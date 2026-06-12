/**
 * Parse `[cite:n]` in-body citation markers (master plan §3.1c). Pure + I/O-
 * free so it's unit-tested; the React renderer (components/sections/
 * cited-rich-text.tsx) turns each marker into a `<sup>` footnote link.
 */

export type CiteSegment = { type: "text"; value: string } | { type: "cite"; n: number };

const MARKER = /\[cite:(\d+)\]/g;

/**
 * Split a text run into plain-text and citation segments.
 * "Solar saves 75% [cite:2]." → [text "Solar saves 75% ", cite 2, text "."]
 * Citation indices ≤ 0 are treated as literal text (defensive).
 */
export function splitCiteMarkers(text: string): CiteSegment[] {
  const out: CiteSegment[] = [];
  let last = 0;
  for (const m of text.matchAll(MARKER)) {
    const n = Number(m[1]);
    const start = m.index ?? 0;
    if (start > last) out.push({ type: "text", value: text.slice(last, start) });
    if (n >= 1) out.push({ type: "cite", n });
    else out.push({ type: "text", value: m[0] }); // keep [cite:0] literal
    last = start + m[0].length;
  }
  if (last < text.length) out.push({ type: "text", value: text.slice(last) });
  if (out.length === 0) out.push({ type: "text", value: text });
  return out;
}

/** True if the text contains at least one valid `[cite:n]` marker. */
export function hasCiteMarker(text: string): boolean {
  return /\[cite:[1-9]\d*\]/.test(text);
}
