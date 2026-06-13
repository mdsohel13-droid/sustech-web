/**
 * POST /api/pipeline/run-start (PIPELINE_SECRET). Opens a pipeline-runs row and
 * returns its id. 409s when SOURCE_WATCH_ENABLED=false — the master kill switch
 * for the nightly pipeline (the site keeps serving last-published content).
 */
import { NextResponse } from "next/server";
import { hasSecret } from "@/lib/pipeline-auth";
import { getPayloadClient } from "@/lib/payload";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!hasSecret(req, "PIPELINE_SECRET")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (process.env.SOURCE_WATCH_ENABLED === "false") {
    return NextResponse.json({ error: "Source watch disabled" }, { status: 409 });
  }
  const body = (await req.json().catch(() => ({}))) as { trigger?: string };
  const trigger = ["n8n", "fallback", "heartbeat"].includes(body.trigger ?? "")
    ? body.trigger
    : "n8n";

  const payload = await getPayloadClient();
  const run = await payload.create({
    collection: "pipeline-runs",
    overrideAccess: true,
    data: {
      runDate: new Date().toISOString(),
      trigger,
      startedAt: new Date().toISOString(),
      sourcesChecked: 0,
      sourcesChanged: 0,
      draftsCreated: 0,
    } as never,
  });
  return NextResponse.json({ runId: run.id });
}
