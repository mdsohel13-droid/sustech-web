/**
 * /api/cron/nightly (CRON_SECRET). The VPS-crontab FALLBACK for when n8n is
 * down (master plan §3.2a). DETECT-ONLY — it never drafts or publishes.
 *
 *  ?mode=if-missed → if no pipeline-run exists for today, write a `fallback`
 *                    run row so the gap is visible. (A fuller detect-only source
 *                    scan can be added later; the row itself proves the gap.)
 *  ?mode=heartbeat → write a `heartbeat` run row proving the crontab is alive
 *                    ("fallback cron last seen" surfaces in the daily report).
 */
import { NextResponse } from "next/server";
import { hasSecret } from "@/lib/pipeline-auth";
import { getPayloadClient } from "@/lib/payload";

export const runtime = "nodejs";

async function handle(req: Request) {
  if (!hasSecret(req, "CRON_SECRET")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const mode = new URL(req.url).searchParams.get("mode") ?? "if-missed";
  const payload = await getPayloadClient();

  if (mode === "heartbeat") {
    await payload.create({
      collection: "pipeline-runs",
      overrideAccess: true,
      data: {
        runDate: new Date().toISOString(),
        trigger: "heartbeat",
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
      } as never,
    });
    return NextResponse.json({ ok: true, mode: "heartbeat" });
  }

  // if-missed: only act when no run exists today (n8n already ran → no-op).
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const existing = await payload.find({
    collection: "pipeline-runs",
    where: {
      and: [
        { trigger: { equals: "n8n" } },
        { runDate: { greater_than_equal: start.toISOString() } },
      ],
    },
    limit: 1,
    overrideAccess: true,
  });
  if (existing.totalDocs > 0) {
    return NextResponse.json({ ok: true, mode: "if-missed", action: "noop (n8n ran)" });
  }

  await payload.create({
    collection: "pipeline-runs",
    overrideAccess: true,
    data: {
      runDate: new Date().toISOString(),
      trigger: "fallback",
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      errors: { note: "n8n missed 04:00 — detect-only fallback" },
    } as never,
  });
  return NextResponse.json({ ok: true, mode: "if-missed", action: "fallback run recorded" });
}

export const POST = handle;
export const GET = handle;
