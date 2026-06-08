import type { GlobalConfig } from "payload";
import { anyone, isAdmin } from "../access";
import { revalidateLayout } from "../hooks/revalidate";

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
              name: "email",
              type: "email",
              required: true,
              admin: {
                description: "Primary contact email — shown in the footer and used in schema.",
              },
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
          ],
        },
      ],
    },
  ],
};
