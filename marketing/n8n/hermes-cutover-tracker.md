# Hermes cutover tracker

Tick each box as you go. Status: ⬜ TODO · 🔄 DOING · ✅ DONE · ⛔ BLOCKED.
Fill the `→ result:` line so progress is auditable. Update the summary as you finish a phase.

**Progress:** A ▢/4 · B ▢/4 · C ▢/5 · D ▢/3
**Context:** new site = VPS 93.127.160.183 (live as beta). www/apex = OLD Laravel (until cutover). Leads: β-CMS → n8n → ERP + GrowthOS.

---

## Phase A — finish trial validation (NOW)

- [ ] **A1** beta `.env`: `LEADENGINE_EVENTS_URL=` (empty) + `SITE_INDEXABLE=false` → `pnpm build && pm2 restart sustech-web --update-env`
      → result: ______ (status: ⬜)
- [ ] **A2** Resend dashboard → verify domain `sustechltd.com` (TXT/DKIM)
      → result: ______ (status: ⬜)
- [ ] **A3** submit ONE test RFQ on https://beta.sustechltd.com/request-quote
      → result: ______ (status: ⬜)
- [ ] **A4** report the 5 hops:
      - hop1 β /admin → Leads (scored, source=rfq): ______
      - hop2 n8n execution `{"ok":true,"erp":200,"growth":200}`: ______
      - hop3 ERP customers (new row): ______
      - hop4 GrowthOS leads (one entry): ______
      - hop5 owner inbox email (if Resend verified): ______

**Gate to Phase B:** hops 1–4 green. ☐ owner signed off trial is enough → date set: ______

---

## Phase B — pre-cutover prep (before DNS flip)

- [ ] **B1** apply 301 redirect map (`marketing/old-site-redirects.md`) on VPS nginx, ABOVE `location /`; verify new service slugs vs live CMS
      → result: ______ (status: ⬜)
- [ ] **B2** export FULL old-site URL list (old DB / server logs / sitemap) → send to dev to extend the map
      → result: ______ (status: ⬜)
- [ ] **B3** GSC + Bing: register ownership of `www.sustechltd.com` (do NOT submit sitemap yet)
      → result: ______ (status: ⬜)
- [ ] **B4** one day before cutover: lower DNS TTL on apex + www to ~300s
      → result: ______ (status: ⬜)

**Gate to Phase C:** ☐ owner approved redirect targets · ☐ cutover date/time fixed: ______

---

## Phase C — the cutover (on the agreed date)

- [ ] **C1** DNS: `sustechltd.com` + `www.sustechltd.com` A → 93.127.160.183 (turn OFF Hostinger CDN/proxy)
      → result: ______ (status: ⬜)
- [ ] **C2** VPS: `certbot --nginx -d sustechltd.com -d www.sustechltd.com`; apex → www 301
      → result: ______ (status: ⬜)
- [ ] **C3** `.env`: `NEXT_PUBLIC_SERVER_URL` + `SITE_URL = https://www.sustechltd.com`, `SITE_INDEXABLE=true` → build + `pm2 restart --update-env` (HSTS only after both HTTPS clean)
      → result: ______ (status: ⬜)
- [ ] **C4** verify PUBLIC host (not VPS origin): no `laravel_session`; robots.txt has bots+Sitemap+Host; sitemap.xml = real XML; `/single/service/page/8` → 301 `/services/solar-renewable`
      → result: ______ (status: ⬜)
- [ ] **C5** GSC + Bing: submit `sitemap.xml`; fire IndexNow
      → result: ______ (status: ⬜)

**Gate:** ☐ owner browser-checked new www + go/no-go before HSTS

---

## Phase D — post-cutover (first week)

- [ ] **D1** wire content n8n workflows: 04:00 source-watch, hourly sweep, 08:00 daily report + Resend `delivered` webhook
      → result: ______ (status: ⬜)
- [ ] **D2** watch: n8n error rate, GSC Pages coverage, no 404 spikes
      → result: ______ (status: ⬜)
- [ ] **D3** KEEP `AUTO_PUBLISH_ENABLED=false` until ≥2 weeks shadow logs reviewed (owner enables later)
      → result: ______ (status: ⬜)

---

## Reference
```
VPS            : 93.127.160.183
n8n webhook    : https://n8n.sustechltd.com/webhook/lead-to-erp
ERP ingest     : http://127.0.0.1:3010/api/leads/from-web  (Bearer ERP_WEB_INGEST_KEY)
GrowthOS leads : https://growth.sustechltd.com/api/v1/public/leads
n8n fan-out    : marketing/n8n/lead-fanout.code.js
redirect map   : marketing/old-site-redirects.md
NODE_FUNCTION_ALLOW_BUILTIN = crypto,http,https
```
