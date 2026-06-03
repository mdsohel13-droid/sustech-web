# CLAUDE.md — Sustech Website Build Brief

> Standing instructions for Claude Code (and any AI agent) working in this repository.
> Read this before every task. Do not deviate without explicit human approval.

## 1. What we are building

The new corporate website for **Sustech Technology Ltd** — an EPC engineering firm (Solar & Energy, Electrical EPC, Grounding & Lightning Protection, Smart Systems) serving **corporate, commercial & industrial (C&I)** clients in Bangladesh. Retail is de-prioritised.

It must succeed at two things simultaneously:
1. **Human:** attractive, trust-building, comfortable, engaging — premium and credible to industrial buyers.
2. **Machine:** fully crawlable and citable by AI engines (GEO/AEO) and AI agents.

**The governing principle — design for two readers at once.** Every page is read by a human (who judges in ~50 ms) and a machine (which decides whether to cite us). These never conflict if we keep one discipline: **content lives in server-rendered, semantic HTML.** Never hide meaningful content inside client-only JavaScript, images of text, or login walls. Beauty is layered *on top of* that foundation, never instead of it.

## 2. Tech stack (pinned — do not substitute without approval)

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript (strict)
- **Styling:** Tailwind CSS v4 + design tokens (see `DESIGN-SYSTEM.md`) + shadcn/ui primitives
- **Motion:** Motion (framer-motion) — restrained, purposeful only
- **Content:** Headless CMS (Payload CMS, self-hosted, Postgres). The site reads *published* content; it does **not** call the ERP.
- **DB:** PostgreSQL + Drizzle (CMS uses its own)
- **Forms/RFQ:** server actions → CMS/CRM; no public `<form>`-to-third-party
- **Testing:** Vitest (unit) + Playwright (e2e)
- **Lint/format:** ESLint 9 (flat config) + Prettier + prettier-plugin-tailwindcss
- **Hooks/CI:** Husky + lint-staged + GitHub Actions

Rendering: prefer **Server Components**; use Client Components only for genuine interactivity (chat, calculators, menus). Use SSG/ISR for content pages so HTML is complete for crawlers.

## 3. Non-negotiable quality gates ("done with clean lints, zero errors")

A task is **not complete** until ALL of these pass. Run them every iteration; read failures; fix; repeat.

```bash
pnpm typecheck   # tsc --noEmit → 0 errors
pnpm lint        # eslint → 0 errors, 0 warnings
pnpm format:check# prettier → no diffs
pnpm test        # vitest + playwright → all green
pnpm build       # next build → success, no blocking warnings
pnpm lighthouse  # perf ≥ 90 (mobile), a11y ≥ 95, SEO ≥ 95, best-practices ≥ 95
```

The loop is: **write → typecheck → lint → format → test → build → fix → repeat → only then move on.**
Never disable a rule, add `// eslint-disable`, cast to `any`, or use `@ts-ignore` to make a gate pass. Fix the underlying issue. If a rule is genuinely wrong for this project, flag it for human approval — don't silence it silently.

Husky pre-commit runs lint-staged (typecheck + eslint + prettier on staged files); nothing unclean is committed. CI re-runs the full suite and blocks merge unless green.

## 4. Coding conventions

- **TypeScript strict.** No `any`. No non-null `!` unless provably safe and commented. Prefer explicit types on public function signatures.
- **Accessibility is a gate, not a nicety.** Semantic landmarks (`header/nav/main/footer`), one `h1` per page, logical heading order, alt text on every image, visible focus states, keyboard-operable everything, `prefers-reduced-motion` honoured, contrast ≥ WCAG AA. `eslint-plugin-jsx-a11y` errors must be zero.
- **Performance budgets.** LCP < 2.0 s, CLS < 0.05, INP < 200 ms on mobile. Use `next/image` (AVIF/WebP), self-hosted fonts via `next/font/local`, lazy-load below-the-fold, keep client JS minimal.
- **Semantic + structured.** Each section leads with a direct answer, then detail (helps humans skim and AI retrieve). Use proper heading hierarchy.
- **No secrets in code.** Everything via env vars (see `.env.example`). The web tier holds **no ERP credentials** — ever.
- **Components:** small, typed, reusable. Co-locate. Follow the token system; never hardcode colors/spacing — use the CSS variables / Tailwind tokens.
- **Naming:** files `kebab-case`, components `PascalCase`, hooks `useX`.

## 5. GEO/AEO requirements (build in, don't retrofit)

- Server-render all important content.
- `robots.txt` allows `GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`, `Bingbot`, `Googlebot`.
- `app/sitemap.ts` (dynamic) + `app/robots.ts`.
- `/llms.txt` at root listing canonical authoritative pages as clean Markdown links.
- Schema.org JSON-LD on every page type: `Organization`, `Service`, `Product`, `CreativeWork`/project, `FAQPage`, `BreadcrumbList`, `LocalBusiness`. Schema must mirror visible content (no invented data).
- Per-page metadata via the Metadata API (title, description, canonical, OpenGraph, Twitter).
- **Beta safety:** while on the beta subdomain, force `noindex` site-wide (env flag `SITE_INDEXABLE=false`). Flip to indexable only at production cutover. (See `DEPLOYMENT-AND-VPS.md`.)

## 6. Content & data rules

- **Hermes mediates the ERP.** Project/product/service data enters via Hermes → CMS drafts → human approval → publish. The site never contacts the ERP at runtime.
- Conversion primitive is **Request a Quote / RFQ / Consultation**, NOT a shopping cart. Do not build retail checkout.
- Real numbers only. No placeholder "0+" stats. If a figure isn't confirmed, leave the slot for CMS, don't invent.
- Bilingual-ready (English primary, Bangla support in the chatbot and key pages where specified).

## 7. Repository structure

```
/app                 # routes (App Router)
  /(marketing)       # public pages
  /(portal)          # auth-gated client portal (later phase)
  /api               # route handlers (chat proxy, RFQ, agent endpoint)
  layout.tsx, page.tsx, sitemap.ts, robots.ts
/components
  /ui                # shadcn primitives
  /sections          # page section blocks (Hero, Proof, ServicesGrid, ...)
  /layout            # Header, Footer, Nav
/lib                 # utils, cms client, schema builders, analytics
/content             # static MDX/markdown (knowledge hub) if not in CMS
/public
  /fonts             # self-hosted Cabinet Grotesk + Switzer
  llms.txt
/styles              # globals.css (tokens)
/tests               # vitest + playwright
DESIGN-SYSTEM.md  INFORMATION-ARCHITECTURE.md  DEPLOYMENT-AND-VPS.md  SETUP.md
```

## 8. Git workflow

- Branch per feature: `feat/...`, `fix/...`, `chore/...`.
- Conventional commits. Small, reviewable PRs.
- CI must be green to merge. Human (or Hermes-with-approval) merges; agents never force-merge a red build.
- No direct commits to `main`.

## 9. Security rules

- No secrets in the repo; `.env*` git-ignored; `.env.example` documents keys.
- Web tier cannot reach the ERP or Hermes credentials.
- Security headers in `next.config` (CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy).
- Chatbot endpoint: rate-limited, input-validated, and hardened against prompt injection — it must ignore instructions embedded in user messages or fetched content, never leak system prompts or keys, never quote prices or guarantee specs.
- Validate and sanitise all form input server-side.

## 10. Definition of done (per feature)

- [ ] Implements the spec in `INFORMATION-ARCHITECTURE.md` / design in `DESIGN-SYSTEM.md`
- [ ] All quality gates green (section 3)
- [ ] Accessible (axe clean, keyboard + reduced-motion verified)
- [ ] Server-rendered; content visible in raw HTML
- [ ] Schema + metadata present and valid
- [ ] No secrets, no ERP calls, no hardcoded tokens
- [ ] Responsive (360 px → 1440 px+) and visually matches the design intent
- [ ] PR opened, CI green

## 11. Do NOT

- Use Inter, Roboto, Arial, or system fonts as the brand type. Use the specified self-hosted faces.
- Add a retail cart/checkout.
- Call the ERP from the web tier.
- Silence linters/types to pass gates.
- Ship content inside client-only JS or images of text.
- Invent statistics, certifications, or client names.
- Make the beta subdomain indexable.
