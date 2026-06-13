/**
 * POST /api/pipeline/revise (PIPELINE_SECRET). Creates a NEW DRAFT VERSION of an
 * existing published doc with the watcher's proposed changes + revision metadata
 * — never publishes. The route runs its OWN independent server-side risk scan on
 * the change summary (the n8n riskFlags are advisory only) and merges the union
 * into revisionMeta.riskFlags, so a hallucinated "no risk" can't strip a real one.
 *
 * Body: { collection, docId, changeSummary, riskFlags?, sourceId?, bodyPatch? }
 */
import { NextResponse } from "next/server";
import { hasSecret } from "@/lib/pipeline-auth";
import { getPayloadClient } from "@/lib/payload";

export const runtime = "nodejs";

const RISK_PATTERNS: { flag: string; re: RegExp }[] = [
  { flag: "pricing", re: /\b(price|pricing|৳|bdt|tk\b|quote|cost per)\b/i },
  { flag: "tariff", re: /\b(tariff|per kwh|kwh rate|slab)\b/i },
  { flag: "legal", re: /\b(legal|law|act\b|regulation|vat|duty|sro|circular|compliance)\b/i },
  { flag: "stat-claim", re: /\b\d+(\.\d+)?\s*(%|percent|mw|kw|kwp|crore|lakh|taka)\b/i },
  { flag: "third-party-name", re: /\b(h&m|inditex|zara|world bank|adb|ifc|bloomberg)\b/i },
];

/** Independent server-side risk derivation (never trusts the model's flags). */
function deriveRiskFlags(text: string): string[] {
  return RISK_PATTERNS.filter((p) => p.re.test(text)).map((p) => p.flag);
}

export async function POST(req: Request) {
  if (!hasSecret(req, "PIPELINE_SECRET")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const b = (await req.json().catch(() => ({}))) as {
    collection?: "articles" | "news-items";
    docId?: string | number;
    changeSummary?: string;
    riskFlags?: string[];
    sourceId?: string | number;
    bodyPatch?: unknown;
  };
  if (!b.collection || !b.docId || (b.collection !== "articles" && b.collection !== "news-items")) {
    return NextResponse.json({ error: "collection + docId required" }, { status: 400 });
  }

  const summary = (b.changeSummary ?? "").slice(0, 4000);
  const serverFlags = deriveRiskFlags(summary);
  const riskFlags = [...new Set([...(b.riskFlags ?? []), ...serverFlags])];

  const payload = await getPayloadClient();
  try {
    const data: Record<string, unknown> = {
      revisionMeta: {
        approvalState: "pending",
        changeSummary: summary,
        riskFlags,
        triggeredBySource: b.sourceId ?? undefined,
      },
    };
    if (b.bodyPatch) data.body = b.bodyPatch;
    // draft:true → new draft VERSION on top of the live published version; never publishes.
    const updated = await payload.update({
      collection: b.collection,
      id: b.docId,
      draft: true,
      overrideAccess: true,
      data: data as never,
    });
    return NextResponse.json({
      ok: true,
      versionId: (updated as { updatedAt?: string }).updatedAt ?? null,
      riskFlags,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
