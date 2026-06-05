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
            { name: "email", type: "email" },
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
      ],
    },
  ],
};
