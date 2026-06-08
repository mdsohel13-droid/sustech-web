/**
 * Partners — technology, distribution, channel and strategic partners.
 * Pre-built for the admin; powers a future "partners wall" without a schema change.
 */
import type { CollectionConfig } from "payload";
import { anyone, isAdminOrEditor } from "../access";

export const Partners: CollectionConfig = {
  slug: "partners",
  labels: { singular: "Partner", plural: "Partners" },
  admin: {
    useAsTitle: "name",
    group: "Company",
    defaultColumns: ["name", "type", "order"],
    description: "Technology, distribution and channel partners.",
  },
  access: {
    read: anyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  defaultSort: "order",
  fields: [
    { name: "name", type: "text", required: true },
    {
      name: "logo",
      type: "upload",
      relationTo: "media",
      admin: { description: "Partner logo (transparent PNG)." },
    },
    {
      name: "type",
      type: "select",
      defaultValue: "technology",
      options: [
        { label: "Technology partner", value: "technology" },
        { label: "Distribution partner", value: "distribution" },
        { label: "Channel partner", value: "channel" },
        { label: "Strategic partner", value: "strategic" },
      ],
    },
    { name: "description", type: "textarea" },
    {
      name: "url",
      type: "text",
      admin: { description: "Optional link to the partner's website." },
    },
    { name: "order", type: "number", defaultValue: 10, admin: { step: 1 } },
  ],
};
