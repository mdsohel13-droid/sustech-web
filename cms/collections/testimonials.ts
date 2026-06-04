import type { CollectionConfig } from "payload";
import { anyone, isAdminOrEditor } from "../access";
import { revalidateHome, revalidateHomeAfterDelete } from "../hooks/revalidate";

export const Testimonials: CollectionConfig = {
  slug: "testimonials",
  labels: { singular: "Testimonial", plural: "Testimonials" },
  admin: { useAsTitle: "person", group: "Content", defaultColumns: ["person", "company"] },
  access: {
    read: anyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  hooks: {
    afterChange: [revalidateHome],
    afterDelete: [revalidateHomeAfterDelete],
  },
  fields: [
    { name: "quote", type: "textarea", required: true },
    {
      type: "row",
      fields: [
        { name: "person", type: "text", required: true, admin: { width: "50%" } },
        { name: "role", type: "text", admin: { width: "50%" } },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "company", type: "text", required: true, admin: { width: "50%" } },
        {
          name: "logo",
          type: "upload",
          relationTo: "media",
          admin: { width: "50%", description: "Optional company logo." },
        },
      ],
    },
  ],
};
