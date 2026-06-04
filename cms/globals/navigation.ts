import type { GlobalConfig } from "payload";
import { anyone, isAdmin } from "../access";
import { linkFields } from "../fields/link";
import { revalidateLayout } from "../hooks/revalidate";

export const Navigation: GlobalConfig = {
  slug: "navigation",
  label: "Navigation",
  admin: {
    group: "Settings",
    description: "The header and footer menus. Add, rename, reorder or remove tabs here — no code.",
  },
  access: { read: anyone, update: isAdmin },
  hooks: { afterChange: [revalidateLayout] },
  fields: [
    {
      name: "header",
      type: "array",
      label: "Header tabs",
      labels: { singular: "Tab", plural: "Tabs" },
      admin: {
        description: "Top-level tabs, left to right. A tab with children becomes a dropdown.",
      },
      fields: [
        ...linkFields,
        {
          name: "children",
          type: "array",
          label: "Dropdown items",
          labels: { singular: "Dropdown item", plural: "Dropdown items" },
          fields: [
            ...linkFields,
            {
              name: "description",
              type: "text",
              admin: { description: "Optional one-line description shown in the mega-menu." },
            },
          ],
        },
      ],
    },
    {
      name: "headerCta",
      type: "group",
      label: "Header call-to-action button",
      fields: linkFields,
    },
    {
      name: "footerColumns",
      type: "array",
      label: "Footer columns",
      labels: { singular: "Column", plural: "Columns" },
      fields: [
        { name: "title", type: "text", required: true },
        {
          name: "links",
          type: "array",
          labels: { singular: "Link", plural: "Links" },
          fields: linkFields,
        },
      ],
    },
  ],
};
