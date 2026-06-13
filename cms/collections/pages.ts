import type { CollectionConfig } from "payload";
import { isAdminOrEditor, isContentWriter, readPublished } from "../access";
import { layoutBlocks } from "../blocks";
import { seoField } from "../fields/seo";
import { slugField } from "../fields/slug";
import { denyHermesPublish } from "../hooks/deny-hermes-publish";
import { revalidatePages, revalidatePagesAfterDelete } from "../hooks/revalidate";
import { pagePath, previewUrl, serverUrl } from "../utils/preview";

export const Pages: CollectionConfig = {
  slug: "pages",
  labels: { singular: "Page", plural: "Pages" },
  admin: {
    useAsTitle: "title",
    group: "Content",
    defaultColumns: ["title", "slug", "_status", "updatedAt"],
    description: "Every page on the site. Stack blocks in 'Page sections' to build the layout.",
    livePreview: { url: ({ data }) => `${serverUrl}${pagePath(data?.slug as string)}` },
    preview: (doc) => previewUrl(pagePath((doc as { slug?: string })?.slug)),
  },
  access: {
    read: readPublished,
    create: isContentWriter,
    update: isContentWriter,
    delete: isAdminOrEditor,
  },
  versions: {
    drafts: { autosave: { interval: 375 }, schedulePublish: true },
    maxPerDoc: 20,
  },
  hooks: {
    beforeChange: [denyHermesPublish],
    afterChange: [revalidatePages],
    afterDelete: [revalidatePagesAfterDelete],
  },
  fields: [
    { name: "title", type: "text", required: true },
    slugField(),
    {
      name: "layout",
      type: "blocks",
      label: "Page sections",
      labels: { singular: "Section", plural: "Sections" },
      blocks: layoutBlocks,
      admin: { initCollapsed: true },
    },
    seoField,
    {
      name: "showInNav",
      type: "checkbox",
      admin: {
        position: "sidebar",
        description: "Hint only — the live menu is controlled by Settings → Navigation.",
      },
    },
    {
      name: "segment",
      type: "select",
      options: [
        { label: "— none —", value: "none" },
        { label: "Foreign investor", value: "foreign-investor" },
        { label: "RMG factory", value: "rmg-factory" },
        { label: "Real estate developer", value: "real-estate" },
        { label: "Commercial building", value: "commercial-building" },
        { label: "Bank / financial", value: "bank-financial" },
      ],
      defaultValue: "none",
      admin: {
        position: "sidebar",
        description:
          "Tags this as a segment landing page. Powers next-best-action targeting and lead attribution.",
      },
    },
  ],
};
