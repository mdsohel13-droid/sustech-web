import type { CollectionConfig } from "payload";
import { anyone, isAdminOrEditor } from "../access";
import { revalidateHome, revalidateHomeAfterDelete } from "../hooks/revalidate";

export const Clients: CollectionConfig = {
  slug: "clients",
  labels: { singular: "Client", plural: "Clients" },
  admin: { useAsTitle: "name", group: "Content", defaultColumns: ["name", "order"] },
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
    { name: "name", type: "text", required: true },
    {
      name: "logo",
      type: "upload",
      relationTo: "media",
      admin: { description: "Client logo (transparent PNG/SVG). Powers the logo wall." },
    },
    {
      type: "row",
      fields: [
        {
          name: "sectors",
          type: "relationship",
          relationTo: "sectors",
          hasMany: true,
          admin: { width: "50%", description: "Used to show relevant logos on sector pages." },
        },
        { name: "order", type: "number", admin: { width: "50%", step: 1 } },
      ],
    },
    { name: "url", type: "text", admin: { description: "Optional link to the client's website." } },
  ],
};
