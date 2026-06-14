# Phase 4 — Pipeline operations (n8n + Resend + VPS crontab)

The **web repo** (this codebase) provides the routes, guards and collections. The
**operational pieces below run on VPS-2 / n8n / Hermes** — they are NOT code in
this repo. This is the hand-off for the GrowthOS/Hermes side.

> Safety posture: auto-publish ships **OFF**. Run ≥2 weeks of shadow-mode sweep
> logs before the owner flips `AUTO_PUBLISH_ENABLED=true` **and** the
> `automation-settings.autoPublishEnabled` DB toggle. Three independent stops +
> claim-diff veto + category whitelist + daily cap all apply.

## Env to set on the web server (`.env.production`)
`SOURCE_WATCH_ENABLED=true` · `AUTOMATION_KILL_SWITCH=false` · `PIPELINE_SECRET=…` ·
`CRON_SECRET=…` · `APPROVAL_TOKEN_SECRET=…` (distinct from PAYLOAD_SECRET) ·
`APPROVAL_TTL_HOURS=72` · `AUTO_PUBLISH_ENABLED=false` · `AUTO_PUBLISH_AFTER_HOURS=24` ·
`AUTO_PUBLISH_CATEGORIES=industry-news-roundup,knowledge-explainer,glossary` ·
`AUTO_PUBLISH_DAILY_CAP=5` · `OWNER_NOTIFY_EMAIL=…`

n8n holds (never in repo): Resend API key, Anthropic API key.

## 1. n8n `nightly-source-watch` — cron `0 4 * * *` (Asia/Dhaka)
1. `POST /api/pipeline/run-start` (Bearer PIPELINE_SECRET) → `{runId}`. 409 = pipeline disabled → stop.
2. `GET /api/pipeline/sources?due=today` → due sources.
3. **Robots/ToS node** (before any fetch): honour robots.txt; UA `SustechContentBot/1.0; +https://www.sustechltd.com/llms.txt`; disallowed → `PATCH /api/pipeline/sources {id, fetchPolicy:"manual-only"}`.
4. **Split in batches** (5, 10 s apart): conditional GET (`If-None-Match`/`If-Modified-Since`), 30 s timeout, 2 retries; 304 → unchanged.
5. **Code node**: normalize + SHA-256 (mirror `lib/source-watcher.ts`: strip tags/scripts/dates, lowercase, collapse whitespace). Store hash + ≤300-char excerpt of the changed region only — never the full page.
6. Changed → `GET /api/pipeline/affected?sourceId=` → else `PATCH /api/pipeline/sources {id, lastCheckedAt, etag, lastContentHash}`.
7. **Anthropic node** per affected doc → `{ revisedSections, changeSummary, riskFlags[] }`.
8. `POST /api/pipeline/revise {collection, docId, changeSummary, riskFlags, sourceId, bodyPatch}` → new DRAFT version (route re-derives risk flags server-side; never publishes).
9. `POST /api/pipeline/run-finish {runId, sourcesChecked, sourcesChanged, draftsCreated}`.
10. **Resend** owner digest: per draft, an Approve / Reject / Preview link using the JWT from `lib/approval-token` (sign `{docId, collection, versionId:<draft.updatedAt>, action, jti, exp}`). Links: `https://www.sustechltd.com/api/approve?token=…` (+ `&...` reject token) + `/api/approve/preview?token=…`.
11. **Resend `delivered` webhook** → a small n8n webhook that `PATCH`es the draft's `revisionMeta.pendingSince = now` (this starts the 24 h clock; no delivery → clock never starts → never auto-publishes). Also write a `publish-audit` `approval-email-delivered` row. No delivery within 6 h → lock to manual queue + alert the backup recipient.
12. **Error Trigger workflow** → owner email with failed node + `runId`.

## 2. n8n `auto-publish-sweep` — cron `15 * * * *` (hourly, NOT a Wait node)
`POST /api/pipeline/auto-publish-sweep` (Bearer PIPELINE_SECRET). The route does all the gating (`lib/auto-publish-policy`); n8n just calls it and logs the JSON (`published`, `wouldPublish`, `denied`). In shadow mode `published` is always empty — that's the signal to watch.

## 3. n8n `daily-report` — cron `0 8 * * *` (Phase 5)
Reads `pipeline-runs`, pending drafts, leads, PostHog; emails the owner; `POST /api/pipeline/daily-report` archives it. (Built in Phase 5.)

## 4. VPS crontab (Hermes — add to `DEPLOYMENT-AND-VPS.md`)
```cron
# Fallback detect-only if n8n missed 04:00 (05:00 Dhaka = 23:00 UTC)
0 23 * * *  curl -fsS -X POST -H "Authorization: Bearer $CRON_SECRET" "https://www.sustechltd.com/api/cron/nightly?mode=if-missed"
# Weekly liveness heartbeat (Sun)
30 23 * * 0 curl -fsS -X POST -H "Authorization: Bearer $CRON_SECRET" "https://www.sustechltd.com/api/cron/nightly?mode=heartbeat"
```
`/api/cron/nightly` is **detect-only** — it can never publish.

## 5. Kill switches (any one halts publishing; site keeps serving last-published)
1. `automation-settings.autoPublishEnabled` — DB toggle, flip from a phone in `/admin`.
2. `AUTO_PUBLISH_ENABLED=false` — env.
3. `AUTOMATION_KILL_SWITCH=true` — env, hard halt even if the DB is compromised.
4. `SOURCE_WATCH_ENABLED=false` — stops the nightly run entirely (run-start 409s).

## 6. Rollback (target < 2 min)
Wrong content live → restore the prior published version in the Payload version
browser (`/admin`); the collection's revalidate hook refreshes the page; log a
`rolled-back` audit row. (One-click admin "Revert & revalidate" button = Phase 4b.)
