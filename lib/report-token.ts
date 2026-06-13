/**
 * Signed report tokens (Lead Engine master plan §3.3 — "PDF v1 = print-styled
 * HTML at /reports/[leadId]/[token], signed, noindex"). Server-only HMAC, like
 * the gated-download token but with its own secret and a longer TTL (the link
 * lives in the owner's email and may be revisited).
 */
import { createHmac, timingSafeEqual } from "crypto";

const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function secret(): string {
  return process.env.REPORTS_SECRET ?? "";
}

function sign(id: string, exp: number): string {
  return createHmac("sha256", secret()).update(`report:${id}.${exp}`).digest("hex");
}

/** Mint a 30-day report token for a lead id. Null if unconfigured. */
export function signReport(leadId: string | number): string | null {
  if (!secret()) return null;
  const exp = Date.now() + TTL_MS;
  return `${exp}.${sign(String(leadId), exp)}`;
}

/** Build the full signed report path, or null when unconfigured. */
export function reportPath(leadId: string | number): string | null {
  const token = signReport(leadId);
  return token ? `/reports/${leadId}/${encodeURIComponent(token)}` : null;
}

/** Verify a report token for a lead id (constant-time, expiry-checked). */
export function verifyReport(leadId: string | number, token: string | null | undefined): boolean {
  if (!secret() || !token) return false;
  const [expStr, sig] = token.split(".");
  const exp = Number(expStr);
  if (!expStr || !sig || !Number.isFinite(exp) || Date.now() > exp) return false;
  const expected = sign(String(leadId), exp);
  if (sig.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}
