/**
 * POST /api/hermes/ingest
 *
 * Secure endpoint for the Hermes AI content agent to create news drafts
 * (and optionally auto-publish approved categories) in Payload CMS.
 *
 * Security model (CLAUDE.md §9):
 *   - Bearer token auth via HERMES_AGENT_SECRET env var
 *   - Rate-limited: 30 drafts per rolling 24-hour window
 *   - Input validated with strict schema before touching the DB
 *   - Hermes can never publish company-update or product-update categories
 *     (those contain Sustech-specific claims that need human verification)
 *   - Auto-publish is opt-in via HERMES_AUTO_PUBLISH_CATEGORIES env var
 *     (comma-separated, e.g. "industry-news,ai-tech")
 *   - All created records include an agentMeta audit trail
 *
 * Request body (JSON):
 *   title        string   required
 *   category     string   required — one of the NewsCategory values
 *   summary      string   required — direct-answer excerpt (1–2 sentences)
 *   body         string   required — full article in HTML or plain text
 *   source?      string   optional — source publication name
 *   sourceUrl?   string   optional — original article URL
 *   tags?        string[] optional
 *   faq?         Array<{ question: string; answer: string }> optional
 *   model?       string   optional — AI model used (for audit)
 *   sourceUrls?  string   optional — comma-separated source URLs used in generation
 *
 * Response:
 *   201  { id, slug, status, adminUrl }
 *   400  { error: "validation error message" }
 *   401  { error: "Unauthorized" }
 *   429  { error: "Rate limit exceeded", retryAfter: number }
 *   500  { error: "Internal error" }
 */
import config from "@payload-config";
import { getPayload } from "payload";
import { NextRequest, NextResponse } from "next/server";

// ── Constants ────────────────────────────────────────────────────────────────

const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours
const RATE_LIMIT_MAX = 30;

// Categories that REQUIRE human approval before publishing (contain Sustech-specific facts)
const HUMAN_REQUIRED_CATEGORIES = new Set(["company-update", "product-update"]);

const VALID_CATEGORIES = new Set([
  "company-update",
  "industry-news",
  "product-update",
  "ai-tech",
  "market-insight",
]);

// ── In-memory rate limiter (resets on server restart) ────────────────────────
// For production at scale, replace with Redis. For a single VPS this is fine.
const rateStore = new Map<string, { count: number; windowStart: number }>();

function checkRateLimit(key: string): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const entry = rateStore.get(key);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateStore.set(key, { count: 1, windowStart: now });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    const retryAfterMs = RATE_LIMIT_WINDOW_MS - (now - entry.windowStart);
    return { allowed: false, retryAfterMs };
  }

  entry.count += 1;
  return { allowed: true, retryAfterMs: 0 };
}

// ── Auth ─────────────────────────────────────────────────────────────────────

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.HERMES_AGENT_SECRET;
  if (!secret) return false; // Guard: if secret not set, deny all
  const auth = req.headers.get("authorization") ?? "";
  return auth === `Bearer ${secret}`;
}

// ── Input validation ─────────────────────────────────────────────────────────

interface IngestBody {
  title: string;
  category: string;
  summary: string;
  body: string;
  source?: string;
  sourceUrl?: string;
  tags?: string[];
  faq?: Array<{ question: string; answer: string }>;
  model?: string;
  sourceUrls?: string;
}

function validate(raw: unknown): { ok: true; data: IngestBody } | { ok: false; error: string } {
  if (!raw || typeof raw !== "object") return { ok: false, error: "Body must be a JSON object" };
  const b = raw as Record<string, unknown>;

  if (typeof b.title !== "string" || b.title.trim().length < 5)
    return { ok: false, error: "title: required, min 5 chars" };
  if (typeof b.category !== "string" || !VALID_CATEGORIES.has(b.category))
    return {
      ok: false,
      error: `category: must be one of ${[...VALID_CATEGORIES].join(", ")}`,
    };
  if (typeof b.summary !== "string" || b.summary.trim().length < 20)
    return { ok: false, error: "summary: required, min 20 chars" };
  if (typeof b.body !== "string" || b.body.trim().length < 100)
    return { ok: false, error: "body: required, min 100 chars" };

  // Optional fields
  if (b.sourceUrl !== undefined && typeof b.sourceUrl !== "string")
    return { ok: false, error: "sourceUrl: must be a string if provided" };
  if (b.tags !== undefined && !Array.isArray(b.tags))
    return { ok: false, error: "tags: must be an array if provided" };
  if (b.faq !== undefined && !Array.isArray(b.faq))
    return { ok: false, error: "faq: must be an array if provided" };

  return {
    ok: true,
    data: {
      title: b.title.trim(),
      category: b.category,
      summary: b.summary.trim(),
      body: b.body.trim(),
      source: typeof b.source === "string" ? b.source.trim() : undefined,
      sourceUrl: typeof b.sourceUrl === "string" ? b.sourceUrl.trim() : undefined,
      tags: Array.isArray(b.tags) ? (b.tags as string[]) : undefined,
      faq: Array.isArray(b.faq)
        ? (b.faq as Array<{ question: string; answer: string }>)
        : undefined,
      model: typeof b.model === "string" ? b.model : undefined,
      sourceUrls: typeof b.sourceUrls === "string" ? b.sourceUrls : undefined,
    },
  };
}

// ── Slug helper ───────────────────────────────────────────────────────────────

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1. Auth
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Rate limit
  const { allowed, retryAfterMs } = checkRateLimit("hermes");
  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded", retryAfter: Math.ceil(retryAfterMs / 1000) },
      { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } },
    );
  }

  // 3. Parse + validate
  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validation = validate(rawBody);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }
  const data = validation.data;

  // 4. Determine publish status
  // Categories in HUMAN_REQUIRED_CATEGORIES are always drafted.
  // Others may auto-publish if the env var opts them in.
  const autoPublishCategories = new Set(
    (process.env.HERMES_AUTO_PUBLISH_CATEGORIES ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
  const canAutoPublish =
    !HUMAN_REQUIRED_CATEGORIES.has(data.category) && autoPublishCategories.has(data.category);
  const status = canAutoPublish ? "published" : "draft";

  // 5. Create in Payload
  try {
    const payload = await getPayload({ config });

    const slug = toSlug(data.title);

    const doc = await payload.create({
      collection: "news-items",
      overrideAccess: true, // API-level auth — Hermes user not in session
      data: {
        title: data.title,
        slug,
        category: data.category as
          | "company-update"
          | "industry-news"
          | "product-update"
          | "ai-tech"
          | "market-insight",
        summary: data.summary,
        body: {
          root: {
            type: "root",
            children: [
              {
                type: "paragraph",
                version: 1,
                children: [{ type: "text", text: data.body, version: 1 }],
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            version: 1,
          },
        },
        source: data.source,
        sourceUrl: data.sourceUrl,
        tags: data.tags?.map((tag) => ({ tag })),
        faq: data.faq?.map((f) => ({ question: f.question, answer: f.answer })),
        publishedDate: new Date().toISOString(),
        agentMeta: {
          generatedBy: "Hermes AI Agent",
          model: data.model ?? "claude",
          sourceUrls: data.sourceUrls,
          generatedAt: new Date().toISOString(),
        },
        _status: status,
      },
    });

    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:4123";

    return NextResponse.json(
      {
        id: doc.id,
        slug: doc.slug,
        status,
        adminUrl: `${serverUrl}/admin/collections/news-items/${doc.id}`,
        publicUrl: status === "published" ? `${serverUrl}/news/${doc.slug}` : null,
        message:
          status === "published"
            ? "Published immediately (auto-publish category)."
            : "Draft created. An admin or editor must publish it.",
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("[hermes/ingest] Error creating news item:", err);
    return NextResponse.json({ error: "Internal error creating content" }, { status: 500 });
  }
}

// Reject non-POST methods
export function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
