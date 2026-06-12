# Sustech Lead Engine — Master Plan

**Status:** Canonical plan, v1.0 (2026-06-12). Merges 6 subsystem designs; resolves all 30 critique items (Appendix §8).
**Repo:** `C:\Projects\sustech-web` (Next.js 16 + Payload 3 + Postgres). Beta: beta.sustechltd.com (noindex). n8n: n8n.sustechltd.com.

---

## 1. Executive summary

The Lead Engine turns the Sustech website into a self-maintaining B2B acquisition machine for five segments: foreign energy investors, RMG factories, real estate developers, commercial buildings, and banks. A registry of 26 authoritative sources (SREDA, BERC, BPDB, Bangladesh Bank, BIDA, NBR, World Bank, ADB, IEA, IRENA, BNEF, the four major newspapers, et al.) backs every published number via a structured citations system rendered as server-side HTML and Schema.org `citation` markup — making content citable by AI engines. A nightly 04:00 Dhaka n8n pipeline re-checks sources, detects changes by content hash, and has Claude draft revisions of affected articles — **drafts only, never direct publishes**. Drafts reach the owner by Resend email (with delivery confirmation) and a `/review` queue on the beta site; one-click signed Approve/Reject tokens publish to production. A guarded 24-hour auto-publish path exists for low-risk prose-only edits in three whitelisted categories — anything touching prices, tariffs, legal claims, or client names waits for a human forever. On the conversion side: four cited calculators, gated sector whitepapers, rule-based lead scoring into a `leads` collection, chatbot qualification, and server-side PostHog events — all consented, no scraping, no cold outreach. A daily 08:00 Dhaka report emails the owner everything: leads, traffic, pending approvals, source changes, pipeline health. Every publish action lands in an immutable audit log; two kill switches stop the whole machine. Owner steady-state cost: ~2.5 h/week. Build cost: ~32–40 dev-days, phased so content and lead capture ship before automation.

---

## 2. Architecture overview

```
                              NIGHTLY LOOP (04:00 Asia/Dhaka)
  +--------------------------------------------------------------------------------+
  |                                                                                |
  | [26 registered sources]      n8n "nightly-source-watch"  (cron 0 4 * * *)      |
  |  SREDA BERC BPDB BB BIDA --> robots-check -> fetch (RSS-first, UA declared)    |
  |  NBR DPDC DESCO WB ADB       -> normalize+hash -> changed?                     |
  |  IEA IRENA BNEF IEEFA              | yes                                       |
  |  DailyStar ProthomAlo TBS FE       v                                           |
  |                         GET /api/pipeline/affected  (citations.source backlink)|
  |                                    v                                           |
  |                         Claude revision -> POST /api/pipeline/revise           |
  |                         (NEW DRAFT VERSION ONLY; server-side risk scan)        |
  |                                    v                                           |
  |   pipeline-runs heartbeat <-- run-finish                                       |
  |   (VPS crontab fallback 05:00: detect-only if heartbeat missing)               |
  +--------------------------------------------------------------------------------+
                                       |
                                       v
            APPROVAL: Resend email (delivered-webhook starts 24h clock)
            + /review queue on beta + /admin drafts
                  |                                   |
   owner clicks Approve/Reject              24h elapsed AND category whitelisted
   (signed token, GET=confirm page,         AND claim-diff clean AND no risk flags
    POST=act, single-use, version-pinned)   AND AUTO_PUBLISH_ENABLED AND under cap
                  |                                   |
                  +-----------> POST /api/publish/guard <------ hourly sweep (15 * * * *)
                                       |  publishes under internal identity
                                       |  writes publish-audit (immutable)
                                       v
                  PRODUCTION www.sustechltd.com (SSR, cited, Schema.org)
                                       |
                                       v
              VISITORS (organic search, AI engines, referrals, print QR later)
                                       |
        calculators . gated whitepapers . chatbot . RFQ forms . next-best-action CTAs
                                       |
              captureLead / RFQ server actions  (+ PostHog server events)
                                       v
                 leads collection (scored, consent-flagged, admin-only)
                                       |  score >= 60 -> instant owner email
                                       v
        n8n "daily-report" (cron 0 8 * * *) -> owner email + daily-reports archive
```

---

## 3. The six subsystems

### 3.0 Canonical data model (single source of truth — supersedes all per-subsystem schema variants)

One owner per schema; every hook/lint references these exact field paths, asserted against generated `payload-types.ts` by a Vitest suite (`tests/unit/schema-contract.test.ts`).

#### `cms/collections/sources.ts` (new)

| Field | Type | Notes |
|---|---|---|
| `name` | text, required | e.g. "BERC — tariff orders" |
| `url` | text, required, unique | canonical homepage |
| `checkUrl` | text | the specific page the nightly job hashes (tariff page, circular index) |
| `tier` | select, required | `tier1-gov` \| `tier1-multilateral` \| `tier2-analyst` (BNEF/IEEFA/standards) \| `tier3-press` |
| `fetchMethod` | select | `rss` \| `html` \| `pdf-link` — RSS preferred for all newspapers |
| `fetchPolicy` | select | `auto` \| `manual-only` — auto-flipped to `manual-only` if robots.txt disallows |
| `contentSelector` | text | CSS selector isolating meaningful content (kills false diffs) |
| `checkFrequency` | select | `daily` \| `weekly` \| `monthly` \| `quarterly` |
| `paywalled` | checkbox | paywalled → cite headline + link only, never quoted body |
| `lastContentHash` / `etag` / `lastModified` | text | conditional-GET caching; hash = SHA-256 of normalized text |
| `lastCheckedAt` / `lastChangedAt` / `robotsCheckedAt` | date | |
| `consecutiveFailures` | number, default 0 | alert at 3, auto-deactivate at 10 |
| `language` | select | `en` \| `bn` \| `both` |
| `active` | checkbox, default true | per-source kill switch |
| `notes` | textarea | |

**Access:** `read/create/delete: isAdminOrEditor`; pipeline service identity may update only `lastCheckedAt/lastContentHash/etag/lastChangedAt/consecutiveFailures/robotsCheckedAt`. **Not publicly readable** (it would map our crawl behavior; nothing on the site reads it — citations render from the article doc). Hermes cannot create sources; drafts citing an unregistered domain get `complianceStatus: "needs-source-review"`.

Seed via `cms/scripts/seed-sources.ts` (jiti, `pnpm seed:sources`) — see §3.1 for the 26-source list.

#### `cms/fields/citations.ts` (new reusable field) — added to `articles`, `news-items`, `knowledge-resources`

```ts
{ name: "citations", type: "array", fields: [
  { name: "source", type: "relationship", relationTo: "sources", required: true, index: true }, // indexed: nightly backlink query
  { name: "quotedClaim", type: "textarea", required: true },  // the exact claim in THIS doc the source backs
  { name: "url", type: "text", required: true },              // deep link to the specific doc/page
  { name: "title", type: "text" },
  { name: "accessedDate", type: "date", required: true },
  { name: "sourcePublishedDate", type: "date" },
  { name: "locator", type: "text" },                          // "p. 14", "SRO No. ...", "Circular No. ..."
  { name: "lastVerifiedAt", type: "date" },                   // refreshed by approved revisions
]}
```

#### `claims[]` field (same collections) — the numeric ledger, **references citations** (no duplicate source data)

```ts
{ name: "claims", type: "array", fields: [
  { name: "claimText", type: "text" }, { name: "value", type: "text" }, { name: "unit", type: "text" },
  { name: "citationIndex", type: "number" },   // 1-based index into citations[]; null only when sourceType=company-catalog
  { name: "sourceType", type: "select", options: ["registry-source", "company-catalog"] },
  { name: "retrievedAt", type: "date" },
  { name: "hedge", type: "select", options: ["as-of-date", "up-to", "approx", "exact-verified"] },
]}
```

v1 enforcement is category-level (§3.6); the full numeric tokenizer is v2. `claims[]` data is captured from day one so the claim-diff guard (§3.2) and v2 gates have data to work with.

#### `cms/collections/leads.ts` (new; admin group "Leads", next to `rfq-requests`)

`rfq-requests` stays the raw form inbox; `afterChange` on rfq-requests (and chat-capture/calculator actions) **upserts** into `leads` keyed email→phone via `lib/leads/upsert-lead.ts`.

| Field | Type |
|---|---|
| `name`, `company` | text |
| `email` (indexed), `phone` (indexed, optional) | email / text |
| `segment` | select: `foreign-investor` \| `rmg-factory` \| `real-estate` \| `commercial-building` \| `bank-financial` \| `other` |
| `source` | select: `rfq` \| `chat` \| `calculator` \| `gated-asset` \| `qr` \| `manual` |
| `sourceDetail`, `sourcePath` | text (e.g. "diesel-vs-bess") |
| `status` | select pipeline: `new` → `contacted` → `qualified` → `won` \| `lost` |
| `score`, `temperature`, `scoreBreakdown` | number / select (hot/warm/cold) / json — all readOnly, set by `beforeChange` hook |
| `consent` group | `marketingOptIn` (checkbox, **default false, never pre-ticked**), `consentTextShown` (snapshot, readOnly), `consentAt`, `consentSourcePath`, `doubleOptInConfirmedAt` (null = **not mailable** for marketing) |
| `attribution` group | `utmSource/Medium/Campaign/Term/Content`, `firstTouchPath`, `referrer` |
| `calcPayload` | json (calculator inputs/outputs for the emailed report) |
| `activity` | array, append-only: `{ event, at, meta }` |
| `relatedRfqs` | relationship → rfq-requests, hasMany |
| `emailEvents` | array `{ type: sent\|delivered\|opened\|bounced, at, campaign }` — written only via signed-token route |

**Access:** identical posture to `rfq-requests` — read/update `isAdminOrEditor`, created only via server actions with `overrideAccess`. `beforeChange` rejects `marketingOptIn: true` without `consentAt` (blocks any bulk import of unknown-provenance emails).

#### One lead-scoring table — `lib/leads/scoring.ts` (pure function, Vitest-tested)

| Rule | Points |
|---|---|
| RFQ submitted | +40 |
| Calculator completed | +30 |
| Chat session with contact captured | +25 |
| Gated asset downloaded | +15 |
| Corporate email domain (not gmail/yahoo/outlook/hotmail/icloud/proton) | +15 |
| `.com.bd`/`.gov.bd`/known BD bank+RMG domain list (`lib/leads/domains.ts`) | +10, sets `segment` guess |
| Phone provided | +10 |
| Interest ∈ {BESS, substation, solar ≥100 kW} | +10 |
| Repeat activity (≥2 distinct events) | +10 |

**Hot ≥ 60, warm 30–59, cold < 30.** Deterministic, auditable via `scoreBreakdown`. Hot → instant owner email from n8n.

#### Supporting collections & globals

- `cms/collections/pipeline-runs.ts` — `runDate`, `trigger` (`n8n`|`fallback`|`heartbeat`), `sourcesChecked/Changed`, `draftsCreated`, `errors` json, `startedAt/finishedAt`. The heartbeat and the daily report's data feed.
- `cms/collections/publish-audit.ts` — **immutable** (`update/delete: () => false`): `docCollection`, `docId`, `versionIdFrom/To`, `action` (`drafted`|`approval-email-sent`|`approval-email-delivered`|`approved-by-owner`|`rejected`|`auto-published-24h`|`killed`|`rolled-back`), `actor` (`owner`|`pipeline`|`admin:<id>` — auto-publish is **never** recorded as owner approval), `tokenJti`, `claimDiffSnapshot` json, `at`.
- `cms/collections/daily-reports.ts` — `date` (unique), `html`, `metrics` json; browsable in `/admin` even if email fails.
- Globals: `cms/globals/tariff-rates.ts` (BERC/BPDB/DPDC/DESCO ৳/kWh slabs + diesel ৳/L, each with `sourceUrl` + `lastVerifiedAt` — **human-edited only**, watcher never writes it); `cms/globals/automation-settings.ts` (`autoPublishEnabled` admin toggle, phone-friendly); `cms/globals/next-best-actions.ts`; `cms/globals/editorial-topics.ts`.
- `revisionMeta` group on `articles`/`news-items`: `triggeredBySource` (rel→sources), `changeSummary` (textarea), `riskFlags` (select hasMany: `pricing|legal|stat-claim|tariff|third-party-name`), `approvalState` (`none|pending|approved|rejected|auto-published`), `pendingSince` (date — set only on Resend `delivered` event), `tokenJti`, `decidedBy`, `decidedAt`.
- Deferred to Phase 7: `email-suppressions`, `short-links`.

#### Env vars (append to `.env.example`) — consolidated, final names

```bash
# Pipeline & approval
SOURCE_WATCH_ENABLED=true        # master kill switch for the nightly pipeline
AUTOMATION_KILL_SWITCH=false     # env-level halt: blocks guard + auto-publish even if DB compromised
CRON_SECRET=                     # VPS crontab ONLY -> detect-only fallback route; can never publish
PIPELINE_SECRET=                 # n8n -> /api/pipeline/* (run-start/finish, sources, affected, revise, sweep, daily-report)
APPROVAL_TOKEN_SECRET=           # signs one-click approve/reject JWTs (HS256); distinct from PAYLOAD_SECRET
APPROVAL_TTL_HOURS=72            # version-pinned, single-use jti
AUTO_PUBLISH_ENABLED=false       # ship OFF; owner flips after >=2 weeks shadow mode
AUTO_PUBLISH_AFTER_HOURS=24
AUTO_PUBLISH_CATEGORIES=industry-news-roundup,knowledge-explainer,glossary   # THE one whitelist; never market-insight/pricing/legal
AUTO_PUBLISH_DAILY_CAP=5
OWNER_NOTIFY_EMAIL=
# Leads & analytics
LEADS_CONFIRM_SECRET=            # signs single-field-flip tokens for POST /api/leads/confirm (n8n gets no Payload write key)
N8N_LEAD_WEBHOOK_URL=            # captureLead -> n8n, HMAC-signed
N8N_WEBHOOK_SECRET=              # HMAC + timestamp + nonce, 5-min skew rejection, both directions
NEXT_PUBLIC_POSTHOG_KEY=         # already in SETUP.md
NEXT_PUBLIC_POSTHOG_HOST=        # <site>/ingest (first-party proxy rewrite)
POSTHOG_PROJECT_ID=              # server-only
POSTHOG_PERSONAL_API_KEY=        # server-only + n8n credential, READ scope only
```

n8n-only credentials (never in repo): Resend API key, Payload `reporter` API key (read-only role), Anthropic API key.

#### API routes (final shapes)

| Route | Auth | Purpose |
|---|---|---|
| `app/api/pipeline/run-start` / `run-finish` | PIPELINE_SECRET | heartbeat rows; run-start 409s if `SOURCE_WATCH_ENABLED=false` |
| `app/api/pipeline/sources` (+`[id]` PATCH) | PIPELINE_SECRET | registry read/update for n8n |
| `app/api/pipeline/affected` | PIPELINE_SECRET | docs citing a changed source (`where[citations.source][equals]`) |
| `app/api/pipeline/revise` | PIPELINE_SECRET | new **draft version** of existing doc; independent server-side risk regex (`৳|Tk|%|price|tariff|warranty|guarantee|legal|VAT|duty` + third-party names); never publishes |
| `app/api/pipeline/auto-publish-sweep` | PIPELINE_SECRET | hourly sweep, calls publish guard internally |
| `app/api/pipeline/daily-report` | PIPELINE_SECRET | n8n writes the `daily-reports` archive row |
| `app/api/publish/guard` | internal (called by approve + sweep) | the **only** code path that publishes; runs under its own internal identity (so `denyHermesPublish` passes and audit attributes correctly); writes `publish-audit` |
| `app/api/approve` | signed JWT | GET = server-rendered confirm page (title + claim-diff + POST button — defeats mail-scanner prefetch); POST = approve/reject + revalidate |
| `app/api/approve/preview` | signed JWT | draft preview on beta without exposing `PREVIEW_SECRET` |
| `app/api/cron/nightly` | CRON_SECRET | VPS fallback, **detect-only** (`mode=if-missed` no-ops when today's run exists; `mode=heartbeat` for the weekly liveness proof) |
| `app/api/leads/confirm` | signed token (LEADS_CONFIRM_SECRET) | single-purpose: flips `doubleOptInConfirmedAt` / appends `emailEvents` — replaces any generic n8n Payload write key |
| `app/api/download/[id]` | HMAC token, 24 h expiry | gated-asset delivery (files not at guessable paths) |

#### Cron schedule (all n8n workflows timezone `Asia/Dhaka`; set `GENERIC_TIMEZONE=Asia/Dhaka`)

| Job | Where | Cron | Notes |
|---|---|---|---|
| `nightly-source-watch` | n8n | `0 4 * * *` | §3.2 |
| `auto-publish-sweep` | n8n | `15 * * * *` | hourly; **not** a Wait node (survives restarts) |
| `daily-report` | n8n | `0 8 * * *` | §3.4 |
| Fallback detect | VPS crontab | `0 23 * * *` UTC (= 05:00 Dhaka) | `curl -fsS -X POST -H "Authorization: Bearer $CRON_SECRET" https://<host>/api/cron/nightly?mode=if-missed` |
| Fallback heartbeat | VPS crontab | `30 23 * * 0` UTC (Sun) | `?mode=heartbeat` — timestamp surfaces in daily report ("fallback cron last seen") |

No version-prune cron: retention is count-based (`maxPerDoc: 50`, see §3.2b).

---

### 3.1 Subsystem 1 — Content & resource strategy

#### (a) Pillar-content map (cornerstones = CMS pages/sectors; supporting articles = `articles` at `/knowledge/[slug]`)

Every cornerstone: direct-answer lead paragraph (`excerpt` = literal answer), FAQ block (→ `FAQPage` schema), RFQ CTA, calculator embed where noted, Bangla variant. Company stats ("103+ projects, 175+ clients, 10 sectors, 8 years") are **interpolated at render from the site-settings stats global / `lib/company-facts.ts` — never typed into body copy** (content-lint flags literal `103+|175+|10 sectors|8 years` in any body field).

**Foreign investors:** `/solutions/investing-in-bangladesh-solar` ("renewable energy investment Bangladesh"); `/solutions/corporate-ppa-bangladesh`; `/knowledge/net-metering-policy-bangladesh` (SREDA); `/knowledge/bangladesh-power-tariff-guide` (BERC orders, BDT/kWh tables); `/solutions/epc-partner-bangladesh`. Supporting: BIDA incentives, NBR SRO duty structure, IEPMP 2023, IDCOL refinancing, Bangladesh Bank repatriation basics (BB + BIDA citations only, no legal advice).

**RMG factories:** `/sectors/rmg-garments` (solar+BESS+LPS+LED one-contractor); `/knowledge/leed-factory-solar-bangladesh` (USGBC-cited); `/knowledge/higg-fem-energy-reporting`; `/knowledge/garment-factory-electricity-cost-reduction` (+calculator; bn: "কারখানার বিদ্যুৎ বিল কমানোর উপায়"); `/knowledge/bess-vs-diesel-generator-cost` (catalog figures, hedged; bn: "জেনারেটরের বিকল্প"). Supporting: net-metering ROI 1 MW rooftop; buyer decarbonisation deadlines (third-party brands like H&M/Inditex only per the third-party naming rule, §3.6, **human-approved, never auto-publish**); IEC 62305 LPS; Atomberg retrofit payback.

**Real estate developers:** `/sectors/real-estate` ("substation installation company Dhaka"); `/knowledge/substation-cost-guide-dhaka` (DPDC/DESCO process; bn: "সাবস্টেশন খরচ"); `/knowledge/bnbc-lightning-protection-requirements` (BNBC 2020); `/knowledge/solar-for-apartment-buildings`. Supporting: smart IPS for lifts, EV-ready design, electrical snag-list lead magnet.

**Commercial buildings:** `/sectors/commercial-buildings`; `/knowledge/energy-audit-bangladesh` (MD is a SREDA-certified Energy Auditor — real credential); `/knowledge/led-retrofit-payback-calculator`; `/knowledge/load-shedding-backup-options-2026` (bn: "লোডশেডিং সমাধান"). Supporting: peak-demand charges (BERC), rooftop structural checklist, BLDC fan cooling-load.

**Banks & financial:** `/sectors/banks-financial` ("ATM UPS solution Bangladesh"); `/knowledge/online-ups-for-atm-branch` (<20 ms claim hedged + sourced); `/knowledge/bangladesh-bank-green-finance-solar` (BB Sustainable Finance circulars — **exact circular number + date resolved in the sources registry before drafting is queued**; same rule applies to every planned citation, e.g. branch-availability requirements live in BB's ICT Security Guideline, not an assumed "uptime guidance" doc); `/knowledge/solar-branch-banking`. Supporting: server-room surge/LPS, energy clauses in fit-out RFPs, case-study template (real CMS clients only).

Priority Bangla queries to own: "সোলার প্যানেল দাম বাংলাদেশ ২০২৬", "নেট মিটারিং কি", "জেনারেটরের বিকল্প ব্যাটারি", "লাইটনিং এরেস্টার", "শিল্প কারখানায় সোলার".

#### (b) Source registry seed (26 named real sources)

| # | Source | Domain | Tier | Freq |
|---|---|---|---|---|
| 1 | SREDA | sreda.gov.bd | tier1-gov | weekly |
| 2 | SREDA National RE Database | renewableenergy.gov.bd | tier1-gov | weekly |
| 3 | BPDB | bpdb.gov.bd | tier1-gov | weekly |
| 4 | BERC (tariff orders) | berc.gov.bd | tier1-gov | daily (`checkUrl` = tariff-order page) |
| 5 | DPDC tariff schedule | dpdc.gov.bd | tier1-gov | weekly |
| 6 | DESCO tariff schedule | desco.gov.bd | tier1-gov | weekly |
| 7 | Bangladesh Bank (circulars, Sustainable Finance) | bb.org.bd | tier1-gov | daily (`checkUrl` = circular index) |
| 8 | BIDA | bida.gov.bd | tier1-gov | weekly |
| 9 | NBR (SROs, solar import duty) | nbr.gov.bd | tier1-gov | weekly |
| 10 | Power Division / MoPEMR (IEPMP) | powerdivision.gov.bd | tier1-gov | monthly |
| 11 | IDCOL | idcol.org | tier1-gov | monthly |
| 12 | BBS | bbs.gov.bd | tier1-gov | quarterly |
| 13 | The Daily Star (Business/Energy) | thedailystar.net | tier3-press | daily (RSS) |
| 14 | Prothom Alo | prothomalo.com | tier3-press | daily (RSS) |
| 15 | The Business Standard | tbsnews.net | tier3-press | daily (RSS) |
| 16 | The Financial Express | thefinancialexpress.com.bd | tier3-press | daily (RSS) |
| 17 | World Bank — BD energy | worldbank.org | tier1-multilateral | monthly |
| 18 | ADB — BD energy | adb.org | tier1-multilateral | monthly |
| 19 | IFC (incl. EDGE) | ifc.org | tier1-multilateral | monthly |
| 20 | IEA | iea.org | tier1-multilateral | monthly |
| 21 | IRENA | irena.org | tier1-multilateral | monthly |
| 22 | BloombergNEF | about.bnef.com | tier2-analyst, `paywalled: true` | monthly |
| 23 | IEEFA (BD power analysis) | ieefa.org | tier2-analyst | weekly |
| 24 | PV Magazine | pv-magazine.com | tier3-press | weekly |
| 25 | Global Solar Atlas (WB/Solargis) | globalsolaratlas.info | tier2-analyst | quarterly |
| 26 | USGBC LEED directory | usgbc.org | tier2-analyst | monthly |

#### (c) Citation rendering

- **In-text markers v1:** `[cite:n]` (1-based index into `citations[]`) in the Lexical body; the RichText renderer post-processes to `<sup><a href="#ref-n">[n]</a></sup>` — server-rendered. v2: custom Lexical inline citation node (Phase 7).
- **References section:** `components/sections/sources-references.tsx` (server component), auto-appended when `citations.length > 0`: `<section aria-labelledby="sources-heading">` with `<ol>`; each `<li id="ref-n">` shows linked title (`rel="noopener"`, **no nofollow** on tier-1/2 — outbound authority links help GEO), source name + tier badge, published date, "Accessed {date}".
- **Schema.org:** extend `lib/seo.ts` with `articleJsonLd(article)` merged into the page `@graph`: `Article` with `citation: [{ "@type": "CreativeWork", name, url, datePublished }]` and `isBasedOn` (tier-1 URLs), `dateModified` from last review.

#### (d) Editorial rules (enforced — see §3.6 for mechanisms)

1. **No number without a citation** in citation-required categories (`market-data`, `tariffs`, `policy`, `finance`, `calculations`) — `beforeValidate` hook blocks publish with `citations.length === 0`; runs at **Hermes ingest time too**, not only nightly.
2. **Company stats only from CMS** (`lib/company-facts.ts`, synced via `pnpm sync:brief`). Catalog performance figures always hedged ("up to 75%", "95%+ RTE", "<20 ms"), never as guarantees, never as prices.
3. **Tariff/tax/policy claims need tier-1 sources** with document number + effective date in `locator` (BERC order no., NBR SRO no., BB circular no.). Press (tier-3) adds context, never the sole source.
4. **Verbatim quotes ≤ 15 words** from any source, inside a quote block with named source + link; prefer paraphrase + link. Paywalled sources (BNEF): headline + link only. *(Single rule — the earlier 75-word draft rule is superseded; see Appendix A7.)*
5. **"As of" dating:** volatile figures carry "as of {month year}"; pages show "Last reviewed: {date}" (drives `dateModified`).
6. **BD context mandatory:** BDT with USD parenthetical; utility-specific tariffs; Bangla variant reuses the same `citations[]`.
7. **AI drafts never self-publish** (existing `denyHermesPublish` hook); the 24 h path applies only to `AUTO_PUBLISH_CATEGORIES` and prose-only diffs (§3.2c).
8. **No invented clients/certifications/testimonials** — only entities in `clients`/`awards`/`testimonials` may be named as relationships; third-party companies only per the naming rule (§3.6.1).
9. **Direct answer first:** `excerpt` = literal answer to the title's question.
10. **Every planned citation resolves to a real document (number + date) in the registry before drafting is queued** — no "assumed" documents.

**New files:** `cms/collections/sources.ts`, `cms/fields/citations.ts`, `cms/scripts/seed-sources.ts`, `components/sections/sources-references.tsx`, `lib/company-facts.ts`. **Modified:** `cms/payload.config.ts`, `articles.ts`, `news-items.ts`, `knowledge-resources.ts`, `lib/seo.ts`, `package.json`.

---

### 3.2 Subsystem 2 — Nightly auto-update pipeline & approval (04:00 Asia/Dhaka)

#### (a) n8n workflow `nightly-source-watch` — node chain

1. **Schedule Trigger** `0 4 * * *`.
2. `POST /api/pipeline/run-start` (PIPELINE_SECRET) → `pipeline-runs` row + `runId`; 409 aborts if `SOURCE_WATCH_ENABLED=false`.
3. `GET /api/pipeline/sources?due=today` → active sources due tonight (per `checkFrequency`).
4. **Robots/ToS check node** (explicit, before any fetch): honor robots.txt; declared UA `SustechContentBot/1.0; +https://www.sustechltd.com/llms.txt`; disallowed → flip `fetchPolicy: manual-only`, never re-fetch. RSS endpoints used for all four newspapers.
5. **Split In Batches** — 5 per batch, 10 s Wait between batches; per source: conditional GET (`If-None-Match`/`If-Modified-Since`), 30 s timeout, 2 retries; 304 → unchanged.
6. **Code node** normalize (`contentSelector`, strip nav/ads/dates) + SHA-256. Store hash + ≤300-char excerpt of the changed region only — **never archive full third-party pages**.
7. **IF changed** → `GET /api/pipeline/affected?sourceId=` (citations backlink, indexed) → else PATCH `lastCheckedAt`/`etag`.
8. **Anthropic node** per affected doc: old cited claim + new excerpt + current section → `{ revisedSections, changeSummary, riskFlags[] }` (riskFlags advisory only — re-derived server-side).
9. `POST /api/pipeline/revise` → **new draft version** on top of the live published version (`payload.update({ draft: true })`); route independently risk-scans the diff. Never publishes.
10. `POST /api/pipeline/run-finish` with totals.
11. **Resend (HTTP Request node)** → owner digest: changed sources, drafts created, per-draft approve/reject/preview links. Resend's `delivered` webhook (received on a small n8n webhook → recorded in `publish-audit` as `approval-email-delivered`) is what starts each draft's `pendingSince` clock. **No delivery event within 6 h → item locks to the manual queue + fallback alert email to the backup recipient.**
12. **Error Trigger workflow** → owner email with failed node + `runId`. (Email + `/admin` queue are the only alert channels — no outbound WhatsApp, no reply-by-email; see Appendix A6.)

**Fallback (n8n down):** VPS crontab (owned by Hermes, documented in `DEPLOYMENT-AND-VPS.md`, Phase 4 deliverable) fires `POST /api/cron/nightly?mode=if-missed` at 05:00 Dhaka — shared `lib/source-watcher.ts` core, **detect-only**: marks `lastChangedAt`, flags affected docs `revisionMeta.staleSource`, writes a `trigger: "fallback"` run row. No drafting, no publishing. Weekly `?mode=heartbeat` run proves the crontab itself is alive ("fallback cron last seen: {date}" in the daily report).

#### (b) Archive & versioning

- **Primary archive = Payload versions.** Raise `maxPerDoc` from 20 → **50** on `articles`, `news-items`, `pages`, `projects` (`cms/collections/articles.ts:23`). Count-based retention only — **no prune cron in v1** (autosave interval 375 ms dominates churn; Payload auto-prunes by count; Payload 3 exposes no public `deleteVersions`). The owner's "3-month archive" requirement is satisfied by count-based version history + the immutable `publish-audit` snapshots — owner sign-off in Phase 0 (Appendix B6).
- **Public dated archive URLs: rejected.** AI engines would retrieve and cite the stale tariff — the exact failure this pipeline prevents. Restore = Payload version browser. Public substitute: server-rendered "Last updated {date} — what changed" collapsible history from `revisionMeta.changeSummary` (freshness signal for humans and AI, no stale standalone URLs).
- `lib/versions.ts` helper: discard-draft / restore-published (Payload has no one-call discard; built once, used by reject + rollback). Admin one-click "Revert & revalidate" → prior published version + revalidate hooks + `rolled-back` audit entry; target < 2 minutes to clear wrong content.

#### (c) Approval workflow + guarded 24 h auto-publish

**One token spec** (`lib/approval-token.ts`): JWT HS256 signed with `APPROVAL_TOKEN_SECRET`; payload `{ docId, collection, versionId, action, jti, exp: 72h }`. **Version-pinned** (approving after a newer draft exists fails with "content changed — re-review"); **single-use** `jti` recorded in `publish-audit`. `GET /api/approve?token=` renders a confirm page (title, claim-diff summary, one `<form method="POST">` button) — mail-scanner prefetch can never publish; `POST` acts. Preview links via `/api/approve/preview` (JWT-gated draft mode; raw `PREVIEW_SECRET` never in email). Beta `/review` page (admin-session-gated) lists all `approvalState: pending` drafts.

**One publish path.** Both owner-approve and the sweep converge on `POST /api/publish/guard`, which publishes under its **own internal identity** (passes `denyHermesPublish`, attributes the audit actor correctly) and writes `publish-audit` (`approved-by-owner` vs `auto-published-24h` — never conflated).

**Auto-publish sweep** (n8n `15 * * * *` → `/api/pipeline/auto-publish-sweep`, PIPELINE_SECRET). A pending draft publishes only if **ALL** hold:

1. `AUTO_PUBLISH_ENABLED=true` AND `automation-settings.autoPublishEnabled=true` (DB toggle, ≤60 s cache) AND `AUTOMATION_KILL_SWITCH` unset — three independent stops;
2. `pendingSince` (set only on the Resend `delivered` event) > 24 h ago;
3. category ∈ `AUTO_PUBLISH_CATEGORIES` (`industry-news-roundup, knowledge-explainer, glossary` — **`market-insight` deliberately excluded**; never `company-update`/`product-update`, never pages/services/products);
4. `riskFlags` empty AND `diffClaims(prevPublished, candidate)` (`lib/claim-diff.ts`) shows the claims ledger **byte-identical** — any numeric/unit/source change = hard veto, flagged `awaiting-human: numeric-change`. Anything touching pricing, tariffs, legal/tax, client or third-party names waits for a human forever;
5. today's auto-publish count < `AUTO_PUBLISH_DAILY_CAP=5`.

Every auto-publish emails "published without your review" and logs to `pipeline-runs` + `publish-audit`. Ship with auto-publish **off**; run ≥2 weeks shadow mode (sweep logs what it *would* publish) before the owner flips it. Stale-source-flagged docs are excluded from the auto path entirely.

**Net effect (owner sign-off required, Phase 0):** the 24 h auto-publish covers **prose-level edits in three low-risk categories only** — a deliberate narrowing of "auto-publish everything after 24 h", because the alternative is robots publishing unreviewed tariff numbers to bankers (Appendix A3/B3).

#### (d) Failure modes

| Failure | Detection → response |
|---|---|
| n8n down at 04:00 | no run row → 05:00 VPS fallback (detect-only); `/admin` flags visible regardless |
| Source 403/robots-disallow | `consecutiveFailures++`; 3 → email; 10 → auto `active=false`; disallow → `manual-only` |
| Hash false positives | `contentSelector` normalization; alert if a source "changes" >4 nights running |
| LLM hallucinated revision | structurally unshippable: draft-only + server risk scan + claim-diff veto + category whitelist + human default |
| Email delivery fails | no `delivered` event → clock never starts; 6 h lock to manual queue + backup-recipient alert; drafts always visible at `/admin` + `/review` (email is a notifier, never the system of record) |
| Token leak/replay | single-use jti, 72 h exp, version pin, POST-confirm; worst case one doc → 2-min rollback |
| Runaway publishing | daily cap 5 → halt + alert; `automation-settings` toggle from a phone; `AUTOMATION_KILL_SWITCH` env |
| Whole pipeline misbehaving | `SOURCE_WATCH_ENABLED=false` → run-start 409s; site keeps serving last published content |

---

### 3.3 Subsystem 3 — Lead capture & conversion

**Foundation (build first):** `leads` collection + scoring (§3.0), `lib/actions/lead.ts` `captureLead()` (zod-validated, honeypot + min-fill-time, IP rate-limited, `overrideAccess` write, then one HMAC-signed webhook to `N8N_LEAD_WEBHOOK_URL`). **The web tier never sends email**; n8n `lead-intake` workflow: verify HMAC → (a) double-opt-in confirm email via Resend if `marketingOptIn`; (b) calculator report email from `calcPayload`; (c) score ≥ 60 → instant owner email. Confirm link → n8n webhook → `POST /api/leads/confirm?token=` (single-field flip; n8n holds **no** Payload write key).

**(P1) Calculators** — engine exists (`knowledge-resources` `CALC_TYPES`: `solar-roi`, `earthing-resistance`, `cable-sizing`, `lightning-zone`, `solar-yield`). Add `diesel-vs-bess`, `atm-ups-sizing`, `outage-cost`; extend `solar-roi` with RMG presets. **Math rules (hard):** formulas use **only user inputs + cited `tariff-rates` global data** — the catalog "up to 75%" marketing ceiling **never enters a formula**; cost outputs are **ranges, not point values**, labeled server-side "Indicative estimate — not a quote or guarantee"; visible "Rates source: BERC notification {date}" line on every calculator. Results stay fully visible without email; the gate is the **emailed report**, not the answer (`components/calculators/email-report-gate.tsx`: name/email/company + separate unticked marketing checkbox; report delivery = single transactional send). "PDF" v1 = print-styled HTML at `/reports/[leadId]/[token]` (signed, noindex) — no PDF lib in the web tier. New block `calculatorEmbed` (rel→knowledge-resources + `blockStyleGroup`) so admins drop calculators on any page.

**(P1) Rule-based auto-suggestions** — no ML: `lib/related-content.ts` (shared sectors/services relations, segment, recency) rendered by `relatedContent` block (auto/manual modes; server component → crawlable internal links). `nextBestAction` block + `cms/globals/next-best-actions.ts` rules (`{ match: {collection, segment?, service?}, cta }`), fallback = RFQ. Seeds: diesel-cost article → "Run the Diesel-vs-BESS calculator"; BESS service page → "Download: BESS for banks"; case study → "Request a similar assessment".

**(P2) Segment landing pages** — created **in the CMS** (no routes coded): `/solutions/rmg-factories`, `/solutions/real-estate-developers`, `/solutions/commercial-buildings`, `/solutions/banks-financial`, `/invest-in-bangladesh-energy`. Code: `segment` select on `pages`; `proofStrip` block (projects+testimonials+clients filtered by sector; stats from CMS global). Composition: Hero → proofStrip → calculatorEmbed → gatedAsset → FAQ → RFQ CTA. All server-rendered.

**(P2) Gated assets** — `knowledge-resources` gains `gated` checkbox + `gateLevel` (`open`|`email`|`email-company`). `gatedAsset` block + `components/sections/gated-asset.tsx`: form → `captureLead` → signed 24 h download URL (`app/api/download/[id]`) + n8n emails the link. Landing pages stay open + indexable with a full summary (GEO: the summary gets cited; only the PDF is gated). Assets (Hermes drafts → owner approval; **identical claims-gate as articles**; every citation resolved to a real document first): "Solar for RMG: LEED & buyer compliance" (USGBC, IFC PaCT, press), "BESS for banks & ATM networks" (BB ICT Security Guideline availability requirements + catalog figures), "Foreign investor one-pager: BD energy" (BIDA, World Bank, ADB, IRENA).

**(P3) Chatbot upgrade** — mostly n8n: qualification stage in the system prompt (buying signals → ≤3 questions: segment, facility size, timeline → offer free site assessment; explicit consent → `lead-intake` webhook, `source: "chatbot"`). Repo change: quick-reply chips in `components/chat/`. Existing hardening stands: no prices quoted, no spec guarantees, injection-resistant. Booking v1 = owner ping (no calendar infra invented).

**Deferred to Phase 7** (pre-revenue polish — Appendix B11): exit-intent/scroll nudges (`components/conversion/nudge-controller.tsx` + `nudge-settings` global, with the hardcoded frequency-cap floor as specced), `short-links`/QR collection + `/go/[slug]` route, newsletter nurture + `email-suppressions` + unsubscribe workflows. **Consent schema fields ship on `leads` from day one** (cheap now, painful to retrofit).

---

### 3.4 Subsystem 4 — Tracking & daily reporting

#### PostHog wiring (one consent model: cookieless v1)

| Layer | File |
|---|---|
| Client init | `instrumentation-client.ts` — `posthog-js`: `persistence: "memory"` (cookieless — **no banner debt**, no consent banner in v1), `autocapture: false`, manual `$pageview`, `respect_dnt: true`, no session replay |
| Provider | `components/analytics/posthog-provider.tsx` (pageview on `usePathname()` change, `useAnalytics()` hook) |
| Server client | `lib/analytics/posthog-server.ts` — `posthog-node` singleton; property **allowlist** (non-schema keys dropped, email/phone-shaped values dropped), `$ip: null`, flush via `after()` |
| Event registry | `lib/analytics/events.ts` — single source of truth for names+types; **no free-string event names anywhere** |
| First-party proxy | `next.config.ts` rewrites `/ingest/:path*` → PostHog; `NEXT_PUBLIC_POSTHOG_HOST=<site>/ingest`; CSP unchanged (`connect-src 'self'`) |

**Server-side conversion events** (never trust the client): `rfq_submitted`, `chat_started`, `chat_lead_captured`, `calculator_completed`, `report_downloaded`, `draft_approved`/`draft_auto_published`, fired from server actions/routes. **`distinct_id` = per-request random UUID in v1 — no `ph_*` cookie parsing, no `lead_id` property pre-consent** (the lead-joined variant ships only with a future explicit-consent model — Appendix A5). Client events: `$pageview`, `scroll_depth` (25/50/75/100), `cta_clicked`, `calculator_started`. PII lives only in Payload `leads`; transcripts never reach PostHog. UTM capture: `lib/analytics/utm.ts` first-touch `st_utm` cookie (30 d, functional) read server-side into lead attribution. UTM convention in `MARKETING-UTM.md`: `utm_campaign = <yyyy>q<n>-<segment>-<topic>` (e.g. `2026q3-rmg-bess-diesel-alt`).

#### Daily report — n8n `daily-report`, cron `0 8 * * *` Asia/Dhaka

Reads: PostHog Query API (HogQL, personal API key as n8n credential, read scope) + Payload REST with read-only `reporter` service account + `pipeline-runs`. Email blocks, in order: **(1)** headline strip — visitors, leads, hot leads, pending approvals (red if any >18 h old, since 24 h triggers the auto path); **(2)** leads table (name/company/segment/source/score, `/admin` links — internal email, PII fine here); **(3)** top 10 pages + Δ vs 7-day average; **(4)** chat sessions + chat-captured leads; **(5)** approvals queue with Approve + preview links and auto-publish countdowns; **(6)** source-watcher: checked/changed/drafted/auto-published + "fallback cron last seen {date}"; **(7)** kill-switch states + report archive link. Rendered HTML also stored via `POST /api/pipeline/daily-report` → `daily-reports` collection (browsable in `/admin` even if email fails). n8n Error Trigger sends a plain-text fallback alert.

#### Dashboard — v1 = `/admin` views, custom insights view deferred

v1: the daily email + `daily-reports` list + `leads` list with `defaultColumns` (name, company, segment, score, temperature, status) + the `/review` approvals queue. The bespoke Payload `admin.components.views` insights screen (charts, KPI row) is **Phase 7** — built only if the owner asks after a month of using the email (Appendix B10).

---

### 3.5 Subsystem 5 — Tool orchestration & operating model

#### Lanes (one tool, one lane)

| Tool | Lane | Must NEVER do |
|---|---|---|
| **Claude Code** | All repo dev work; only entity that commits/opens PRs; quality gates (`pnpm typecheck/lint/test/build`) | Publish content; touch ERP; SSH; secrets in code; merge red CI |
| **Hermes Agent** | VPS ops (PM2/Nginx/`.env`/backups/deploys after merge, **installs the fallback crontab**); ERP extraction → CMS **drafts** via `/api/hermes/ingest` + `/api/hermes/content-brief` (service account draft-only) | Publish outside auto-publish policy; commit code; expose ERP creds; bypass approval queue |
| **n8n** | All schedulers + glue (04:00 watcher, hourly sweep, 08:00 report, lead-intake, chat backend); all email sends via **Resend HTTP node** | Write Postgres directly (always via app routes); publish without guard; bulk/unsolicited email; scrape personal data |
| **Claude Cowork** | Weekly content batch: 2–4 article drafts/session from calendar + fact packs; owner review sessions | Commit code; publish; invent stats; submit without `citations[]` |
| **Gemini Pro** | Long-document analysis: tariff orders, circulars, WB/ADB PDFs → fact rows `{claim, value, unit, sourceName, sourceUrl, docDate, pageRef}` | Be cited as a source itself; write to CMS; output facts without page refs |
| **ChatGPT** | Second opinion: headline variants, Bangla translation QA, pre-approval checklist pass | Be a fact source; touch any credential |
| **Manus.ai** | One-off research dossiers per segment (pain points, decision criteria, BIDA/NBR hooks, keyword maps) → OneDrive beside the brief docs | Contact prospects; collect personal data; recurring jobs |
| **Owner** | Approvals, lead follow-up, budgets, tariff-global updates, cutover decision | — |

**Pipeline in one line:** Manus dossier → Cowork draft (+ Gemini facts, ChatGPT QA) → `/api/hermes/ingest` → Payload **draft** (visible on beta) → Resend approval email (delivered-event starts clock) → owner approves (or guarded 24 h path) → publish guard → revalidate → live. Nothing bypasses the draft stage; only Claude Code changes code; only Hermes touches ERP/VPS. *(The former 15-min "approval sweep via signed token" lane is deleted — Appendix A1.)*

#### RACI (condensed)

| Activity | Owner | Claude Code | Hermes | n8n |
|---|---|---|---|---|
| Content approve/publish | **A/R** (24 h delegation within guard rules only) | I | C (drafts) | R (executes via guard) |
| Code merge to `main` | **A** | **R** | I | — |
| VPS deploys + fallback crontab | A | C | **R** | I |
| Source registry / tariff-rates global | **A/R** (edits values) | R (schema) | — | C (diff alerts) |
| Lead follow-up | **A/R** | — | C (ERP side) | R (routing/report) |
| Cutover (`SITE_INDEXABLE=true`) | **A/R** | R (checklist) | R (env flip) | I |

#### Weekly rhythm (owner ≈ 2.5 h/week steady-state)

Automatic: 04:00 watcher; hourly sweep; 08:00 report. Owner: **Mon** 45 min — read report, Cowork session (pick 2–4 topics, review last batch); **Wed** 30 min — approval batch (email links + beta skim); **Fri** 45 min — leads pipeline in `/admin`, follow-ups, weekly numbers; ad hoc ~30 min — answer agent questions (facts, photos, client clearances).

---

### 3.6 Subsystem 6 — Compliance, safety & quality gates

A rule that isn't enforced by a hook or lint doesn't exist. v1 gates are deliberately cheap and deterministic (Appendix B5).

#### 3.6.1 Content gates (v1)

| Gate | Mechanism |
|---|---|
| Citation-required categories can't publish uncited | `beforeValidate` hook on articles/news-items/knowledge-resources (runs on save AND at Hermes ingest) |
| Quote length ≤ 15 words, inside quote blocks, attributed | `scripts/content-lint.ts` — counts words in Lexical quote nodes |
| Banned phrases | lint regex list: "guaranteed savings", "zero risk", "best in Bangladesh", "no. 1", "ROI guaranteed", cart/checkout/"buy now" phrasing |
| Hardcoded company stats | lint flags literal `103+\|175+\|10 sectors\|8 years` in body fields (must come from the stats global) |
| `[DATA NEEDED]` marker | drafting prompts instruct "if a figure isn't in the provided material, write [DATA NEEDED]"; lint blocks the marker from the approval flow |
| Paywalled source quoting | `sources.paywalled` → lint blocks quote nodes citing it |
| Disclaimers | incentive/duty/financing content renders the standing disclaimer block from a CMS global ("verify with NBR/BIDA/your advisor; figures as of {date}") |
| Media licensing | `media` collection gains required `license` select (`own`/`licensed`/`cc-attribution`/`supplier-provided`) + `attributionText`; no hotlinking/scraped images |
| **Third-party naming (split rule)** | (a) Clients/testimonials: only entities in `clients` with `publishApproved: true` (written clearance). (b) Third parties in news context (H&M, Inditex, named utilities): allowed **only** with tier-1/2 or the brand's own published source, neutral attribution ("according to …"), no relationship implication, no disparagement — and **always human-approved, never in the auto-publish path** (`riskFlags: third-party-name`). |
| Editorial topic fence | `editorial-topics` global (solar/BESS/EPC/LPS/lighting/energy policy for BD C&I); politics, elections, religion, labor disputes, brand controversies → hard skip, logged to daily report |

**v2 (Phase 7, explicitly cut from v1):** full numeric tokenizer ("every number must trace" — false-positives on kVA ratings/model numbers), nightly LLM-judge rubric, Bangla numeric-parity lint, JSONL audit mirror on the VPS (the immutable Payload collection suffices).

#### 3.6.2 Data & privacy (GDPR-grade by choice — BD's data-protection ordinance is fluid; bank/IFC-linked buyers expect it)

1. PII in exactly two collections (`rfq-requests`, `leads`), admin-auth only; PostHog/n8n logs carry opaque ids only.
2. Minimization: name, work email, company, optional phone, service interest. No NID/DOB/home addresses. IP stored only as truncated hash (`sha256` of /24) for rate-limiting, 90-day TTL.
3. Consent: unticked checkbox, copy snapshot stored (`consentTextShown`), double opt-in before any marketing send (`doubleOptInConfirmedAt`), transactional sends (report/asset delivery, RFQ replies) never require it.
4. Unsubscribe honored instantly when nurture email ships (Phase 7: suppression collection + `List-Unsubscribe` headers); until then, no marketing sends at all.
5. Retention: inactive leads anonymized after 24 months (n8n monthly job, Phase 7).

#### 3.6.3 Security

- **Secrets segregation:** `APPROVAL_TOKEN_SECRET` (human approval), `PIPELINE_SECRET` (n8n machine lane, can reach the sweep), `CRON_SECRET` (VPS crontab — detect-only routes, **can never publish**; it sits in a crontab line readable on the box), `LEADS_CONFIRM_SECRET` (single field flip), `HERMES_AGENT_SECRET` (drafts only, unchanged). n8n never holds Hermes's bearer or a generic Payload write key.
- **Server-to-server:** HMAC bearer + timestamp + nonce, >5 min skew rejected, both directions. Nothing automation-related callable from a browser.
- **Rate limits:** `/api/approve/*` 10/h/IP; lead-capture actions 10/h/IP; `/api/download` 20/h/IP; `/api/chat` keeps its existing limit; 429 with no detail.
- **Approval tokens:** §3.2c spec (single-use, version-pinned, 72 h, GET-confirm/POST-act).
- **Kill switches:** `SOURCE_WATCH_ENABLED` (pipeline), `automation-settings.autoPublishEnabled` (DB, phone-toggleable), `AUTOMATION_KILL_SWITCH` (env, survives DB compromise). Daily report states all three every day.
- **Beta/prod separation:** previews on beta (noindex); the guard endpoint is the only promotion path; existing CSP/headers posture (PR #37) extended, not weakened.

---

## 4. Phased roadmap

Order fixed per Appendix B12 (lead capture and content before automation; watcher only once there is cited content to watch). Honest total: **~32–40 dev-days** + continuous content cadence.

| Phase | Deliverables | Effort | Depends on | Who |
|---|---|---|---|---|
| **0 — Prerequisites & sign-offs** | Owner checklist (§5) complete; Resend account + SPF/DKIM/DMARC on sustechltd.com; PostHog project; n8n access confirmed; **written sign-offs:** (a) auto-publish = prose-only edits in 3 whitelisted categories, (b) count-based version retention satisfies the 3-month archive intent | 0.5 dev-day + owner admin | — | Owner + Claude Code |
| **1 — Leads & analytics foundation** | `leads` collection + upsert + scoring + Vitest; `lib/actions/lead.ts`; rfq-requests `afterChange` upsert; n8n `lead-intake` (HMAC, Resend double-opt-in confirm, hot-lead ping); `/api/leads/confirm`; PostHog wiring (cookieless, typed events, `/ingest` proxy, server capture); UTM util | 5–6 dev-days | 0 | Claude Code + n8n |
| **2a — Citation data model** | `sources` + seed 26 (`pnpm seed:sources`); `citations` + `claims` fields (+`index: true`); `sources-references.tsx`; `articleJsonLd`; citation-required hook (save + ingest); content-lint v1 (quotes/banned phrases/stats/markers); `lib/company-facts.ts`; `/llms.txt` update; schema-contract Vitest | 3–4 dev-days | — (parallel with 1) | Claude Code |
| **3 — Calculators, blocks & segment pages** | `tariff-rates` global; 3 new calculators + RMG presets + `email-report-gate`; blocks `calculatorEmbed`, `gatedAsset`, `relatedContent`, `nextBestAction`, `proofStrip`; `pages.segment` field; `/api/download/[id]`; 5 segment pages assembled in CMS; gated-asset pipeline | 8–10 dev-days | 1, 2a | Claude Code (code) + Owner (CMS pages, tariff values) |
| **2b — Content cadence (continuous)** | 10 cornerstone articles (2/segment) via Manus → Cowork → Gemini → ChatGPT → `/api/hermes/ingest` → owner approval; 3 gated whitepapers; Bangla variants of top cornerstones | ~4 weeks cadence, ~0 dev-days | 2a + Phase-0 items 8–9 | Cowork/Gemini/Manus/Hermes + Owner |
| **4 — Nightly pipeline & approval** | `pipeline-runs`, `publish-audit`, `revisionMeta`; routes `/api/pipeline/*`, `/api/approve(+preview)`, `/api/publish/guard`, `/api/cron/nightly`; `lib/source-watcher.ts`, `lib/approval-token.ts`, `lib/claim-diff.ts`, `lib/versions.ts`, `lib/auto-publish-policy.ts` (+Vitest); n8n `nightly-source-watch` + `auto-publish-sweep` (shadow mode); Resend delivered-webhook recording; `/review` queue page; **VPS crontab installed by Hermes + documented in `DEPLOYMENT-AND-VPS.md`**; `maxPerDoc` 20→50 | 7–9 dev-days | 2a, ≥10 cited articles live (2b) | Claude Code + n8n + Hermes |
| **5 — Daily report** | n8n `daily-report` (08:00); `daily-reports` collection + `/api/pipeline/daily-report`; `reporter` read-only role; heartbeat lines; `MARKETING-UTM.md` | 3–4 dev-days | 1, 4 | Claude Code + n8n |
| **6 — Auto-publish enablement & cutover** | Review ≥2 weeks of sweep shadow logs → owner flips `AUTO_PUBLISH_ENABLED`; production cutover: DNS to www, `SITE_INDEXABLE=true`, sitemap to GSC/Bing, monitoring confirmed | 1–2 dev-days | 4, 5, owner go-date | Owner + Hermes + Claude Code |
| **7 — Backlog (on demand)** | `/admin/insights` view; `short-links` + `/go/[slug]` QR; nudge controller; newsletter nurture + `email-suppressions` + unsubscribe; Lexical citation node; numeric tokenizer + LLM-judge + Bangla parity lint; WhatsApp Business API (if owner provisions it); calendar booking | scoped per item | 6 | per item |

---

## 5. What we need from you (owner-input checklist)

**Accounts & access**
1. **Resend account** (the email decision is made — Resend, called from n8n; delivery webhooks are load-bearing for the 24 h clock) + DNS access to add SPF/DKIM/DMARC for sustechltd.com.
2. **Approval inbox** + a **backup recipient** (delivery-failure fallback — silence must never mean approval).
3. **PostHog** org login or project API keys (client key + read-only personal key).
4. **n8n admin credentials** confirmed for n8n.sustechltd.com.
5. **Google Search Console + Bing Webmaster** ownership of sustechltd.com (register now, even while noindex).
6. (Optional, Phase 7) WhatsApp Business API onboarding if outbound WhatsApp alerts are ever wanted — none exist today.

**Decisions (need written sign-off in Phase 0)**
7. **Auto-publish narrowing:** the 24 h auto path covers prose-only edits in `industry-news-roundup, knowledge-explainer, glossary` only; tariffs/prices/legal/client-naming always wait for you. Confirm so nobody "fixes" it later by widening the list.
8. **Archive model:** count-based version retention (50/doc) + immutable audit log instead of a literal 90-day prune job and instead of public dated archive URLs.
9. **Production cutover target date** (drives Phase 6 and the `SITE_INDEXABLE` flip).
10. **Ad budget** (monthly figure + channels; zero is valid — the plan is organic-first).

**Content assets**
11. **Cleared client list:** written list of client names/logos/testimonials approved for public use (`publishApproved` is set only from this list).
12. **Source seed confirmation:** the 26-source registry (§3.1b) + any licensed analyst reports you have access to.
13. **Current tariff documents** you already hold (BERC order PDFs, DPDC/DESCO schedules) to seed `tariff-rates` with verified values + dates.
14. **Official social URLs** (LinkedIn/Facebook) for `Organization` schema `sameAs`.
15. **Segment briefs** for Manus dossiers (one paragraph per segment: who you want, deal size, references you can show).

---

## 6. Compliance charter (the red lines)

1. **Accuracy first.** No number without a registered source or the company catalog; tariff/tax/policy claims need a tier-1 document with number + date; volatile figures carry "as of {date}"; performance figures are hedged ("up to"), never guaranteed, never quoted as prices.
2. **Never invent.** No invented statistics, certifications, clients, testimonials, or citations. Planned citations resolve to real documents before drafting. Company stats come only from `lib/company-facts.ts`/CMS.
3. **Copyright.** ≤15 verbatim words per quote, attributed and linked; paraphrase + link preferred; paywalled content cited by headline only; no archived copies of third-party pages (hash + ≤300-char excerpt max); images only from `media` with recorded license.
4. **Respectful fetching.** robots.txt honored with a declared bot UA; RSS preferred; conditional GETs; 5-fetch batches with 10 s gaps; disallowed sources flip to manual-only permanently.
5. **No publishing without a human or a guard.** AI output is draft-only. The single auto-publish path requires: enabled switches, delivered approval email, 24 h elapsed, whitelisted category, byte-identical claims ledger, no risk flags, under daily cap. Everything else waits for a human forever. Every publish is in an immutable audit log; rollback < 2 minutes.
6. **Consent or silence.** No purchased/scraped lists, no cold-outreach bots, no auto-DMs; WhatsApp stays inbound-only. Marketing email only after explicit unticked opt-in + double opt-in confirm; transactional sends are single-purpose; unsubscribe honored instantly when nurture launches.
7. **No dark patterns.** Pre-ticked boxes, confirm-shaming, fake countdowns, hidden dismissals, retro-gated results: banned. Calculator results visible without email; calculators compute only from user inputs + cited public rates; outputs labeled "indicative estimate — not a quote or guarantee."
8. **Privacy minimal.** PII only in `rfq-requests`/`leads` behind admin auth; analytics cookieless with property allowlists and no PII; no IP storage beyond hashed rate-limit keys; no enrichment beyond what the lead typed + public company domain.
9. **Editorial fences.** No politics/elections/religion/labor-dispute commentary; no government criticism; no disparagement of any company; third-party brands only with tier-1/2 sourcing, neutral attribution, human approval; no legal/tax/financial advice voice — standing disclaimers on incentive/duty content.
10. **Stop means stop.** Three independent kill switches; daily report states their status; any one of them halts publishing while the site keeps serving last published content.

---

## 7. KPIs & definition of success (90 days from Phase 5 complete; targets, not guarantees)

**Engine health (must hit — these are in our control)**
- Nightly pipeline success rate ≥ 95%; fallback heartbeat visible weekly; 0 unaudited publishes; 0 compliance incidents (copyright complaints, spam reports, wrong-tariff publications).
- 100% of published knowledge articles carry ≥1 tier-1/2 citation with rendered references + `Article` schema; "Last reviewed" ≤ 45 days on all tariff/policy pages.
- Owner steady-state time ≤ 2.5 h/week; approval median < 24 h; daily report delivered ≥ 99% of days.

**Content & visibility**
- 10 cornerstone pages + 25–35 supporting articles live and indexed at cutover (+ Bangla variants of the top 5).
- All 5 segment landing pages live with calculator + gated asset + sector proof.
- Post-cutover trajectory: GSC impressions trending up month-over-month for the named money keywords; first verified AI-engine citation of a Sustech page (spot-checked monthly against Perplexity/ChatGPT/Claude answers for the target queries).

**Leads (realistic BD B2B, organic-first)**
- 40–80 captured leads total (calculators + gated assets + chat + RFQ), of which 8–15 hot (score ≥ 60).
- 10–20 qualified RFQs/consultation requests; 3–6 advancing to site assessment or proposal stage (owner-confirmed in the `leads` pipeline).
- Calculator completion rate ≥ 25% of calculator starts; report-email conversion ≥ 20% of completions.

**Success =** the engine runs a full month with zero manual firefighting, the owner trusts the approval flow enough to enable auto-publish, and at least one new B2B opportunity in the pipeline is attributable (via `leads.attribution`) to engine-generated content.

---

## 8. Design decisions appendix (critique resolutions)

All 30 items resolved. ✅ = incorporated as recommended; ✱ = incorporated with modification (explained).

| # | Item | Resolution |
|---|---|---|
| A1 | Three conflicting auto-publish paths; S5 sweep forged owner intent | ✅ S5's 15-min token-minting sweep **deleted**. One path: hourly sweep → `/api/publish/guard` under internal identity; audit `auto-published-24h` ≠ `approved-by-owner` (§3.2c) |
| A2 / B2 | SMTP has no delivery webhooks; `lib/email/` contradiction | ✅ Resend via n8n HTTP node (no email SDK in web tier; `lib/email/` removed from Phase 1). Clock starts on `delivered` webhook; no event in 6 h → manual-queue lock + backup alert (§3.2a, §5.1) |
| A3 / B3 | `market-insight` in whitelist; dead-code-path honesty | ✅ One env var `AUTO_PUBLISH_CATEGORIES` = S6's list verbatim; `market-insight` removed; ships OFF + ≥2-week shadow mode; **owner sign-off item 7** documents the deliberate narrowing of the stated 24 h requirement |
| A4 | Calculators using "up to 75%" as math input | ✅ Formulas use user inputs + cited `tariff-rates` only; catalog ceilings never enter formulas; ranges not points; "indicative estimate — not a quote" rendered server-side (§3.3) |
| A5 / B9 | Pre-consent pseudonymous tracking; two consent models; event-name drift | ✅ One model: cookieless v1 (S3), no banner; server events use per-request random UUIDs, no `ph_*` parsing, **no `lead_id`** pre-consent; S4's typed event registry is canonical (`calculator_completed`); conversions server-side (§3.4) |
| A6 / B4 | Outbound WhatsApp + reply-by-email are invented infra | ✅ Stripped everywhere. v1 alerts = email + `/admin`/`/review` queue. WABA is optional Phase-7/owner-input item 6 |
| A7 | 75-word vs 15-word quote limit | ✅ 15 words, one rule (§3.1d.4); content-lint runs at Hermes ingest, not only nightly |
| A8 | Third-party naming both planned and banned | ✅ Split rule (§3.6.1): clients need written clearance; third parties in news context need tier-1/2 or brand-own source, neutral attribution, human approval, never auto-publish |
| A9 | "BB uptime guidance" unverified citation | ✅ Corrected to BB ICT Security Guideline; rule generalized: every planned citation resolves to a real document number+date in the registry before drafting (§3.1d.10, §3.3 gated assets) |
| A10 / B7 | n8n credential blast radius; sweep auth; two token specs | ✱ Per-surface secrets: `PIPELINE_SECRET` (replaces Hermes-bearer reuse; `/api/hermes/revise` → `/api/pipeline/revise`), `LEADS_CONFIRM_SECRET` signed-token route (no Payload write key for n8n), read-only `reporter` key. **A10/B7 conflict resolved:** B7 wanted the sweep on `CRON_SECRET`, A10 forbids `CRON_SECRET` (crontab-visible) from publish-capable surfaces — sweep therefore auths with `PIPELINE_SECRET` (n8n-held, not on the box); `CRON_SECRET` is confined to detect-only fallback routes. Token spec merged: S2's JWT mechanism + GET-confirm/POST-act + hourly sweep, S6's 72 h TTL + version pinning + single-use jti, one secret `APPROVAL_TOKEN_SECRET` (§3.2c) |
| A11 / B1 | Schema split-brain (3× sources, 2× citations, 2× leads, overlapping claims) | ✅ §3.0 canonical model: sources = S2 ops fields + S6 `paywalled`/`fetchPolicy` + S1 four-level `checkFrequency`; one `citations`; `claims[]` kept as data but **references `citations` by index** (deduplicates S6's overlap); leads = S4 upsert model + S3 consent group; one scoring table; schema-contract Vitest asserts every hook field path against `payload-types.ts` |
| A12 | Robots/ToS as a footnote | ✅ Explicit robots-check node before every fetch; declared UA; RSS-first for all four newspapers; auto-flip to `manual-only` (§3.2a step 4) |
| A13 | Two approval-token specs | ✅ Merged spec — see A10/B7 row |
| A14 | `sources` publicly readable | ✅ `read: isAdminOrEditor`; nothing public reads it (§3.0) |
| A15 | Hardcoded company stats in cornerstone copy | ✅ Interpolated from stats global/`company-facts.ts`; lint pattern flags literals (§3.1a, §3.6.1) |
| B5 | Cut heavy gates (tokenizer, LLM-judge, Bangla parity, JSONL mirror) | ✅ v1 = category hook + banned-phrase lint + quote-length lint + `claims[]` as data + immutable `publish-audit` collection; tokenizer/judge/parity/JSONL mirror → Phase 7 (§3.6.1) |
| B6 | Version retention triple-specified; no public deleteVersions; autosave churn | ✱ `maxPerDoc` 20→50, count-based retention, **no prune cron**. Deviates from a literal 90-day prune; covered by owner sign-off item 8 (the 3-month *intent* — recoverability — is met by versions + audit snapshots) |
| B8 | Watcher must not write `tariff-rates` | ✅ Global is human-edited only (globals have no drafts); watcher flags the change in the daily report → owner edits in `/admin` → revalidate refreshes calculators (§3.0, §3.4) |
| B10 | Admin insights view is v2 | ✅ Deferred to Phase 7; v1 = daily email + `daily-reports` + `leads` defaultColumns + `/review` queue |
| B11 | Defer nudges, QR/short-links, suppression workflows | ✅ All Phase 7; consent fields on `leads` ship day one; until nurture exists there are zero marketing sends (so no suppression list needed yet) |
| B12 | Phase order built automation before content | ✅ Roadmap reordered 0 → 1 ∥ 2a → 3 → 2b (continuous) → 4 (watcher gated on ≥10 cited articles) → 5 → 6 (§4) |
| B13 | Effort ~2× understated | ✅ With B5/B6/B10/B11 cuts: 32–40 dev-days stated honestly; Phase 7 scoped per item |
| B14 | Fallback cron unowned, no liveness | ✅ Phase 4 deliverable: installed by Hermes, documented in `DEPLOYMENT-AND-VPS.md`, weekly `mode=heartbeat` run surfaces "fallback cron last seen" in the daily report (§3.0 cron table, §3.2a) |
| B15 | Payload 3 gotchas | ✅ (a) `index: true` on `citations.source`; (b) `lib/versions.ts` discard/restore helper; (c) publish guard runs under its own internal identity so `denyHermesPublish` (verified at `cms/hooks/deny-hermes-publish.ts`) passes and audit actors are accurate (§3.0, §3.2) |

**Rejected ideas (for the record):** public `/archive/[slug]/[date]` URLs (GEO liability — stale numbers get cited); n8n Wait-node 24 h timers (lost on restart); PDF generation library in the web tier (print-styled HTML report instead); separate `/dashboard` auth surface (owner lives in `/admin`); ML lead scoring (rule-based is auditable); any outbound automation toward prospects (inbound-only by charter).