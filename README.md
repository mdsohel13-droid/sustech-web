# Sustech Technology Ltd — Corporate Website

> **Next.js 16 · Payload CMS 3 · PostgreSQL · Tailwind CSS v4**
>
> Premium corporate website for a Bangladesh-based EPC engineering firm. Built for two audiences simultaneously: human buyers (premium, trust-building, fast) and AI engines (server-rendered, semantic, citable via GEO/AEO).

---

## Quick links

| Resource | Path / URL |
|---|---|
| 📖 Admin & Super Admin Manual | [`ADMIN-MANUAL.md`](ADMIN-MANUAL.md) |
| 🤖 Hermes AI Agent Setup | [`HERMES-AGENT-SETUP.md`](HERMES-AGENT-SETUP.md) |
| 🎨 Design System | [`DESIGN-SYSTEM.md`](DESIGN-SYSTEM.md) |
| 🏗 Information Architecture | [`INFORMATION-ARCHITECTURE.md`](INFORMATION-ARCHITECTURE.md) |
| 🚀 Deployment & VPS | [`DEPLOYMENT-AND-VPS.md`](DEPLOYMENT-AND-VPS.md) |
| ⚙️ CMS & Dynamic Content | [`CMS-AND-DYNAMIC-CONTENT.md`](CMS-AND-DYNAMIC-CONTENT.md) |
| 🛠 Local Dev Setup | [`SETUP.md`](SETUP.md) |
| 📋 AI Agent Instructions | [`CLAUDE.md`](CLAUDE.md) |

---

## What this project is

The Sustech website is a **fully CMS-driven, AI-citable engineering firm website**.

- **No hardcoded content.** Every page, menu, project, service, article, calculator, and piece of media is managed from the CMS admin panel at `/admin`. Adding a page, enabling a calculator, or changing a phone number never requires a code change.
- **Two readers at once.** The HTML is server-rendered and semantic so both search engines / AI crawlers (no JS required) and human visitors see the same high-quality content.
- **GEO/AEO ready.** Schema.org JSON-LD on every page, a dynamic `/llms.txt`, hourly sitemap, AI bot allowlist in `robots.txt`, and daily AI-generated content via the Hermes agent.

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS v4 + design tokens |
| Components | shadcn/ui primitives + custom sections |
| Motion | Motion (framer-motion) — restrained |
| CMS | Payload CMS 3.x (self-hosted, Postgres) |
| Database | PostgreSQL (port 55432 locally, 5432 on VPS) |
| Hosting | Virtarix VPS — Node.js + PM2 |
| Testing | Vitest (unit) + Playwright (e2e) |
| Lint / format | ESLint 9 (flat config) + Prettier + tailwindcss plugin |
| CI | GitHub Actions |

---

## Local development

### Prerequisites

- Node.js ≥ 20 (project targets Node 24)
- pnpm ≥ 9
- Docker Desktop (for PostgreSQL) **OR** a local Postgres instance on port 55432
- Git

### 1 — Clone and install

```bash
git clone <repo-url>
cd sustech-web
pnpm install
```

### 2 — Environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in:

```
DATABASE_URI=postgresql://postgres:postgres@localhost:55432/sustech
PAYLOAD_SECRET=<generate: openssl rand -hex 32>
NEXT_PUBLIC_SERVER_URL=http://localhost:4123
```

> ⚠️ Port **4123** is used because Windows WinNAT blocks port 3000 on this machine.
> On a standard Linux VPS, port 3000 is fine.

### 3 — Start Postgres

```bash
# Using Docker:
docker run -d --name sustech-pg -p 55432:5432 -e POSTGRES_PASSWORD=postgres postgres:16
```

Or configure `DATABASE_URI` to point to your local Postgres.

### 4 — Start the dev server

```bash
pnpm dev
```

Open [http://localhost:4123](http://localhost:4123) and [http://localhost:4123/admin](http://localhost:4123/admin).

The first visit to `/admin` prompts you to create the first Super Admin user.

### 5 — Regenerate CMS types (after schema changes)

```bash
pnpm generate:types
```

This runs `node --import jiti/register cms/scripts/gen-types.ts` (the Payload CLI is broken on Node 24).

---

## Project structure

```
/app
  /(site)          → public marketing pages (App Router)
    /knowledge     → Knowledge Hub: articles, calculators, downloads
    /news          → Daily news feed (Hermes AI agent)
    /projects      → EPC project case studies
    /services      → Service pages
    /solutions     → Sector/industry pages
    /request-quote → RFQ / consultation form
  /api
    /hermes        → Hermes AI content agent endpoints
    /chat          → Chat proxy (rate-limited)
    /rfq           → RFQ form handler
  /llms.txt        → Dynamic llms.txt route (GEO/AEO)
  layout.tsx       → Root layout (fonts, chat widget, analytics)
  sitemap.ts       → Dynamic sitemap (ISR, hourly)
  robots.ts        → robots.txt (AI bots allowed)

/cms
  /collections     → Payload collection schemas
  /globals         → SiteSettings, Navigation globals
  /fields          → Reusable field definitions (slug, seo, etc.)
  /hooks           → afterChange, beforeChange hooks
  /access          → Role-based access control

/components
  /calculators     → Interactive engineering calculators (client components)
  /layout          → Header, Footer, EngagementWidgets
  /sections        → Page section blocks (Hero, ServicesGrid, etc.)
  /seo             → JsonLd wrapper
  /ui              → shadcn/ui primitives + brand components

/lib
  /payload.ts      → CMS data-fetching functions
  /seo.ts          → serverUrl, metadata helpers
  /block-styles.ts → Dynamic block style resolver

/public
  /fonts           → Self-hosted Cabinet Grotesk + Switzer (woff2)
  /llms.txt        → (not used — dynamic route takes precedence)

/tests             → Vitest unit + Playwright e2e

ADMIN-MANUAL.md    → Non-technical CMS user guide
HERMES-AGENT-SETUP.md → AI content agent setup
DESIGN-SYSTEM.md   → Tokens, typography, colour system
```

---

## Quality gates

A task is **done** only when ALL of these pass:

```bash
pnpm typecheck   # tsc --noEmit → 0 errors
pnpm lint        # eslint → 0 errors, 0 warnings
pnpm format:check# prettier → no diffs
pnpm test        # vitest + playwright → all green (see known failures below)
pnpm build       # next build → success
pnpm lighthouse  # perf ≥ 90 mobile, a11y ≥ 95, SEO ≥ 95
```

### Known pre-existing test failures

These failures exist before any current work and are **not regressions**:

| Test | Reason |
|---|---|
| `chat.spec.ts` (2 tests) | No AI API key in CI |
| `home.spec.ts` nav mega-menu (2 tests) | Timing sensitivity |
| `home.spec.ts` draft 404 (1 test) | Payload dev-mode quirk |
| `home.spec.ts` timeout (2 tests) | Server cold-start in test env |
| `nav-motion.spec.ts` (2 tests) | Nav timing |
| `services.spec.ts` (1 test) | Payload dev-mode 404 quirk |
| `solutions.spec.ts` (1 test) | Payload dev-mode 404 quirk |

---

## Key features

### Knowledge Hub — `/knowledge`

Three tabs managed entirely from the CMS:

1. **Articles & Guides** — technical articles authored in Payload richText
2. **Calculators** — interactive engineering calculators (client-side, no data sent to servers):
   - ☀️ Solar ROI / Payback Period
   - ⚡ Earthing Resistance (Dwight formula)
   - 🔌 Cable Sizing (voltage drop method)
   - 🌩️ Lightning Protection Zone (IEC 62305 Rolling Sphere)
   - 📊 Solar Energy Yield (Bangladesh PSH data)
3. **Downloads** — sample documents, RFQ templates, spec sheets (CMS-managed URLs or uploads)

Admins enable/disable calculators and manage sample documents from **CMS → Knowledge Resources** — no code deploy needed.

### Hermes AI Content Agent — `/news`

Daily news feed at `/news` populated automatically by the Hermes AI agent:
- `GET /api/hermes/content-brief` — returns content gaps and GEO writing instructions
- `POST /api/hermes/ingest` — creates CMS drafts (bearer-token authenticated)
- Auto-publish configurable per category via `HERMES_AUTO_PUBLISH_CATEGORIES` env var
- `company-update` and `product-update` are **always draft** — human review required

See [`HERMES-AGENT-SETUP.md`](HERMES-AGENT-SETUP.md) for full setup instructions.

### GEO / AEO

Every page is optimised for AI engine citations:
- `robots.txt` allows GPTBot, ClaudeBot, PerplexityBot, Google-Extended
- Dynamic `/llms.txt` (refreshes hourly from CMS)
- Schema.org JSON-LD on every page type
- All content server-rendered (no JS required for crawlers)
- `noindex` forced site-wide until `SITE_INDEXABLE=true` at go-live

---

## Environment variables

See [`.env.example`](.env.example) for all variables with descriptions.

Key variables:

| Variable | Purpose |
|---|---|
| `DATABASE_URI` | PostgreSQL connection string |
| `PAYLOAD_SECRET` | CMS encryption secret (min 32 chars) |
| `NEXT_PUBLIC_SERVER_URL` | Canonical site URL (no trailing slash) |
| `SITE_INDEXABLE` | Set `true` only at production go-live |
| `HERMES_AGENT_SECRET` | Bearer token for the Hermes API endpoints |
| `HERMES_AUTO_PUBLISH_CATEGORIES` | Comma-separated categories Hermes may auto-publish |

---

## Git workflow

- Branch naming: `feat/...`, `fix/...`, `chore/...`
- Conventional commits
- CI must be green to merge — agents never force-merge
- No direct commits to `main`
- Husky pre-commit: lint-staged (typecheck + eslint + prettier on staged files)

---

## Deployment

See [`DEPLOYMENT-AND-VPS.md`](DEPLOYMENT-AND-VPS.md) for full VPS setup (Virtarix hosting).

Quick checklist for go-live:
1. All CMS content published
2. `SITE_INDEXABLE=true` in server `.env`
3. `pm2 restart sustech-web`
4. Submit sitemap: `https://www.sustechltd.com/sitemap.xml`

---

## Admin manual

> **Non-technical users and Super Admins:** see [`ADMIN-MANUAL.md`](ADMIN-MANUAL.md) for step-by-step instructions for managing all content, configuring the chatbot and WhatsApp button, managing users, deploying updates, and using the Hermes AI content agent.

The admin manual covers:
- Managing pages, blocks, and navigation
- Publishing projects, services, articles, and news items
- Enabling calculators and uploading sample documents
- WhatsApp button and chatbot configuration
- GEO/AEO best practices for admins
- Deployment checklist

---

## Contributing

1. Create a feature branch: `git checkout -b feat/your-feature`
2. Make changes, run all quality gates
3. Open a PR — CI must be green
4. No force-merges

---

*Built with ❤️ by the Sustech Technology Ltd development team.*
