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
  versions: { drafts: { autosave: { interval: 375 } }, maxPerDoc: 50 },
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
          admin: {
            width: "50%",
            description: "Imported drafts leave this blank — assign on review.",
          },
        },
        { name: "year", type: "number", admin: { width: "25%", step: 1 } },
        { name: "featured", type: "checkbox", admin: { width: "25%" } },
      ],
    },
    {
      name: "services",
      type: "relationship",
      relationTo: "services",
      hasMany: true,
      admin: { description: "Service lines delivered on this project." },
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
    {
      name: "scaleNote",
      type: "text",
      admin: {
        description: "Non-financial scale note (e.g. site size, count). Never a monetary value.",
      },
    },
    {
      name: "clientPublic",
      type: "checkbox",
      defaultValue: false,
      admin: {
        position: "sidebar",
        description: "Off = client stays anonymous on the site until the MD approves naming.",
      },
    },
    // Optional — Hermes writes the narrative; imported drafts leave it blank.
    { name: "summary", type: "textarea" },
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
    {
      type: "collapsible",
      label: "Import metadata (Hermes)",
      admin: {
        initCollapsed: true,
        description: "Set by the project importer. Helps de-duplicate and flags review TODOs.",
      },
      fields: [
        {
          name: "importKey",
          type: "text",
          index: true,
          admin: { readOnly: true, description: "Opaque, stable de-dup key from the source." },
        },
        {
          name: "importSource",
          type: "text",
          admin: {
            readOnly: true,
            description: "Which adapter produced this draft (excel / erp).",
          },
        },
        {
          name: "needsSectorReview",
          type: "checkbox",
          admin: { description: "Sector was not in the source — assign it before publishing." },
        },
        {
          name: "importNotes",
          type: "textarea",
          admin: { description: "Source service lines, proposed new service, and review TODOs." },
        },
      ],
    },
    seoField,
  ],
};
