/**
 * POST /api/pipeline/run-finish (PIPELINE_SECRET). Closes a pipeline-runs row
 * with totals. Body: { runId, sourcesChecked, sourcesChanged, draftsCreated, errors? }.
 */
import { NextResponse } from "next/server";
import { hasSecret } from "@/lib/pipeline-auth";
import { getPayloadClient } from "@/lib/payload";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!hasSecret(req, "PIPELINE_SECRET")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const b = (await req.json().catch(() => ({}))) as {
    runId?: string | number;
    sourcesChecked?: number;
    sourcesChanged?: number;
    draftsCreated?: number;
    errors?: unknown;
  };
  if (!b.runId) return NextResponse.json({ error: "runId required" }, { status: 400 });

  const payload = await getPayloadClient();
  try {
    await payload.update({
      collection: "pipeline-runs",
      id: b.runId,
      overrideAccess: true,
      data: {
        finishedAt: new Date().toISOString(),
        sourcesChecked: b.sourcesChecked ?? 0,
        sourcesChanged: b.sourcesChanged ?? 0,
        draftsCreated: b.draftsCreated ?? 0,
        errors: b.errors ?? null,
      } as never,
    });
  } catch {
    return NextResponse.json({ error: "Run not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
