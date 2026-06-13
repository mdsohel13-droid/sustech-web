/**
 * GET /api/pipeline/affected?sourceId= (PIPELINE_SECRET). Returns the published
 * articles + news-items that cite a changed source (the indexed citations
 * backlink), so the watcher knows which docs to re-draft.
 */
import { NextResponse } from "next/server";
import { hasSecret } from "@/lib/pipeline-auth";
import { getPayloadClient } from "@/lib/payload";

export const runtime = "nodejs";

export async function GET(req: Request) {
  if (!hasSecret(req, "PIPELINE_SECRET")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const sourceId = new URL(req.url).searchParams.get("sourceId");
  if (!sourceId) return NextResponse.json({ error: "sourceId required" }, { status: 400 });

  const payload = await getPayloadClient();
  const where = { "citations.source": { equals: sourceId } };
  const [articles, news] = await Promise.all([
    payload.find({ collection: "articles", where, limit: 100, depth: 0, overrideAccess: true }),
    payload.find({ collection: "news-items", where, limit: 100, depth: 0, overrideAccess: true }),
  ]);
  const docs = [
    ...articles.docs.map((d) => ({
      collection: "articles",
      id: d.id,
      slug: d.slug,
      title: d.title,
    })),
    ...news.docs.map((d) => ({ collection: "news-items", id: d.id, slug: d.slug, title: d.title })),
  ];
  return NextResponse.json({ count: docs.length, docs });
}
