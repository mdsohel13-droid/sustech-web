/**
 * GET /api/leads/suppression-hashes — the outbound suppression feed
 * (integration brief §3 / charter §6). GrowthOS's nightly sync pulls this to
 * mark prospects "do not cold-touch".
 *
 * Privacy: raw emails NEVER leave this box. The feed is SHA-256 hashes of
 * lowercased addresses; GrowthOS hashes its side and compares.
 *
 * Scope: EVERY lead is suppressed for cold outreach — a hand-raiser is
 * already in the inbound pipeline (cold-touching them would be both rude and
 * a worse conversion path), and doNotContact leads are suppressed forever.
 *
 * Auth: Bearer LEADENGINE_REPORTER_KEY (read-only key, n8n credential store).
 * 404 when unconfigured.
 */
import { NextRequest, NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";
import { emailHash, safeEqualHex, sha256Hex } from "@/lib/leads/security";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const key = process.env.LEADENGINE_REPORTER_KEY;
  if (!key) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const auth = req.headers.get("authorization") ?? "";
  const presented = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  // Compare hashes of the keys — constant-time, length-independent.
  if (!presented || !safeEqualHex(sha256Hex(presented), sha256Hex(key))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await getPayloadClient();
  const hashes = new Set<string>();
  let page = 1;
  // Paginate defensively; selects only the email column.
  for (;;) {
    const res = await payload.find({
      collection: "leads",
      where: { email: { exists: true } },
      select: { email: true },
      limit: 500,
      page,
      overrideAccess: true,
    });
    for (const doc of res.docs) {
      const email = (doc as { email?: string | null }).email;
      if (email) hashes.add(emailHash(email));
    }
    if (!res.hasNextPage) break;
    page += 1;
  }

  return NextResponse.json(
    { algo: "sha256", normalization: "trim+lowercase", count: hashes.size, hashes: [...hashes] },
    { headers: { "Cache-Control": "no-store" } },
  );
}
