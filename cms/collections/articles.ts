import type { CollectionConfig } from "payload";
import { isAdminOrEditor, isContentWriter, readPublished } from "../access";
import { categoryField, citationsField, claimsField } from "../fields/citations";
import { seoField } from "../fields/seo";
import { slugField } from "../fields/slug";
import { citationGuard } from "../hooks/citation-guard";
import { denyHermesPublish } from "../hooks/deny-hermes-publish";
import { revalidateCollectionRoute, revalidateHomeAfterDelete } from "../hooks/revalidate";

export const Articles: CollectionConfig = {
  slug: "articles",
  labels: { singular: "Article", plural: "Articles" },
  admin: {
    useAsTitle: "title",
    group: "Content",
    defaultColumns: ["title", "author", "publishedDate", "_status"],
    description: "Knowledge hub. Lives at /knowledge/[slug].",
  },
  access: {
    read: readPublished,
    create: isContentWriter,
    update: isContentWriter,
    delete: isAdminOrEditor,
  },
  versions: { drafts: { autosave: { interval: 375 } }, maxPerDoc: 20 },
  hooks: {
    beforeValidate: [citationGuard],
    beforeChange: [denyHermesPublish],
    afterChange: [revalidateCollectionRoute("/knowledge")],
    afterDelete: [revalidateHomeAfterDelete],
  },
  fields: [
    { name: "title", type: "text", required: true },
    slugField(),
    {
      type: "row",
      fields: [
        { name: "author", type: "text", admin: { width: "50%" } },
        { name: "publishedDate", type: "date", admin: { width: "50%" } },
      ],
    },
    {
      name: "excerpt",
      type: "textarea",
      admin: { description: "TL;DR / answer shown up top and in listings." },
    },
    { name: "body", type: "richText", required: true },
    citationsField,
    claimsField,
    {
      name: "faq",
      type: "array",
      labels: { singular: "Q&A", plural: "FAQ" },
      fields: [
        { name: "question", type: "text", required: true },
        { name: "answer", type: "textarea", required: true },
      ],
    },
    categoryField,
    seoField,
  ],
};
