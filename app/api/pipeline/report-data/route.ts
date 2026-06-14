/**
 * GET /api/pipeline/report-data (PIPELINE_SECRET). Aggregates the Payload-side
 * metrics for the morning report SERVER-SIDE, so n8n composes the email from one
 * call and never needs a Payload account (the plan's "reporter" role is replaced
 * by this single authenticated endpoint — design note in phase4 ops doc).
 *
 * n8n still pulls visitor metrics (visitors, top pages) from PostHog directly.
 * PII (lead names/emails) is NOT included here — only counts.
 */
import { NextResponse } from "next/server";
import {
  renderReportHtml,
  summarizePending,
  type PendingDraft,
  type ReportMetrics,
} from "@/lib/daily-report";
import { hasSecret } from "@/lib/pipeline-auth";
import { getPayloadClient } from "@/lib/payload";

export const runtime = "nodejs";

function startOfTodayDhaka(): { iso: string; ymd: string } {
  // Asia/Dhaka is UTC+6, no DST.
  const now = new Date();
  const dhaka = new Date(now.getTime() + 6 * 3_600_000);
  const ymd = dhaka.toISOString().slice(0, 10);
  const startUtc = new Date(`${ymd}T00:00:00.000Z`).getTime() - 6 * 3_600_000;
  return { iso: new Date(startUtc).toISOString(), ymd };
}

export async function GET(req: Request) {
  if (!hasSecret(req, "PIPELINE_SECRET")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const payload = await getPayloadClient();
  const { iso: dayStart, ymd } = startOfTodayDhaka();
  const now = Date.now();

  // ── Leads today ──────────────────────────────────────────────────────────
  const leadsToday = await payload.find({
    collection: "leads",
    where: { createdAt: { greater_than_equal: dayStart } },
    limit: 500,
    depth: 0,
    overrideAccess: true,
  });
  const bySegment: Record<string, number> = {};
  const bySource: Record<string, number> = {};
  let hot = 0;
  for (const l of leadsToday.docs) {
    const seg = (l as { segment?: string }).segment ?? "other";
    const src = (l as { source?: string }).source ?? "other";
    bySegment[seg] = (bySegment[seg] ?? 0) + 1;
    bySource[src] = (bySource[src] ?? 0) + 1;
    if (((l as { score?: number }).score ?? 0) >= 60) hot += 1;
  }

  // ── Pending approvals ────────────────────────────────────────────────────
  const pendingDrafts: PendingDraft[] = [];
  for (const collection of ["articles", "news-items"] as const) {
    const res = await payload.find({
      collection,
      where: { "revisionMeta.approvalState": { equals: "pending" } },
      draft: true,
      depth: 0,
      limit: 100,
      overrideAccess: true,
    });
    for (const d of res.docs) {
      const ps = (d as { revisionMeta?: { pendingSince?: string } }).revisionMeta?.pendingSince;
      pendingDrafts.push({
        id: String(d.id),
        title: (d as { title?: string }).title ?? "(untitled)",
        collection,
        pendingSinceMs: ps ? new Date(ps).getTime() : null,
      });
    }
  }

  // ── Pipeline runs + auto-publish count + source changes ──────────────────
  const lastRun = async (trigger: string) => {
    const r = await payload.find({
      collection: "pipeline-runs",
      where: { trigger: { equals: trigger } },
      sort: "-runDate",
      limit: 1,
      overrideAccess: true,
    });
    return (r.docs[0] as { runDate?: string } | undefined)?.runDate ?? null;
  };
  const [lastN8n, lastFallback, lastHeartbeat, autoPub, srcChanged] = await Promise.all([
    lastRun("n8n"),
    lastRun("fallback"),
    lastRun("heartbeat"),
    payload.find({
      collection: "publish-audit",
      where: {
        and: [
          { action: { equals: "auto-published-24h" } },
          { at: { greater_than_equal: dayStart } },
        ],
      },
      limit: 0,
      overrideAccess: true,
    }),
    payload.find({
      collection: "sources",
      where: { lastChangedAt: { greater_than_equal: dayStart } },
      limit: 0,
      overrideAccess: true,
    }),
  ]);

  const metrics: ReportMetrics = {
    date: ymd,
    leads: { total: leadsToday.totalDocs, hot, bySegment, bySource },
    pending: summarizePending(pendingDrafts, now),
    pipeline: {
      lastN8nRunAt: lastN8n,
      lastFallbackAt: lastFallback,
      lastHeartbeatAt: lastHeartbeat,
      sourcesChanged: srcChanged.totalDocs,
      autoPublishedToday: autoPub.totalDocs,
    },
    killSwitches: {
      sourceWatch: process.env.SOURCE_WATCH_ENABLED !== "false",
      autoPublishEnv: process.env.AUTO_PUBLISH_ENABLED === "true",
      killSwitch: process.env.AUTOMATION_KILL_SWITCH === "true",
    },
  };

  return NextResponse.json({ metrics, html: renderReportHtml(metrics) });
}
