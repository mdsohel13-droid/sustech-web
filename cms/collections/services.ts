import type { CollectionConfig } from "payload";
import { anyone, isAdminOrEditor } from "../access";
import { seoField } from "../fields/seo";
import { slugField } from "../fields/slug";
import { revalidateHome, revalidateHomeAfterDelete } from "../hooks/revalidate";

export const Services: CollectionConfig = {
  slug: "services",
  labels: { singular: "Service", plural: "Services" },
  admin: { useAsTitle: "title", group: "Content", defaultColumns: ["title", "slug", "order"] },
  access: {
    read: anyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  defaultSort: "order",
  hooks: {
    afterChange: [revalidateHome],
    afterDelete: [revalidateHomeAfterDelete],
  },
  fields: [
    { name: "title", type: "text", required: true },
    slugField(),
    {
      type: "row",
      fields: [
        {
          name: "icon",
          type: "select",
          required: true,
          defaultValue: "solar",
          options: [
            { label: "Solar / Renewable", value: "solar" },
            { label: "BESS / Storage", value: "bess" },
            { label: "Lightning / Earthing", value: "lps" },
            { label: "Electrical / EPC", value: "electrical" },
            { label: "Inspection / Testing", value: "inspection" },
            { label: "Substation / HV", value: "substation" },
            { label: "Fire & Safety", value: "fire" },
            { label: "Lighting / Products", value: "lighting" },
            { label: "Training", value: "training" },
            { label: "Consultancy", value: "consultancy" },
          ],
          admin: { width: "50%" },
        },
        { name: "order", type: "number", admin: { width: "50%", step: 1 } },
      ],
    },
    {
      name: "customIcon",
      type: "upload",
      relationTo: "media",
      label: "Custom icon (image)",
      admin: {
        description:
          "Optional uploaded icon (e.g. a 3D PNG with transparent background) shown on service " +
          "cards instead of the built-in line icon. Leave empty to keep the standard SVG. " +
          "`pnpm icons:3d` pre-loads an MIT-licensed 3D set.",
      },
    },
    {
      name: "summary",
      type: "textarea",
      required: true,
      admin: { description: "One-line outcome shown on cards and grids." },
    },
    {
      name: "heroImage",
      type: "upload",
      relationTo: "media",
      admin: {
        description:
          "Hero image used at the top of the service page. Wide 3:2 or 16:9 ratio works best.",
      },
    },
    {
      type: "row",
      fields: [
        {
          name: "explainerVideo",
          type: "upload",
          relationTo: "media",
          admin: {
            width: "50%",
            description:
              "Optional 8–15s MP4 — autoplays muted in a loop on the service page. Use a poster image (below) for the still frame.",
          },
        },
        {
          name: "explainerPoster",
          type: "upload",
          relationTo: "media",
          admin: {
            width: "50%",
            description:
              "Poster frame for the explainer video (still image shown before/while it loads, and to reduced-motion users).",
          },
        },
      ],
    },
    { name: "scope", type: "richText", admin: { description: "Scope of work — what's included." } },
    {
      name: "standards",
      type: "richText",
      admin: { description: "Standards & methodology (IEC / BNBC / NFPA references)." },
    },
    {
      name: "faq",
      type: "array",
      labels: { singular: "Q&A", plural: "FAQ" },
      fields: [
        { name: "question", type: "text", required: true },
        { name: "answer", type: "textarea", required: true },
      ],
    },
    seoField,
  ],
};
