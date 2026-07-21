#!/usr/bin/env node
/**
 * purge-cdn.mjs — purge the Cloudflare edge cache for the whole zone.
 *
 * Runs at the end of a deploy: a code deploy changes the rendered HTML, but the
 * CMS revalidate hook (which normally purges on publish) never fires, so without
 * this the CDN would keep serving the previous build until its TTL expires.
 *
 * No-op (exit 0) when Cloudflare isn't configured. NEVER fails the deploy — a
 * cache purge is best-effort; the site is already live and healthy by this point.
 */
import { readFileSync } from "node:fs";

/** Minimal .env reader so this works without extra flags/deps. process.env wins. */
function envFromFile(file = ".env") {
  const out = {};
  try {
    for (const line of readFileSync(file, "utf8").split("\n")) {
      const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
      if (!m) continue;
      out[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
    }
  } catch {
    /* no .env — rely on process.env */
  }
  return out;
}

const file = envFromFile();
const zone = process.env.CLOUDFLARE_ZONE_ID || file.CLOUDFLARE_ZONE_ID;
const token = process.env.CLOUDFLARE_API_TOKEN || file.CLOUDFLARE_API_TOKEN;

if (!zone || !token) {
  process.stdout.write("CDN purge skipped — CLOUDFLARE_ZONE_ID / CLOUDFLARE_API_TOKEN not set.\n");
  process.exit(0);
}

try {
  const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${zone}/purge_cache`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({ purge_everything: true }),
  });
  const body = await res.json().catch(() => ({}));
  if (res.ok && body?.success) {
    process.stdout.write("CDN purge: OK — Cloudflare edge cache cleared.\n");
  } else {
    // Surface the reason but do not fail: the deploy itself already succeeded.
    process.stdout.write(
      `CDN purge: FAILED (HTTP ${res.status}) — ${JSON.stringify(body?.errors ?? body).slice(0, 300)}\n` +
        "The site is live; the CDN will refresh on its own TTL. Check the API token's Cache Purge permission.\n",
    );
  }
} catch (err) {
  process.stdout.write(`CDN purge: skipped — ${String(err)}\n`);
}
process.exit(0);
