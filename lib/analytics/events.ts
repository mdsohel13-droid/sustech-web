/**
 * Typed analytics event registry (master plan §3.4 — "events stay typed in
 * lib/analytics/events.ts"; GTM intentionally skipped). One place to see
 * everything we measure. NO PII in any property — emails, phones and names
 * never enter analytics; leads carry identity, analytics carries behavior.
 */

export const ANALYTICS_EVENTS = {
  /** Server-side (authoritative funnel) */
  RFQ_SUBMITTED: "rfq_submitted",
  CHAT_STARTED: "chat_started",
  CHAT_LEAD_SUBMITTED: "chat_lead_submitted",
  LEAD_CAPTURED: "lead_captured",
  CALCULATOR_COMPLETED: "calculator_completed",
  REPORT_EMAIL_REQUESTED: "report_email_requested",
  GATED_ASSET_DOWNLOADED: "gated_asset_downloaded",
  /** Client-side (engagement) */
  PAGEVIEW: "$pageview",
  CTA_CLICKED: "cta_clicked",
  CALCULATOR_STARTED: "calculator_started",
} as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

/** Allowlisted property keys — anything else is dropped before sending. */
export const ALLOWED_PROPS = new Set([
  "source",
  "segment",
  "score",
  "created",
  "service",
  "intent",
  "calculator",
  "asset",
  "cta",
  "path",
  "referrer_domain",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "$current_url",
  "$pathname",
]);

export function sanitizeProps(
  props: Record<string, unknown>,
): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(props)) {
    if (!ALLOWED_PROPS.has(k)) continue;
    if (typeof v === "string") out[k] = v.slice(0, 300);
    else if (typeof v === "number" || typeof v === "boolean") out[k] = v;
  }
  return out;
}
