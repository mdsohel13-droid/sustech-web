/**
 * Server-side PostHog capture (master plan §3.4) — authoritative funnel
 * events (RFQ, chat, lead, calculator) recorded from server code so ad
 * blockers can't blind the business numbers.
 *
 * Deliberately SDK-free: one HTTP POST to PostHog's /capture endpoint keeps
 * the dependency graph and cold-start cost at zero. Fire-and-forget; no-op
 * when NEXT_PUBLIC_POSTHOG_KEY is unset. NO PII: properties pass through the
 * sanitizeProps allowlist; the distinct id is a server-event constant, not a
 * person (people analytics stay client-side and cookieless).
 */
import { after } from "next/server";
import { sanitizeProps, type AnalyticsEvent } from "./events";

function posthogHost(): string {
  return (process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com").replace(/\/$/, "");
}

async function send(event: AnalyticsEvent, props: Record<string, unknown>): Promise<void> {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;
  try {
    await fetch(`${posthogHost()}/capture/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: key,
        event,
        distinct_id: "server",
        properties: { ...sanitizeProps(props), $process_person_profile: false },
        timestamp: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(4000),
    });
  } catch {
    // Analytics must never break a request.
  }
}

/** Capture a server event after the response flushes (zero visitor latency). */
export function serverCapture(event: AnalyticsEvent, props: Record<string, unknown> = {}): void {
  try {
    after(() => send(event, props));
  } catch {
    void send(event, props); // outside a request scope (scripts/tests)
  }
}
