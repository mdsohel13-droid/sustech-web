import type { CollectionConfig } from "payload";
import { isAdminOrEditor, isContentWriter, readPublished } from "../access";
import { seoField } from "../fields/seo";
import { slugField } from "../fields/slug";
import { denyHermesPublish } from "../hooks/deny-hermes-publish";
import { revalidateCollectionRoute, revalidateHomeAfterDelete } from "../hooks/revalidate";

export const Projects: CollectionConfig = {
  slug: "projects",
  labels: { singular: "Project", plural: "Projects" },
  admin: {
    useAsTitle: "name",
    group: "Content",
    defaultColumns: ["name", "sector", "year", "featured", "_status"],
    description: "Case studies. Hermes can draft these from ERP data; an admin/editor publishes.",
  },
  access: {
    read: readPublished,
    create: isContentWriter,
    update: isContentWriter,
    delete: isAdminOrEditor,
  },
  versions: { drafts: { autosave: { interval: 375 } }, maxPerDoc: 20 },
  hooks: {
    beforeChange: [denyHermesPublish],
    afterChange: [revalidateCollectionRoute("/projects")],
    afterDelete: [revalidateHomeAfterDelete],
  },
  fields: [
    { name: "name", type: "text", required: true },
    slugField("name"),
    {
      type: "row",
      fields: [
        {
          name: "sector",
          type: "relationship",
          relationTo: "sectors",
          admin: { width: "50%" },
        },
        { name: "year", type: "number", admin: { width: "25%", step: 1 } },
        { name: "featured", type: "checkbox", admin: { width: "25%" } },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "location", type: "text", admin: { width: "50%" } },
        {
          name: "capacity",
          type: "text",
          admin: { width: "50%", description: "e.g. 2.5 MWp, 1× 2500 kVA substation." },
        },
      ],
    },
    { name: "summary", type: "textarea", required: true },
    {
      type: "collapsible",
      label: "Challenge → Solution → Outcome",
      fields: [
        { name: "challenge", type: "richText" },
        { name: "solution", type: "richText" },
        { name: "outcome", type: "richText" },
      ],
    },
    {
      name: "gallery",
      type: "array",
      labels: { singular: "Photo", plural: "Gallery" },
      fields: [{ name: "image", type: "upload", relationTo: "media", required: true }],
    },
    { name: "client", type: "relationship", relationTo: "clients" },
    seoField,
  ],
};
