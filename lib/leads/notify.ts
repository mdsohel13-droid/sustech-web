/**
 * Outbound lead-event webhook (integration brief §3). Fires HMAC-signed
 * events to GrowthOS/n8n on VPS-2 so the outbound engine can dedupe its
 * cadence ("prospect converted on their own — stop touching them") and the
 * lead-intake workflow can ping the owner on hot leads.
 *
 * Fire-and-forget: never blocks or fails the visitor's request. Raw PII is
 * minimized — the event carries the email HASH, not the address.
 * Graceful no-op when LEADENGINE_EVENTS_URL/SECRET are unset (local dev).
 */
import { after } from "next/server";
import { emailHash, hmacHex } from "./security";

export type LeadEventName = "lead.created" | "lead.updated" | "rfq.submitted";

export interface LeadEvent {
  event: LeadEventName;
  emailHash?: string;
  segment?: string;
  source?: string;
  score?: number;
  hot?: boolean;
  utm?: { source?: string; medium?: string; campaign?: string };
  ts: string;
}

async function send(event: LeadEvent): Promise<void> {
  const url = process.env.LEADENGINE_EVENTS_URL;
  const secret = process.env.LEADENGINE_EVENTS_SECRET;
  if (!url || !secret) return;
  try {
    const body = JSON.stringify(event);
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Signature": hmacHex(secret, body),
      },
      body,
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // Best-effort by design — the daily report surfaces gaps, not the visitor.
  }
}

/** Queue a lead event to run after the response is sent (zero visitor latency). */
export function notifyLeadEvent(
  event: Omit<LeadEvent, "ts" | "emailHash"> & { email?: string | null },
): void {
  const { email, ...rest } = event;
  const payload: LeadEvent = {
    ...rest,
    ...(email ? { emailHash: emailHash(email) } : {}),
    ts: new Date().toISOString(),
  };
  try {
    after(() => send(payload));
  } catch {
    // `after` requires a request scope; in scripts/tests just send inline.
    void send(payload);
  }
}

// ── Owner notification: instant email + ERP/CRM forward ──────────────────────
//
// Separate from the GrowthOS event above: this carries the FULL contact details
// the owner needs to follow up. Two independent, env-gated, non-blocking sinks:
//   1. LEAD_ALERT_EMAIL + RESEND_API_KEY → an instant email to the owner's inbox.
//   2. LEAD_FORWARD_URL (+ _SECRET)       → an HMAC POST to a Hermes/n8n endpoint
//      that pushes the lead into the ERP/CRM. The web tier NEVER calls the ERP
//      directly (CLAUDE.md §9) — Hermes owns those credentials.

export interface OwnerLeadDetails {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  segment?: string | null;
  source?: string | null;
  score?: number;
  temperature?: "hot" | "warm" | "cold";
  sourcePath?: string | null;
  message?: string | null;
  leadId?: string | number;
  utm?: { source?: string; medium?: string; campaign?: string };
}

function esc(s: string): string {
  return String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!);
}

/** Render the owner's lead-alert email (pure → unit-tested). */
export function renderLeadEmailHtml(d: OwnerLeadDetails, siteUrl: string): string {
  const rows: [string, string][] = [];
  const add = (k: string, v?: string | null) => {
    if (v) rows.push([k, esc(v)]);
  };
  add("Name", d.name);
  if (d.email) rows.push(["Email", `<a href="mailto:${esc(d.email)}">${esc(d.email)}</a>`]);
  if (d.phone)
    rows.push(["Phone", `<a href="tel:${esc(d.phone.replace(/\s+/g, ""))}">${esc(d.phone)}</a>`]);
  add("Company", d.company);
  add("Segment", d.segment);
  add("Source", d.source);
  if (typeof d.score === "number")
    rows.push(["Score", `${d.score}${d.temperature ? ` (${d.temperature})` : ""}`]);
  add("Page", d.sourcePath);
  if (d.utm?.campaign) add("Campaign", d.utm.campaign);
  add("Message", d.message);

  const heat = d.temperature === "hot" ? "🔥 HOT LEAD" : "New lead";
  const adminLink = d.leadId
    ? `${siteUrl}/admin/collections/leads/${d.leadId}`
    : `${siteUrl}/admin`;
  return [
    `<div style="font:15px/1.5 system-ui,sans-serif;color:#0B1B2B;max-width:560px">`,
    `<h2 style="margin:0 0 12px">${heat}${d.company ? ` — ${esc(d.company)}` : ""}</h2>`,
    `<table style="width:100%;border-collapse:collapse">`,
    ...rows.map(
      ([k, v]) =>
        `<tr><td style="padding:5px 0;color:#556;border-bottom:1px solid #eef;vertical-align:top">${esc(k)}</td><td style="padding:5px 0 5px 12px;border-bottom:1px solid #eef">${v}</td></tr>`,
    ),
    `</table>`,
    `<p style="margin-top:16px"><a href="${adminLink}" style="background:#0073CF;color:#fff;padding:8px 14px;border-radius:8px;text-decoration:none;font-weight:600">Open in admin →</a></p>`,
    `</div>`,
  ].join("");
}

async function emailOwner(d: OwnerLeadDetails): Promise<void> {
  const to = process.env.LEAD_ALERT_EMAIL;
  const key = process.env.RESEND_API_KEY;
  if (!to || !key) return;
  const siteUrl =
    process.env.NEXT_PUBLIC_SERVER_URL ?? process.env.SITE_URL ?? "https://www.sustechltd.com";
  const subject = `${d.temperature === "hot" ? "🔥 Hot lead" : "New lead"}${
    d.company ? ` — ${d.company}` : d.name ? ` — ${d.name}` : ""
  }`;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.LEAD_ALERT_FROM ?? "Sustech Leads <leads@sustechltd.com>",
        to: [to],
        subject,
        html: renderLeadEmailHtml(d, siteUrl),
      }),
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    // Best-effort; the lead is already saved + visible in /admin.
  }
}

async function forwardToErp(d: OwnerLeadDetails): Promise<void> {
  const url = process.env.LEAD_FORWARD_URL;
  const secret = process.env.LEAD_FORWARD_SECRET;
  if (!url || !secret) return;
  try {
    const body = JSON.stringify({ ...d, ts: new Date().toISOString() });
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Signature": hmacHex(secret, body) },
      body,
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    // Best-effort; Hermes/n8n can re-pull from the daily lead list if needed.
  }
}

/**
 * Notify the owner of a new lead — instant email + ERP/CRM forward. Both sinks
 * are env-gated and non-blocking, so a missing config or a slow third party
 * never affects the visitor. Call alongside notifyLeadEvent at each capture site.
 */
export function notifyOwnerLead(details: OwnerLeadDetails): void {
  const run = () => Promise.allSettled([emailOwner(details), forwardToErp(details)]);
  try {
    after(() => {
      void run();
    });
  } catch {
    void run();
  }
}
