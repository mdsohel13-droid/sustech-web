import type { Field } from "payload";

/** Per-document SEO overrides. Empty fields fall back to SiteSettings defaults. */
export const seoField: Field = {
  name: "seo",
  type: "group",
  label: "SEO",
  admin: { description: "Search & social. Leave blank to use the site defaults." },
  fields: [
    {
      type: "row",
      fields: [
        {
          name: "title",
          type: "text",
          admin: { width: "50%", description: "Overrides the page/site title." },
        },
        {
          name: "canonical",
          type: "text",
          admin: { width: "50%", description: "Canonical URL (advanced; usually leave blank)." },
        },
      ],
    },
    {
      name: "description",
      type: "textarea",
      admin: { description: "~150–160 characters. Shown in search results and link previews." },
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      admin: { description: "Social share image (Open Graph), 1200×630." },
    },
    {
      name: "noindex",
      type: "checkbox",
      label: "Hide this page from search engines",
    },
  ],
};
