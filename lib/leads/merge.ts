/**
 * Pure lead merge/sanitize logic — NO I/O, no Payload imports, so it unit-
 * tests without a database or env. `lib/leads/upsert-lead.ts` is the thin
 * persistence wrapper around this module.
 */
import type { Lead } from "@/payload-types";
import { scoreLead, type ScoringInput } from "./scoring";

export interface LeadTouch {
  source: ScoringInput["source"];
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  segment?: string;
  message?: string;
  sourcePath?: string;
  utm?: { source?: string; medium?: string; campaign?: string };
  /**
   * Consent may ONLY be passed by first-party UI code where the visitor
   * ticked the unticked box themselves. The /api/leads/ingest route strips it
   * unconditionally before calling here.
   */
  marketingOptIn?: boolean;
  /** Calculator inputs/outputs captured with the lead (for the emailed report). */
  calcPayload?: Record<string, unknown>;
}

export type LeadData = Partial<
  Pick<
    Lead,
    | "name"
    | "company"
    | "email"
    | "phone"
    | "segment"
    | "source"
    | "score"
    | "status"
    | "marketingOptIn"
    | "utmSource"
    | "utmMedium"
    | "utmCampaign"
    | "sourcePath"
    | "touches"
    | "notes"
    | "calcPayload"
  >
>;

const clean = (v: unknown, max: number): string | undefined => {
  const s = typeof v === "string" ? v.trim().slice(0, max) : "";
  return s || undefined;
};

const SEGMENTS = new Set([
  "investor",
  "rmg",
  "real-estate",
  "commercial",
  "bank",
  "gov-ngo",
  "home",
  "other",
]);

/** Sanitize one inbound touch (clamp lengths, drop junk). Pure. */
export function sanitizeTouch(t: LeadTouch): LeadTouch {
  return {
    source: t.source,
    name: clean(t.name, 120),
    email: clean(t.email, 200)?.toLowerCase(),
    phone: clean(t.phone, 40),
    company: clean(t.company, 160),
    segment: SEGMENTS.has(t.segment ?? "") ? t.segment : undefined,
    message: clean(t.message, 2000),
    sourcePath: clean(t.sourcePath, 300),
    utm: t.utm
      ? {
          source: clean(t.utm.source, 100),
          medium: clean(t.utm.medium, 100),
          campaign: clean(t.utm.campaign, 150),
        }
      : undefined,
    marketingOptIn: t.marketingOptIn === true,
    calcPayload: boundedPayload(t.calcPayload),
  };
}

/** Keep only a small, JSON-serialisable calc payload (defensive size bound). */
function boundedPayload(p: unknown): Record<string, unknown> | undefined {
  if (!p || typeof p !== "object") return undefined;
  try {
    const json = JSON.stringify(p);
    if (json.length > 8000) return undefined; // implausibly large → drop
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return undefined;
  }
}

/**
 * Merge a sanitized touch into an existing lead (or null for a new one).
 * Pure — returns the data to persist. Rules:
 *  - never blank an existing field with an empty incoming one
 *  - first-touch attribution wins (source/UTM/sourcePath set once)
 *  - consent is one-way ON here; doNotContact is NEVER touched by upserts
 *  - touch timeline appends (bounded at 50); score recomputes over the merge
 */
export function mergeLead(existing: Lead | null, t: LeadTouch, now: Date): LeadData {
  const touches = [
    ...(existing?.touches ?? []),
    { at: now.toISOString(), channel: t.source, note: t.message ?? null },
  ].slice(-50);

  const merged: LeadData = {
    name: t.name ?? existing?.name ?? undefined,
    company: t.company ?? existing?.company ?? undefined,
    email: existing?.email ?? t.email ?? undefined,
    phone: t.phone ?? existing?.phone ?? undefined,
    segment: (t.segment ?? existing?.segment ?? "other") as Lead["segment"],
    source: (existing?.source ?? t.source) as Lead["source"],
    utmSource: existing?.utmSource ?? t.utm?.source ?? undefined,
    utmMedium: existing?.utmMedium ?? t.utm?.medium ?? undefined,
    utmCampaign: existing?.utmCampaign ?? t.utm?.campaign ?? undefined,
    sourcePath: existing?.sourcePath ?? t.sourcePath ?? undefined,
    marketingOptIn: existing?.marketingOptIn || t.marketingOptIn === true,
    // Latest calculator run wins (the emailed report reflects the most recent estimate).
    calcPayload: t.calcPayload ?? existing?.calcPayload ?? undefined,
    touches,
  };

  merged.score = scoreLead({
    source: t.source,
    segment: merged.segment,
    email: merged.email,
    phone: merged.phone,
    company: merged.company,
    touchCount: touches.length,
    messageLength: t.message?.length ?? 0,
  });

  // A won/lost lead that re-engages goes back into the pipeline.
  if (existing && (existing.status === "lost" || existing.status === "won")) {
    merged.status = "new";
  }

  return merged;
}
