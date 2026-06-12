/**
 * Content-lint v1 (Lead Engine master plan §3.1d / §3.6) — pure, no I/O, so
 * it's unit-tested and runs identically in the CMS hook and (later) CI.
 *
 * Enforces two editorial rules at publish time:
 *  1. Company stats are interpolated at render from lib/company-facts.ts —
 *     never typed into body copy. Flags literal "103+", "175+", "10 sectors",
 *     "8 years" so a stale number can't be hard-coded.
 *  2. No guarantees / absolute promises (catalog figures must stay hedged).
 *     Flags "guarantee(d)", "guaranteed savings", "100% efficiency", etc.
 */

export interface LintFinding {
  rule: "literal-company-stat" | "banned-guarantee";
  match: string;
  hint: string;
}

const LITERAL_STAT_PATTERNS: { re: RegExp; hint: string }[] = [
  {
    re: /\b1\s*0\s*3\s*\+?\s*projects?\b/gi,
    hint: "Use the projects stat from lib/company-facts.ts, not a literal.",
  },
  {
    re: /\b1\s*7\s*5\s*\+?\s*clients?\b/gi,
    hint: "Use the clients stat from lib/company-facts.ts, not a literal.",
  },
  {
    re: /\b10\s*\+?\s*sectors?\b/gi,
    hint: "Use the sectors stat from lib/company-facts.ts, not a literal.",
  },
  {
    re: /\b8\s*\+?\s*years?\b/gi,
    hint: "Use the years-active stat from lib/company-facts.ts, not a literal.",
  },
];

const BANNED_PHRASES: { re: RegExp; hint: string }[] = [
  {
    re: /\bguarantee(d|s)?\b/gi,
    hint: 'Performance figures must be hedged ("up to"), never guaranteed.',
  },
  {
    re: /\b100\s*%\s*(efficiency|uptime|savings?)\b/gi,
    hint: "Absolute performance claim — hedge it.",
  },
  {
    re: /\bzero\s+(downtime|maintenance\s+forever)\b/gi,
    hint: "Avoid absolute zero-downtime promises.",
  },
  {
    re: /\b(lowest|cheapest|best)\s+price\b/gi,
    hint: "Price superlatives are unverifiable; route to consultation.",
  },
];

/** Lint a block of plain text. Returns all findings (empty = clean). */
export function lintText(text: string): LintFinding[] {
  const findings: LintFinding[] = [];
  for (const { re, hint } of LITERAL_STAT_PATTERNS) {
    for (const m of text.matchAll(re)) {
      findings.push({ rule: "literal-company-stat", match: m[0].trim(), hint });
    }
  }
  for (const { re, hint } of BANNED_PHRASES) {
    for (const m of text.matchAll(re)) {
      findings.push({ rule: "banned-guarantee", match: m[0].trim(), hint });
    }
  }
  return findings;
}

/** Recursively extract visible text from a Lexical richText value. */
export function extractLexicalText(node: unknown): string {
  if (node == null) return "";
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(extractLexicalText).join(" ");
  if (typeof node === "object") {
    const n = node as Record<string, unknown>;
    const here = typeof n.text === "string" ? n.text : "";
    const root = n.root !== undefined ? extractLexicalText(n.root) : "";
    const children = n.children !== undefined ? extractLexicalText(n.children) : "";
    return [here, root, children].filter(Boolean).join(" ");
  }
  return "";
}

/** Lint a Lexical richText value (extracts text first). */
export function lintRichText(richText: unknown): LintFinding[] {
  return lintText(extractLexicalText(richText));
}
