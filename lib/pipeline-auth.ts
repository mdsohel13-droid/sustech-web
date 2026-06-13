/**
 * Shared auth for the pipeline routes (Lead Engine master plan §3.0). Bearer or
 * `x-pipeline-secret` header checked in constant time against the env secret.
 * Each secret guards a distinct surface; a missing env secret denies (never
 * fail-open).
 */
import { timingSafeEqual } from "crypto";

function safeEq(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/** True if the request carries the named env secret (Bearer or x-<header>). */
export function hasSecret(req: Request, envName: "PIPELINE_SECRET" | "CRON_SECRET"): boolean {
  const expected = process.env[envName];
  if (!expected) return false;
  const auth = req.headers.get("authorization") ?? "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const header = req.headers.get("x-pipeline-secret") ?? req.headers.get("x-cron-secret") ?? "";
  const provided = bearer || header;
  return Boolean(provided) && safeEq(provided, expected);
}
