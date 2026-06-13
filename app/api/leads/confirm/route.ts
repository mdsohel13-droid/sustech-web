/**
 * GET /api/leads/confirm?token=… — double-opt-in confirmation (charter §6:
 * marketing email only after explicit opt-in + confirm click).
 *
 * Flow: visitor ticks the marketing box → n8n lead-intake sends a Resend
 * confirm email carrying makeConfirmToken(email) → visitor clicks → this
 * route verifies the stateless HMAC token and stamps optInConfirmedAt.
 *
 * Stateless by design: nothing to store, nothing to expire server-side; the
 * token self-expires in 7 days. Single-purpose secret (LEADS_CONFIRM_SECRET).
 * GET is acceptable here — the action is idempotent and benign (confirming
 * your own subscription); mail scanners pre-fetching the link only confirm
 * what the visitor already requested.
 */
import { NextRequest, NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";
import { verifyConfirmToken } from "@/lib/leads/security";

export const runtime = "nodejs";

function page(title: string, body: string, status: number): NextResponse {
  return new NextResponse(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title} · Sustech</title><style>body{font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0;background:#f5f7fa;color:#0b1b2b}main{max-width:28rem;padding:2.5rem;background:#fff;border-radius:12px;box-shadow:0 4px 24px rgba(11,27,43,.08);text-align:center}h1{font-size:1.25rem}a{color:#0073cf}</style></head><body><main><h1>${title}</h1><p>${body}</p><p><a href="/">Back to sustechltd.com</a></p></main></body></html>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}

export async function GET(req: NextRequest) {
  const secret = process.env.LEADS_CONFIRM_SECRET;
  if (!secret) return page("Not available", "This link is not active.", 404);

  const token = req.nextUrl.searchParams.get("token") ?? "";
  const verified = token ? verifyConfirmToken(secret, token) : null;
  if (!verified) {
    return page(
      "Link expired",
      "This confirmation link is invalid or has expired. Please subscribe again.",
      400,
    );
  }

  const payload = await getPayloadClient();
  const found = await payload.find({
    collection: "leads",
    where: { email: { equals: verified.email } },
    limit: 1,
    overrideAccess: true,
  });
  const lead = found.docs[0];
  if (lead && !(lead as { optInConfirmedAt?: string | null }).optInConfirmedAt) {
    await payload.update({
      collection: "leads",
      id: lead.id,
      data: { marketingOptIn: true, optInConfirmedAt: new Date().toISOString() },
      overrideAccess: true,
    });
  }

  return page(
    "Subscription confirmed",
    "Thanks — you’ll hear from Sustech occasionally, and you can unsubscribe any time.",
    200,
  );
}
