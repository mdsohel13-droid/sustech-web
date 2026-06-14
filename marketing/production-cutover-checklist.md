# Production cutover checklist (Phase 6)

Move from beta-only to indexed production on **www.sustechltd.com**. Do this when
beta has run clean for a few days and real leads are flowing. The code side is
ready — the steps below are owner/Hermes actions (an agent does not merge to
`main` or change DNS/SSL).

> Pre-req: the calculatorEmbed `calc_type` hotfix (commit `d5c6f72`) is on
> `feat/ui-improvements`, so it flows to `main` with PR #42 automatically.

## 1. Merge to main
- [ ] Beta verified (homepage + calculators + a real captured lead in `/admin`).
- [ ] Merge **PR #42** (`main ← feat/ui-improvements`). CI green first.

## 2. Provision the production host (if separate from beta)
- [ ] Deploy `main` (same steps as the merge-deploy guide §3): `git reset --hard origin/main` → `pnpm install --frozen-lockfile` → `pnpm migrate:status` → `pnpm migrate` → `pnpm seed:sources` (once) → `pnpm build` → `pm2 restart`.
- [ ] Copy `.env.production` secrets; **keep `AUTO_PUBLISH_ENABLED=false`**.

## 3. SSL on the bare domain (currently HTTP-only)
- [ ] `certbot --nginx -d sustechltd.com -d www.sustechltd.com`
- [ ] Confirm `https://sustechltd.com` and `https://www.sustechltd.com` serve 200.
- [ ] Pick the canonical host (recommend `www`) and 301-redirect the apex to it in nginx.
- [ ] Set `NEXT_PUBLIC_SERVER_URL=https://www.sustechltd.com` and `SITE_URL=https://www.sustechltd.com`.
- [ ] Enable HSTS only after **both** hosts serve clean HTTPS.

## 4. Flip indexing (the one switch)
- [ ] Set **`SITE_INDEXABLE=true`** in `.env.production`, rebuild + restart.
- [ ] Verify: `curl https://www.sustechltd.com/robots.txt` now **allows** `/` and lists GPTBot/ClaudeBot/PerplexityBot/Googlebot/Bingbot (was `Disallow: /` on beta).
- [ ] Verify a page no longer carries `X-Robots-Tag: noindex` / `<meta robots noindex>`.
- [ ] `curl https://www.sustechltd.com/sitemap.xml` returns the full URL set (pages, services, sectors, projects, knowledge, calculators, news).
- [ ] `curl https://www.sustechltd.com/llms.txt` returns the GEO index.

## 5. Submit to search + AI engines
- [ ] Google Search Console: add `www.sustechltd.com`, submit `sitemap.xml`.
- [ ] Bing Webmaster Tools: same.
- [ ] (Already verifiable now while on beta — register ownership early.)

## 6. Post-cutover monitoring (first week)
- [ ] Daily report arrives at `OWNER_NOTIFY_EMAIL` (08:00 Dhaka).
- [ ] GSC "Pages" shows the site being crawled; no coverage errors.
- [ ] Spot-check an AI engine (Perplexity/ChatGPT/Claude): does a Sustech page get cited for a target query (e.g. "diesel vs lithium BESS Bangladesh")?
- [ ] PM2: `sustech-web` stable (watch restart count); add `pm2 startup systemd` + `pm2 save` so a reboot survives.

## 7. Only after a stable month — consider enabling auto-publish
- [ ] Review ≥2 weeks of sweep `shadow`/`wouldPublish` logs (`/var/log/sustech/sweep.log`).
- [ ] If the would-publish set looks correct every time: flip **`AUTO_PUBLISH_ENABLED=true`** AND the `automation-settings.autoPublishEnabled` DB toggle. Both required; either off = no auto-publish.
- [ ] Keep `AUTOMATION_KILL_SWITCH` ready as the instant env-level stop.

## Rollback
Wrong content live → restore the prior published version in the Payload version
browser (`/admin`); revalidate hooks refresh the page; target < 2 minutes.
Whole-site issue → redeploy the previous git tag and `pm2 restart`.
