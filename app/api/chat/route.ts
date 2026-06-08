/**
 * POST /api/chat — secure server-side proxy to the n8n AI chat workflow.
 *
 * Why proxy instead of calling n8n from the browser:
 *  - Keeps the widget secret SERVER-SIDE (never shipped to the client).
 *  - Stays inside the site's strict CSP (`connect-src 'self'`) — the browser
 *    only ever talks to this same-origin route; the n8n call is server→server.
 *  - Adds rate-limiting + input validation + a graceful fallback.
 *
 * Contract (matches the n8n webhook):
 *   request : { message: string, user_ref?: string, image?: string }
 *             `image` is an optional data URL (data:image/<type>;base64,…) — a
 *             photo the visitor attached (e.g. an electrical panel, a bill, a
 *             site). The browser resizes/compresses it before upload.
 *   upstream: POST { message, user_ref, secret, image? } → n8n
 *   response: { answer: string }
 *
 * Env:
 *   CHAT_N8N_ENDPOINT  — e.g. https://n8n.sustechltd.com/webhook/chat
 *   CHAT_WIDGET_SECRET — shared secret the n8n workflow checks
 */
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// ── In-memory rate limiter (per IP, rolling window) ──────────────────────────
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;
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

const FALLBACK =
  "I’m having trouble right now. Please try again, or reach us via the Contact page.";

// ── Image attachment limits ──────────────────────────────────────────────────
// Accept only the common web-safe raster types as base64 data URLs. The browser
// already downscales/compresses, so a generous-but-bounded cap protects the
// server and the upstream workflow from oversized payloads.
const IMAGE_DATA_URL = /^data:image\/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+/]+={0,2}$/;
const MAX_IMAGE_CHARS = 7_000_000; // ~5 MB decoded — comfortably above the 1280px JPEG the client sends

function validateImage(value: unknown): string | null {
  if (typeof value !== "string" || !value) return null;
  if (value.length > MAX_IMAGE_CHARS) return null;
  if (!IMAGE_DATA_URL.test(value)) return null;
  return value;
}

export async function POST(req: NextRequest) {
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { answer: "You’re sending messages a little fast — please wait a moment and try again." },
      { status: 429 },
    );
  }

  let body: { message?: unknown; user_ref?: unknown; image?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Validate + clamp input (prompt-injection / abuse hardening is in the n8n
  // workflow's system prompt; here we just bound size and never echo secrets).
  const message = typeof body.message === "string" ? body.message.trim().slice(0, 2000) : "";
  const image = validateImage(body.image);
  // A message OR an image is enough — a visitor may send a photo with no caption.
  if (!message && !image) {
    return NextResponse.json({ error: "Empty message" }, { status: 400 });
  }
  const userRef =
    typeof body.user_ref === "string" ? body.user_ref.replace(/[^\w-]/g, "").slice(0, 64) : "web";

  const endpoint = process.env.CHAT_N8N_ENDPOINT;
  const secret = process.env.CHAT_WIDGET_SECRET;
  if (!endpoint || !secret) {
    return NextResponse.json({
      answer:
        "The chat assistant isn’t configured yet. Please use the Contact page or call us — we’ll be glad to help.",
    });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25_000);
    const upstream = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: message || "(image attached)",
        user_ref: userRef,
        secret,
        ...(image ? { image } : {}),
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const data = (await upstream.json().catch(() => ({}))) as { answer?: unknown; reply?: unknown };
    const raw = data.answer ?? data.reply;
    const answer = typeof raw === "string" && raw.trim() ? raw.trim().slice(0, 4000) : FALLBACK;
    return NextResponse.json({ answer });
  } catch {
    return NextResponse.json({ answer: FALLBACK }, { status: 200 });
  }
}

export function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
