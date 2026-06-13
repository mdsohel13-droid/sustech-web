/**
 * /api/pipeline/sources (PIPELINE_SECRET).
 *  GET  ?due=today → active sources due to be checked tonight (per checkFrequency).
 *  PATCH body { id, ...watchFields } → record watch bookkeeping after a fetch
 *        (lastCheckedAt, lastContentHash, etag, lastModified, lastChangedAt,
 *        consecutiveFailures). Only those fields are writable here.
 */
import { NextResponse } from "next/server";
import { hasSecret } from "@/lib/pipeline-auth";
import { getPayloadClient } from "@/lib/payload";
import { isDue } from "@/lib/source-watcher";

export const runtime = "nodejs";

export async function GET(req: Request) {
  if (!hasSecret(req, "PIPELINE_SECRET")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const due = new URL(req.url).searchParams.get("due");
  const payload = await getPayloadClient();
  const res = await payload.find({
    collection: "sources",
    where: { active: { equals: true }, fetchPolicy: { equals: "auto" } },
    limit: 200,
    overrideAccess: true,
  });
  const now = Date.now();
  const sources = res.docs
    .filter((s) => (due === "today" ? isDue(s.checkFrequency, s.lastCheckedAt, now) : true))
    .map((s) => ({
      id: s.id,
      name: s.name,
      url: s.url,
      checkUrl: s.checkUrl,
      fetchMethod: s.fetchMethod,
      contentSelector: s.contentSelector,
      etag: s.etag,
      lastModified: s.lastModified,
      lastContentHash: s.lastContentHash,
    }));
  return NextResponse.json({ sources });
}

const WATCH_FIELDS = new Set([
  "lastCheckedAt",
  "lastChangedAt",
  "lastContentHash",
  "etag",
  "lastModified",
  "consecutiveFailures",
  "robotsCheckedAt",
  "fetchPolicy",
  "active",
]);

export async function PATCH(req: Request) {
  if (!hasSecret(req, "PIPELINE_SECRET")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown> & {
    id?: string | number;
  };
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const data: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body)) {
    if (k !== "id" && WATCH_FIELDS.has(k)) data[k] = v;
  }
  const payload = await getPayloadClient();
  try {
    await payload.update({
      collection: "sources",
      id: body.id,
      overrideAccess: true,
      data: data as never,
    });
  } catch {
    return NextResponse.json({ error: "Source not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
