import type { CollectionConfig } from "payload";
import { anyone, isAdminOrEditor } from "../access";
import { seoField } from "../fields/seo";
import { slugField } from "../fields/slug";
import { revalidateHome, revalidateHomeAfterDelete } from "../hooks/revalidate";

/**
 * Products & distribution catalogue (brief Part 12 §6). Examples: Atomberg fan, Growatt inverter,
 * Hithium BESS, UFO high-bay, solar street light, fire detection panel. Light-weight schema —
 * a card-level showcase, not a full e-commerce model (CLAUDE.md §6 forbids retail/cart).
 */
export const Products: CollectionConfig = {
  slug: "products",
  labels: { singular: "Product", plural: "Products" },
  admin: {
    useAsTitle: "title",
    group: "Content",
    defaultColumns: ["title", "brand", "category", "featured", "order"],
    description:
      "Products & distribution showcase — the cards rendered by the Product Showcase block.",
  },
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
          name: "brand",
          type: "text",
          admin: { width: "50%", description: "e.g. Atomberg, Growatt, Hithium." },
        },
        {
          name: "category",
          type: "select",
          required: true,
          defaultValue: "energy",
          options: [
            { label: "Energy efficiency", value: "energy" },
            { label: "Solar & storage", value: "solar" },
            { label: "Lighting", value: "lighting" },
            { label: "Safety & fire", value: "safety" },
            { label: "Power & control", value: "power" },
          ],
          admin: { width: "50%" },
        },
      ],
    },
    {
      name: "summary",
      type: "textarea",
      required: true,
      admin: { description: "One-line outcome shown on the product card." },
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      required: true,
      admin: { description: "Card image. 3:2 product photography looks best." },
    },
    {
      type: "row",
      fields: [
        { name: "featured", type: "checkbox", admin: { width: "33%" } },
        { name: "order", type: "number", admin: { width: "33%", step: 1 } },
        {
          name: "externalUrl",
          type: "text",
          admin: { width: "34%", description: "Optional — partner site or datasheet." },
        },
      ],
    },
    { name: "details", type: "richText", admin: { description: "Optional — longer-form copy." } },
    seoField,
  ],
};
