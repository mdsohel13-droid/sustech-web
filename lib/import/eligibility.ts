/**
 * Only WON / COMPLETED work is eligible. A client is INCLUDED only if its status is
 * "Client — Work Won" (or it has won/billed work), and is NEVER included if its status is a
 * non-won pipeline stage (Lead / Quoted — Pending WO / Engaged — No Formal Quote). The hard
 * exclusion wins, so a pending client is never surfaced even if a stray bill exists.
 */

export type EligibilityReason =
  | "won"
  | "excluded: lead"
  | "excluded: quoted (pending)"
  | "excluded: engaged (no formal quote)"
  | "not won"
  | "no status"
  | "no client";

export interface EligibilityInput {
  status: string;
  jobsWon: number;
  bills: number;
}

export function evaluateEligibility(input: EligibilityInput): {
  eligible: boolean;
  reason: EligibilityReason;
} {
  const status = (input.status ?? "").trim();
  if (!status) return { eligible: false, reason: "no status" };

  if (/^lead/i.test(status)) return { eligible: false, reason: "excluded: lead" };
  if (/^quoted/i.test(status)) return { eligible: false, reason: "excluded: quoted (pending)" };
  if (/^engaged/i.test(status)) {
    return { eligible: false, reason: "excluded: engaged (no formal quote)" };
  }

  const won = /work won/i.test(status) || input.jobsWon > 0 || input.bills > 0;
  return won ? { eligible: true, reason: "won" } : { eligible: false, reason: "not won" };
}
