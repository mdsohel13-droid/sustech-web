# GrowthOS × Lead Engine — Unified Integration Plan

**Status:** Canonical, v1.0 (2026-06-12). Merges `D:\Projects_AI\GrowthOS\Lead_Gen_Supreme_Master.md` (Doc A, read in full) into `C:\Projects\sustech-web\marketing\lead-engine-master-plan.md` (Doc B, read in full). All 12 adversarial-review fixes applied; zero rejected (one *design* reversal: the chat backend stays on the web tier — fix #11). This document answers the owner's three questions and is the source of truth for both projects.

---

## 1. Verdict — merge or separate? (Q1)

1. **One program, two deployment units, three engines.** Doc A's Inbound engine (Engine 2) **merges into** the existing Phase 0–7 website roadmap — it was already ~80% built there; the website repo gains exactly **three small code items** (`/api/leads/ingest` + `/api/leads/suppression-hashes`, and a consent-gated pixel loader at ads launch).
2. Doc A's **Outbound (Engine 1) and Public Signal (Engine 3) run beside it** as a GrowthOS track that lives entirely on VPS-2 (n8n + `growthos` Postgres + manual playbooks) — they never add code, credentials, or prospect data to the web tier.
3. The two tracks **merge at the data/reporting layer only**: one daily 08:00 report, one one-way prospect→lead promotion path, one shared ethics charter (Doc B §6 reworded per Conflict 6.2 below + Doc A ch. 13/16 verbatim).
4. Doc B's charter stands unbroken: "no cold-outreach bots" — Doc A complies because AI researches and drafts, **a human sends every message**, from a side domain, opt-outs honored instantly.
5. v1 outbound is deliberately cut to **one motion** (weekly trigger scan → Sunday top-5 → ≤5 deeply personalized Tier-A touches/week) because the full Doc A program costs 10–15 h/week the owner does not have (fix #5).

---

## 2. Unified architecture

```
                                  ┌──────────────────────────────┐
                                  │            OWNER             │
                                  │ approves drafts · SENDS every│
                                  │ outbound msg · sets budgets  │
                                  │ 1:1 WhatsApp (provenance-only│
                                  │ numbers, Business app)       │
                                  └─────┬────────────────┬───────┘
        approve/reject links · hot-lead │                │ Sunday top-5 · daily 08:00 report
        pings · review queue            │                │ outbound due-queue (NocoDB)
                ┌───────────────────────┘                └───────────────────┐
                ▼                                                            ▼
┌── VPS-1 "WebVPS" 93.127.160.183 — PUBLIC, LEAN ──┐  ┌── VPS-2 "Hermes/Services" 93.127.160.68 — PRIVATE, CREDENTIALED ──┐
│            ENGINE 2 · INBOUND                     │  │       ENGINE 1 · OUTBOUND   +   ENGINE 3 · PUBLIC SIGNAL          │
│ nginx → Next.js + Payload /admin (PM2 :3000)      │  │ n8n (HARDENED: UI behind VPN/IP-allowlist + 2FA; nginx exposes    │
│ sustech Postgres (127.0.0.1) — content +          │  │  only named webhook paths; pinned version, monthly patch)        │
│   leads/rfq = ONLY consented hand-raiser PII      │  │  ├ nightly-source-watch 04:00 · sweep :15 · daily-report 08:00   │
│ calculators · gated assets · segment pages        │①▶│  ├ lead-intake (HMAC) → dedupe vs prospects → cadence halt       │
│ chatbot (Anthropic call STAYS here, spend-capped  │◀②│  ├ CAPI relay — fires ONLY adConsent=true AND fbc/fbp present     │
│   key — fix #11; n8n move rejected)               │  │  ├ weekly trigger-scan (news/e-GP/Bdjobs/BB/BEZA) → Claude       │
│ PostHog /ingest proxy (cookieless v1)             │  │  │   filter/score → growthos DB → Sunday top-5 email             │
│ [ads phase] consent banner + gated pixel loader   │  │  └ suppression sync (pulls HASHES only — fix #9)                 │
│ /api/leads/ingest (consent-stripped — fix #3)     │  │ growthos Postgres (127.0.0.1): prospects = researched,           │
│ /api/leads/suppression-hashes (SHA-256 out only)  │  │   NON-consented; 6–12 mo TTL purge (fix #10); NocoDB viewer      │
│ VPS crontab fallback (CRON_SECRET, detect-only)   │  │ outbound drafting (Claude) → human review → human send           │
│ NO outreach/ad/AI-batch/ERP credentials. Ever.    │  │ creds: Resend · Anthropic(n8n) · MillionVerifier · Meta/Google   │
└───────────────────────────────────────────────────┘  │ ERP + ERP2/GrowthOS containers · VPS-Hermes (separate OS user)   │
  ① one channel out: HMAC webhooks (lead events,        └───────────────────────────────────────────────────────────────────┘
    adConsent-flagged conversions), fired via after()              ▲ SSH = people-lane only (no service keys cross boxes)
  ② per-surface tokens back: PIPELINE_SECRET,              ┌───────┴──────┐
    signed confirm tokens, reporter read-only key          │  PC-Hermes   │ OneDrive/brief sync · drafting · research CSVs →
  NO cross-DB links · prospect data NEVER reaches VPS-1    └──────────────┘ HMAC-signed import webhook (fix #12)

  SIDE COLD-EMAIL DOMAIN (e.g. sustech-energy.com): separate mailbox/tooling, visibly-Sustech one-pager,
  honest whois, postal address + opt-out in every mail — NEVER touches sustechltd.com SPF/DKIM (fix #6).
  Encrypted backups (age/gpg) → third-party object storage (B2/S3) — never WebVPS (fix #8).
```

---

## 3. Feature integration matrix (final, deduplicated)

Lives-in legend: **WEB** = sustech-web repo/VPS-1 · **GOS** = GrowthOS store+jobs, VPS-2 · **n8n** = workflow, VPS-2 · **MAN** = manual playbook. Phase column = merged roadmap (§5).

| # | Capability (Doc A ref) | Status | Lives in | Phase | Decision notes |
|---|---|---|---|---|---|
| 1 | Authentic-lead / consent-first philosophy (ch. 2, 13, 16) | COVERED | — | — | Doc B §6 stricter; one shared charter, Doc A ch. 13/16 text copied verbatim into it |
| 2 | ICP + champion maps + budget-cycle calendar (ch. 3.1) | PARTIAL | MAN + GOS | G1 | One-page ICP doc; living champion maps **deferred to v2** (fix #5) |
| 3 | Funnel math & benchmarks (ch. 3.2, 17) | NEW | MAN | G1 | Expectation-setting doc only |
| 4 | Prospect scoring Fit/Signal/Reach 0–9, A/B/C (ch. 3.3) | NEW | GOS | G1 | Scores *prospects*; Payload behavioral scoring untouched (Conflict 6.3) |
| 5 | BD public-data list building: BB banks, BGMEA/BKMEA/BTMA, e-GP, DSE, chambers, BIDA/BEZA/BEPZA, SREDA, Bdjobs (ch. 5) | NEW | GOS + MAN | G1 | Research starts day one; **sending** is gated (fix #4). Never mixes with Doc B's 26-source *citation* registry |
| 6 | Enrichment waterfall Apollo/Hunter/Lusha/Clay (ch. 5–6) | NEW | GOS | G1/v2 | Hunter optional; Clay/Apollo deferred — owner decision, keys VPS-2 only |
| 7 | MillionVerifier gate, bounce discipline (ch. 6.2) | NEW | n8n | G2 | **Only `valid` sends — never risky/catch-all; auto-halt batch at ≥2% bounce** (fix #6a) |
| 8 | Weekly lead-machine → Sunday top-5 (ch. 6.3) | NEW | n8n + GOS | G2 | Report by email (no outbound WhatsApp, Doc B A6); = the v1 "one motion" core |
| 9 | Cold email: side domain, SPF/DKIM/DMARC, warm-up, 20–30/day, OPPA formula (ch. 7.1) | NEW | GOS + MAN | G3 | Human-sent. Domain bought **week 1**, visibly Sustech, manual 4+-week ramp, **no warm-up bot networks** (fix #6b/c). v1 volume: ≤5/week, scale only after reply-handling proves calendar fit (fix #5) |
| 10 | WhatsApp respectful first-touch (ch. 7.2) | NEW | MAN only | G3 | Provenance-enforced numbers (referral/card/event); zero automation (Conflict 6.2) |
| 11 | LinkedIn social selling, no bots (ch. 6.4, 7.3) | NEW | MAN + GOS | G3 | Doc A's own no-bot rule = Doc B charter; drafting automated, sending manual |
| 12 | Referral process, LEA/CCCI/IEB, expos, PS protocol (ch. 7.4) | NEW | MAN | G3 | No code; GBP review-ask joins this playbook |
| 13 | 14-day multi-touch cadence machine (ch. 7.5) | NEW | GOS | **v2** | **Deferred** (fix #5); v1 = plain Postgres `next_due_at` viewed in NocoDB |
| 14 | Tracking: GTM+GA4+Meta Pixel+Google tag+LinkedIn tag+Clarity (ch. 9) | PARTIAL | WEB | G4 | PostHog canonical; **consent banner + consent-gated pixel loader = explicit phase-gated deliverable** with CSP diff + privacy-policy dependency (fixes #2, #12); GA4 skipped; Clarity skipped |
| 15 | Server-side CAPI (ch. 9) | NEW | n8n | G4 | Forwards **only** events with `adConsent=true` AND `fbc`/`fbp` present — never the whole lead stream (fix #2) |
| 16 | Google Search Ads, high-intent + negatives, ৳30–50k/mo (ch. 10.1) | NEW | MAN + GOS | G4 | Landing pages/UTM already covered (Doc B §3.3/§3.4) |
| 17 | Google Business Profile (ch. 10.2) | NEW | MAN | G3 | Free; no code |
| 18 | SEO content engine (ch. 10.3) | COVERED | — | 2b | Doc B cornerstone map + nightly freshness exceed Doc A |
| 19 | GEO / AI-search (ch. 10.4) | COVERED | — | 2a | Citations + Schema.org + `/llms.txt` already ahead |
| 20 | Meta 3-tier TOFU/MOFU/BOFU funnel (ch. 11.1) | NEW | MAN | G4 | v1 = Lead Ads + simple pixel retargeting only (fix #12) |
| 21 | Meta Lead Ads + instant ingestion (ch. 11.2) | NEW | n8n + WEB | 1b + G4 | Meta webhook → n8n → `POST /api/leads/ingest`; route **server-side forces `marketingOptIn:false`, `consentAt:null`, `doubleOptInConfirmedAt:null`** — mailable pool only via standard double-opt-in confirm (fix #3) |
| 22 | Advantage+ / lookalikes from client lists (ch. 11.3–11.4) | NEW | MAN + n8n | **v2** | Deferred until Lead Ads + retargeting prove CPL (fix #12); when built: **documented notice/consent artifact per contact, written owner sign-off per upload, clients only** (fix #7) |
| 23 | Landing pages per offer, never homepage (ch. 12.1) | COVERED | — (CMS) | 3 | Pure CMS composition, zero code |
| 24 | Lead magnets: gated SolarCalc, checklists, guides (ch. 12.2) | COVERED | — | 3 | Doc B's no-dark-pattern gate kept (Conflict, cleared by review) |
| 25 | Chatbot 24/7 + WhatsApp button (ch. 12.3) | COVERED | WEB | 3 | **Anthropic call stays in web tier** — spend-capped key + existing rate limits; n8n move rejected: no streaming, cross-box latency, hard-down on every n8n restart (fix #11) |
| 26 | 5-minute response rule (ch. 12.4) | PARTIAL | n8n | 1 | Extend `lead-intake`: ack every lead + owner ping; WABA stays Phase 7 |
| 27 | Nurture: 5-email sequences, behavioral scoring, retargeting (ch. 12.5) | PARTIAL | WEB + n8n | 7 | Already Doc B Phase-7 backlog; consent fields ship day one |
| 28 | Weekly trigger scan: factories, fires, bank green moves, hiring (ch. 13, prompt C) | NEW | n8n + GOS | G2 | Sibling of 04:00 watcher, **separate workflow + store**; signals → prospect DB, never CMS |
| 29 | Signal→channel first-touch matrix (ch. 13.5, prompt E) | NEW | MAN + GOS | G2 | Decision table + drafting prompts; never scraped personal numbers |
| 30 | "Public ≠ permission" ethics (ch. 13.1–13.3, 16) | COVERED | MAN | 0 | Merged into the one shared charter |
| 31 | Surround sound (ch. 14) | NEW | MAN | G4 | Via UTM-tagged pages + consented pixel retargeting only; **researched prospect lists never uploaded to any ad platform** |
| 32 | Tool stack ~৳70k/mo, 85% ads (ch. 15) | NEW | MAN | 0/G4 | Owner decision (§8) |
| 33 | KPI loop CPL/CPA/ROAS + outbound KPIs (ch. 17) | PARTIAL | n8n | 5 | Daily-report extension reads ad APIs + outbound stats from VPS-2 |
| 34 | Prompt library A–E (ch. 18) | NEW | MAN | G1 | Used as-is; **versioned prompt-asset system deferred to v2** (fix #5) |
| 35 | 90-day roadmap (ch. 17) | NEW | — | §5 | Replaced by the merged roadmap below; ads gated on website Phases 3+6 |

**Tally:** 7 COVERED · 6 PARTIAL · 22 NEW. Website-repo touchpoints: **three** (rows 14, 21+suppression endpoint, 27-already-planned). Everything else is VPS-2 or playbook.

---

## 4. Deployment map + Hermes split (Q2 + Q3)

### 4.1 VPS-1 "WebVPS" (93.127.160.183) — public, attackable, latency-critical. Keep lean.

| Component | Note |
|---|---|
| Next.js + Payload `/admin` (PM2 :3000 behind nginx) | All 3 vCPU/RAM headroom reserved for LCP < 2.0 s |
| `sustech` Postgres (Docker, 127.0.0.1) | Co-located for SSR; never exposed off-box |
| `leads` + `rfq-requests` — consented inbound PII only | The only PII this box ever holds |
| Chat endpoint with Anthropic call, **dedicated spend-capped key** | Fix #11 — conversion channel beats credential purity, said explicitly |
| `POST /api/leads/ingest` (HMAC, consent-stripping) + `GET /api/leads/suppression-hashes` (reporter-gated, **SHA-256 values only**) | Fixes #3, #9 — raw lead emails never bulk-leave this box |
| [G4] consent banner + consent-gated pixel loader (`next/script` afterInteractive, CSP allowlist diff) | Fix #2/#12 — loads nothing for organic/non-consenting visitors |
| PostHog `/ingest` rewrite; VPS crontab fallback (`CRON_SECRET`, detect-only) | Unchanged from Doc B |
| Secrets: `PAYLOAD_SECRET`, DB creds, `APPROVAL_TOKEN_SECRET`, `CRON_SECRET`, `LEADS_CONFIRM_SECRET`, `N8N_WEBHOOK_SECRET`, capped Anthropic chat key | Smallest possible set |

**Never on WebVPS:** n8n, scanners, prospect rows, outreach drafts, Resend/Meta/Google-Ads/MillionVerifier/Hunter keys, CAPI tokens, ERP anything, Hermes credentials, backup dumps of `growthos`.

### 4.2 VPS-2 "Hermes/Services" (93.127.160.68) — private automation tier. **Hardening is a precondition (fix #1):** before any outreach/ad credential lands here — n8n UI behind VPN or nginx IP-allowlist, 2FA on, nginx exposes only the named webhook paths publicly, fail2ban on the vhost, pinned n8n version + monthly VPS-Hermes patch job, Hermes SSH keys in a separate OS user from the n8n runtime.

| Component | Note |
|---|---|
| n8n + all workflows: 04:00 watcher, hourly sweep, 08:00 report, lead-intake, trigger-scan, suppression sync, CAPI relay, Meta Lead Ads ingestion, monthly prospect-TTL purge | All schedulers and glue live here |
| `growthos` Postgres 16 (self-hosted container, 127.0.0.1 — **not** Supabase cloud) | Prospects = most sensitive dataset; no third-party processor; BD PDPA posture; n8n reaches it over localhost |
| Prospects schema per the matrix design, plus: **TTL purge at 6–12 months inactivity; `signals[]` restricted to business role + linked public sources; one-page lawful-basis memo; opt-outs global both directions** (cold opt-out → Phase-7 `email-suppressions`; lead unsubscribes → `do_not_contact`) (fix #10) | NocoDB/psql viewer in v1 — no custom GrowthOS UI (fix #5) |
| Outbound drafting pipeline (Claude API, MillionVerifier) → review queue; **sending always human** | Side-domain mailbox/tooling configured here or owner's machine — never sustechltd.com DNS |
| Credentials: Resend (n8n store only), Anthropic batch, MillionVerifier, Meta/Google ads, CAPI tokens | Ad-platform tokens never touch the public box |
| Backups: nightly `pg_dump` of both DBs, **client-side encrypted (age/gpg), shipped to third-party object storage (B2/S3) — never WebVPS**; `sustech` dumps landing here are encrypted too (fix #8) | Closes the "VPS-2 aggregates everything in plaintext" hole |
| ERP + ERP2/GrowthOS containers + VPS-Hermes instance | Already resident |

**Data flows:** one channel WebVPS→VPS-2 (HMAC webhooks, fired via `after()`); per-surface tokens back (`PIPELINE_SECRET`, signed confirm tokens, read-only `reporter` key — no generic Payload write key, no Hermes bearer in n8n). No cross-DB connections ever. Prospect data enters Payload only via the three promotion doors, one record at a time; `marketingOptIn` always arrives `false` (a cold-email reply is correspondence, not consent).

### 4.3 Hermes lane split (Q3)

| | **VPS-Hermes** (VPS-2, always-on) | **PC-Hermes** (local, interactive) |
|---|---|---|
| **Owns** | Scheduled server work: post-merge deploys (build to fresh dir → `pm2 reload`), WebVPS fallback crontab, encrypted nightly backups → B2/S3, cert renewals, n8n pin/patch cycle, PM2/systemd config, security patching, disk/RAM/restart monitoring, secret rotation (lock-protected) | File-and-human work: OneDrive/Excel (brief, chatbot KB, catalog), `pnpm sync:brief`, content drafting sessions, prospect-research sessions (Claude web search → verified CSV → **HMAC-signed, schema-validated, deduped import webhook into `growthos`** — fix #12), owner ad-hoc requests |
| **Never** | Edits OneDrive/local files; creative sessions | Installs crontabs; runs `pm2`/`systemctl`/migrations; schedules anything; holds application secrets (SSH keys only) |

**Coordination rules:**
1. **Single lock authority on VPS-2:** `hermes_locks` table in `growthos` — `{job, holder: vps|pc, acquired_at, heartbeat_at, ttl}`. Every mutating job (deploy, crontab edit, migration, restore, bulk import) takes the lock; heartbeat every 5 min; locks with heartbeat > 15 min stale may be broken with a journal entry.
2. **Default ownership beats negotiation:** scheduled → VPS-Hermes; interactive → PC-Hermes. PC-Hermes *requests* deploys rather than running them.
3. **Append-only journal** `/var/log/hermes/journal.ndjson` on VPS-2; both instances read it at session start.
4. **Credential hygiene:** secrets used only on their home box, read in-session, never copied across machines/OneDrive/transcripts/shell history; rotate `PIPELINE_SECRET`/`N8N_WEBHOOK_SECRET`/SSH keys whenever either instance is rebuilt.

---

## 5. Merged roadmap

Website phases 0–7 keep their numbers; GrowthOS phases are **G0–G4** and run in parallel where dependencies allow. **NEW** marks work that did not exist in Doc B v1.0. Website total rises honestly from ~32–40 to **~36–45 dev-days**; GrowthOS adds **~8–12 automation/ops-days** (VPS-2, not the web repo) + owner playbook time.

| Phase | Lane | Deliverables | Effort | Depends on |
|---|---|---|---|---|
| **0 — Prerequisites & sign-offs** | Both | Existing checklist + **NEW:** side-domain purchase (week 1, not week 4 — fix #6c); privacy-policy/cookie-notice drafting commissioned (fix #2); MillionVerifier account; charter §6.6 reworded to the explicit human-sent/side-domain/verified/opt-out rule; B2/S3 bucket + age key | 0.5 dev-day + owner admin | — |
| **G0 — VPS-2 hardening** NEW | GrowthOS | Full fix-#1 list (VPN/IP-allowlist, 2FA, webhook-only nginx, fail2ban, pinned n8n + patch job, OS-user separation); encrypted-backup pipeline (fix #8). **Hard precondition for any outreach/ad credential on VPS-2** | 1–2 ops-days (Hermes) | 0 |
| **G1 — Prospect foundation** NEW | GrowthOS | `growthos` Postgres + `prospects` schema (incl. TTL job, lawful-basis memo — fix #10); NocoDB viewer; ICP one-pager + funnel-math doc; prompt library A–E in use; **list-building research starts (no sending)** | 2–3 days (n8n/Hermes/PC-Hermes) | G0 |
| **1 — Leads & analytics foundation** | Website | Unchanged from Doc B (leads collection, scoring, captureLead, lead-intake, PostHog, UTM) + lead-intake extension: ack every lead + owner ping (row 26) | 5–6 dev-days | 0 |
| **1b — Ingest & suppression routes** NEW | Website | `POST /api/leads/ingest` (HMAC, **consent fields force-stripped server-side** — fix #3) reusing `lib/leads/upsert-lead.ts`; `GET /api/leads/suppression-hashes` (reporter-gated, SHA-256 only — fix #9); `source` select gains `outbound` | 1–1.5 dev-days | 1 |
| **2a — Citation data model** | Website | Unchanged | 3–4 dev-days | parallel w/ 1 |
| **3 — Calculators, blocks & segment pages** | Website | Unchanged | 8–10 dev-days | 1, 2a |
| **2b — Content cadence** | Website | Unchanged, continuous | ~0 dev-days | 2a |
| **G2 — Trigger scan & suppression** NEW | GrowthOS | Weekly trigger-scan workflow (Claude filter/score → prospects); Sunday top-5 email; nightly suppression sync (hash feed + `clients`-domain guard); MillionVerifier gate with ≥2%-bounce auto-halt (fix #6a); side-domain one-pager site + DNS + manual warm-up ramp begins | 3–4 days (n8n) | G1, 1b |
| **G3 — Outbound v1 "one motion"** NEW | GrowthOS | ≤5 deeply personalized Tier-A touches/week, human-sent (email/LinkedIn/provenance-WhatsApp); GBP setup; referral playbook. **First cold send gate (ALL of, fix #4):** Phase 1+1b live · suppression feed live · clients-domain guard wired · side domain warmed ≥4 weeks · DMARC `p=reject` on sustechltd.com (fix #6d) | ongoing; owner ~2–3 h/wk | G2 + gate |
| **4 — Nightly pipeline & approval** | Website | Unchanged | 7–9 dev-days | 2a, ≥10 cited articles |
| **5 — Daily report** | Website | Unchanged + **NEW:** outbound KPIs, ad-spend (when live), VPS disk/RAM/restart lines | 3–4 dev-days (+0.5) | 1, 4 |
| **6 — Auto-publish & cutover** | Website | Unchanged | 1–2 dev-days | 4, 5 |
| **G4 — Ads stack v1** NEW | Both | **Gates: privacy policy + cookie notice published (fix #2) · Phase 3 live · Phase 6 cutover done · owner budget confirmed.** Website: consent banner + consent-gated pixel loader + CSP diff (2–3 dev-days). n8n: CAPI relay (adConsent + fbc/fbp gated), Meta Lead Ads → `/api/leads/ingest` (2–3 days). Campaigns: Google Search (high-intent + negatives) + Meta Lead Ads + simple pixel retargeting **only** — lookalikes/Advantage+/Enhanced Conversions/Clarity cut until CPL proves out at ৳20–40k/mo (fix #12) | ~5–6 days combined | 3, 6, policy |
| **7 — Backlog** | Both | Doc B Phase-7 items + **NEW v2 GrowthOS items:** 14-day cadence machine, GrowthOS review UI, lookalikes (with per-upload consent artifacts — fix #7), Google Enhanced Conversions, versioned prompt library, champion maps, Sales Navigator | scoped per item | 6, G3 results |

---

## 6. Conflict resolutions (decided)

1. **Tracking stack.** PostHog (cookieless, first-party proxy) is canonical and permanent. GA4: skipped entirely. GTM: skipped — events stay typed in `lib/analytics/events.ts`; the "no developer needed" promise is knowingly sacrificed. Ad pixels (Meta, Google, LinkedIn) load **only** in G4, behind a consent banner, with a published privacy policy, via a deliberate CSP diff. Conversions go server-side from n8n (CAPI / later Enhanced Conversions), forwarding **only** events carrying `adConsent=true` and ad attribution. Clarity: not in v1; if the owner later wants heatmaps, consent-gated on ad landing pages only.
2. **WhatsApp.** The system (website + n8n) stays inbound-only + transactional — charter unchanged. Human 1:1 WhatsApp by the owner from the Business app is a sales activity outside any system, allowed only for numbers with recorded provenance (`referral`/`card`/`event` — no provenance, no phone stored). No drip, no automation until WABA + opt-in exist (Phase 7). Scraped numbers banned everywhere, both docs agree.
3. **Prospects vs leads.** Two stores, one consent boundary: `prospects` (non-consented, VPS-2, Fit/Signal/Reach scoring, TTL-purged) vs Payload `leads` (hand-raisers, VPS-1, behavioral scoring, untouched). One-way promotion through three doors (inbound conversion match, human "promote" on reply via `/api/leads/ingest`, Meta Lead Ad); consent fields force-stripped at the door; suppression compares hashes computed **on WebVPS**; opt-outs propagate globally in both directions. The web tier never reads the prospect DB.
4. **Ads budget.** Organic-first stands — the engine compounds with zero ad spend. Ads are a G4 workstream gated on Phases 3+6 and a published privacy policy; the owner sets the figure then (Doc A's ৳50–70k/mo is the reference point, not a commitment). v1 ad surface is deliberately small: Search + Lead Ads + simple retargeting.
5. **Also decided (one-liners):** chat backend stays on WebVPS (fix #11 — rejecting the deployment doc's n8n move; degraded-UX cost exceeds credential-purity gain); `growthos` on self-hosted Postgres, not Supabase cloud; calculator results stay ungated (email-report gate only); email = three lanes (Resend transactional on sustechltd.com / separate side-domain cold tooling / nurture tool decided in Phase 7); cold-email reply ≠ marketing consent, ever.

---

## 7. Immediate infra fixes — Hermes task list (start today, before anything above)

1. **PM2 reboot survival (today):** `pm2 startup systemd` (run emitted command) + `pm2 save` on WebVPS; verify the postgres container has `--restart unless-stopped`. A reboot currently kills the site.
2. **SSL on bare sustechltd.com:** `certbot --nginx -d sustechltd.com -d www.sustechltd.com` + HTTP→HTTPS redirect. Phase-6 cutover cannot land on an HTTP-only vhost. HSTS only after both hosts serve clean HTTPS.
3. **Diagnose the 63 PM2 restarts:** `pm2 describe sustech-web` + logs; likely OOM. `max_memory_restart` with alerting as stopgap; fix the cause.
4. **Add 2–4 GB swap** on WebVPS; move deploys to build-into-fresh-dir + `pm2 reload` off-peak (VPS-Hermes job).
5. **Backups (none exist):** nightly `pg_dump` of `sustech` + `/var/www/sustechltd.com` media, **age/gpg-encrypted client-side, shipped to B2/S3 — never stored plaintext on VPS-2, never on WebVPS** (fix #8). Same for `growthos` once created.
6. **DMARC `p=reject` on sustechltd.com** (fix #6d) — before any cold mail goes out from the side domain, spoofers will probe the main domain.
7. **VPS-2/n8n hardening (G0, fix #1):** VPN/IP-allowlist on the n8n UI, 2FA, webhook-paths-only nginx exposure, fail2ban, pin n8n + monthly patch job, Hermes SSH keys in a separate OS user.
8. **Hygiene:** app runs non-root; `.env.production` mode 600; stale `.next` artifact cleanup in deploy job; disk/RAM/restart counts added to the 08:00 daily report.

---

## 8. New owner inputs (beyond Doc B §5's 15 items)

| # | Input | When | Note |
|---|---|---|---|
| 16 | **Side domain purchase** (e.g. sustech-energy.com) + DNS access | Week 1 | Must be visibly Sustech: real one-page site, honest whois, postal address + opt-out line in every mail (fix #6b) |
| 17 | **Privacy policy + cookie notice sign-off** | Before G4 | Hard gate on ads; copy must cover ad-platform sharing + `adConsent` (fix #2) |
| 18 | **MillionVerifier account** (~৳600 one-time pack) | G2 | Only `valid` results ever sendable |
| 19 | **Meta Business Manager + Google Ads accounts** | G4 | Created/owned by you; credentials live on VPS-2 only |
| 20 | **Ad budget confirmation** | G4 gate | Reference: ৳30–50k Google + ৳20–40k Meta monthly; zero remains valid — organic engine runs regardless |
| 21 | **LinkedIn Sales Navigator decision** | Defer to v2 | Not needed for the one-motion v1; revisit when outbound scales past 5 touches/week |
| 22 | **B2/S3 bucket + encryption key custody** | Week 1–2 | For fix #8 backups; you hold a copy of the age/gpg key offline |
| 23 | **Weekly outbound time commitment** | G3 | Honest budget: ~2–3 h/week for the one-motion v1 (reply handling included); full Doc A program needs 10–15 h/wk and is deferred until this proves out (fix #5) |
| 24 | **Custom-audience consent process sign-off** | Phase 7 only | Per-upload written sign-off + per-contact consent artifact, clients only (fix #7) |

---

**Critique disposition:** fixes #1–#12 all applied (#1→§4.2/G0, #2→§5 G4/§6.1/§8.17, #3→§5 1b/§3 row 21, #4→§5 G3 gate, #5→§1.5/§3 rows 2·8·13·34/§8.23, #6→§3 rows 7·9/§5/§7.6, #7→§3 row 22/§8.24, #8→§4.2/§7.5/§8.22, #9→§4.1/§5 1b, #10→§4.2, #11→§3 row 25/§4.1/§6.5, #12→§3 rows 14·20·22/§4.3/§5 G4). None rejected; one upstream design reversed (chat backend remains on WebVPS, per #11).
---

## 9. Addendum (v1.1, 2026-06-12) — GrowthOS is a real platform; the track maps onto it

**Discovery.** After v1.0 was written, the owner clarified that **GrowthOS is an existing, in-progress
product**: Sustech's AI marketing/branding/sales platform — pnpm monorepo (`apps/api` Express+TS+Drizzle,
`apps/web` React+Vite+Tailwind+shadcn, `packages/db`, `packages/shared`), deployed at
**growth.sustechltd.com** on VPS-2 via GitHub push → webhook → n8n → `/opt/growthos/deploy.sh`. It has its
own governance: `docs/02_schema.sql` is the DB source of truth, build phases live in
`docs/04_BUILD_RUNBOOK.md`, a Cowork agent builds it on the owner's PC, and approval gates already cover
schema migrations, first deploys, **and anything that posts to Facebook/LinkedIn, modifies ads, or spends
money**. The playbook file living in that folder was therefore not a misfile — it is GrowthOS domain spec.

**Verdict upgrade (replaces "beside it" plumbing, keeps every boundary).** The G-track (G0–G4) is not an
ad-hoc collection of n8n workflows + a bare Postgres + NocoDB. **It is GrowthOS's product roadmap.** All
v1.0 security boundaries stand unchanged — WebVPS lean/public, VPS-2 private/credentialed, no cross-DB
links, consent doors. What changes is *where the VPS-2 side lives*:

1. **Prospect registry → GrowthOS DB.** The `prospects` schema (§3 matrix, §4.2) becomes a requirements
   input to `docs/02_schema.sql` — implemented by the Cowork agent through GrowthOS's own migration gate
   (owner approval), not a parallel `growthos` Postgres created by anyone else. The database already exists.
2. **NocoDB viewer: cut.** `apps/web` (Bangla labels, mobile-first) is the prospect/outreach/review UI.
3. **n8n writes through GrowthOS API** (`apps/api`), never raw SQL — same app-routes-only rule both repos
   already enforce. n8n keeps the cron clock (trigger scan, Sunday top-5, suppression sync, TTL purge).
4. **Webhook contracts are now repo-to-repo:** sustech-web fires HMAC lead events → GrowthOS API;
   GrowthOS/n8n calls sustech-web `POST /api/leads/ingest` (promotion door) and
   `GET /api/leads/suppression-hashes`. Contracts in `docs/05_LEAD_ENGINE_INTEGRATION_BRIEF.md` (GrowthOS repo).
5. **G4 ads + social posting are native GrowthOS territory** — its approval gate #3 already governs them.
   Social campaigns (including the 3-day launch pack) execute through GrowthOS once those modules ship.
6. **`hermes_locks` moves out of the product DB** → Hermes-owned store on VPS-2 (file-based lock + the
   existing append-only journal), so server-ops coordination never depends on product-schema approvals.
7. **Agent division hardened:** Claude Code never edits the GrowthOS repo; the GrowthOS Cowork agent never
   edits sustech-web; Hermes never edits either (servers only). Handoff artifact between the two code
   agents = the integration brief; the owner carries approvals both ways.
8. **G-phase estimates (~8–12 ops/dev-days) stand** but are delivered as GrowthOS runbook phases under its
   own acceptance criteria, evidence-in-STATE.md discipline, and phase approvals.

**Net effect:** three engines, two codebases, one owner. sustech-web = Engine 2 (inbound surface);
GrowthOS = Engines 1+3 (+ ads/social when gated on); n8n = the clock; Hermes = the floor they stand on.
