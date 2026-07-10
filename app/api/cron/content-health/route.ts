/**
 * /api/cron/content-health (CRON_SECRET) — evergreen Tier-0 read-only audit.
 * Sweeps the CMS for accessibility/SEO/funnel gaps (missing alt text, missing
 * meta descriptions, unfinished sector funnels) and returns a structured report
 * for the weekly digest. Detect-only: it changes nothing.
 */
import { NextResponse } from "next/server";
import { runContentHealthAudit } from "@/lib/content-health";
import { hasSecret } from "@/lib/pipeline-auth";

export const runtime = "nodejs";

async function handle(req: Request) {
  if (!hasSecret(req, "CRON_SECRET")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const report = await runContentHealthAudit();
  return NextResponse.json({ ok: true, ...report });
}

export const POST = handle;
export const GET = handle;
