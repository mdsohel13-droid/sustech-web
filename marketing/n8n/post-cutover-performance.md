# Post-cutover performance — final step (make the live site fast)

The cutover is DONE: `www.sustechltd.com` serves the new Next.js site from the VPS
(`93.127.160.183`, Frankfurt). Measured "slow" cause = **origin is far from
Bangladesh users + no CDN + HTTP/1.1**. The app itself is fine (ISR cache HIT,
gzip, immutable static caching). Fix = put a CDN in front + enable HTTP/2.

---

## PART 1 — VPS quick wins (do now, cheap)

### 1a. Enable HTTP/2 (currently serving HTTP/1.1)
In each `:443` server block:
```nginx
listen 443 ssl;
http2 on;            # nginx ≥ 1.25.1
# (older nginx: use  listen 443 ssl http2;  instead)
```
```bash
sudo nginx -t && sudo systemctl reload nginx
curl -sI --http2 https://www.sustechltd.com/ | head -1     # expect: HTTP/2 200
```

### 1b. HSTS sanity — preload is a one-way door
Header is currently `max-age=63072000; includeSubDomains; preload`.
`includeSubDomains` + `preload` force **every** subdomain (beta, mail, etc.) to be
HTTPS forever and bake it into browsers. Confirm EVERY subdomain is HTTPS. If not
sure, drop `preload` for now (keep `max-age`); re-add it once everything is HTTPS.

### 1c. (optional) Brotli
Add the nginx brotli module → smaller payloads than gzip. Minor vs the CDN win.

---

## PART 2 — Cloudflare (free) — the real fix ⭐

Puts an edge cache near Bangladesh users, adds HTTP/2 + HTTP/3 + Brotli, terminates
TLS close to users. Directly cancels the Frankfurt distance for cacheable content.

> ⚠️ Moving nameservers means Cloudflare becomes authoritative for DNS. **Every
> record must exist in Cloudflare — especially `MX` and `TXT` (SPF, DKIM, Resend
> `send` + `resend._domainkey`).** Get these wrong and **email breaks.** Verify
> carefully (step 4).

1. cloudflare.com → add site `sustechltd.com` → **Free** plan. Cloudflare scans and
   imports existing DNS.
2. **Review the imported records against Hostinger** — make sure ALL of these are
   present and identical:
     - `A  @`  and `A  www`  → set to **93.127.160.183**, **Proxy: ON (orange cloud)**
     - `MX` records (company email) → **DNS only (grey cloud)**, exact priority/target
     - `TXT` SPF (`v=spf1 …`) , Resend `send` SPF/MX, `resend._domainkey` DKIM → copy EXACT
     - any mail `CNAME` (autodiscover/webmail) → DNS only
     - `beta` → 93.127.160.183 (Proxy ON or DNS-only; keep it noindex either way)
3. **SSL/TLS → mode = Full (strict)** (the VPS has a valid Let's Encrypt cert — do
   NOT use Flexible, it causes redirect loops). Turn on **Always Use HTTPS**,
   **HTTP/2**, **HTTP/3 (QUIC)**, **Brotli**.
4. Registrar = Hostinger → change the domain's **nameservers** to the two Cloudflare
   NS shown. Wait for Cloudflare to mark the site **Active** (minutes–hours).
5. Cache: Next sends `s-maxage=3600` (HTML) and `immutable` (static) → Cloudflare
   caches both automatically. No page rule needed. (Optional: a cache rule for
   `/_next/static/*` = Cache Everything, Edge TTL 1y.)

---

## PART 3 — Verify (after Cloudflare is Active)
```bash
dig +short NS sustechltd.com                 # → *.ns.cloudflare.com
curl -sI https://www.sustechltd.com/ | grep -iE "server|cf-ray|cf-cache-status|content-encoding"
                                             # server: cloudflare ; cf-cache-status: HIT (on 2nd hit) ; br
curl -sI --http2 https://www.sustechltd.com/ | head -1     # HTTP/2 200
curl -so /dev/null -w "TTFB %{time_starttransfer}s total %{time_total}s\n" https://www.sustechltd.com/
                                             # should drop a lot for BD users vs Frankfurt-direct
```
- [ ] Site loads via Cloudflare (`cf-ray`, `server: cloudflare`), HTTP/2/3, Brotli.
- [ ] **Email still sends AND receives** on the domain (the MX/TXT test) — most important.
- [ ] Lead form still works end-to-end (CMS + ERP + GrowthOS + owner email).
- [ ] Old-URL 301s + sitemap.xml + robots.txt all correct through the proxy.

---

## PART 4 — (optional, longer-term)
If most traffic is Bangladesh and you want even lower origin latency, host the VPS
closer (Singapore / Mumbai) at next renewal. With Cloudflare in front this is a
minor gain for cacheable pages, but helps dynamic (RFQ submit, /admin).

---

## ROLLBACK
- Cloudflare problems → revert nameservers at Hostinger to the previous ones (DNS
  back under Hostinger). The VPS keeps serving directly via the A records.
- Keep the Hostinger DNS zone export saved before switching NS, so MX/TXT can be
  restored exactly if needed.
