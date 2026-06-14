/**
 * Crypto helpers for the lead-engine surface (master plan §4.1 / integration
 * brief §3). Pure Node crypto — no I/O — unit-tested in
 * tests/unit/leads-security.test.ts.
 *
 *  - HMAC request signing: GrowthOS/n8n sign the raw request body with the
 *    shared LEADENGINE_INGEST_SECRET; we verify timing-safely.
 *  - Suppression hashes: raw emails NEVER leave this box — the suppression
 *    feed exports SHA-256 of the lowercased, trimmed address only.
 *  - Confirm tokens: double-opt-in links carry HMAC(email|exp) so the confirm
 *    route is stateless and unforgeable; single-purpose secret.
 */
import { createHash, createHmac, timingSafeEqual } from "crypto";

export function sha256Hex(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

/** Canonical suppression hash: SHA-256 of the lowercased, trimmed email. */
export function emailHash(email: string): string {
  return sha256Hex(email.trim().toLowerCase());
}

export function hmacHex(secret: string, payload: string): string {
  return createHmac("sha256", secret).update(payload, "utf8").digest("hex");
}

/** Constant-time hex comparison (length leak is fine; content is not). */
export function safeEqualHex(a: string, b: string): boolean {
  const ba = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  if (ba.length !== bb.length || ba.length === 0) return false;
  return timingSafeEqual(ba, bb);
}

/** Verify an HMAC signature over a raw request body. */
export function verifySignature(secret: string, rawBody: string, signature: string): boolean {
  if (!/^[0-9a-f]{64}$/i.test(signature)) return false;
  return safeEqualHex(hmacHex(secret, rawBody), signature.toLowerCase());
}

// ── Double-opt-in confirm tokens ─────────────────────────────────────────────

const CONFIRM_TTL_MS = 7 * 24 * 60 * 60 * 1000; // links stay valid for 7 days

export function makeConfirmToken(secret: string, email: string, now = Date.now()): string {
  const exp = now + CONFIRM_TTL_MS;
  const payload = `${email.trim().toLowerCase()}|${exp}`;
  const sig = hmacHex(secret, payload);
  return Buffer.from(`${payload}|${sig}`, "utf8").toString("base64url");
}

export function verifyConfirmToken(
  secret: string,
  token: string,
  now = Date.now(),
): { email: string } | null {
  let decoded: string;
  try {
    decoded = Buffer.from(token, "base64url").toString("utf8");
  } catch {
    return null;
  }
  const parts = decoded.split("|");
  if (parts.length !== 3) return null;
  const [email, expStr, sig] = parts as [string, string, string];
  const exp = Number(expStr);
  if (!email || !sig || !Number.isFinite(exp) || now > exp) return null;
  if (!safeEqualHex(hmacHex(secret, `${email}|${exp}`), sig)) return null;
  return { email };
}
