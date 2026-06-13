/**
 * Rule-based lead scoring (Lead Engine master plan §3.4). Pure function — no
 * I/O — so the rules are unit-testable and auditable. 0–100; ≥60 is "hot"
 * (triggers the instant owner ping in the n8n lead-intake workflow).
 *
 * Philosophy: score = how strongly this person has raised their hand, plus
 * how well they fit the C&I ICP. Behavioral signals (calculator completed,
 * multiple touches) outweigh static fit. Rules are deliberately simple —
 * a 1-person pipeline needs explainable heat, not ML.
 */

export const HOT_THRESHOLD = 60;

/** Free / personal mailbox providers — corporate domains score higher. */
const FREE_MAIL = new Set([
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "icloud.com",
  "aol.com",
  "mail.com",
  "protonmail.com",
  "yandex.com",
]);

export interface ScoringInput {
  source: "rfq" | "chat" | "calculator" | "gated-asset" | "outbound" | "manual";
  segment?: string | null;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  /** Total recorded touches including the current one. */
  touchCount?: number;
  /** Visitor message length — a written brief signals real intent. */
  messageLength?: number;
}

/** Points for how the lead arrived (hand-raise strength). */
const SOURCE_POINTS: Record<ScoringInput["source"], number> = {
  rfq: 35, // wrote to us asking for a quote — strongest signal
  calculator: 30, // invested effort, asked for the report
  chat: 25, // started a conversation
  "gated-asset": 20, // exchanged contact for a whitepaper
  outbound: 15, // replied to outreach (human-promoted)
  manual: 10,
};

/** High-value ICP segments (C&I focus — Brief + master plan §1.2). */
const SEGMENT_POINTS: Record<string, number> = {
  rmg: 15,
  bank: 15,
  investor: 15,
  commercial: 10,
  "real-estate": 10,
  "gov-ngo": 8,
  home: 3,
  other: 0,
};

export function corporateEmailDomain(email: string | null | undefined): string | null {
  const at = (email ?? "").trim().toLowerCase().split("@");
  if (at.length !== 2 || !at[1]) return null;
  return FREE_MAIL.has(at[1]) ? null : at[1];
}

/** Compute the 0–100 heat score. */
export function scoreLead(input: ScoringInput): number {
  let score = SOURCE_POINTS[input.source] ?? 10;

  score += SEGMENT_POINTS[input.segment ?? "other"] ?? 0;

  // Reachability + identity quality
  if (corporateEmailDomain(input.email)) score += 15;
  if ((input.phone ?? "").trim().length >= 7) score += 10;
  if ((input.company ?? "").trim()) score += 5;

  // Engagement depth
  const touches = Math.max(1, input.touchCount ?? 1);
  score += Math.min(15, (touches - 1) * 5); // repeat engagement compounds, capped
  if ((input.messageLength ?? 0) >= 80) score += 5; // wrote a real brief

  return Math.max(0, Math.min(100, score));
}

export const isHot = (score: number): boolean => score >= HOT_THRESHOLD;
