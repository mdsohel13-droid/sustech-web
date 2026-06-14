/**
 * POST /api/leads/ingest — the GrowthOS "promotion door" (integration brief
 * §3). When a researched prospect replies positively, a HUMAN clicks promote
 * in GrowthOS, which calls this route; n8n's Meta-Lead-Ads workflow uses the
 * same door later.
 *
 * Security model:
 *  - HMAC-SHA256 over the RAW body with LEADENGINE_INGEST_SECRET (X-Signature)
 *  - consent fields are FORCE-STRIPPED server-side regardless of payload — a
 *    cold-email reply is correspondence, not marketing consent (charter §6)
 *  - rate-limited; 404s when the secret is unconfigured (no surface to probe)
 */
import { NextRequest, NextResponse } from "next/server";
import { verifySignature } from "@/lib/leads/security";
import { upsertLead, type LeadTouch } from "@/lib/leads/upsert-lead";

export const runtime = "nodejs";

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 30;
const hits = new Map<string, { count: number; reset: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const cur = hits.get(ip);
  if (!cur || now >= cur.reset) {
    hits.set(ip, { count: 1, reset: now + WINDOW_MS });
    return false;
  }
  cur.count += 1;
  return cur.count > MAX_PER_WINDOW;
}

const ALLOWED_SOURCES = new Set(["outbound", "manual"]);

export async function POST(req: NextRequest) {
  const secret = process.env.LEADENGINE_INGEST_SECRET;
  if (!secret) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  const raw = await req.text();
  if (raw.length > 10_000) return NextResponse.json({ error: "Too large" }, { status: 413 });

  const signature = req.headers.get("x-signature") ?? "";
  if (!verifySignature(secret, raw, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const source =
    typeof body.source === "string" && ALLOWED_SOURCES.has(body.source)
      ? (body.source as LeadTouch["source"])
      : "outbound";

  // Build the touch EXPLICITLY — consent fields (marketingOptIn, doNotContact,
  // optInConfirmedAt) are not read from the body at all. Force-stripped by
  // construction, not by deletion.
  const touch: LeadTouch = {
    source,
    name: typeof body.name === "string" ? body.name : undefined,
    email: typeof body.email === "string" ? body.email : undefined,
    phone: typeof body.phone === "string" ? body.phone : undefined,
    company: typeof body.company === "string" ? body.company : undefined,
    segment: typeof body.segment === "string" ? body.segment : undefined,
    message: typeof body.context === "string" ? body.context : undefined,
    utm: body.utm && typeof body.utm === "object" ? (body.utm as LeadTouch["utm"]) : undefined,
  };

  const result = await upsertLead(touch);
  if (!result) {
    return NextResponse.json({ error: "Email or phone required" }, { status: 400 });
  }
  return NextResponse.json({ ok: true, id: result.id, created: result.created });
}

export function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
