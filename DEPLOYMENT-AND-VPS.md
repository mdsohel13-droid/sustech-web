# DEPLOYMENT-AND-VPS.md — Sustech Website

How to host the new site, what VPS to buy, how to launch on a **beta subdomain** without touching the live site, and how to cut over to the apex domain later.

## 1. Topology (security-first, per the master plan)

Two trust zones, kept separate:

```
NEW VPS  (public web tier)            EXISTING VPS  (private ops tier — upgraded)
─────────────────────────            ────────────────────────────────────────────
Next.js site (new)                   Hermes (VPS) — holds ERP connectivity
Payload CMS + its Postgres           n8n
Caddy (auto-TLS)                     (Local Hermes connects in over Telegram/API)
        ▲                                     │
        └──────── private network ────────────┘
        Hermes pushes approved content into the CMS over WireGuard/Tailscale.
        The public site holds NO ERP credentials.
```

The public website is the most exposed surface; Hermes (with ERP keys) is the most privileged. Keeping them on separate boxes means a web breach can't reach the ERP. Since Hermes mediates all ERP content, the site needs no live ERP/Hermes access at runtime — so separation costs nothing.

> Alternative: host the Next.js front end on **Vercel** instead of the new VPS, and run only CMS+Postgres on the new VPS. Both are fine; the self-hosted VPS gives you full control and data residency, which suits a beta you'll iterate on heavily.

## 2. New VPS specification

For the new box running **Next.js + Payload CMS + Postgres + Caddy** (beta and early production):

| Tier | Spec | Example | Use |
|---|---|---|---|
| **Recommended** | **4 vCPU / 8 GB RAM / 160 GB NVMe** | Hetzner **CPX31** (~€16/mo), DO Premium AMD 4/8, Vultr/Linode equiv. | Comfortable for site + CMS + DB + builds. Best starting point. |
| Lean (tight) | 2–3 vCPU / 4 GB / 80 GB | Hetzner CPX21 | Works for a quiet beta, but `next build` + CMS + Postgres together can be tight on 4 GB. |
| Headroom | 8 vCPU / 16 GB / 240 GB | Hetzner CPX41 / CCX line | If you later add traffic, more CMS media, or want fast builds. |

**Pick the recommended 4 vCPU / 8 GB** for the beta. Add swap (2–4 GB) as a safety net for build spikes.

**Existing VPS:** if it currently struggles, upgrade it to ~**4 vCPU / 16 GB** so Hermes + n8n run comfortably alongside content jobs. Keep it on the private network, locked down.

**OS:** Ubuntu 24.04 LTS on both.

## 3. Stack on the new VPS (Docker Compose)

Containers: `web` (Next.js standalone), `cms` (Payload), `db` (Postgres), `proxy` (Caddy). Postgres **not** exposed publicly — bound to the internal Docker network only.

```yaml
# docker-compose.yml (sketch)
services:
  proxy:
    image: caddy:2
    ports: ["80:80", "443:443"]
    volumes: ["./Caddyfile:/etc/caddy/Caddyfile", "caddy_data:/data"]
  web:
    build: ./web            # Next.js output: "standalone"
    env_file: ./web/.env
    expose: ["3000"]
  cms:
    build: ./cms
    env_file: ./cms/.env
    expose: ["3001"]
    depends_on: [db]
  db:
    image: postgres:16
    environment: { POSTGRES_PASSWORD_FILE: /run/secrets/db_pw }
    volumes: ["pgdata:/var/lib/postgresql/data"]
    # no "ports:" — internal only
volumes: { caddy_data: {}, pgdata: {} }
```

```
# Caddyfile (beta)
beta.sustechltd.com {
    redir /admin* http://cms:3001{uri}
    reverse_proxy /admin* cms:3001
    reverse_proxy web:3000
    encode zstd gzip
}
```

Set Next.js `output: "standalone"` in `next.config.ts` for a small container.

## 4. Beta launch on a subdomain (live site untouched)

1. **Choose** `beta.sustechltd.com` (or `staging.`/`new.`).
2. **DNS:** add an **A record** `beta` → new VPS IP. Leave apex `@`, `www`, `erp` exactly as they are — the live Laravel site keeps serving uninterrupted.
3. **TLS:** Caddy auto-issues a Let's Encrypt cert for `beta.sustechltd.com` on first request.
4. **Keep beta invisible to search & AI:**
   - `SITE_INDEXABLE=false` → `app/robots.ts` returns `Disallow: /`, every page renders `<meta name="robots" content="noindex,nofollow">`, and send header `X-Robots-Tag: noindex`.
   - Optional during early build: HTTP Basic Auth in Caddy so only your team sees it.
   - This prevents duplicate-content confusion with the live site and stops AI engines citing an unfinished beta.
5. **Iterate** here with real content via Hermes→CMS. Run `pnpm verify` + Lighthouse on every change.

## 5. Production cutover to the apex domain (when finalised)

Do this as a deliberate, reversible event.

**Pre-flight (day before):**
- Lower DNS TTL on `@`/`www` to 300s for fast propagation.
- Full `pnpm verify` green; Lighthouse budgets met; content reviewed; DB + media backed up.
- Build the **301 redirect map**: old Laravel URLs → new equivalents, e.g.
  `/service/page → /services`, `/single/service/page/1 → /services/grounding-lightning-protection`, `/all/products → /capabilities`, `/about/page → /about`, `/contact/page → /contact`. Implement via `next.config.ts` `redirects()` or middleware.

**Cutover:**
1. Point apex `@` and `www` A-records to the new VPS IP (or to Vercel if hosting the front end there).
2. Update Caddy to serve `sustechltd.com` + `www.sustechltd.com` (auto-TLS); 301 `www → apex` (or your canonical choice).
3. Flip `SITE_INDEXABLE=true` → remove noindex, allow crawlers.
4. Update **all canonical URLs, `sitemap.xml`, `llms.txt`, and JSON-LD URLs** from the beta host to the apex.
5. 301 `beta.sustechltd.com → https://sustechltd.com` to retire the beta cleanly.

**Post-cutover (48–72h watch):**
- Submit new `sitemap.xml` to Google Search Console + Bing Webmaster; request re-crawl. Confirm AI crawlers (GPTBot/ClaudeBot/PerplexityBot) are allowed and hitting the site (check server logs).
- Monitor: redirect coverage (no orphan 404s), Core Web Vitals, RFQ/contact delivery, chat widget.
- Keep the **old Laravel site parked** (e.g., on a `legacy.` subdomain or snapshot) for instant rollback.

**Rollback:** if anything breaks, point `@`/`www` DNS back to the old site — low TTL makes this minutes, not hours.

## 6. Security hardening (both VPS)

- **SSH:** key-only, password auth disabled, non-root sudo user, `fail2ban`. Restrict SSH to your IP if static.
- **Firewall (ufw):** allow 443/80 + SSH only; deny the rest. Postgres/CMS never exposed publicly.
- **Updates:** `unattended-upgrades` for security patches.
- **Secrets:** Docker secrets or env files `chmod 600`; or a vault (Infisical). The new VPS holds **no ERP credentials**.
- **Private link:** WireGuard/Tailscale between new VPS and Hermes VPS; the CMS content-push endpoint is reachable only over that private network (or authenticated + IP-allowlisted).
- **TLS + headers:** Caddy auto-HTTPS; HSTS; security headers from `next.config`.
- **Backups:** nightly Postgres dump + CMS media → Backblaze B2 / Hetzner Storage Box, 30-day retention; **test a restore monthly** (Hermes can run + report via Telegram).
- **Monitoring:** Uptime Kuma (or similar); Hermes watches and alerts on downtime/cert expiry/disk.
- **Chat endpoint:** rate-limited, prompt-injection-hardened, no secret leakage.

## 7. Who deploys what

- **Claude Code:** builds the app, Dockerfiles, Caddyfile, compose, `redirects()`, robots/sitemap/llms.txt logic.
- **Local Hermes:** can run the heavy first build/migrations, then hand artifacts to the VPS.
- **VPS Hermes:** owns ongoing deploys, the content pipeline, backups, monitoring, and the approval-gated publish — all reporting to you over Telegram.
- **You:** approve the cutover and the production indexing flip.
