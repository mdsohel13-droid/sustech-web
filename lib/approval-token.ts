/**
 * Approval tokens (Lead Engine master plan §3.2c). One token spec for the
 * one-click approve/reject flow. Minimal HS256 JWT (node crypto — no external
 * dependency), so the same secret signs and verifies without a library.
 *
 * Guarantees baked into the payload:
 *  - `versionId` PINS the token to a specific draft version → approving after a
 *    newer draft exists fails ("content changed — re-review").
 *  - `jti` is single-use (the caller records it in publish-audit and rejects
 *    replays).
 *  - `exp` (default 72 h) bounds the blast radius of a leaked link.
 *  - GET only renders a confirm page; POST acts (mail-scanner prefetch can't act).
 */
import { createHmac, randomBytes, timingSafeEqual } from "crypto";

export interface ApprovalClaims {
  docId: string | number;
  collection: "articles" | "news-items";
  versionId: string | number;
  action: "approve" | "reject" | "preview";
  jti: string;
  exp: number; // unix seconds
}

const DEFAULT_TTL_HOURS = Number(process.env.APPROVAL_TTL_HOURS ?? 72);

function secret(): string {
  return process.env.APPROVAL_TOKEN_SECRET ?? "";
}

function b64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlJson(obj: unknown): string {
  return b64url(Buffer.from(JSON.stringify(obj)));
}
function fromB64url(s: string): Buffer {
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

/** Sign an approval JWT. Returns null if no secret is configured. */
export function signApproval(
  input: Omit<ApprovalClaims, "jti" | "exp"> & { jti?: string; ttlHours?: number },
): { token: string; jti: string; exp: number } | null {
  if (!secret()) return null;
  const jti = input.jti ?? b64url(randomBytes(12));
  const exp = Math.floor(Date.now() / 1000) + (input.ttlHours ?? DEFAULT_TTL_HOURS) * 3600;
  const header = b64urlJson({ alg: "HS256", typ: "JWT" });
  const claims: ApprovalClaims = {
    docId: input.docId,
    collection: input.collection,
    versionId: input.versionId,
    action: input.action,
    jti,
    exp,
  };
  const body = b64urlJson(claims);
  const sig = b64url(createHmac("sha256", secret()).update(`${header}.${body}`).digest());
  return { token: `${header}.${body}.${sig}`, jti, exp };
}

/** Verify + decode an approval JWT (signature, expiry). Null if invalid. */
export function verifyApproval(token: string | null | undefined): ApprovalClaims | null {
  if (!secret() || !token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, body, sig] = parts as [string, string, string];
  const expected = b64url(createHmac("sha256", secret()).update(`${header}.${body}`).digest());
  let ok = false;
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    ok = a.length === b.length && timingSafeEqual(a, b);
  } catch {
    ok = false;
  }
  if (!ok) return null;
  let claims: ApprovalClaims;
  try {
    claims = JSON.parse(fromB64url(body).toString("utf8")) as ApprovalClaims;
  } catch {
    return null;
  }
  if (!claims.exp || Math.floor(Date.now() / 1000) > claims.exp) return null;
  if (!claims.docId || !claims.collection || !claims.jti) return null;
  return claims;
}
