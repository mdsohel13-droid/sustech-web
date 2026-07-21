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
3. Set `SITE_INDEXABLE=true` in the production env **and rebuild/redeploy** — the `noindex` (robots.txt, per-page `<meta robots>`, and the `X-Robots-Tag` header) is **baked at build time** for the statically-prerendered pages, so a runtime-only flip is not enough. After the rebuild: `robots.txt` returns `Allow: /` (welcoming GPTBot/ClaudeBot/PerplexityBot/Google-Extended/Bingbot/Googlebot, disallowing `/admin` `/api` `/preview`), no `X-Robots-Tag`, and pages carry no `noindex` meta. (Verified locally both ways.)
4. Set `NEXT_PUBLIC_SERVER_URL` (and `SITE_URL`) to the apex and rebuild so **all canonical URLs, `sitemap.xml`, `llms.txt`, and JSON-LD URLs** point at the apex rather than the beta host.
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

## 8. Database schema changes (the permanent rule — no more "vanished" data)

Production runs with `push` OFF (`payload.config.ts`). Schema is changed only by
**committed SQL migrations**, applied **before** the build. This is what prevents
the "Site Settings / Knowledge looks empty" failure: that happens when the code
SELECTs a column the database doesn't have yet, so Postgres errors and Payload
returns nothing — the rows are never deleted, just unreadable until the column
exists.

> **Never hand-write schema SQL to "catch up" a database — it always misses
> pieces.** Adding ONE collection (e.g. `awards`) changes the DB in several
> places at once:
> 1. its own table (`awards`);
> 2. a foreign-key column in the shared system join tables
>    `payload_locked_documents_rels` and `payload_preferences_rels`
>    (`awards_id`) — the admin reads these on every dashboard load, so a
>    missing column here 500s the whole admin;
> 3. enum types, indexes, sequences.
>
> A hand-written `ALTER TABLE` only ever covers what you remembered. Only
> Payload's own generator (`pnpm migrate:create`) — or a full `push` in dev —
> captures **all** of it. So: change schema in dev, `pnpm migrate:create`,
> review, commit, and `pnpm migrate` on deploy. `db:sync` is a *detector*
> (it surfaces a missing column by failing), not a substitute for migrations.

**Every deploy** (use the script — it runs migrate before build):

```bash
./scripts/deploy.sh main       # default branch is main
```

### Continuous deployment (GitHub Actions)

`.github/workflows/deploy.yml` runs the above script automatically on every push
to `main` (a merged, CI-green PR). Manual runs: Actions tab → "Deploy (production)"
→ Run workflow. It only needs SSH access — the app's runtime secrets stay in the
VPS `.env`, never in GitHub. One-time setup — add these repo secrets
(Settings → Secrets and variables → Actions):

| Secret | Value |
|--------|-------|
| `DEPLOY_HOST` | VPS IP / hostname |
| `DEPLOY_USER` | ssh user that owns the app |
| `DEPLOY_PORT` | ssh port (usually 22) |
| `DEPLOY_PATH` | repo path on the VPS |
| `DEPLOY_SSH_KEY` | private key of a **dedicated deploy keypair** (public key in the VPS user's `~/.ssh/authorized_keys`) |

Until the secrets exist the workflow no-ops (it doesn't fail). Generate a
dedicated key — never reuse a personal key: `ssh-keygen -t ed25519 -C sustech-deploy -f deploy_key -N ""`.

**When you change a collection/global/field**, ship a migration in the same change:

```bash
pnpm migrate:create   # writes ./migrations/<ts>_*.ts  — REVIEW it is additive
pnpm migrate:status   # shows applied / pending
# commit the migration file alongside the code change
```

### 8a. One-time recovery / adopting migrations on the current beta DB

The beta database was created by `push` and has accumulated additive schema gaps
(new columns/tables from recent features). Heal it once, then it's in lock-step:

```bash
cd /path/to/sustech-web
# 1) BACKUP FIRST (always)
docker exec -t sustech-pg pg_dump -U <user> <db> > ~/sustech_$(date +%F_%H%M).sql
# 2) Make the now-required contact email non-null so the sync can't trip on it
docker exec -i sustech-pg psql -U <user> -d <db> \
  -c "UPDATE site_settings SET email='info@sustechltd.com' WHERE email IS NULL OR email='';"
# 3) Pull the code + install
git fetch origin && git reset --hard origin/feat/ui-improvements
pnpm install --frozen-lockfile
# 4) Apply the ADDITIVE schema (safe; only adds, never drops) BEFORE building
PAYLOAD_DB_PUSH=true pnpm db:sync
# 5) Build + restart (push stays OFF here — back to the safe default)
pnpm build
pm2 restart sustech-web --update-env
```

Everything reappears immediately (same rows). From here on, use
`./scripts/deploy.sh` and ship a migration with every schema change.
