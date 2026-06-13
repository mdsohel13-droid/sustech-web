/**
 * Signed gated-download tokens (Lead Engine master plan §3.3). Server-only.
 * A token authorises one resource id for 24 h: `<exp>.<hmac>` where the HMAC is
 * over `id.exp` with GATED_DOWNLOAD_SECRET. The web tier never streams the file;
 * /api/download/[id] verifies the token then redirects to the real file URL.
 */
import { createHmac, timingSafeEqual } from "crypto";

const TTL_MS = 24 * 60 * 60 * 1000;

function secret(): string {
  return process.env.GATED_DOWNLOAD_SECRET ?? "";
}

function sign(id: string, exp: number): string {
  return createHmac("sha256", secret()).update(`${id}.${exp}`).digest("hex");
}

/** Mint a token for a resource id, valid for 24 h. Returns null if unconfigured. */
export function signDownload(id: string | number): string | null {
  if (!secret()) return null;
  const exp = Date.now() + TTL_MS;
  return `${exp}.${sign(String(id), exp)}`;
}

/** Verify a token for a resource id (constant-time, expiry-checked). */
export function verifyDownload(id: string | number, token: string | null | undefined): boolean {
  if (!secret() || !token) return false;
  const [expStr, sig] = token.split(".");
  const exp = Number(expStr);
  if (!expStr || !sig || !Number.isFinite(exp) || Date.now() > exp) return false;
  const expected = sign(String(id), exp);
  if (sig.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}
