/**
 * Source-watcher core (Lead Engine master plan §3.2a). The PURE, unit-tested
 * normalization + hashing used by both the n8n nightly workflow and the VPS
 * fallback route, so a "change" means the same thing in both paths.
 *
 * We never archive third-party pages: we keep a SHA-256 of the normalized text
 * and a short excerpt of the changed region only.
 */
import { createHash } from "crypto";

/**
 * Normalize fetched content for stable diffing: strip scripts/styles/tags,
 * collapse whitespace, drop volatile date-like tokens and page furniture so a
 * real content change isn't masked by — or faked by — a timestamp tick.
 */
export function normalizeContent(input: string): string {
  let s = input ?? "";
  s = s.replace(/<script[\s\S]*?<\/script>/gi, " ");
  s = s.replace(/<style[\s\S]*?<\/style>/gi, " ");
  s = s.replace(/<!--[\s\S]*?-->/g, " ");
  s = s.replace(/<[^>]+>/g, " "); // strip tags
  s = s.replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&");
  // Drop common volatile tokens (ISO dates, times) that change without content.
  s = s.replace(/\b\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2})?)?\b/g, " ");
  s = s.replace(/\b\d{1,2}:\d{2}(:\d{2})?\s*(am|pm)?\b/gi, " ");
  s = s.replace(/\s+/g, " ").trim().toLowerCase();
  return s;
}

/** SHA-256 hex of a string. */
export function sha256(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}

/** Hash of normalized content — the change-detection fingerprint. */
export function contentHash(raw: string): string {
  return sha256(normalizeContent(raw));
}

export interface ChangeResult {
  changed: boolean;
  hash: string;
  excerpt: string; // ≤300 chars of the changed region (never the full page)
}

/**
 * Compare new content against the last stored hash. Returns whether it changed,
 * the new hash, and a bounded excerpt of the new normalized text for context.
 */
export function detectChange(raw: string, lastHash: string | null | undefined): ChangeResult {
  const norm = normalizeContent(raw);
  const hash = sha256(norm);
  return {
    changed: hash !== (lastHash ?? ""),
    hash,
    excerpt: norm.slice(0, 300),
  };
}

/** Which sources are due tonight given their checkFrequency + lastCheckedAt. */
export function isDue(
  checkFrequency: string | null | undefined,
  lastCheckedAt: string | null | undefined,
  nowMs: number,
): boolean {
  if (!lastCheckedAt) return true;
  const last = new Date(lastCheckedAt).getTime();
  if (Number.isNaN(last)) return true;
  const days = (nowMs - last) / (24 * 3600 * 1000);
  switch (checkFrequency) {
    case "daily":
      return days >= 1;
    case "weekly":
      return days >= 7;
    case "monthly":
      return days >= 30;
    case "quarterly":
      return days >= 90;
    default:
      return days >= 1;
  }
}
