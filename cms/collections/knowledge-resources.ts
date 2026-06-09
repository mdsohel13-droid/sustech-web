/**
 * KnowledgeResources collection — interactive calculators and sample documents
 * shown in the /knowledge page under dedicated tabs.
 *
 * Admins can:
 *   - Enable/disable individual calculators or sample documents without a deploy
 *   - Set display order
 *   - Link sample documents by external URL or direct upload
 *
 * Calculator types map to built-in client components (code must be deployed to
 * add a new calc type, but admins can toggle existing ones on/off and reorder).
 */
import type { CollectionConfig } from "payload";
import { isAdminOrEditor, readEnabled } from "../access";
import { slugField } from "../fields/slug";
import { revalidateCollectionRoute } from "../hooks/revalidate";

export const CALC_TYPES = [
  { label: "Solar ROI / Payback Period", value: "solar-roi" },
  { label: "Earthing Resistance — Single Rod (Dwight)", value: "earthing-resistance" },
  { label: "Cable Sizing — Voltage Drop Method", value: "cable-sizing" },
  { label: "Lightning Protection Zone (IEC 62305 Rolling Sphere)", value: "lightning-zone" },
  { label: "Solar Energy Yield Estimate", value: "solar-yield" },
] as const;

export type CalcType = (typeof CALC_TYPES)[number]["value"];

export const FILE_FORMATS = [
  { label: "PDF", value: "pdf" },
  { label: "Word (DOCX)", value: "docx" },
  { label: "Excel (XLSX)", value: "xlsx" },
  { label: "Image (PNG / JPG)", value: "image" },
  { label: "ZIP", value: "zip" },
  { label: "Other", value: "other" },
] as const;

export const OPEN_MODES = [
  { label: "View + Download (both)", value: "both" },
  { label: "View in browser only", value: "view" },
  { label: "Download only", value: "download" },
] as const;

export const KnowledgeResources: CollectionConfig = {
  slug: "knowledge-resources",
  labels: { singular: "Knowledge Resource", plural: "Knowledge Resources" },
  admin: {
    useAsTitle: "title",
    group: "Content",
    defaultColumns: ["title", "type", "calcType", "enabled", "order"],
    description:
      "Calculators and sample documents shown in the Knowledge Hub. " +
      "Toggle enabled/disabled without a code deploy.",
  },
  access: {
    read: readEnabled,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  hooks: {
    afterChange: [revalidateCollectionRoute("/knowledge")],
  },
  fields: [
    // ── Core ──────────────────────────────────────────────────────────────
    { name: "title", type: "text", required: true },
    slugField(),

    {
      name: "type",
      type: "select",
      required: true,
      options: [
        { label: "⚙️  Calculator (interactive, built-in)", value: "calculator" },
        { label: "📄  Sample Document (download / link)", value: "sample" },
      ],
      admin: {
        description:
          "Calculator = built-in interactive tool. Sample = downloadable document or link.",
      },
    },

    {
      name: "description",
      type: "textarea",
      admin: {
        description: "Short description shown on the resource card (1–2 sentences).",
      },
    },

    {
      type: "row",
      fields: [
        {
          name: "order",
          type: "number",
          defaultValue: 10,
          admin: {
            width: "33%",
            description: "Display order within the tab. Lower numbers appear first.",
          },
        },
        {
          name: "enabled",
          type: "checkbox",
          defaultValue: true,
          admin: {
            width: "33%",
            description: "Tick to show in the Knowledge Hub. Untick to hide without deleting.",
          },
        },
      ],
    },

    // ── Calculator-specific fields ─────────────────────────────────────────
    {
      name: "calcType",
      type: "select",
      label: "Calculator type",
      options: [...CALC_TYPES],
      admin: {
        condition: (data) => data?.type === "calculator",
        description:
          "Which built-in calculator to render. " + "New calc types require a developer deploy.",
      },
    },

    // ── Sample document fields ─────────────────────────────────────────────
    {
      name: "fileUpload",
      type: "upload",
      relationTo: "media",
      label: "Upload document",
      admin: {
        condition: (data) => data?.type === "sample",
        description:
          "Upload PDF, DOCX, or XLSX directly. If the file is large or already hosted " +
          "elsewhere, use the External URL field below instead.",
      },
    },
    {
      name: "fileUrl",
      type: "text",
      label: "External document URL (alternative to upload)",
      admin: {
        condition: (data) => data?.type === "sample",
        description:
          "Google Drive link, SharePoint URL, or any direct download link. " +
          "Leave blank if you uploaded the file above.",
      },
    },
    {
      type: "row",
      fields: [
        {
          name: "fileSize",
          type: "text",
          label: "File size",
          admin: {
            width: "50%",
            condition: (data) => data?.type === "sample",
            description: 'Human-readable size, e.g. "420 KB" or "1.2 MB".',
          },
        },
        {
          name: "fileFormat",
          type: "select",
          label: "File format",
          options: [...FILE_FORMATS],
          admin: {
            width: "50%",
            condition: (data) => data?.type === "sample",
          },
        },
      ],
    },
    {
      name: "openMode",
      type: "select",
      label: "How visitors can open this file",
      defaultValue: "both",
      options: [...OPEN_MODES],
      admin: {
        condition: (data) => data?.type === "sample",
        description:
          "View opens the file in the browser (PDFs and images render inline); " +
          "Download saves it to the visitor's device. Choose one or both.",
      },
    },
    {
      name: "downloadLabel",
      type: "text",
      label: "Download button label",
      defaultValue: "Download",
      admin: {
        condition: (data) => data?.type === "sample",
        description: 'Text on the download button. Default: "Download".',
      },
    },
  ],
};
