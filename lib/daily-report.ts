/**
 * Daily-report shaping (Lead Engine master plan §3.4). PURE, unit-tested helpers
 * the report route uses; keeping the derivations here (red-flags, HTML render)
 * makes them testable without a DB or n8n.
 */

export interface PendingDraft {
  id: string;
  title: string;
  collection: string;
  pendingSinceMs: number | null; // null = approval email not yet delivered
}

export interface PendingSummary {
  count: number;
  oldestHours: number | null;
  /** Red when any draft has been pending > 18 h (the 24 h auto path is near). */
  redFlag: boolean;
  awaitingDelivery: number; // drafts whose clock hasn't started
}

/** Summarize the pending-approvals queue (master plan §3.4 block 1/5). */
export function summarizePending(drafts: PendingDraft[], nowMs: number): PendingSummary {
  let oldest = 0;
  let awaitingDelivery = 0;
  for (const d of drafts) {
    if (d.pendingSinceMs == null) {
      awaitingDelivery += 1;
      continue;
    }
    const hours = (nowMs - d.pendingSinceMs) / 3_600_000;
    if (hours > oldest) oldest = hours;
  }
  return {
    count: drafts.length,
    oldestHours: drafts.length > awaitingDelivery ? Math.round(oldest) : null,
    redFlag: oldest > 18,
    awaitingDelivery,
  };
}

export interface ReportMetrics {
  date: string;
  leads: {
    total: number;
    hot: number;
    bySegment: Record<string, number>;
    bySource: Record<string, number>;
  };
  pending: PendingSummary;
  pipeline: {
    lastN8nRunAt: string | null;
    lastFallbackAt: string | null;
    lastHeartbeatAt: string | null;
    sourcesChanged: number;
    autoPublishedToday: number;
  };
  killSwitches: { sourceWatch: boolean; autoPublishEnv: boolean; killSwitch: boolean };
}

function esc(s: string): string {
  return String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!);
}
function kv(obj: Record<string, number>): string {
  const entries = Object.entries(obj).filter(([, n]) => n > 0);
  if (entries.length === 0) return "<em>none</em>";
  return entries.map(([k, n]) => `${esc(k)}: <strong>${n}</strong>`).join(" · ");
}

/** Render a simple, email-safe HTML report from the metrics (master plan §3.4). */
export function renderReportHtml(m: ReportMetrics): string {
  const p = m.pending;
  const flag = p.redFlag ? ' style="color:#b00020;font-weight:700"' : "";
  return [
    `<div style="font:15px/1.5 system-ui,sans-serif;color:#0B1B2B;max-width:640px">`,
    `<h2 style="margin:0 0 4px">Sustech — daily report</h2>`,
    `<p style="color:#556;margin:0 0 16px">${esc(m.date)} (Asia/Dhaka)</p>`,
    `<table style="width:100%;border-collapse:collapse">`,
    row(
      "Leads (new today)",
      `<strong>${m.leads.total}</strong> · hot: <strong>${m.leads.hot}</strong>`,
    ),
    row("By segment", kv(m.leads.bySegment)),
    row("By source", kv(m.leads.bySource)),
    row(
      "Pending approvals",
      `<span${flag}>${p.count}${p.oldestHours != null ? ` · oldest ${p.oldestHours}h` : ""}${p.awaitingDelivery ? ` · ${p.awaitingDelivery} awaiting email delivery` : ""}</span>`,
    ),
    row("Auto-published today", String(m.pipeline.autoPublishedToday)),
    row("Sources changed", String(m.pipeline.sourcesChanged)),
    row(
      "Last nightly run",
      m.pipeline.lastN8nRunAt ? esc(m.pipeline.lastN8nRunAt) : "<em>none today</em>",
    ),
    row(
      "Fallback cron last seen",
      m.pipeline.lastFallbackAt || m.pipeline.lastHeartbeatAt
        ? esc(m.pipeline.lastFallbackAt ?? m.pipeline.lastHeartbeatAt ?? "")
        : "<em>—</em>",
    ),
    row(
      "Kill switches",
      `source-watch: ${m.killSwitches.sourceWatch ? "on" : "OFF"} · auto-publish: ${m.killSwitches.autoPublishEnv ? "ON" : "off"}${m.killSwitches.killSwitch ? " · KILL-SWITCH ENGAGED" : ""}`,
    ),
    `</table>`,
    `<p style="margin-top:16px"><a href="https://www.sustechltd.com/review">Open the review queue →</a></p>`,
    `</div>`,
  ].join("");
}

function row(label: string, value: string): string {
  return `<tr><td style="padding:6px 0;color:#556;border-bottom:1px solid #eef">${esc(label)}</td><td style="padding:6px 0;text-align:right;border-bottom:1px solid #eef">${value}</td></tr>`;
}
