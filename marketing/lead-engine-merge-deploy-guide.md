# Lead Engine — Merge & Deploy Guide

How to land the six stacked Lead-Engine PRs into `feat/ui-improvements`, deploy to
**beta**, verify, and (later) cut over to **main / production**.

---

## 0. The PR stack (each PR's base ← head)

```
#48  feat/lead-engine-phase4  ← feat/lead-engine-phase5   (daily report)
#47  feat/lead-engine-phase3b ← feat/lead-engine-phase4   (pipeline + approval)
#46  feat/lead-engine-phase3a ← feat/lead-engine-phase3b  (segments + gated + suggestions)
#45  feat/lead-engine-phase2a ← feat/lead-engine-phase3a  (calculators)
#44  feat/lead-engine-phase1  ← feat/lead-engine-phase2a  (citations + sources)
#43  feat/ui-improvements     ← feat/lead-engine-phase1   (leads + analytics)
─────────────────────────────────────────────────────────────────────────
#42  main                     ← feat/ui-improvements      (PRODUCTION cutover, later)
```

Each branch was cut from the previous one, so `phase5` already **contains every
commit** of phases 1–4. The beta server runs `feat/ui-improvements`.

---

## 1. Merge the stack into `feat/ui-improvements`

Two equivalent options. **Option A preserves all six PR reviews; Option B is one click.**

### Option A — bottom-up (recommended; GitHub auto-retargets)

Merge from the **bottom** of the stack upward. When you **merge + delete** a head
branch that is the *base* of the next PR, GitHub automatically retargets that next
PR onto the just-merged base. So:

1. Merge **#43** (`phase1 → ui-improvements`) → delete `feat/lead-engine-phase1`.
   GitHub retargets **#44** to base `feat/ui-improvements`.
2. Merge **#44** → delete `phase2a`. (#45 retargets to `ui-improvements`.)
3. Merge **#45** → delete `phase3a`.
4. Merge **#46** → delete `phase3b`.
5. Merge **#47** → delete `phase4`.
6. Merge **#48** → delete `phase5`.

Use **"Merge commit"** (not squash) so each phase stays a reviewable unit and the
migration files keep their identities. After step 6, `feat/ui-improvements` holds
the entire engine.

> CI must be green on each before merging. Don't merge a red PR.

### Option B — one merge (fastest)

Re-target **#48** to base `feat/ui-improvements` and merge it once — it carries all
six phases. Then close #43–#47 (their commits are already in). Loses the per-phase
merge granularity but is a single operation.

**Either way, the end state is identical:** `feat/ui-improvements` = old beta +
all 6 Lead-Engine phases, with 6 new migrations registered in `migrations/index.ts`:
`leads_collection`, `citations_and_sources`, `tariff_rates_and_calc_payload`,
`segments_gated_suggestions`, `pipeline_approval`, `daily_reports`.

---

## 2. Pre-deploy: secrets to set on the beta server `.env.production`

Generate strong random values (`openssl rand -hex 32`) for each secret. The engine
**degrades gracefully** — every route 404s / no-ops until its secret is set — so a
deploy before these are set is harmless, but the features stay dormant.

```bash
# Lead capture / analytics
LEADS_CONFIRM_SECRET=<rand>          # double-opt-in confirm tokens
GATED_DOWNLOAD_SECRET=<rand>         # 24h gated-asset download tokens
N8N_LEAD_WEBHOOK_URL=https://n8n.sustechltd.com/webhook/lead-intake
N8N_WEBHOOK_SECRET=<rand>            # HMAC for lead events (both directions)
LEADENGINE_INGEST_SECRET=<rand>      # GrowthOS promotion door
LEADENGINE_REPORTER_KEY=<rand>       # suppression-hash feed
NEXT_PUBLIC_POSTHOG_KEY=<phc_...>    # from your PostHog project
NEXT_PUBLIC_POSTHOG_HOST=https://beta.sustechltd.com/ingest

# Content pipeline & approval (KEEP AUTO_PUBLISH OFF)
SOURCE_WATCH_ENABLED=true
AUTOMATION_KILL_SWITCH=false
PIPELINE_SECRET=<rand>               # n8n -> /api/pipeline/*
CRON_SECRET=<rand>                   # VPS crontab -> /api/cron/nightly
APPROVAL_TOKEN_SECRET=<rand>         # one-click approve JWTs (NOT = PAYLOAD_SECRET)
APPROVAL_TTL_HOURS=72
AUTO_PUBLISH_ENABLED=false           # <-- stays false until 2+ weeks of shadow logs
AUTO_PUBLISH_AFTER_HOURS=24
AUTO_PUBLISH_CATEGORIES=industry-news-roundup,knowledge-explainer,glossary
AUTO_PUBLISH_DAILY_CAP=5
OWNER_NOTIFY_EMAIL=<your email>
```

n8n holds (never in the repo / never on the web box): Resend API key, Anthropic API key.

---

## 3. Deploy to beta — Hermes commands (VPS-1, 93.127.160.183)

App root: `/var/www/sustechltd.com/app/` · env: `/var/www/sustechltd.com/.env.production`

```bash
cd /var/www/sustechltd.com/app

# 1) Get the merged code
git fetch origin
git reset --hard origin/feat/ui-improvements

# 2) Install (frozen lockfile)
pnpm install --frozen-lockfile

# 3) >>> CHECK MIGRATION STATE FIRST <<<  (see §4 — this decides the next step)
pnpm migrate:status
```

**Stop and read the status output before continuing — go to §4.**

```bash
# 4) Apply migrations (only after §4 confirms the DB is migrate-tracked)
pnpm migrate

# 5) One-time: seed the 26-source registry (idempotent — safe to re-run)
pnpm seed:sources

# 6) Build + restart
pnpm build
pm2 restart sustech-web
pm2 save
```

The `tariff-rates`, `next-best-actions` and `automation-settings` globals create
their default rows automatically on first access — no seeding needed.

---

## 4. The one real risk: migration history

`pnpm migrate` runs **only the migrations that aren't yet recorded** in the
`payload_migrations` table. Two cases:

- **A. The 12 pre-Lead-Engine migrations show `Yes` (applied)** in `migrate:status`
  → the DB is migration-tracked. **Just run `pnpm migrate`** — it applies the 6 new
  ones in order. Done.

- **B. They show `No` (pending)** → the beta DB was built by Payload *push*, not by
  migrations, so the history is empty. Running `pnpm migrate` now would try to run
  `initial_schema` against already-existing tables and **fail**. **Baseline first:**
  mark the 12 old migrations as already-applied (they ARE — the tables exist), then
  run only the new ones:

  ```bash
  # On the beta Postgres (adjust container/DB names to the server):
  docker exec -i sustech-db psql -U sustech -d sustech <<'SQL'
  INSERT INTO payload_migrations (name, batch, created_at, updated_at)
  SELECT n, 1, now(), now() FROM (VALUES
    ('20260609_052220_initial_schema'),
    ('20260609_053000_content_layouts_and_stats'),
    ('20260609_054000_page_intros_and_chat_config'),
    ('20260609_055000_emails_array'),
    ('20260609_056000_capabilities_surface'),
    ('20260609_057000_block_style_defaults'),
    ('20260609_058000_design_version'),
    ('20260610_060000_custom_icons'),
    ('20260610_061000_hero_background_fx'),
    ('20260610_062000_hero_fx_options'),
    ('20260610_063000_nav_style'),
    ('20260610_064000_nav_style_options')
  ) AS t(n)
  WHERE NOT EXISTS (SELECT 1 FROM payload_migrations m WHERE m.name = t.n);
  SQL
  ```

  Then `pnpm migrate` applies just the 6 Lead-Engine migrations. (All six are
  idempotent — `IF NOT EXISTS` + exception-guarded — so even a re-run is safe.)

> Take a DB snapshot before migrating: `docker exec sustech-db pg_dump -U sustech sustech | gzip > ~/pre-leadengine-$(date +%F).sql.gz`

---

## 5. Verify on beta (no n8n needed yet)

```bash
# Public surfaces
curl -s -o /dev/null -w "%{http_code}\n" https://beta.sustechltd.com/knowledge/calculators/diesel-vs-bess   # 200
curl -s -o /dev/null -w "%{http_code}\n" https://beta.sustechltd.com/api/download/1                          # 403 (no token)

# Pipeline auth (replace <PIPELINE_SECRET>)
curl -s -o /dev/null -w "%{http_code}\n" -X POST https://beta.sustechltd.com/api/pipeline/auto-publish-sweep  # 401
curl -s -H "Authorization: Bearer <PIPELINE_SECRET>" https://beta.sustechltd.com/api/pipeline/report-data | head -c 120  # {"metrics":...}
```

In `/admin` you should now see the **Lead Engine** group: Leads, Sources, Pipeline
runs, Publish audit, Daily reports, Tariff rates, Next-best actions, Automation
settings. Sign in and open **/review** (the pending-approvals queue).

Then exercise the loop by hand: open the diesel-vs-BESS calculator → compute →
"Email me this report" → confirm a **Lead** row appears in `/admin` with the
calc payload and `source: calculator`.

---

## 6. After beta is verified — wire n8n + crontab (Hermes, on VPS-2)

Per `marketing/phase4-pipeline-ops.md`: the `nightly-source-watch` (04:00),
`auto-publish-sweep` (hourly, **shadow mode**), `daily-report` (08:00), and the
Resend `delivered` webhook; plus the VPS fallback crontab. Auto-publish stays OFF
until 2+ weeks of shadow logs are reviewed.

---

## 7. Production cutover (Phase 6 — later, via PR #42)

When beta is signed off:
1. Merge **PR #42** (`main ← feat/ui-improvements`).
2. On production: same deploy steps (§3) on the `main` branch.
3. Flip indexing: `SITE_INDEXABLE=true`, add real SSL to `sustechltd.com`
   (`certbot --nginx -d sustechltd.com -d www.sustechltd.com`), submit the sitemap
   to Google Search Console + Bing.
4. Only then consider enabling auto-publish (env + DB toggle).

That cutover is the Phase 6 work — keep `main` un-deployed to production until you
explicitly choose to.
```
