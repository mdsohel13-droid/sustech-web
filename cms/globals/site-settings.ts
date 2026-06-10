import type { GlobalConfig } from "payload";
import { anyone, isAdmin } from "../access";
import { revalidateLayout } from "../hooks/revalidate";

/**
 * Listing surfaces an admin can assign a card layout to (vertical | horizontal).
 * Each value must be wired in the corresponding page via `layoutFor()` in
 * lib/content-layout.ts. To support a new listing: add it here AND read
 * `layoutFor(settings, "<value>")` in that page — no other change needed.
 */
export const LAYOUT_SURFACES = [
  { label: "Knowledge Hub", value: "knowledge" },
  { label: "Projects / case studies", value: "projects" },
  { label: "Services (all-services page)", value: "services" },
  { label: "Solutions / Sectors (all)", value: "sectors" },
  { label: "Capabilities (CMS page)", value: "capabilities" },
] as const;

/**
 * Index pages whose hero copy (eyebrow / heading / lede) can be overridden from
 * the CMS. A page with no intro row keeps its built-in default copy, so this is
 * purely additive — read via pageIntro() in lib/page-intro.ts.
 */
export const INTRO_PAGES = [
  { label: "Services (index)", value: "services" },
  { label: "Solutions / Sectors (index)", value: "solutions" },
  { label: "Projects (index)", value: "projects" },
  { label: "Knowledge Hub", value: "knowledge" },
  { label: "Contact", value: "contact" },
  { label: "Request a Consultation", value: "request-quote" },
] as const;

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Site Settings",
  admin: {
    group: "Settings",
    description: "Logo, company details, contacts, social and SEO defaults.",
  },
  access: { read: anyone, update: isAdmin },
  hooks: { afterChange: [revalidateLayout] },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Brand",
          fields: [
            {
              name: "logo",
              type: "upload",
              relationTo: "media",
              admin: { description: "Optional — a text wordmark is used if empty." },
            },
            {
              type: "row",
              fields: [
                {
                  name: "companyName",
                  type: "text",
                  required: true,
                  defaultValue: "Sustech Technology Ltd",
                  admin: { width: "50%" },
                },
                {
                  name: "shortName",
                  type: "text",
                  defaultValue: "Sustech",
                  admin: { width: "50%" },
                },
              ],
            },
            { name: "tagline", type: "text" },
            {
              name: "description",
              type: "textarea",
              admin: { description: "Company blurb used in the footer and as an SEO fallback." },
            },
            { name: "foundingYear", type: "number", defaultValue: 2017 },
            { name: "areaServed", type: "text", defaultValue: "Bangladesh" },
            {
              name: "stats",
              type: "array",
              label: "Headline statistics",
              labels: { singular: "Statistic", plural: "Statistics" },
              admin: {
                description:
                  "Real, verified figures shown on the Projects page. Leave empty to hide the " +
                  "stats band. Use real numbers only — never invented or placeholder values.",
              },
              fields: [
                {
                  type: "row",
                  fields: [
                    {
                      name: "value",
                      type: "number",
                      required: true,
                      admin: { width: "33%" },
                    },
                    {
                      name: "suffix",
                      type: "text",
                      admin: { width: "33%", description: 'e.g. "+", "%", "MWp"' },
                    },
                    {
                      name: "label",
                      type: "text",
                      required: true,
                      admin: { width: "34%", description: "e.g. Projects executed" },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: "Contact",
          fields: [
            {
              name: "phones",
              type: "array",
              labels: { singular: "Phone", plural: "Phones" },
              fields: [{ name: "number", type: "text", required: true }],
            },
            {
              name: "emails",
              type: "array",
              labels: { singular: "Email", plural: "Emails" },
              minRows: 1,
              required: true,
              admin: {
                description:
                  "Contact emails. The first is the primary (shown in the footer and used in " +
                  "schema); add more for departments like Sales or Support.",
              },
              fields: [
                {
                  type: "row",
                  fields: [
                    {
                      name: "address",
                      type: "email",
                      required: true,
                      admin: { width: "60%" },
                    },
                    {
                      name: "label",
                      type: "text",
                      admin: { width: "40%", description: 'Optional, e.g. "Sales", "Support".' },
                    },
                  ],
                },
              ],
            },
            {
              name: "address",
              type: "group",
              fields: [
                { name: "street", type: "text" },
                {
                  type: "row",
                  fields: [
                    { name: "city", type: "text", admin: { width: "50%" } },
                    { name: "region", type: "text", admin: { width: "50%" } },
                  ],
                },
                {
                  type: "row",
                  fields: [
                    { name: "postalCode", type: "text", admin: { width: "50%" } },
                    {
                      name: "country",
                      type: "text",
                      defaultValue: "BD",
                      admin: { width: "50%", description: "ISO country code (e.g. BD)." },
                    },
                  ],
                },
              ],
            },
            { name: "hours", type: "text", admin: { description: "e.g. Sun–Thu, 9:00–18:00" } },
            {
              name: "geo",
              type: "group",
              admin: { description: "Map coordinates for LocalBusiness schema." },
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "latitude", type: "number", admin: { width: "50%" } },
                    { name: "longitude", type: "number", admin: { width: "50%" } },
                  ],
                },
              ],
            },
            {
              name: "social",
              type: "array",
              labels: { singular: "Social link", plural: "Social links" },
              fields: [
                { name: "label", type: "text", required: true },
                { name: "url", type: "text", required: true },
              ],
            },
          ],
        },
        {
          label: "SEO defaults",
          fields: [
            {
              name: "defaultTitle",
              type: "text",
              admin: { description: "Used when a page has no SEO title." },
            },
            {
              name: "titleTemplate",
              type: "text",
              defaultValue: "%s · Sustech Technology Ltd",
              admin: { description: "%s is replaced by the page title." },
            },
            { name: "defaultDescription", type: "textarea" },
            {
              name: "ogImage",
              type: "upload",
              relationTo: "media",
              admin: { description: "Default social share image (1200×630)." },
            },
          ],
        },
        /* ── Display / layout ────────────────────────────────────────── */
        {
          label: "Display",
          description: "Visual layout options that apply across content listings.",
          fields: [
            {
              name: "designVersion",
              type: "select",
              label: "Design version (whole site)",
              defaultValue: "classic",
              options: [
                { label: "Classic (current look)", value: "classic" },
                { label: "Pro — glassmorphism + gradients", value: "pro" },
              ],
              admin: {
                description:
                  "Switch the entire site's visual style. Classic is the standard look; Pro layers " +
                  "frosted-glass surfaces, subtle brand gradients and richer motion on top — same " +
                  "content, fully reversible. Flip back to Classic anytime.",
              },
            },
            {
              name: "navStyle",
              type: "select",
              label: "Navigation style (header)",
              defaultValue: "classic",
              options: [
                { label: "Classic (mega-menu with dropdowns)", value: "classic" },
                { label: "Adaptive pill (collapses to current page)", value: "pill" },
              ],
              admin: {
                description:
                  "Classic shows the full menu bar with Solutions/Services dropdowns. Adaptive pill " +
                  "is a compact glass pill that shows the current page and expands on hover/tap to " +
                  "reveal all top-level links (no dropdowns — parents link to their first item). " +
                  "Fully reversible.",
              },
            },
            {
              name: "contentLayouts",
              type: "array",
              label: "Content listing layouts",
              labels: { singular: "Layout rule", plural: "Layout rules" },
              admin: {
                description:
                  "Add a rule per listing you want to control. Pick the surface and the card " +
                  "style. Any surface without a rule uses the default (vertical grid). Horizontal " +
                  "rows reveal the description on hover — the same interaction as About → Our Team.",
                initCollapsed: false,
              },
              fields: [
                {
                  type: "row",
                  fields: [
                    {
                      name: "surface",
                      type: "select",
                      label: "Listing",
                      required: true,
                      admin: { width: "60%" },
                      options: [...LAYOUT_SURFACES],
                    },
                    {
                      name: "style",
                      type: "select",
                      label: "Card style",
                      required: true,
                      defaultValue: "horizontal",
                      admin: { width: "40%" },
                      options: [
                        { label: "Vertical cards (grid)", value: "vertical" },
                        { label: "Horizontal rows (hover to reveal)", value: "horizontal" },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        /* ── Page intros (hero copy for index pages) ─────────────────── */
        {
          label: "Page intros",
          description:
            "Override the hero eyebrow / heading / lede on the built-in index pages. " +
            "Leave a field blank to keep that page's default copy.",
          fields: [
            {
              name: "pageIntros",
              type: "array",
              label: "Page intro overrides",
              labels: { singular: "Page intro", plural: "Page intros" },
              admin: {
                description: "Add a row for each index page you want to customise.",
                initCollapsed: false,
              },
              fields: [
                {
                  name: "page",
                  type: "select",
                  label: "Page",
                  required: true,
                  options: [...INTRO_PAGES],
                },
                {
                  name: "eyebrow",
                  type: "text",
                  admin: { description: "Small label above the heading." },
                },
                {
                  name: "heading",
                  type: "text",
                  admin: { description: "Main hero heading (H1)." },
                },
                {
                  name: "lede",
                  type: "textarea",
                  admin: { description: "Intro paragraph under the heading." },
                },
              ],
            },
          ],
        },
        /* ── GEO / AEO (AI engine optimisation) ──────────────────────── */
        {
          label: "GEO / AEO",
          description:
            "Authoritative facts for AI answer engines (ChatGPT, Claude, Perplexity, Google AI). " +
            "Everything here is emitted into /llms.txt. Use real, verifiable facts only — never " +
            "invent statistics, certifications or claims.",
          fields: [
            {
              name: "aiOverview",
              type: "textarea",
              label: "AI overview (structured prompt)",
              admin: {
                description:
                  "One authoritative paragraph describing Sustech for AI engines. Facts only — " +
                  "this becomes the lead context AI assistants cite when asked about the company.",
              },
            },
            {
              name: "keyFacts",
              type: "array",
              label: "Key facts",
              labels: { singular: "Fact", plural: "Facts" },
              admin: {
                description:
                  "Short, citable facts (e.g. 'Founded 2017', 'IEC 62305 / NFPA 780 lightning " +
                  "protection', 'Serves C&I clients across Bangladesh'). Verifiable only.",
              },
              fields: [{ name: "fact", type: "text", required: true }],
            },
            {
              name: "aiFaqs",
              type: "array",
              label: "AI FAQ (question & answer)",
              labels: { singular: "Q&A", plural: "Q&A pairs" },
              admin: {
                description:
                  "Common questions about Sustech with accurate answers. Added to /llms.txt so AI " +
                  "engines answer correctly. For an on-page FAQ with rich-result schema, use the " +
                  "FAQ block on a Page instead.",
              },
              fields: [
                { name: "question", type: "text", required: true },
                { name: "answer", type: "textarea", required: true },
              ],
            },
          ],
        },
        /* ── Chat & Engagement widgets ───────────────────────────────── */
        {
          label: "Chat & Engagement",
          fields: [
            /* WhatsApp ────────────────────────────────────────────── */
            {
              name: "whatsapp",
              type: "group",
              label: "WhatsApp Chat",
              admin: {
                description:
                  "Shows a floating WhatsApp button on every page. Leave the number blank to disable.",
              },
              fields: [
                {
                  name: "enabled",
                  type: "checkbox",
                  label: "Enable WhatsApp button",
                  defaultValue: false,
                },
                {
                  name: "number",
                  type: "text",
                  label: "WhatsApp number (international format)",
                  admin: {
                    condition: (_d, s) => Boolean(s?.enabled),
                    description: "Include country code, no spaces (e.g. 8801711000000).",
                  },
                },
                {
                  name: "prefilledMessage",
                  type: "text",
                  label: "Pre-filled message",
                  defaultValue: "Hello, I would like to get a quote.",
                  admin: {
                    condition: (_d, s) => Boolean(s?.enabled),
                    description: "Message pre-typed when the user opens WhatsApp.",
                  },
                },
                {
                  name: "position",
                  type: "select",
                  label: "Button position",
                  defaultValue: "bottom-right",
                  admin: { condition: (_d, s) => Boolean(s?.enabled) },
                  options: [
                    { label: "Bottom right (default)", value: "bottom-right" },
                    { label: "Bottom left", value: "bottom-left" },
                  ],
                },
              ],
            },
            /* Chatbot ─────────────────────────────────────────────── */
            {
              name: "chatbot",
              type: "group",
              label: "Web Chatbot",
              admin: {
                description:
                  "Deploy a chatbot widget. Choose between Hermes (your custom AI agent), " +
                  "Crisp (free live chat), or a custom embed script.",
              },
              fields: [
                {
                  name: "enabled",
                  type: "checkbox",
                  label: "Enable chatbot widget",
                  defaultValue: false,
                },
                {
                  name: "provider",
                  type: "select",
                  label: "Chatbot provider",
                  defaultValue: "hermes",
                  admin: {
                    condition: (_d, s) => Boolean(s?.enabled),
                    description:
                      "Hermes / n8n: your own open-ended AI assistant (recommended) — same brand widget, answers from your database with text + image support. Crisp: free live chat. Custom: paste any embed script.",
                  },
                  options: [
                    {
                      label: "Hermes — Sustech AI agent (recommended)",
                      value: "hermes",
                    },
                    {
                      label: "n8n — open-ended AI via secure proxy",
                      value: "n8n",
                    },
                    { label: "Crisp — free live chat + chatbot", value: "crisp" },
                    {
                      label: "Custom embed script",
                      value: "custom",
                    },
                  ],
                },
                /* Hermes config */
                {
                  name: "hermesWebhookUrl",
                  type: "text",
                  label: "Hermes webhook URL",
                  admin: {
                    condition: (_d, s) => s?.enabled && s?.provider === "hermes",
                    description:
                      "The /chat API endpoint of your Hermes agent. " +
                      "Leave blank to use the built-in /api/chat route.",
                  },
                },
                {
                  name: "hermesGreeting",
                  type: "text",
                  label: "Greeting message",
                  defaultValue: "Hello! I'm the Sustech AI assistant. How can I help you today?",
                  admin: {
                    condition: (_d, s) => s?.enabled && s?.provider === "hermes",
                  },
                },
                /* Crisp config */
                {
                  name: "crispWebsiteId",
                  type: "text",
                  label: "Crisp Website ID",
                  admin: {
                    condition: (_d, s) => s?.enabled && s?.provider === "crisp",
                    description:
                      "Find your Website ID in Crisp Dashboard → Settings → Website Settings.",
                  },
                },
                /* Custom embed */
                {
                  name: "customScript",
                  type: "textarea",
                  label: "Custom embed script",
                  admin: {
                    condition: (_d, s) => s?.enabled && s?.provider === "custom",
                    description:
                      "Paste the full <script> tag(s) from your chat provider. " +
                      "Script is injected into the page footer.",
                  },
                },
                {
                  name: "chatPosition",
                  type: "select",
                  label: "Widget position",
                  defaultValue: "bottom-right",
                  admin: {
                    condition: (_d, s) => Boolean(s?.enabled),
                  },
                  options: [
                    { label: "Bottom right (default)", value: "bottom-right" },
                    { label: "Bottom left", value: "bottom-left" },
                  ],
                },
              ],
            },
            /* Chatbot quick-reply config (used by the AI chat widget) */
            {
              name: "chatSuggestions",
              type: "array",
              label: "Chat starter suggestions",
              labels: { singular: "Suggestion", plural: "Suggestions" },
              admin: {
                description:
                  "Quick-reply chips shown when the chat opens. Leave empty to use the built-in " +
                  'defaults. "Get a quote" opens the quote form; others are sent as questions.',
              },
              fields: [{ name: "text", type: "text", required: true }],
            },
            {
              name: "quoteScales",
              type: "array",
              label: "Quote — project scale options",
              labels: { singular: "Scale", plural: "Scales" },
              admin: {
                description:
                  'Options in the chat quote form\'s "Project scale" dropdown. Leave empty to use ' +
                  "the built-in defaults.",
              },
              fields: [{ name: "text", type: "text", required: true }],
            },
          ],
        },
      ],
    },
  ],
};
