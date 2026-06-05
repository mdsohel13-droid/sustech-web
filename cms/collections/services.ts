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
      name: "summary",
      type: "textarea",
      required: true,
      admin: { description: "One-line outcome shown on cards and grids." },
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
