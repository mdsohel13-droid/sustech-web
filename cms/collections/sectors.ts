import type { CollectionConfig } from "payload";
import { anyone, isAdminOrEditor } from "../access";
import { seoField } from "../fields/seo";
import { slugField } from "../fields/slug";
import { revalidateHome, revalidateHomeAfterDelete } from "../hooks/revalidate";

export const Sectors: CollectionConfig = {
  slug: "sectors",
  labels: { singular: "Sector", plural: "Sectors" },
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
          defaultValue: "garments",
          options: [
            { label: "Garments & RMG", value: "garments" },
            { label: "Government & Public Sector", value: "government" },
            { label: "NGO & UN Agencies", value: "ngo" },
            { label: "Industrial & Chemical", value: "industrial" },
            { label: "Ports & Logistics", value: "ports" },
            { label: "Healthcare", value: "healthcare" },
            { label: "Academic & TVET", value: "academic" },
            { label: "Food Processing", value: "food" },
            { label: "Commercial & Hospitality", value: "commercial" },
            { label: "Heritage & Cultural", value: "heritage" },
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
          "Optional uploaded icon (e.g. a 3D PNG with transparent background) shown on sector " +
          "tiles instead of the built-in line icon. Leave empty to keep the standard SVG.",
      },
    },
    { name: "summary", type: "textarea", required: true },
    {
      name: "challenges",
      type: "richText",
      admin: { description: "Sector challenges → how Sustech solves them." },
    },
    {
      name: "services",
      type: "relationship",
      relationTo: "services",
      hasMany: true,
      admin: { description: "Relevant services for this sector." },
    },
    // --- World-class funnel (plan 3·1): quantified proof, testimonial, gated lead
    //     magnet, FAQ (→ FAQPage schema), tailored CTA. Logos are pulled from the
    //     Clients collection via each client's own "sectors" relationship.
    {
      name: "proofStats",
      type: "array",
      maxRows: 4,
      labels: { singular: "Proof figure", plural: "Proof figures" },
      admin: {
        description:
          "Quantified proof for THIS sector, e.g. 12 · factories powered, 4.2 · MWp on textile " +
          "roofs. Any figure left at 0 is hidden automatically — the page never shows '0'.",
      },
      fields: [
        {
          type: "row",
          fields: [
            { name: "value", type: "number", required: true, admin: { width: "34%", step: 1 } },
            {
              name: "suffix",
              type: "text",
              admin: { width: "26%", description: "e.g. +, MWp, %" },
            },
            { name: "label", type: "text", required: true, admin: { width: "40%" } },
          ],
        },
      ],
    },
    {
      name: "testimonials",
      type: "relationship",
      relationTo: "testimonials",
      hasMany: true,
      maxRows: 2,
      admin: { description: "1–2 testimonials to feature on this sector page." },
    },
    {
      name: "leadMagnet",
      type: "relationship",
      relationTo: "knowledge-resources",
      admin: {
        description:
          "Optional gated download for this sector (e.g. an RMG electrical-compliance " +
          "checklist). Pick a knowledge resource that has a file + a gate; visitors exchange " +
          "their email to download it, which captures a sector-tagged lead.",
      },
    },
    {
      name: "faqs",
      type: "array",
      maxRows: 6,
      labels: { singular: "Q&A", plural: "Q&As" },
      admin: {
        description:
          "4–6 sector questions & answers. Rendered on the page AND emitted as FAQPage " +
          "structured data so AI answer engines can cite Sustech.",
      },
      fields: [
        { name: "question", type: "text", required: true },
        { name: "answer", type: "textarea", required: true },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "ctaHeading",
          type: "text",
          admin: { width: "50%", description: "Optional — overrides the default CTA heading." },
        },
        {
          name: "ctaLede",
          type: "text",
          admin: { width: "50%", description: "Optional — overrides the default CTA sub-text." },
        },
      ],
    },
    seoField,
  ],
};
