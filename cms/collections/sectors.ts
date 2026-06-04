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
          defaultValue: "manufacturing",
          options: [
            { label: "Manufacturing", value: "manufacturing" },
            { label: "Power & utilities", value: "power" },
            { label: "Commercial", value: "commercial" },
            { label: "Ports & heavy industry", value: "ports" },
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
