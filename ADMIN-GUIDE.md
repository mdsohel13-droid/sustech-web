# Admin Guide — Managing the Sustech Website

Everything on the public site — navigation, pages, sections, images, projects, services and
text — is managed from the **CMS dashboard**. You never need a developer for routine content.

> Developers are only needed for a brand-new _type_ of section block, brand-new functionality,
> or design-system (colour/font) changes.

---

## 1. Logging in

1. Go to **`/admin`** (e.g. `https://beta.sustechltd.com/admin`).
2. Sign in with your email and password.
   - The seeded starter admin is **`admin@sustech.local`** / **`ChangeMe!2026`** —
     **change this password immediately** (top-right avatar → Account) and create real
     accounts under **Admin → Users**.
3. Roles:
   - **Admin** — full control (content, navigation, settings, users).
   - **Editor** — create/edit/publish content; no settings or users.
   - **Hermes** — an automated service account that can only _draft_ content (e.g. case
     studies from the ERP). It can never publish; an Admin/Editor approves and publishes.

---

## 2. Adding (or renaming / reordering / removing) a navigation tab

1. **Settings → Navigation**.
2. Under **Header tabs**, click **Add Tab**.
   - Set the **Label** (what visitors see).
   - Choose **Internal page** (pick a page — the URL stays in sync automatically) or
     **Custom URL** (type any path or link).
   - To make it a **dropdown** (like _Solutions_ / _Services_), add one or more
     **Dropdown items**, each with its own label, link and optional description.
3. **Reorder** tabs by dragging the ⠿ handle. **Remove** with the row’s ✕. **Rename** by
   editing the Label.
4. Edit **Footer columns** the same way.
5. Click **Save**. The live menu updates within a few seconds — no deploy.

---

## 3. Creating a new page

1. **Content → Pages → Create New**.
2. Enter a **Title**. The **Slug** (the URL, in the right sidebar) fills in automatically —
   e.g. title “About Us” → `/about-us`. Edit it only if you must.
3. Build the page in **Page sections** (see §4).
4. Fill in **SEO** (optional) — a custom title/description and social share image. Blank
   fields fall back to the site defaults.
5. **Save draft** → **Preview** (see it rendered) → **Publish**. A published page is live at
   its URL immediately; there’s nothing else to deploy.
   - The home page is just a Page with the slug **`home`**.

---

## 4. Adding, reordering and removing sections (blocks)

Inside a page’s **Page sections**:

1. Click **Add Section** and pick a block type — e.g. **Hero**, **Stats / counters**,
   **Services grid**, **Sector tiles**, **Projects list**, **Logo wall**, **Testimonials**,
   **Steps**, **CTA band**, **FAQ**, **Rich text**, **Image gallery**, **Contact / RFQ**,
   **Calculator embed**, or **Spacer**.
2. Fill in the block’s simple, labelled fields.
   - “Automatic” blocks (Services grid, Sector tiles, Logo wall, Testimonials) pull their
     content from the matching collection — you don’t re-enter it. Switch to **Choose
     manually** to hand-pick.
   - Most blocks have an **Appearance** option (Default / Muted / Dark) to control the
     light/dark banding.
3. **Reorder** sections by dragging the ⠿ handle. **Collapse** a section to tidy the view.
   **Remove** with the ✕.
4. **Save** → **Publish**.

---

## 5. Uploading an image

1. Wherever a field asks for an image (page SEO, a Hero background, a client logo, a project
   photo), click **Choose from library** → **Upload**, or go to **Content → Media** first.
2. Select the file. The CMS automatically creates optimised, resized versions.
3. **Alt text is required** — describe the image for screen readers and search engines, then
   **Save**. The image is now reusable anywhere on the site.

---

## 6. Projects, Services, Sectors, Testimonials, Clients, Articles

Each lives under **Content** and edits the same way. Create/edit an entry, then it appears
automatically in the matching block (e.g. a new **Service** shows up in every _Services grid_).
**Projects** and **Articles** have **draft/publish** with **Preview**, so you can review before
going live.

---

## 7. Good to know

- **Real numbers only.** The home “proof” counters stay blank until real figures are entered —
  the site shows a tasteful placeholder rather than an invented number.
- **Preview before publish.** The **Preview** button shows the real rendered page using your
  unsaved draft.
- **Versioned.** Pages, Projects and Articles keep version history — you can revert.
- **Beta safety.** While on the beta domain the whole site is hidden from search engines; this
  is flipped on at production launch by a developer (one environment setting).
