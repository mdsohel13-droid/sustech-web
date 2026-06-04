# CMS & Dynamic Content Model — Sustech Website

Goal: the site admin manages everything dynamic — navigation tabs, pages, sections, images,
content — from a browser dashboard, no code. This spec defines that system.

**Engine:** Payload CMS (self-hosted, Postgres, runs on the new VPS). Admin UI at `/admin`.
**Principle:** code = the engine + the design + the block *types*; CMS = all content, images,
pages, menus, and how blocks are arranged. New content/pages/menus never require a developer.

---

## 1. Globals (site-wide, single instance)

**SiteSettings** — logo, company name, tagline; contact (phone(s), email, address, map
coords, hours); social links; SEO defaults (default title template, description, OG image);
analytics IDs. Editable by admin.

**Navigation** — the menus, fully admin-controlled:
- `header`: ordered array of items → each has `label`, `type` (page-link | external | dropdown),
  `pageRef` or `url`, and optional `children[]` (for dropdowns like Solutions/Services).
- `footer`: ordered array of columns → each a title + ordered links.
- Admin can add / remove / rename / reorder items and dropdown children. The site menu
  re-renders from this — **adding a tab is a CMS action, not a code change.**

---

## 2. Collections (many entries)

- **Pages** — the heart of dynamic editing. Fields: `title`, `slug` (URL), `status`
  (draft/published), `seo` (title/description/OG/canonical), `showInNav` + `navLabel`, and
  **`layout`: an ordered array of Blocks** (the page builder). Creating a published Page
  makes a live URL automatically.
- **Projects** (case studies) — name, sector, location, capacity/scale, year, summary,
  challenge/solution/outcome (rich text), gallery, client, featured flag, status. Can be
  drafted by Hermes from ERP data, then admin-approved.
- **Services** — the four lines (and any added later): title, slug, icon, summary, scope,
  standards/methodology, FAQ, related projects.
- **Sectors** — title, slug, summary, challenges, relevant services/projects.
- **Testimonials** — quote, person, role, company, logo. Real only.
- **Clients** — name, logo (Media), sectors, optional link. Powers the logo wall.
- **Articles** — knowledge hub: title, slug, body (rich text), FAQ, author, date, status.
- **Media** — central asset library: upload images; auto-generate WebP/AVIF + sizes; alt
  text required. Used everywhere images appear.

---

## 3. Block library (compose any page — the "Facebook-like" part)

Predefined, designed section blocks the admin stacks/reorders inside a Page's `layout`.
**The Phase 1 components ARE these blocks** — wire each built component to a matching block
type so design and editing share one source.

- **Hero** (heading, subhead, CTAs, background image/video, dark/light)
- **RichText** (freeform formatted text)
- **StatsCounters** (label + value rows; animated)
- **ServicesGrid** (auto-pulls Services, or manual selection)
- **SectorTiles** (auto-pulls Sectors)
- **ProjectsList** (featured / filtered / manual selection from Projects)
- **ImageGallery** (from Media)
- **LogoWall** (from Clients; optional sector filter)
- **Testimonials** (from Testimonials)
- **Steps / HowItWorks** (numbered items)
- **CTABand** (heading, subhead, CTAs; dark)
- **FAQ** (Q/A pairs → also emits FAQ schema)
- **CalculatorEmbed** (SolarCalc / ROI)
- **ContactRFQ** (the quote form)
- **Spacer/Divider**

Each block has only simple, labelled fields. Admin: “Add block → choose type → fill fields →
drag to position.” Adding a new *type* of block is the rare developer task.

---

## 4. Dynamic routing & menus (how it stays code-free)

- **Catch-all route** `app/[[...slug]]/page.tsx`: looks up the published Page by slug, renders
  its blocks in order. New CMS page → new live URL, zero code.
- Home is a Page with slug `home` (or root); the Phase 1 home sections become its default blocks.
- **Header/Footer** render from the Navigation global — adding/removing a tab is instant.
- **Revalidation:** on publish, the affected routes revalidate (ISR/on-demand) so changes
  appear within seconds while pages stay fast and crawlable (SSR/ISR — GEO intact).
- Collections (Projects/Articles) get their own dynamic routes (`/projects/[slug]`, etc.).

---

## 5. Roles & publish flow

- **Admin** (you / trusted staff): full control — create/edit/publish/delete, manage nav,
  media, settings, users.
- **Editor**: edit and publish content, no settings/user management.
- **Hermes (service account): draft-only.** It can create/update drafts (e.g., case studies
  from the ERP) but **cannot publish** — you approve via the dashboard or Telegram, per the
  security model. Direct human admin edits publish normally (you're trusted).

Flow: edit → **Save draft** → **Preview** (see the real rendered page) → **Publish** (live in
seconds) → versioned (revert if needed).

---

## 6. Hosting & media

- Payload + its Postgres run on the **new VPS** (private; admin at `/admin` or
  `cms.beta.sustechltd.com`). The public site reads published content.
- Media stored on the VPS or object storage (Backblaze B2/Hetzner) + CDN; images served as
  optimized WebP/AVIF.
- Admin dashboard is browser-based and mobile-friendly — manageable from a phone.

---

## 7. Editable vs. code — the boundary (set expectations)

**You edit, anytime, no code:** all text, all images, navigation tabs & dropdowns, creating/
deleting/reordering pages, arranging blocks on any page, projects, services, sectors,
testimonials, client logos, articles, contact details, footer, SEO text, publish/draft.

**Developer (Claude Code/Hermes), rarely:** brand-new functionality (e.g., a new interactive
tool, payments, login), a brand-new *type* of block, or design-system changes (colors/fonts —
can optionally be exposed as theme settings if you want them admin-editable too).

We stock the block library and content types up front so day-to-day work — including building
new pages — stays point-and-click.

---

## 8. Build note (minimize rework)

The Phase 1 home components already being built become the **block implementations**. So the
order is: finish the Phase 1 components → introduce Payload with these collections/globals/
blocks → convert the home page into a CMS Page composed of those blocks → seed initial content
(homepage copy, services, nav) so the admin starts with a full, editable site. No throwaway work.
