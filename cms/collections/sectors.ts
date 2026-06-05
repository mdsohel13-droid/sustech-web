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
    seoField,
  ],
};
