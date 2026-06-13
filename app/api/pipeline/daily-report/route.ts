/**
 * POST /api/pipeline/daily-report (PIPELINE_SECRET). n8n posts the rendered
 * report HTML + metrics after sending the 08:00 email, so the owner can always
 * browse it in /admin even if the email failed. Upsert by date (one row/day).
 *
 * Body: { date: "YYYY-MM-DD", html: string, metrics?: object }
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
    date?: string;
    html?: string;
    metrics?: unknown;
  };
  if (!b.date || !/^\d{4}-\d{2}-\d{2}$/.test(b.date)) {
    return NextResponse.json({ error: "date (YYYY-MM-DD) required" }, { status: 400 });
  }

  const payload = await getPayloadClient();
  const data = {
    date: b.date,
    generatedAt: new Date().toISOString(),
    html: (b.html ?? "").slice(0, 100_000),
    metrics: b.metrics ?? null,
  };

  const existing = await payload.find({
    collection: "daily-reports",
    where: { date: { equals: b.date } },
    limit: 1,
    overrideAccess: true,
  });
  try {
    if (existing.docs[0]) {
      // The collection blocks public update; overrideAccess lets the pipeline replace today's row.
      await payload.delete({
        collection: "daily-reports",
        id: existing.docs[0].id,
        overrideAccess: true,
      });
    }
    const created = await payload.create({
      collection: "daily-reports",
      data: data as never,
      overrideAccess: true,
    });
    return NextResponse.json({ ok: true, id: created.id });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
