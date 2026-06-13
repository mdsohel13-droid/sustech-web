"use server";

import { headers } from "next/headers";
import { serverCapture } from "@/lib/analytics/server";
import { isHot } from "@/lib/leads/scoring";
import { notifyLeadEvent } from "@/lib/leads/notify";
import { upsertLead, type LeadTouch } from "@/lib/leads/upsert-lead";

/**
 * captureLead — the one server action every first-party capture surface calls
 * (calculator "email me this report", gated-asset downloads, newsletter box).
 * RFQ and chat keep their existing actions and converge on the same upsert
 * via hooks/internal calls.
 *
 * Hardening: honeypot, per-IP rate limit, length clamps in sanitizeTouch.
 * Consent: `marketingOptIn` here is legitimate ONLY because this action is
 * called by our own UI where the visitor ticked the unticked box themselves.
 */

export interface CaptureLeadInput extends Omit<LeadTouch, "source"> {
  source: Exclude<LeadTouch["source"], "outbound" | "manual">; // public surfaces only
  company_website?: string; // honeypot — real users never fill this
}

const hits = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 10;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

export async function captureLead(input: CaptureLeadInput): Promise<{ ok: boolean }> {
  if ((input.company_website ?? "").trim() !== "") return { ok: true }; // honeypot

  const allowedSources = new Set(["rfq", "chat", "calculator", "gated-asset"]);
  if (!allowedSources.has(input.source)) return { ok: false };

  const hdrs = await headers();
  const ip = (hdrs.get("x-forwarded-for") ?? "").split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) return { ok: false };

  const touch: LeadTouch = { ...input };
  delete (touch as CaptureLeadInput).company_website; // honeypot never persists
  const result = await upsertLead(touch);
  if (!result) return { ok: false };

  notifyLeadEvent({
    event: result.created ? "lead.created" : "lead.updated",
    email: touch.email,
    segment: touch.segment,
    source: touch.source,
    score: result.score,
    hot: isHot(result.score),
    utm: touch.utm,
  });
  serverCapture("lead_captured", {
    source: touch.source,
    segment: touch.segment ?? "other",
    score: result.score,
    created: result.created,
  });

  return { ok: true };
}
