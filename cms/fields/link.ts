import type { Field } from "payload";

type Condition = (data: unknown, siblingData: Record<string, unknown>) => boolean;
const isPage: Condition = (_d, s) => s?.type === "page";
const isCustom: Condition = (_d, s) => s?.type === "custom";

/** The shared fields for a single link (used by nav items and CTAs). */
export const linkFields: Field[] = [
  {
    name: "label",
    type: "text",
    required: true,
  },
  {
    name: "type",
    type: "radio",
    defaultValue: "page",
    options: [
      { label: "Internal page", value: "page" },
      { label: "Custom URL", value: "custom" },
    ],
    admin: { layout: "horizontal" },
  },
  {
    name: "page",
    type: "relationship",
    relationTo: "pages",
    admin: { condition: isPage, description: "Pick a page — its URL is always kept in sync." },
  },
  {
    name: "url",
    type: "text",
    admin: { condition: isCustom, description: "e.g. https://… or /a/known/path" },
  },
  {
    name: "newTab",
    type: "checkbox",
    label: "Open in a new tab",
  },
];

/** A CTA button = a link + a visual style. */
export const ctaArray: Field = {
  name: "ctas",
  type: "array",
  label: "Call-to-action buttons",
  maxRows: 2,
  fields: [
    ...linkFields,
    {
      name: "style",
      type: "select",
      defaultValue: "primary",
      options: [
        { label: "Primary (solar amber)", value: "primary" },
        { label: "Secondary (outline)", value: "secondary" },
      ],
    },
  ],
};
