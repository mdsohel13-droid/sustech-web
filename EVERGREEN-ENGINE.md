# Evergreen Engine

How the Sustech site keeps itself fresh with minimal human touch (plan Part 4).
Because this is an engineering firm — a wrong public spec is a liability, not a
typo — **anything reversible/technical is fully automatic; any net-new public
_claim_ stays one-tap.**

## Autonomy tiers

| Tier | Approval | Examples |
|------|----------|----------|
| **0 — automatic** | none (reversible, non-claim) | IndexNow re-crawl pings, sitemap/llms refresh, ISR revalidation, freshness, analytics digest |
| **1 — one-tap** | you approve in Telegram | article-of-the-week, new case studies, proof-number refresh, new testimonials/logos |
| **2 — human only** | you initiate | pricing, certifications, positioning, legal |

Guardrail: Hermes is **draft-only** for public content; Tier-1 publishes only on
your tap. `AUTO_PUBLISH_ENABLED` stays `false`. Nothing invents figures.

## What runs, and where it lives

### Tier 0 — automatic
- **Instant re-indexing (IndexNow).** On every _published_ content change the
  revalidate hook pings IndexNow so Bing/Yandex/etc. re-crawl that URL within
  minutes (also accelerates dropping stale/old index entries).
  - `lib/indexnow.ts` — `submitIndexNow(paths)`, no-op unless `INDEXNOW_KEY` set
    **and** `NEXT_PUBLIC_SERVER_URL` is https (dev/beta never ping).
  - `cms/hooks/revalidate.ts` — pings the changed page/collection URL after ISR.
  - `GET /api/indexnow/key` — serves the verification key (`keyLocation`).
  - `GET|POST /api/cron/indexnow` (`CRON_SECRET`) — weekly full resubmit of the
    whole canonical set (from the sitemap), so nothing is ever missed.
- **Content-health audit (detect-only).** `GET|POST /api/cron/content-health`
  (`CRON_SECRET`) sweeps the CMS for missing image alt text, missing SEO meta
  descriptions on published docs, and unfinished sector funnels — returns a
  structured report for the weekly digest. `lib/content-health.ts` (pure checks +
  runner; changes nothing).
- **Edge-cache purge on publish.** Cloudflare caches the HTML, so after Next
  revalidates a page the hook also purges the CDN edge — the change is visible
  immediately instead of after the CDN TTL. `lib/cloudflare-purge.ts`; no-op unless
  `CLOUDFLARE_ZONE_ID` + `CLOUDFLARE_API_TOKEN` are set (token needs Cache-Purge on
  the zone). A global/nav change purges the whole zone.
- **Sitemap + llms.txt freshness.** `app/sitemap.ts` / `app/llms.txt` are dynamic
  (ISR, 1h) and the revalidate hook refreshes them on any content change.
- **Fallback heartbeat / gap detection.** `GET /api/cron/nightly` (`CRON_SECRET`,
  detect-only) records a `pipeline-runs` row if n8n missed its slot.

### Tier 1 — one-tap (draft → approve)
- **Daily content pipeline:** `n8n content-engine` → `/api/hermes/content-brief`
  → Claude → `/api/hermes/ingest` (creates a **News draft**). See
  `marketing/n8n/content-engine.md`.
- **Approval queue:** drafts land in a review state; approve/publish via the
  token routes (`/api/approve`, `/review`) — Hermes cannot publish.
- **Audit trail:** every automated action is recorded (`publish-audit`,
  `pipeline-runs`) and summarised in the daily report (`lib/daily-report.ts`).

## Setup (prod)
Set in the web `.env`: `INDEXNOW_KEY` (random 16–32 hex), `CRON_SECRET`.
Add a weekly crontab entry (or n8n schedule) hitting
`/api/cron/indexnow` with the `CRON_SECRET`. Verify the key file resolves:
`curl https://www.sustechltd.com/api/indexnow/key` → returns the key.

## How to pause it
- **Stop instant pings:** unset `INDEXNOW_KEY` (everything else keeps working).
- **Stop content drafting:** disable the n8n `content-engine` workflow.
- **Publishing is already paused by default** (`AUTO_PUBLISH_ENABLED=false`).

## Not yet automated (candidate Tier-0 follow-ups)
Internal-linking pass, broken internal-link crawl, schema validation, scheduled
Lighthouse regression, featured-project rotation. Each should still pass the full
quality gate before any merge.
