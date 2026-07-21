# Cutover handoff — who does what

Legend: **🔧 HERMES** = execute on VPS/n8n/DNS/Resend. **👤 OWNER** = know / check / decide / sign-off.

Status today: code is on `main`, e2e green; the new Next.js site runs on **beta** (VPS 93.127.160.183); leads flow β-CMS → n8n → ERP + GrowthOS. `www`/apex still = OLD Laravel site (intentional, until cutover).

---

## Phase A — Finish the trial validation (NOW)

### 🔧 HERMES
- [ ] **Unset** `LEADENGINE_EVENTS_URL` in beta `.env` → restart. (n8n now owns GrowthOS; otherwise GrowthOS gets the lead twice — a hash-event from the site + the full lead from n8n.)
- [ ] **Set `SITE_INDEXABLE=false`** in beta `.env` → rebuild + restart. **Important:** it's currently `true`, so the trial beta is being exposed to Google. Keep it false until the real DNS cutover day.
- [ ] Resend dashboard → **verify the `sustechltd.com` domain** (DNS TXT/DKIM). Needed for the owner-email hop.
- [ ] Submit a **test RFQ** on beta `/request-quote`, then report the 5-hop result below.

### 👤 OWNER (check / know)
- [ ] Confirm the test lead actually shows up in **β admin → Leads** (the business proof the site captures leads).
- [ ] Confirm n8n execution output reads **`{ok:true, erp:200, growth:200}`** (Hermes pastes it).
- [ ] Decide: is the beta trial "enough" to cut over? (how many days / real leads you want first).

---

## Phase B — Pre-cutover prep (before flipping DNS)

### 🔧 HERMES
- [ ] Apply the **301 redirect map** on the VPS nginx (`marketing/old-site-redirects.md`) — verify the new service **slugs** match the live CMS first.
- [ ] Pull the **full old-site URL list** (old DB / server logs / old sitemap) and send to dev to extend the redirect map beyond the homepage links.
- [ ] Register **ownership** of `www.sustechltd.com` in Google Search Console + Bing now (so it's ready on switch day). Don't submit the sitemap yet.
- [ ] Lower DNS **TTL** on apex + www to ~300s a day before, so rollback is fast.

### 👤 OWNER (decide)
- [ ] Approve the redirect targets in `old-site-redirects.md` (esp. the 3 marked `(check)` — sourcing / PLC automation / panel-board).
- [ ] Decide the cutover **date/time** (low-traffic window) and that the old site can be retired.
- [ ] Confirm nothing critical on the old Laravel site (forms, logins, data) is lost — migrate first if so.

---

## Phase C — The cutover (switch www → new site)

### 🔧 HERMES
- [ ] Repoint DNS: `sustechltd.com` + `www.sustechltd.com` **A → 93.127.160.183** (turn off Hostinger CDN proxy for these).
- [ ] On the VPS: `certbot --nginx -d sustechltd.com -d www.sustechltd.com`; apex → www 301.
- [ ] Set `NEXT_PUBLIC_SERVER_URL` + `SITE_URL = https://www.sustechltd.com`, **`SITE_INDEXABLE=true`** → rebuild + restart. Enable HSTS once both hosts serve clean HTTPS.
- [ ] Verify the **public** host (not the VPS origin): `curl https://www.sustechltd.com/robots.txt` (bots + Sitemap + Host), `/sitemap.xml` (XML), homepage has no `laravel_session`.
- [ ] GSC + Bing: **submit `sitemap.xml`** + IndexNow ping (now it's the new site).

### 👤 OWNER (check / sign-off)
- [ ] Open `https://www.sustechltd.com` in a browser → it's the NEW site, loads fast, looks right.
- [ ] Spot-check a couple of OLD URLs (e.g. `/single/service/page/8`) → they 301 to the right new page.
- [ ] Final go/no-go before HSTS (HSTS is hard to undo).

---

## Phase D — Post-cutover monitoring (first week)

### 🔧 HERMES
- [ ] Wire the remaining **content** n8n workflows (04:00 source-watch, hourly sweep, 08:00 daily report) + the Resend `delivered` webhook.
- [ ] Watch n8n execution error rate; GSC "Pages" coverage; no 404 spikes.

### 👤 OWNER (know)
- [ ] Daily owner report arrives 08:00 Dhaka.
- [ ] Real leads flowing to ERP + your inbox.
- [ ] **Keep `AUTO_PUBLISH_ENABLED=false`** until ≥2 weeks of shadow-mode logs are reviewed — then you decide to enable auto-content.

---

## Parked (not blocking — owner's call later)
- 👤 stale PRs **#41** (blocks refactor), **#38** (Redis rate-limit): now that `main` is green, a rebase clears them — say the word and dev rebases/merges or closes. (CI-monitor keeps pinging until then.)
