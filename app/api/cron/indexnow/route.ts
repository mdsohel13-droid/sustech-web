/**
 * /api/cron/indexnow (CRON_SECRET) — evergreen Tier-0 weekly full resubmit.
 * Publishes ping IndexNow for their own URL in real time (revalidate hook); this
 * weekly job resubmits the WHOLE canonical set (from the sitemap) so nothing is
 * ever missed and the index stays fresh. No-op unless IndexNow is configured.
 */
import { NextResponse } from "next/server";
import sitemap from "@/app/sitemap";
import { indexNowEnabled, submitIndexNow } from "@/lib/indexnow";
import { hasSecret } from "@/lib/pipeline-auth";
import { serverUrl } from "@/lib/seo";

export const runtime = "nodejs";

async function handle(req: Request) {
  if (!hasSecret(req, "CRON_SECRET")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!indexNowEnabled()) {
    return NextResponse.json({ ok: true, skipped: "IndexNow not configured" });
  }
  const entries = await sitemap();
  const paths = entries
    .map((e) => (typeof e.url === "string" ? e.url.replace(serverUrl, "") : ""))
    .filter((p) => p.startsWith("/"));
  const { submitted } = await submitIndexNow(paths);
  return NextResponse.json({ ok: true, submitted });
}

export const POST = handle;
export const GET = handle;
