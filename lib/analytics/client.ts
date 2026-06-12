"use client";

/**
 * Cookieless first-party analytics client (master plan §3.4). ~1 KB instead
 * of a 50 KB SDK — protects the LCP/INP budgets (CLAUDE.md §4). Talks only to
 * the same-origin /ingest proxy (CSP connect-src 'self' intact).
 *
 * Privacy posture:
 *  - NO cookies. A random per-tab-session id lives in sessionStorage and dies
 *    with the tab session — no cross-visit tracking, no consent banner needed.
 *  - Respects Do Not Track / Global Privacy Control.
 *  - $process_person_profile:false — events stay anonymous in PostHog.
 *  - Properties pass the same allowlist as the server (no PII can leak in).
 */
import { sanitizeProps, type AnalyticsEvent } from "./events";

const SESSION_KEY = "stc_aid";
const UTM_KEY = "stc_utm";

function enabled(): boolean {
  if (typeof window === "undefined") return false;
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return false;
  const dnt =
    navigator.doNotTrack === "1" ||
    (navigator as { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
  return !dnt;
}

function sessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = "anon-" + crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "anon-ephemeral";
  }
}

/** Persist UTM params for the tab session so lead capture can attribute. */
export function rememberUtm(): void {
  if (typeof window === "undefined") return;
  try {
    const p = new URLSearchParams(window.location.search);
    const utm = {
      source: p.get("utm_source") ?? undefined,
      medium: p.get("utm_medium") ?? undefined,
      campaign: p.get("utm_campaign") ?? undefined,
    };
    if (utm.source || utm.medium || utm.campaign) {
      sessionStorage.setItem(UTM_KEY, JSON.stringify(utm));
    }
  } catch {
    /* storage unavailable — attribution is best-effort */
  }
}

/** Read the remembered UTM set (for captureLead calls). */
export function getUtm(): { source?: string; medium?: string; campaign?: string } | undefined {
  try {
    const raw = sessionStorage.getItem(UTM_KEY);
    return raw ? (JSON.parse(raw) as ReturnType<typeof getUtm>) : undefined;
  } catch {
    return undefined;
  }
}

/** Send one event through the first-party proxy. Fire-and-forget. */
export function capture(event: AnalyticsEvent, props: Record<string, unknown> = {}): void {
  if (!enabled()) return;
  const body = JSON.stringify({
    api_key: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    event,
    distinct_id: sessionId(),
    properties: {
      ...sanitizeProps(props),
      $current_url: window.location.pathname, // path only — never query strings (may carry tokens)
      $process_person_profile: false,
    },
    timestamp: new Date().toISOString(),
  });
  try {
    // sendBeacon survives navigation; fetch keepalive is the fallback.
    if (!navigator.sendBeacon?.("/ingest/capture/", new Blob([body], { type: "text/plain" }))) {
      void fetch("/ingest/capture/", { method: "POST", body, keepalive: true });
    }
  } catch {
    /* analytics never breaks the page */
  }
}

export function capturePageview(pathname: string): void {
  capture("$pageview", { path: pathname });
}
