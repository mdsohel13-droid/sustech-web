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
