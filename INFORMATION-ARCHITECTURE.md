# INFORMATION-ARCHITECTURE.md — Sustech Website

Sitemap, navigation, and per-page wireframe with content slots and schema. Build pages to this spec. Content marked **[CMS]** comes from Hermes→CMS; **[static]** is hand-built.

## 1. Navigation

**Top nav (sticky, condenses on scroll):**
`Logo` · Solutions ▾ · Services ▾ · Projects · Capabilities · Knowledge · About · **[Request a Consultation]** (solar CTA) · (Client Login — later phase)

- **Solutions ▾** (by sector — buyer self-selects): Manufacturing & RMG/Textile · Power & Utilities · Commercial Real Estate · Ports & Heavy Industry
- **Services ▾** (by capability): Solar & Energy · Electrical EPC · Grounding & Lightning Protection · Smart Systems · Testing, Inspection & Consultancy

**Footer:** company blurb + real address/phone/email/hours · Solutions · Services · Projects · Knowledge · About · Contact · Privacy · social. (No dead `javascript:void(0)` links — every link resolves.)

## 2. Sitemap

```
/                         Home
/solutions/[sector]       4 sector pages
/services/[service]       5 service pages
/projects                 Portfolio index
/projects/[slug]          Case study [CMS]
/capabilities             Capabilities & compliance
/knowledge                Knowledge hub index
/knowledge/[slug]         Article [CMS/MDX]
/about                    About / team / story
/contact                  Contact + RFQ
/request-quote            RFQ flow (also modal)
/llms.txt  /robots.txt  /sitemap.xml
(later) /portal/*         Client portal (auth)
```

## 3. Home (`/`)

The 50-millisecond credibility test. Sections top→bottom:

1. **Hero** [static + CMS hero data] — dark band. Eyebrow ("EPC ENGINEERING · SINCE 2017"), `h1` one-line value prop ("Single-point EPC for industrial power, solar & safety — engineered to IEC, BNBC & NFPA"), supporting line, **primary CTA [Request a Consultation]** + secondary [See Projects]. Background: subtle gradient-mesh + fine engineering grid. Real project still or short muted video. Staggered load reveal.
2. **Proof bar** [CMS] — four animated real counters: years of engineering, clients served, projects delivered, service lines. (No "0+"; the earlier kWp-installed and substations-commissioned stats are removed — not in the source data.)
3. **What we do** [static] — 5 service cards (the five lines) with icon, one-line outcome, link.
4. **Solutions by sector** [static] — 4 sector tiles; visitor self-identifies.
5. **Featured projects** [CMS] — 3 case-study cards (sector-adaptive if personalization on).
6. **Why Sustech / differentiators** [static] — "what competitors can't say": in-house engineering, standards-compliant design, NEBOSH-certified safety, after-sales/AMC. Each a concise claim + proof.
7. **How we work** [static] — 1-2-3-4 strip: Discover → Engineer → Deliver → Commission.
8. **Client logo wall** [CMS] — grayscale→color hover.
9. **Engineering tools teaser** [static] — SolarCalc Pro / ROI calculator entry (lead magnet).
10. **Testimonials** [CMS] — named, company-attributed.
11. **CTA band** [static] — dark; "Planning an industrial power, solar or safety project?" + primary CTA.
12. Footer.

Schema: `Organization` + `LocalBusiness` + `WebSite`. Metadata: brand title, strong description, OG image.

## 4. Sector pages (`/solutions/[sector]`)

For each of the 4 sectors:
1. Hero — sector-specific headline + pain framed as outcome.
2. Sector challenges → how Sustech solves (mapped to services).
3. Relevant services for this sector (subset).
4. **Sector-specific case studies** [CMS].
5. **Sector-relevant client logos** [CMS] (contextual proof).
6. Relevant compliance/standards note.
7. CTA band.

Schema: `Service`/`WebPage` + `BreadcrumbList` + `FAQPage`.

## 5. Service pages (`/services/[service]`)

For each of the 5 lines (Solar & Energy, Electrical EPC, Grounding & LPS, Smart Systems, and Testing, Inspection & Consultancy at `/services/testing-inspection-consultancy`):
1. Hero — service value prop.
2. **Scope of work** — what's included (bulleted, scannable).
3. **Standards & methodology** — IEC/BNBC/NFPA references; your SOP-based approach. (Authority + GEO gold.)
4. Sub-capabilities / specialisations.
5. Representative **projects** [CMS] for this service.
6. Relevant **tool** embed (e.g., SolarCalc on Solar page).
7. FAQ [CMS] (schema-marked).
8. CTA.

Each section leads with a direct answer sentence, then detail. Schema: `Service` + `FAQPage` + `BreadcrumbList`.

## 6. Projects (`/projects`, `/projects/[slug]`)

**Index:** filterable grid (by sector/service/capacity) of case-study cards. [CMS]

**Case study** [CMS] — the credibility engine. Structure:
- Hero: project name, sector, location, capacity/scale, year.
- Snapshot: key facts (capacity, scope, duration, standards) in a mono spec block.
- **Challenge → Solution → Outcome** narrative (Hermes drafts from ERP project data; real figures).
- Gallery (real photos), as-built highlights.
- Client/testimonial if available.
- Related projects + CTA.

Schema: `CreativeWork`/`Project` + `BreadcrumbList`. These pages should be in `llms.txt`.

## 7. Capabilities (`/capabilities`)

Procurement reads this to qualify you.
- Engineering capabilities matrix.
- **Certifications & compliance** (NEBOSH, standards adhered to) — real only.
- QA/HSE process.
- Team credentials / key personnel.
- Equipment & partners / line-card.
- Downloadable company profile (PDF) + capability statement.

Schema: `Organization` (with `hasCredential`), `WebPage`.

## 8. Knowledge hub (`/knowledge`, `/knowledge/[slug]`)

GEO engine + lead gen. 8–12 launch articles, e.g.: LPS design to NFPA 780; solar system sizing basics; energy-audit fundamentals; BESS economics in Bangladesh; substation safety; choosing an EPC partner. [CMS/MDX]

Article structure: clear `h1`, TL;DR/answer up top, scannable H2/H3, real figures, FAQ block, author + date, related articles, soft CTA.
Schema: `Article` + `FAQPage` + `BreadcrumbList`.

## 9. About (`/about`)

Mission/vision, founding story (since 2017 — accurate), values, sustainability narrative (Ørsted-style credibility), team, LEA membership, locations/map.
Schema: `AboutPage` + `Organization`.

## 10. Contact & RFQ (`/contact`, `/request-quote`)

- Contact: real address/map, phone (both numbers), email, hours, quick contact form.
- **RFQ flow** (the conversion primitive, also a modal from any CTA): select service(s)/sector → project details (capacity, location, timeline) → contact → submit. Server action → CMS/CRM + Telegram alert to sales. Optional AI-assisted mode that asks the right engineering questions.
- Confirmation state + what-happens-next.

Schema: `ContactPage`. No public form posting to third parties; server-action only; validated + sanitised.

## 11. Cross-cutting

- **AI chat widget** on every page (bottom-right): bilingual, RAG over published content, escalation handoff. Lazy-loaded; never blocks first paint.
- **Breadcrumbs** on all non-home pages (visible + schema).
- **Personalization** (optional, privacy-first): sector inferred from referrer/UTM/behaviour adjusts hero + featured projects + CTA. Strong default always present.
- **Beta:** all pages `noindex` until cutover (env flag).

## 12. Build order (pages)

1. Layout shell (header/nav/footer) + design system + home.
2. Service pages (5) → Sector pages (4).
3. Projects index + case-study template.
4. Capabilities + About + Contact/RFQ.
5. Knowledge hub.
6. Chat widget + personalization + tools.

Each page ships only when it passes `pnpm verify` (see SETUP.md).
