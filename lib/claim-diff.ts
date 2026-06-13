/**
 * Claim-diff (Lead Engine master plan §3.2c, gate 4). PURE, unit-tested.
 *
 * The auto-publish guard requires the numeric claims ledger to be BYTE-IDENTICAL
 * between the live published version and the candidate draft. Any change to a
 * value, unit, source type or citation index is a hard veto — a robot must
 * never auto-publish a changed number (a wrong tariff to bankers is the exact
 * failure this prevents). Prose may change freely; numbers may not.
 */

export interface Claim {
  claimText?: string | null;
  value?: string | null;
  unit?: string | null;
  sourceType?: string | null;
  citationIndex?: number | null;
  hedge?: string | null;
}

export interface ClaimDiffResult {
  identical: boolean;
  changes: string[]; // human-readable, for the audit snapshot
}

/** The numeric-bearing fields. claimText/hedge are prose-ish and ignored. */
function fingerprint(c: Claim): string {
  return JSON.stringify({
    value: (c.value ?? "").trim(),
    unit: (c.unit ?? "").trim(),
    sourceType: c.sourceType ?? "",
    citationIndex: c.citationIndex ?? null,
  });
}

/** Multiset of claim fingerprints, order-independent. */
function counts(claims: Claim[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const c of claims) {
    const k = fingerprint(c);
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return m;
}

/**
 * Compare two claims ledgers. Returns identical=true only when the numeric
 * fingerprints match exactly (count + content), order-independent.
 */
export function diffClaims(
  prev: Claim[] | null | undefined,
  next: Claim[] | null | undefined,
): ClaimDiffResult {
  const a = counts(prev ?? []);
  const b = counts(next ?? []);
  const changes: string[] = [];

  if (a.size !== b.size || (prev ?? []).length !== (next ?? []).length) {
    changes.push(`claim count changed: ${(prev ?? []).length} → ${(next ?? []).length}`);
  }
  for (const [k, n] of a) {
    if ((b.get(k) ?? 0) !== n) changes.push(`removed/changed: ${k}`);
  }
  for (const [k, n] of b) {
    if ((a.get(k) ?? 0) !== n) changes.push(`added/changed: ${k}`);
  }

  return { identical: changes.length === 0, changes: [...new Set(changes)] };
}
