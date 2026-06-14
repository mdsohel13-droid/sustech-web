# Sustech CMS — Admin & Super Admin User Manual

> **Who this is for:** Super Admins and Admins managing the Sustech Technology Ltd website through the CMS admin panel at `/admin`.
> This document is your complete reference. No coding or technical knowledge required for the tasks described here.
>
> **Developer reference:** See the project [`README.md`](README.md) for technical architecture, local setup, and deployment instructions.

---

## Table of Contents

1. [Accessing the Admin Panel](#1-accessing-the-admin-panel)
2. [User Roles Explained](#2-user-roles-explained)
3. [Super Admin Responsibilities](#3-super-admin-responsibilities)
4. [Managing Pages](#4-managing-pages)
5. [Building Pages with Blocks](#5-building-pages-with-blocks)
6. [Block Style Controls (Width, Padding, Fonts, Borders)](#6-block-style-controls)
7. [Managing Content Collections](#7-managing-content-collections)
8. [Hero Carousel & Photo Strip](#8-hero-carousel--photo-strip)
9. [Icons & 3D Assets](#9-icons--3d-assets)
10. [Site Settings (Logo, Contact, SEO)](#10-site-settings)
11. [WhatsApp Chat & Chatbot](#11-whatsapp-chat--chatbot)
12. [Navigation & Menus](#12-navigation--menus)
13. [Deploying Updates (Super Admin)](#13-deploying-updates-super-admin)
14. [Troubleshooting](#14-troubleshooting)
15. [GEO / AEO — Getting Cited by AI Engines](#15-geo--aeo--getting-cited-by-ai-engines)
16. [Knowledge Hub — Calculators & Sample Documents](#16-knowledge-hub--calculators--sample-documents)
17. [News & Updates — Hermes AI Agent](#17-news--updates--hermes-ai-agent)

---

## 1. Accessing the Admin Panel

| Environment | URL |
|-------------|-----|
| Local development | `http://localhost:4123/admin` |
| Staging / beta | `https://beta.sustechltd.com/admin` |
| Production | `https://www.sustechltd.com/admin` |

**Login:** use the email and password created for your account. If you forget your password, ask the Super Admin to reset it.

> ⚠️ **Never share your admin credentials.** Each person should have their own account.

---

## 2. User Roles Explained

| Role | What they can do |
|------|-----------------|
| ⭐ **Super Admin** | Everything: manage users, deploy widgets, change all settings, publish/unpublish content |
| **Admin** | Full CMS: create/edit/publish all content, manage media and icons. Cannot manage other users. |
| **Editor** | Create and edit content (pages, articles, projects, etc.) but **cannot publish** — an Admin must approve and publish. |
| **Hermes** | Service account for the AI integration. Cannot log into the admin panel. |

**Principle of least privilege:** give people the lowest role that lets them do their job.

---

## 3. Super Admin Responsibilities

Only the Super Admin can do the following:

### 3.1 Creating new users
1. Go to **Admin → Users → Create new**
2. Enter name, email, and choose role
3. The user will receive a password-reset email
4. Only Super Admin can set `Admin` or `Super Admin` roles

### 3.2 Deactivating a user
1. Go to **Admin → Users**
2. Open the user record
3. Click **Delete** (only Super Admin can delete users)

### 3.3 Changing site-wide settings
See [Section 10 — Site Settings](#10-site-settings).

### 3.4 Enabling the WhatsApp button and Chatbot
See [Section 11 — WhatsApp Chat & Chatbot](#11-whatsapp-chat--chatbot).

### 3.5 Making the site publicly indexable (Go-live)
When you're ready to launch:
1. On the server, edit the `.env` file
2. Change `SITE_INDEXABLE=false` → `SITE_INDEXABLE=true`
3. Restart the server (`pm2 restart sustech-web`)

> 🔴 **Do not do this on the beta/staging server.** Only on the production server.

---

## 4. Managing Pages

### Creating a new page
1. Go to **Pages → Create new**
2. Enter a **Title** (required) and a **Slug** — the URL path (e.g. `about-us` → `/about-us`)
3. Set the page **Status** to `Draft` while building it
4. Add blocks to the **Layout** (see Section 5)
5. Fill in the **SEO** tab: title, description, Open Graph image
6. When ready: change Status to **Published** and click **Save**

> Pages only appear on the live site when **Published**.

### Editing an existing page
1. Go to **Pages**
2. Click the page name to open it
3. Make changes
4. Click **Save** — changes go live instantly if already published

### Preview a draft
Click the **Preview** button (eye icon) at the top right to see how the page looks before publishing.

---

## 5. Building Pages with Blocks

Every page is built by stacking **blocks** — like LEGO bricks. Each block is a self-contained section of the page.

### Available blocks

| Block | What it shows |
|-------|--------------|
| **Hero** | Full-width hero banner with heading, subheading, buttons, background image/video, or carousel |
| **Rich Text** | Formatted paragraphs, headings, lists, quotes |
| **Stats / Counters** | Animated number counters (e.g. "250+ Projects") |
| **Services Grid** | Card grid of your services (auto-loads from Services collection) |
| **Sector Tiles** | Visual tiles for each industry sector |
| **Projects List** | Showcases featured/selected projects |
| **Image Gallery** | Grid of images from media |
| **Photo Strip** | Infinite-scroll marquee or one-by-one carousel of photos |
| **Video Showcase** | A cinematic video band — poster cards with a play button; loads the video only on click. Supports uploaded MP4s and YouTube/Vimeo links. |
| **Logo Wall** | Client logos in a grid |
| **Partner Bar** | Partner/certification logos in a row |
| **Product Showcase** | Featured products with specs |
| **Articles List** | Latest articles from the knowledge hub |
| **Testimonials** | Client quotes carousel |
| **Team Grid** | Team member cards |
| **Steps / How it works** | Numbered process steps |
| **CTA Band** | Full-width call-to-action banner (e.g. "Get a Quote") |
| **FAQ** | Expandable Q&A (also adds FAQ schema for SEO) |
| **Calculator Embed** | Solar ROI / savings calculator |
| **Contact / RFQ** | Request-a-Quote form |
| **Spacer / Divider** | Vertical spacing or a horizontal rule |

### Adding a block
1. On a page, scroll to the **Layout** field
2. Click **Add Block**
3. Choose the block type
4. Fill in the block's content fields
5. Optionally open **Style & Animation** to customise appearance

### Reordering blocks
Drag the ⠿ handle on the left of each block up or down.

### Removing a block
Click the **⋮** menu on the block → **Remove**.

### Hero side-media panel (auto-scrolling images/videos)

The **Hero** block can show an auto-scrolling (crossfade) panel of images and videos in the space beside the hero text — great for filling the empty area on the right.

1. Open a page and edit its **Hero** block.
2. Open **Side media panel** and tick **Show side media panel**.
3. Choose the **Media source**:
   - **Auto — featured project photos + explainer videos**: pulls from your featured projects' galleries plus any uploaded videos. (Make sure those projects have gallery photos.)
   - **Auto — recent media library**: cycles through your most recent uploads (images and videos).
   - **Manual — pick items below**: you choose the exact images/videos, in order. Best for a curated look.
4. Set **Seconds per slide** (default 5).
5. Save.

The panel auto-advances, pauses on hover of its pause button, stops for visitors who prefer reduced motion, and videos play muted only while on screen. It's per-hero, so you decide which pages show it.

> **Tip:** For the most premium look, use **Manual** and pick a few strong landscape photos and one short video. Media is shown **fully contained** (never cropped) over a soft blurred backdrop, so portrait and landscape items both fit.

### Hero band height

On the **Hero** block, **Band height** sets how tall the hero is: **Compact**, **Standard**, **Tall**, or **Full screen** (fills the first view on load). Use Full screen for a bold landing hero.

### Gap between blocks

Every block's **Style & Animation** panel has **Gap below this block** (None / Small / Default / Large) — tighten or loosen the space between stacked sections without touching anything else. Tick **Card border + 3D shadow** for a fine, lifted card that gently raises on hover.

### Team groups (Leadership, Engineering, Advisors…)

1. On each **Team member**, set the **Group** (sidebar): Leadership, Management, Engineering, Consultant, Advisor, or Other.
2. On a page, add a **Team** block and set **Show which group** to one group, with its own heading (e.g. "Leadership Team").
3. Add several Team blocks — one per group — to show Leadership, then Engineering, then Advisors, each as its own section. The card design and animation stay the same.

---

### Using the Video Showcase block

The **Video Showcase** block displays one or more videos as a band (section). Each video appears as a poster image with a play button; the video only loads when a visitor clicks it — so the page stays fast and no third-party (YouTube) cookies are set until the visitor chooses to play.

1. Add a **Video Showcase** block to the page Layout.
2. Set the **Layout**:
   - **Spotlight** — one large feature video with a supporting grid beneath. (Tick **Feature large** on the video you want enlarged; otherwise the first is used.)
   - **Grid** — all videos shown at equal size.
3. Set the **Band background** — **Dark cinematic** is recommended (it looks best for video); Light, Muted grey, and Brand blue are also available.
4. Add a **heading**, **lede**, and optional **eyebrow** label.
5. For each video, click **Add Video** and fill in:
   - **Title** (required) and a short **Description** (shown under the video and given to search/AI engines).
   - **Source**: *Uploaded MP4* (then choose the **video file** from media) **or** *YouTube / Vimeo link* (then paste the **URL**).
   - **Duration** — a small badge shown on the poster, e.g. `1:24`.
   - **Poster** — the thumbnail image (16:9). For YouTube links this is optional; the YouTube thumbnail is used automatically if you leave it blank.
   - **Publish date** — optional; improves the video's search listing.

> **Tip:** For uploaded videos, always set a **Poster** image — it's what visitors see before they press play, and it makes the page load fast.

---

## 6. Block Style Controls

Every block (except Spacer) has a collapsible **Style & Animation** panel at the bottom. You do **not** need to touch this for the default site look — only open it when you want a custom treatment.

### Colour scheme
Sets the background + text colour for the block:

| Option | Result |
|--------|--------|
| Default (white) | White background, dark text |
| Muted (light grey) | Light grey background |
| Dark (navy) | Deep navy/ink background, white text |
| Brand — True Blue | Brand blue background |
| Energy — Lime Green | Lime green background |
| Solar — Golden Poppy | Gold/amber background |

### Content width
Controls how wide the content area is:

| Option | Width |
|--------|-------|
| Narrow | 640 px — good for text-heavy blocks |
| Standard | 1200 px — default |
| Wide | 1400 px — good for galleries, grids |
| Full bleed | Edge to edge — no margins |

### Vertical padding
Controls the space **above and below** the block:

| Option | Space |
|--------|-------|
| Compact | Less space — tighten up adjacent sections |
| Standard | Default spacing |
| Spacious | Extra breathing room |

### Text alignment
- **Left** (default) — standard reading alignment
- **Centre** — centred heading and lede, good for CTA bands and hero sections

### Heading size
- **Default (h2)** — standard section heading
- **Large (h1)** — bigger, for emphasis
- **XL — display** — largest, bold impact

### Heading font
- **Display — Cabinet Grotesk** — the brand display typeface
- **Mono — JetBrains** — technical/engineering feel

### Body text font
- **Sans — Switzer** — default body text
- **Display — Cabinet Grotesk** — matches the heading face
- **Mono — JetBrains** — code/technical look

### Body text size
- Small / Base (default) / Large / XL (lede)

### Card border + 3D shadow
Tick this to wrap the section in a rounded card with a subtle border and depth shadow — gives a "lifted" 3D feel. Works well for sections that need to stand out from neighbours.

### Entrance animation
How the block enters the screen as the user scrolls:

| Option | Effect |
|--------|--------|
| Fade + Rise | Content fades in and rises up (default) |
| Slide from Left | Sweeps in from the left |
| Slide from Right | Sweeps in from the right |
| Scale Up | Grows from slightly smaller |
| Stagger (cascade) | Grid items enter one after another |
| None — instant | No animation, appears immediately |

### Animation delay
Pause before the animation starts: None / Short (150ms) / Medium (300ms) / Long (500ms). Use to sequence blocks on the same page.

---

## 7. Managing Content Collections

### Projects
**Path:** Projects in the sidebar

Fields: Name, Summary, Sector, Location, Capacity, Year, Challenge, Solution, Outcome, Featured (checkbox).

Slug is auto-generated from the name. Published projects appear in the Projects List block and at `/projects/[slug]`.

### Services
**Path:** Services

Fields: Title, Slug, Summary, Description (richtext), Icon (from Icons collection), Featured.

### Articles (Knowledge Hub)
**Path:** Articles

Fields: Title, Slug, Excerpt, Body (richtext), Author, Published Date, FAQ array.

Published articles appear in the Articles List block and at `/knowledge/[slug]`.

### Clients (Logo Wall)
**Path:** Clients

Fields: Name, Logo (upload), Website, Featured.

### Testimonials
**Path:** Testimonials

Fields: Quote, Author, Company, Role, Photo, Rating.

### Media
**Path:** Media

General images and videos used in blocks. Accepts JPEG, PNG, WebP, AVIF, GIF, MP4.

> 💡 For icons and small brand assets, use the **Icons** collection instead (see Section 9).

---

## 8. Hero Carousel & Photo Strip

### Hero Carousel
In any Hero block, you can switch from a single background to a carousel:

1. Open a Hero block
2. Find **Hero mode** → change to **Carousel — auto-advance through media**
3. Click **Add Item** under **Carousel slides**
4. For each slide, upload an Image or MP4 video from Media
5. Optionally add a caption
6. Set the **Slide interval** (default 5 seconds)

The slides crossfade automatically. Navigation dots appear at the bottom for the user to skip ahead.

### Photo Strip
The **Photo Strip** block shows a row of photos as either:

- **Marquee** — photos scroll continuously from right to left, looping forever
- **Carousel** — one photo at a time with left/right arrows and swipe support

**To add:**
1. On a page, Add Block → Photo Strip
2. Choose **Display mode**: Marquee or Carousel
3. For Marquee: choose **Scroll speed** (Slow / Normal / Fast)
4. Click **Add Photo** to upload photos
5. Optionally add a caption to each photo

---

## 9. Icons & 3D Assets

The **Icons** collection is a dedicated folder for:
- 3D-rendered engineering icons
- AI-generated icons
- SVG symbols
- Brand marks and certification logos

### Uploading an icon
1. Go to **Icons → Create new**
2. Upload the file (SVG, PNG, WebP, AVIF accepted)
3. Fill in:
   - **Name** — shown in the picker (e.g. "Solar Panel 3D")
   - **Category** — Service icon / Sector icon / UI icon / Brand / 3D render / AI-generated / Other
   - **Tags** — comma-separated keywords for searching
   - **Alt text** — describe it for screen readers (leave blank if purely decorative)

### Using icons in blocks
When editing a Service, Sector, or any block that has an "Icon" field:
1. Click the icon picker
2. Browse or search by name/tag
3. Click to select

---

## 10. Site Settings

**Path:** Settings → Site Settings in the sidebar

This is the central control for company-wide information that appears across all pages.

### Brand tab
- **Logo** — upload the company logo (SVG/PNG recommended)
- **Company Name** — appears in the header wordmark if no logo is set
- **Tagline** — short tagline (shown in footer)
- **Description** — company blurb for footer and SEO
- **Founding Year** — used in schema.org data

### Contact tab
- **Phone numbers** — add multiple numbers; the first one is used in the WhatsApp button
- **Email**
- **Address** — street, city, region, postal code, country
- **Business hours** — e.g. "Sun–Thu, 9:00–18:00"
- **Map coordinates** — latitude/longitude for Google Maps and LocalBusiness schema
- **Social links** — LinkedIn, Facebook, YouTube, etc.

### SEO Defaults tab
- **Default title** — used when a page has no SEO title set
- **Title template** — how page titles are formatted (e.g. "Page Name · Sustech Technology Ltd")
- **Default description** — fallback meta description
- **Default OG image** — fallback social share image (1200×630 px)

### Chat & Engagement tab
See Section 11 below.

---

## 11. WhatsApp Chat & Chatbot

Both widgets are controlled from **Settings → Site Settings → Chat & Engagement**.

### WhatsApp Button
1. **Enable WhatsApp button** → tick the checkbox
2. **WhatsApp number** → enter the number in international format (e.g. `8801711000000` — country code first, no spaces, no +)
3. **Pre-filled message** → the text pre-typed when the user taps the button (e.g. "Hello, I'd like a quote for...")
4. **Button position** → Bottom right (default) or Bottom left
5. Click **Save** at the top of the page

The button appears immediately on all pages.

### Chatbot Widget

**Provider options:**

#### Option A: Hermes (Recommended — your own AI agent)
- **Enable chatbot widget** → tick
- **Chatbot provider** → Hermes — Sustech AI agent
- **Greeting message** → the first message the bot shows (e.g. "Hello! How can I help?")
- **Hermes webhook URL** → leave blank to use the built-in chat route, OR enter the URL of a custom Hermes endpoint

#### Option B: Crisp (Free live chat)
1. Create a free account at [crisp.chat](https://crisp.chat)
2. Go to Crisp Dashboard → Settings → Website Settings → copy your **Website ID**
3. In CMS: Provider → Crisp → paste the Website ID
4. Enable and save

#### Option C: Custom embed
- Paste the full `<script>` tag from any chat provider (Intercom, Tidio, Tawk.to, etc.)
- The script is injected into the page footer

**Widget position:** choose Bottom right or Bottom left.

---

## 12. Navigation & Menus

**Path:** Settings → Navigation

The navigation controls:
- **Header items** — main menu tabs and dropdowns
- **Footer columns** — footer link groups
- **Header CTA** — the button in the top-right of the header (e.g. "Get a Quote")

### Adding a menu item
1. Open Navigation
2. Under **Header items**, click **Add Item**
3. Enter a **Label** and choose a **Link type**:
   - **Internal page** → pick a page from the Pages collection
   - **Custom URL** → enter any path or external URL
4. To add a dropdown: tick **Has dropdown** and add sub-items

### Reordering
Drag items up/down using the ⠿ handle.

---

## 13. Deploying Updates (Super Admin)

### How publishing works
- **Draft** → visible only in the admin panel preview
- **Published** → live on the website immediately after save
- Pages use ISR (Incremental Static Regeneration) — they refresh automatically every hour or when you save

### Forcing an immediate refresh
If a page doesn't update after saving, go to the page URL and add `?revalidate=true` — this forces a fresh render.

### Server restart (if needed)
On the Virtarix VPS, SSH in and run:
```bash
pm2 restart sustech-web
```

### Go-live checklist (first deployment)
- [ ] All important pages are Published
- [ ] Site Settings has the correct logo, phone, address
- [ ] WhatsApp button is configured and tested
- [ ] Navigation has all required menu items
- [ ] Flip `SITE_INDEXABLE=true` in server `.env`
- [ ] Restart server: `pm2 restart sustech-web`
- [ ] Submit sitemap to Google Search Console: `https://www.sustechltd.com/sitemap.xml`
- [ ] Test on mobile (phone and tablet)
- [ ] Verify WhatsApp button appears and opens correctly
- [ ] Run Lighthouse audit (aim for Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95)

---

## 14. Troubleshooting

### "My changes aren't showing on the live site"
- Check the page **Status** is **Published** (not Draft)
- Wait up to 1 minute for ISR to kick in
- Hard-refresh the browser (Ctrl+Shift+R / Cmd+Shift+R)
- If still not updated, contact your developer

### "The WhatsApp button isn't appearing"
- Check **Settings → Site Settings → Chat & Engagement → WhatsApp → Enable WhatsApp button** is ticked
- Check that a phone number has been entered
- Click Save at the top of the page

### "I can't log in"
- Check you're using the correct email
- Use the **Forgot password** link on the login page
- If the forgot password email doesn't arrive, check your spam folder
- If still locked out, contact your Super Admin

### "I can't delete a user / can't create an Admin"
- Only Super Admins can create or delete users
- Only Super Admins can assign Admin or Super Admin roles
- Contact your Super Admin

### "The admin panel is showing an error"
- Try a hard refresh
- Clear browser cache
- Try a different browser
- If persisting, contact your developer

### "I uploaded an image but it looks blurry"
- Upload the highest-resolution version you have
- Minimum recommended: 1600 × 900 px for full-width images
- For OG/share images: exactly 1200 × 630 px

---

## 15. GEO / AEO — Getting Cited by AI Engines

**GEO (Generative Engine Optimization)** and **AEO (Answer Engine Optimization)** are how you make the site show up when people ask AI assistants — ChatGPT, Perplexity, Claude, Gemini, Bing Copilot — questions like:

> *"Who does solar EPC in Bangladesh?"*
> *"Best grounding and lightning protection contractor in Dhaka?"*

The site is already built for AI citability (see what's automatic below). But admins have a recurring job here, just like SEO — and it pays dividends quickly because AI engines are refreshed often.

---

### What the site does automatically (no admin action needed)

| Signal | What it does |
|--------|-------------|
| **robots.txt** | Explicitly allows GPTBot, ClaudeBot, PerplexityBot, Google-Extended — every major AI crawler |
| **sitemap.xml** | Dynamic, updates hourly — all published pages, services, projects, articles |
| **Schema.org JSON-LD** | Machine-readable structured data on every page type (Organization, LocalBusiness, WebSite, Service, CreativeWork, FAQPage, BreadcrumbList, Article) |
| **Server-rendered HTML** | All content is in the raw HTML — no JavaScript required to read it |
| **llms.txt** | Machine-readable index at `/llms.txt` listing every canonical page with a one-line description — refreshes hourly from the CMS |
| **Per-page metadata** | Title, description, canonical URL, OpenGraph image on every page |

---

### What admins do regularly (your GEO/AEO job)

These are the actions that directly improve how AI engines answer questions about Sustech. Do them on a rolling basis — monthly is a good cadence.

---

#### ✅ 1. Write FAQ sections on every Service page

This is the **single highest-impact action**. When you add Q&A pairs to a service's FAQ array, the site automatically generates `FAQPage` schema. AI engines use this to give direct answers.

**How:**
1. Open any service (e.g. Solar & Energy)
2. Scroll to the **FAQ** section
3. Add 5–10 questions people actually ask:
   - "How much does a 100 kW solar system cost in Bangladesh?"
   - "What is the payback period for commercial solar?"
   - "Do you handle grid-connection permits?"
   - "What standards do you use for earthing systems?"
4. Write answers in plain, direct language — first sentence should be the actual answer, then explain

**Why it works:** AI engines use FAQPage schema as a direct source for answers. If your FAQ says "Sustech installs grid-tie solar from 10 kW to 5 MW", that answer gets attributed to Sustech when someone asks the question.

---

#### ✅ 2. Write full project case studies with the Challenge → Solution → Outcome structure

Every published project is listed in `llms.txt` and indexed for AI retrieval. A rich case study (500–1000 words) is cited far more often than a bare name + location.

**Fields to fill in:**
- **Summary** — one sentence ("5 MW rooftop solar for a textile factory in Gazipur, reducing grid dependence by 60%.")
- **Challenge** — what the client faced (specifics: load profile, grid unreliability, budget constraints)
- **Solution** — what Sustech did (technical specifics: panel type, inverter brand, earthing standards used)
- **Outcome** — measurable results (kWh saved, cost reduction %, CO2 avoided, payback period)
- **Year, Location, Capacity** — always fill these — they're used in the schema.org CreativeWork data

**Why it works:** AI engines treat case studies as primary evidence. "Sustech completed a 5 MW solar installation for a textile factory" is the kind of citable, specific fact that appears in AI answers.

---

#### ✅ 3. Publish Knowledge Hub articles that answer specific questions

Articles live at `/knowledge/[slug]` and are listed in `llms.txt`. Each one is an indexed `Article` schema entry. Write articles that directly answer questions your buyers search for.

**High-value topics for Sustech:**
- "What is earthing in electrical installations? (Bangladesh standards)"
- "Hybrid solar vs grid-tie: which is better for factories in Bangladesh?"
- "How to spec a lightning protection system for a warehouse"
- "BESS (Battery Energy Storage) for commercial buildings — a buyer's guide"

**Format for best citability:**
1. **Excerpt (TL;DR)** — answer the question in 1–2 sentences, right up top
2. **Body** — explain in detail
3. **FAQ array** — add 3–5 related questions as Q&A pairs at the bottom

**Why it works:** AI engines prefer content that leads with a direct answer. The excerpt field becomes the short answer; the body becomes the supporting evidence; the FAQ array becomes additional citable Q&As.

---

#### ✅ 4. Keep Site Settings complete and accurate

The Organization, LocalBusiness, and WebSite schema on every page is built entirely from **Settings → Site Settings**. AI engines use this to identify and locate the business.

**Keep these current:**
- **Description** — 2–3 sentences that describe exactly what Sustech does and for whom
- **Phone and email** — used in LocalBusiness schema
- **Address** — street, city, postal code, country
- **Business hours** — used in LocalBusiness schema
- **Social links** — LinkedIn, Facebook, YouTube — used as `sameAs` (tells AI engines that your LinkedIn is the same business)
- **Founding year** — credibility signal

---

#### ✅ 5. Write good SEO descriptions for every published page

In any Page, Service, Project, or Article — open the **SEO** tab and fill in:
- **SEO title** — how you want the page named in search and AI results
- **SEO description** — 1–2 sentences that directly answer what the page is about

This feeds both the meta description (Google) and provides clean context for AI engines.

---

### Monthly GEO/AEO checklist (recommended)

- [ ] Add FAQs to any service page that doesn't have at least 5 Q&As
- [ ] Publish one Knowledge Hub article on a topic your clients commonly ask about
- [ ] Add one completed project as a full case study (Challenge + Solution + Outcome)
- [ ] Check Site Settings → Contact — is everything still current?
- [ ] Check Site Settings → Social — are all your profile URLs up to date?
- [ ] Read `/llms.txt` in your browser to verify all new content is appearing

---

### What NOT to do (common mistakes)

- **Do not put key information only in images or PDFs.** AI crawlers cannot read text inside images. If a spec sheet only exists as a PDF image, its content is invisible to AI engines. Type the key specs into a richtext body instead.
- **Do not write vague descriptions.** "We do great work" is not citable. "We design and install grid-tie solar PV systems from 10 kW to 10 MW for commercial and industrial clients in Bangladesh" is.
- **Do not leave the Excerpt blank on articles.** The excerpt is the direct answer — the most AI-citable field on an article.
- **Do not invent statistics.** AI engines attribute claims to Sustech. Only publish numbers you can stand behind.

---

---

## 16. Knowledge Hub — Calculators & Sample Documents

The Knowledge Hub at `/knowledge` has three tabs:

1. **Articles & Guides** — rich-text articles authored in the CMS
2. **Calculators** — interactive engineering tools (built-in to the site)
3. **Downloads** — sample documents and templates

Both Calculators and Downloads are managed entirely from the CMS, with no code deployment needed to toggle them on/off or reorder them.

---

### 16.1 Managing Calculators

**Path:** Content → Knowledge Resources

The site ships with 5 built-in calculators. Admins control which ones appear on the website and in what order:

| Calculator | What it does |
|---|---|
| ☀️ **Solar ROI / Payback Period** | Calculates payback years, 25-yr savings, and CO₂ avoided for a solar installation |
| ⚡ **Earthing Resistance** | Single rod resistance using Dwight's formula + IEC 60364/62305 compliance check |
| 🔌 **Cable Sizing** | Minimum cable cross-section by voltage drop method (IEC 60228 / IEC 60364) |
| 🌩️ **Lightning Protection Zone** | Rolling sphere radius and protected area per IEC 62305 for all four LPLs |
| 📊 **Solar Energy Yield** | Annual kWh generation for 6 Bangladesh cities using NASA POWER irradiance data |

#### To enable or disable a calculator:

1. Go to **Content → Knowledge Resources**
2. Find the calculator you want to manage (e.g. "Solar ROI / Payback Period")
3. Open it
4. Tick or untick the **Enabled** checkbox
5. Click **Save**

The calculator will appear or disappear from the Knowledge Hub **Calculators** tab immediately.

#### To change the display order:

1. Open the Knowledge Resource record
2. Change the **Order** number (lower = appears first; e.g. 1, 2, 3...)
3. Click Save

#### To add a new calculator (admin guide for the dev):

> ⚠️ Adding a brand-new calculator type requires a code change. Ask your developer. Once deployed, the developer will add a new option to the **Calculator type** dropdown, and you can create a new Knowledge Resource record to activate it.

---

### 16.2 Managing Sample Documents (Downloads)

**Path:** Content → Knowledge Resources → Create new

Sample documents are files (PDFs, Word docs, Excel templates) that visitors can download.

#### Adding a new sample document:

1. Go to **Content → Knowledge Resources → Create new**
2. Set **Type** → **Sample Document**
3. Fill in:
   - **Title** — the document name shown on the card (e.g. "RFQ Template — Solar EPC")
   - **Description** — 1–2 sentences describing what the document contains
   - **Order** — display order (lower = first)
   - **Enabled** — tick to show it
4. **Document source** — choose one:
   - **Upload document** — drag and drop a PDF, DOCX, or XLSX file directly into the CMS media library
   - **External document URL** — paste a Google Drive link, SharePoint URL, or other hosted file URL
5. Fill in **File size** (e.g. "420 KB") and **File format** (PDF / DOCX / XLSX / ZIP)
6. Optionally set a **Download button label** (default: "Download")
7. Click **Save**

The document will appear on the Knowledge Hub **Downloads** tab.

#### Tips for sample documents:

- Use **External URL** for large files (> 10 MB) to avoid slowing the CMS
- For Google Drive: set sharing to "Anyone with the link → Viewer" before adding the URL
- If a document has no URL yet, leave the URL blank — the card will show "Contact us to request this document"

#### Document ideas for Sustech:

| Document | Format | Purpose |
|---|---|---|
| RFQ Template — Solar EPC | DOCX | Helps clients send complete project enquiries |
| Earthing Test Report Template | XLSX | Standard format for site test records |
| LPS Design Checklist | PDF | Pre-installation checklist per IEC 62305 |
| Solar Commissioning Checklist | PDF | Site acceptance testing steps |
| Cable Schedule Template | XLSX | Standard format for electrical design packages |
| Project Handover Report Sample | PDF | Example format for client delivery |

---

### 16.3 What appears on the Knowledge Hub page

| Tab | Shows | When |
|---|---|---|
| Articles & Guides | All published Articles | Always |
| Calculators | All enabled Knowledge Resources of type "calculator" | When at least 1 is enabled |
| Downloads | All enabled Knowledge Resources of type "sample" | When at least 1 is enabled |

If no calculators are enabled, the Calculators tab still appears but shows "Calculators coming soon." Same for Downloads.

---

## 17. News & Updates — Hermes AI Agent

The daily news feed at `/news` is maintained by the **Hermes AI content agent**. This section explains what admins need to know.

---

### 17.1 What Hermes does

Every day at 5:00 AM (Bangladesh time), the Hermes agent:

1. Fetches a **content brief** from the site (gaps, suggested topics, GEO writing instructions)
2. Generates 3 news articles using the Claude AI API
3. Posts them to the CMS as **drafts**
4. Sends a notification ("3 new drafts ready for review") to the team

The full architecture and setup guide is in [`HERMES-AGENT-SETUP.md`](HERMES-AGENT-SETUP.md).

---

### 17.2 Reviewing and publishing Hermes drafts

**Path:** Content → News & Updates → filter by Status: Draft

1. Log into the admin panel
2. Go to **Content → News & Updates**
3. Filter by **Status = Draft**
4. Open each draft and check:
   - Is the summary accurate and specific?
   - Are the FAQ answers factually correct?
   - Does the source link work?
   - Does it represent Sustech's voice?
5. Make any edits needed
6. Click **Publish**

**Total time:** ~5 minutes per day for all three drafts.

---

### 17.3 Categories and who can publish them

| Category | Can Hermes auto-publish? | Why |
|---|---|---|
| **Industry News** | Yes (opt-in) | External facts about the sector — low risk |
| **AI & Technology** | Yes (opt-in) | Tech coverage unrelated to Sustech claims |
| **Market Insight** | Yes (opt-in) | Market analysis from public sources |
| **Company Update** | ❌ Never | Contains Sustech-specific claims — must be human-verified |
| **Product Update** | ❌ Never | Contains product specs — must be human-verified |

Company Update and Product Update are **always saved as drafts** regardless of any server settings. A human must always review and publish these.

---

### 17.4 Writing your own news items

You don't have to wait for Hermes. Admins and Editors can write news items manually:

1. Go to **Content → News & Updates → Create new**
2. Fill in:
   - **Title** — the headline
   - **Category** — pick the appropriate category
   - **Published date** — defaults to today
   - **Summary (TL;DR)** — 1–2 sentence direct answer (used in AI citations)
   - **Body** — full article
   - **FAQ** — 2–5 question-answer pairs (highly recommended — these become FAQPage schema)
   - **Source** and **Source URL** — for curated/aggregated news
3. Set Status to **Published** and click **Save**

The article appears on `/news` immediately.

---

*This manual covers all CMS functionality. For developer-level changes (new block types, code changes, server configuration), contact the development team.*
*For the technical project reference, see [`README.md`](README.md).*
