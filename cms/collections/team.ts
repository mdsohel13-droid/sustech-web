import type { CollectionConfig } from "payload";
import { anyone, isAdminOrEditor } from "../access";
import { revalidateHome, revalidateHomeAfterDelete } from "../hooks/revalidate";

export const Team: CollectionConfig = {
  slug: "team",
  labels: { singular: "Team member", plural: "Team" },
  admin: {
    useAsTitle: "name",
    group: "Content",
    defaultColumns: ["name", "role", "order"],
    description: "Leadership and key people, shown via the Team block on pages like About.",
  },
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
  defaultSort: "order",
  fields: [
    {
      type: "row",
      fields: [
        { name: "name", type: "text", required: true, admin: { width: "50%" } },
        {
          name: "role",
          type: "text",
          required: true,
          admin: { width: "50%", description: "e.g. Managing Director, Head of Engineering." },
        },
      ],
    },
    {
      name: "category",
      type: "select",
      label: "Group",
      defaultValue: "leadership",
      options: [
        { label: "Leadership", value: "leadership" },
        { label: "Management", value: "management" },
        { label: "Engineering", value: "engineering" },
        { label: "Consultant", value: "consultant" },
        { label: "Advisor", value: "advisor" },
        { label: "Other", value: "other" },
      ],
      admin: {
        position: "sidebar",
        description:
          "Which group this person belongs to. The Team block can show one group at a time.",
      },
    },
    {
      name: "photo",
      type: "upload",
      relationTo: "media",
      admin: { description: "Headshot. Square images look best." },
    },
    {
      name: "bio",
      type: "textarea",
      admin: { description: "Short professional bio (2–3 sentences). Real details only." },
    },
    {
      name: "order",
      type: "number",
      admin: { position: "sidebar", step: 1, description: "Lower numbers appear first." },
    },
  ],
};
