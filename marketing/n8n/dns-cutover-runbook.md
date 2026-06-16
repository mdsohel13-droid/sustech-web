# DNS cutover runbook — shift the site from beta → www.sustechltd.com

**Goal:** make the new Next.js site (VPS `93.127.160.183`, today on `beta.sustechltd.com`)
serve the real domain `www.sustechltd.com` + apex `sustechltd.com`.

**Principle (read first):** this is NOT a domain transfer and NOT a nameserver
change. Keep the registrar **and** DNS at Hostinger. You change **only the two A
records** and add SSL on the VPS. **Never touch `MX` / `TXT` (SPF/DKIM/Resend)** —
that keeps company email alive. Rollback = revert the A records (minutes).

---

## 0. Prerequisites — all must be TRUE before you start
- [ ] Lead pipeline green on beta: form → CMS → n8n `{erp:200,growth:201}` → ERP + GrowthOS. ✅ (proven, trace `trace+1915`)
- [ ] Owner-alert email confirmed arriving (Resend domain verified for sending). ✅
- [ ] Test data purged from CMS/ERP/GrowthOS. ✅
- [ ] 301 redirect rules deployed in the `sustechltd.com` nginx block. ✅ (B1)
- [ ] Owner approved the 3 `(check)` redirect targets + picked the cutover window.

---

## PHASE 1 — Prepare the VPS (NO public impact; do this in advance)

### 1a. nginx server block for the domain
You already have `/etc/nginx/sites-enabled/sustechltd.com` with the 19 redirect
rules. Make sure it has all three of these servers. **Match `proxy_pass` to the
exact upstream port + headers your working `beta` block uses** (don't invent a port).

```nginx
# HTTP → HTTPS (both hosts)
server {
  listen 80; listen [::]:80;
  server_name sustechltd.com www.sustechltd.com;
  return 301 https://www.sustechltd.com$request_uri;
}

# apex HTTPS → www
server {
  listen 443 ssl http2; listen [::]:443 ssl http2;
  server_name sustechltd.com;
  ssl_certificate     /etc/letsencrypt/live/sustechltd.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/sustechltd.com/privkey.pem;
  return 301 https://www.sustechltd.com$request_uri;
}

# www HTTPS → Next app  (+ the 19 old-URL 301s ABOVE location /)
server {
  listen 443 ssl http2; listen [::]:443 ssl http2;
  server_name www.sustechltd.com;
  ssl_certificate     /etc/letsencrypt/live/sustechltd.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/sustechltd.com/privkey.pem;

  # … the 19 redirect rules from marketing/old-site-redirects.md go here …
  location = /single/service/page/8 { return 301 https://www.sustechltd.com/services/solar-renewable; }
  # … etc …

  location / {
    proxy_pass         http://127.0.0.1:APP_PORT;   # SAME as your beta block
    proxy_http_version 1.1;
    proxy_set_header   Host $host;
    proxy_set_header   X-Real-IP $remote_addr;
    proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;   # app reads this for rate-limit/IP
    proxy_set_header   X-Forwarded-Proto $scheme;
    proxy_set_header   Upgrade $http_upgrade;
    proxy_set_header   Connection "upgrade";
  }
}
```
Don't `nginx -t` / reload yet if the cert files don't exist — issue the cert first (1b).

### 1b. Zero-downtime SSL — issue the cert NOW via DNS-01
DNS-01 validates by a TXT record, so it works **before** the A records point to the
VPS → no HTTPS gap at flip time.
```bash
sudo certbot certonly --manual --preferred-challenges dns \
  -d sustechltd.com -d www.sustechltd.com
# certbot prints:  _acme-challenge.sustechltd.com  TXT  <value>
#  → add that TXT in Hostinger DNS → wait ~2 min → press Enter → cert issued.
```
Now `sudo nginx -t && sudo systemctl reload nginx` (cert exists; block is valid).
The VPS now answers HTTPS for the domain even though DNS still points to Hostinger.
Verify with a Host-header probe (no DNS needed):
```bash
curl -s -H "Host: www.sustechltd.com" https://93.127.160.183/ -k -o /dev/null -w "%{http_code}\n"   # 200
```

### 1c. Lower TTL — DO THIS FIRST, NOW
Hostinger hPanel → Domains → DNS → set TTL = **300** on A `@` and A `www`. Save.
**Scheduled flip = TODAY ~01:00 (BD).** There isn't a full 24h, so lower the TTL
*immediately* at the start of Phase 1 — it propagates as far as the current TTL
allows before the flip, which keeps rollback reasonably fast.

---

## PHASE 2 — The flip (low-traffic window, e.g. Friday morning BD)

### 2a. Turn OFF Hostinger CDN/proxy for the domain
`www` currently resolves to `*.cdn.hstgr.net`. In hPanel disable the CDN /
"website" proxy for this domain — otherwise Hostinger keeps serving the OLD site.

### 2b. Change ONLY the A records (hPanel → DNS)
```
A   @     93.127.160.183
A   www   93.127.160.183
```
❗ Leave `MX`, `TXT` (SPF/DKIM/Resend `send`, `resend._domainkey`), and any mail
`CNAME` untouched. Save.

### 2c. Point the app at the production host + enable indexing
On the VPS `.env`:
```bash
SITE_URL=https://www.sustechltd.com
NEXT_PUBLIC_SERVER_URL=https://www.sustechltd.com
SITE_INDEXABLE=true
```
```bash
pnpm build && pm2 restart sustech-web --update-env
```
(Enable HSTS only AFTER step 3 confirms clean HTTPS on both hosts.)

### 2d. Keep beta out of the index (same VPS → avoid duplicate content)
In the `beta.sustechltd.com` server block add:
```nginx
add_header X-Robots-Tag "noindex, nofollow" always;
```
(or 301 beta → www). `nginx -t && reload`.

---

## PHASE 3 — Verify the PUBLIC host (after propagation, ~minutes at TTL 300)
```bash
dig +short www.sustechltd.com                         # → 93.127.160.183
curl -I https://www.sustechltd.com/                    # 200, valid cert, NO laravel_session cookie
curl -s https://www.sustechltd.com/robots.txt          # GPTBot/ClaudeBot/Googlebot + Sitemap + Host
curl -s https://www.sustechltd.com/sitemap.xml | head  # real XML, not a 404 page
curl -sI https://www.sustechltd.com/single/service/page/8 | grep -i location
                                                       # → /services/solar-renewable (301)
curl -I https://sustechltd.com/                        # apex 301 → https://www.sustechltd.com/
```
- [ ] New site loads, fast, correct branding.
- [ ] A couple of old URLs 301 to the right new pages.
- [ ] **Send + receive a test email** on the domain → company mail still works.
- [ ] Submit a test RFQ on the LIVE www → lead reaches CMS + ERP + GrowthOS + owner email.

---

## PHASE 4 — Post-cutover
1. GSC + Bing → submit `https://www.sustechltd.com/sitemap.xml`. Fire IndexNow.
2. (Optional, recommended) Add a GSC **Domain property** via DNS TXT to track the
   whole domain through the migration.
3. Watch first 48h: GSC Coverage, no 404 spikes, n8n execution errors, real leads
   landing in ERP + inbox.
4. Once stable + HTTPS clean on both hosts → enable **HSTS**.
5. Keep `AUTO_PUBLISH_ENABLED=false` until ≥2 weeks of shadow logs reviewed.

---

## ROLLBACK (if anything breaks)
- Hostinger DNS → revert A `@` and `www` to the **old Hostinger IP**, re-enable the
  CDN if you disabled it. TTL=300 → old site live again in minutes. Nothing is lost
  (the VPS app + DB are untouched; you only changed where the name points).

---

## REFERENCE
```
VPS              : 93.127.160.183
Registrar + DNS  : stay at Hostinger (change A records ONLY)
Do NOT           : transfer domain, change nameservers, touch MX/TXT
App env (cutover): SITE_INDEXABLE=true, SITE_URL/NEXT_PUBLIC_SERVER_URL=https://www.sustechltd.com
Redirect map     : marketing/old-site-redirects.md  (slugs verified vs live sitemap)
Lead pipeline    : β CMS → n8n /webhook/lead-to-erp → ERP :3010 /api/leads/from-web + GrowthOS
```
