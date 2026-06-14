#!/usr/bin/env node
/**
 * healthcheck.mjs — post-deploy smoke test.
 *
 * Hits the key public + admin routes and checks status + a content signal, so a
 * deploy gets an automatic PASS/FAIL. It is tuned to catch the exact failure we
 * just fixed: a schema-drift read error makes DB-backed pages 500 or render
 * empty. `/llms.txt` reads Site Settings; `/knowledge?tab=downloads` reads the
 * Knowledge collection — if either is broken, this goes red.
 *
 * Usage:
 *   node scripts/healthcheck.mjs
 *   HEALTHCHECK_URL=https://beta.sustechltd.com node scripts/healthcheck.mjs
 *
 * Base URL resolution: HEALTHCHECK_URL -> SITE_URL -> http://localhost:3000
 * Exit code: 0 if all hard checks pass, 1 otherwise (so it can gate a deploy).
 */

const BASE = (
  process.env.HEALTHCHECK_URL ||
  process.env.SITE_URL ||
  "http://localhost:3000"
).replace(/\/$/, "");
const TIMEOUT_MS = 15_000;

/** @typedef {{ name: string, path: string, must?: string[], softData?: { present: string[], empty: string[] } }} Check */

/** @type {Check[]} */
const CHECKS = [
  { name: "Home", path: "/", must: ["</html>"] },
  { name: "Admin panel", path: "/admin", must: ["<html"] },
  { name: "llms.txt (reads Site Settings)", path: "/llms.txt", must: ["# "] },
  {
    name: "Knowledge - Downloads",
    path: "/knowledge?tab=downloads",
    must: ["Sample Documents"],
    softData: { present: ['download=""'], empty: ["coming soon"] },
  },
  {
    name: "Knowledge - Calculators",
    path: "/knowledge?tab=calculators",
    must: ["Engineering Calculators"],
    softData: { present: ["/knowledge/calculators/"], empty: ["coming soon"] },
  },
  { name: "Projects (reads Projects + Site Settings)", path: "/projects", must: ["</html>"] },
  { name: "Sitemap", path: "/sitemap.xml", must: ["<urlset"] },
  { name: "robots.txt", path: "/robots.txt", must: ["User-Agent", "User-agent"] },
];

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal, redirect: "manual" });
    const body = await res.text().catch(() => "");
    return { status: res.status, body };
  } finally {
    clearTimeout(t);
  }
}

const containsAny = (haystack, needles) => needles.some((n) => haystack.includes(n));

let failures = 0;
const lines = [];

process.stdout.write(`\nHealth check -> ${BASE}\n${"-".repeat(56)}\n`);

for (const c of CHECKS) {
  const url = `${BASE}${c.path}`;
  let ok = false;
  let detail = "";
  let dataNote = "";
  try {
    const { status, body } = await fetchWithTimeout(url);
    const statusOk = status >= 200 && status < 400;
    const mustOk = !c.must || c.must.some((m) => body.includes(m));
    ok = statusOk && mustOk;
    detail = `HTTP ${status}${mustOk ? "" : " (content signal missing)"}`;

    if (ok && c.softData) {
      if (containsAny(body, c.softData.present)) dataNote = "items present";
      else if (containsAny(body, c.softData.empty)) dataNote = "empty (no items yet)";
      else dataNote = "unknown";
    }
  } catch (e) {
    detail = `request failed: ${(e && e.message) || e}`;
  }

  if (!ok) failures += 1;
  const mark = ok ? "PASS" : "FAIL";
  const note = dataNote ? `  -- ${dataNote}` : "";
  lines.push(`[${mark}] ${c.name.padEnd(42)} ${detail}${note}`);
}

process.stdout.write(lines.join("\n") + "\n");
process.stdout.write(`${"-".repeat(56)}\n`);

if (failures === 0) {
  process.stdout.write(`ALL CHECKS PASSED (${CHECKS.length}/${CHECKS.length})\n\n`);
  process.exit(0);
} else {
  process.stdout.write(
    `${failures} CHECK(S) FAILED of ${CHECKS.length}. ` +
      `If DB-backed pages are red, run the recovery in DEPLOYMENT-AND-VPS.md section 8a.\n\n`,
  );
  process.exit(1);
}
