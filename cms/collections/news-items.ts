/**
 * NewsItems collection — daily fresh content managed by Hermes AI agent
 * and/or the editorial team.
 *
 * Categories:
 *   company-update  — Sustech news: new projects, certifications, team updates
 *   industry-news   — Solar/EPC/electrical industry news, Bangladesh energy sector
 *   product-update  — Equipment, technology, product line updates
 *   ai-tech         — AI & emerging tech relevant to EPC and smart buildings
 *   market-insight  — Market analysis, policy, incentive updates
 *
 * Publishing model:
 *   - Hermes (service account) can only create DRAFTS — enforced by denyHermesPublish hook.
 *   - Admins/Editors review and click Publish. Takes ~30 seconds.
 *   - Auto-publish opt-in: set HERMES_AUTO_PUBLISH_CATEGORIES env var on the server
 *     (comma-separated: "industry-news,ai-tech") — the /api/hermes/ingest route will
 *     publish directly for those categories only.
 *
 * GEO/AEO:
 *   - summary (excerpt) = the direct answer — used in NewsArticle schema and llms.txt
 *   - faq array = FAQPage schema, highest-citability signal for AI engines
 *   - body = full explanation and supporting detail
 */
import type { CollectionConfig } from "payload";
import { isAdminOrEditor, isContentWriter, readPublished } from "../access";
import { citationsField, claimsField } from "../fields/citations";
import { revisionMetaField } from "../fields/revision-meta";
import { seoField } from "../fields/seo";
import { slugField } from "../fields/slug";
import { citationGuard } from "../hooks/citation-guard";
import { denyHermesPublish } from "../hooks/deny-hermes-publish";
import { revalidateCollectionRoute, revalidateHomeAfterDelete } from "../hooks/revalidate";

export const NEWS_CATEGORIES = [
  { label: "Company Update", value: "company-update" },
  { label: "Industry News", value: "industry-news" },
  { label: "Product Update", value: "product-update" },
  { label: "AI & Technology", value: "ai-tech" },
  { label: "Market Insight", value: "market-insight" },
] as const;

export type NewsCategory = (typeof NEWS_CATEGORIES)[number]["value"];

export const NewsItems: CollectionConfig = {
  slug: "news-items",
  labels: { singular: "News Item", plural: "News & Updates" },
  admin: {
    useAsTitle: "title",
    group: "Content",
    defaultColumns: ["title", "category", "publishedDate", "source", "_status"],
    description:
      "Daily news feed — updated by the Hermes AI agent and/or editorial team. Lives at /news/[slug].",
  },
  access: {
    read: readPublished,
    create: isContentWriter, // Hermes + admins/editors
    update: isContentWriter,
    delete: isAdminOrEditor,
  },
  versions: { drafts: { autosave: { interval: 375 } }, maxPerDoc: 50 },
  hooks: {
    beforeValidate: [citationGuard],
    beforeChange: [denyHermesPublish],
    afterChange: [revalidateCollectionRoute("/news")],
    afterDelete: [revalidateHomeAfterDelete],
  },
  fields: [
    // ── Core fields ───────────────────────────────────────────────────────
    { name: "title", type: "text", required: true },
    slugField(),
    {
      type: "row",
      fields: [
        {
          name: "category",
          type: "select",
          required: true,
          defaultValue: "industry-news",
          options: [...NEWS_CATEGORIES],
          admin: { width: "50%" },
        },
        {
          name: "publishedDate",
          type: "date",
          admin: {
            width: "50%",
            description: "Defaults to today. Used for ordering in the news feed.",
          },
        },
      ],
    },

    // ── GEO/AEO: The direct answer ─────────────────────────────────────
    {
      name: "summary",
      type: "textarea",
      required: true,
      admin: {
        description:
          "TL;DR — the direct answer in 1–2 sentences. " +
          "AI engines pull this as the short answer citation. Make it specific and factual.",
      },
    },

    // ── Body (full article) ───────────────────────────────────────────
    {
      name: "body",
      type: "richText",
      required: true,
      admin: {
        description: "Full article. Lead with the most important fact, then explain.",
      },
    },

    // ── Hero image ────────────────────────────────────────────────────
    {
      name: "heroImage",
      type: "upload",
      relationTo: "media",
      admin: { description: "Optional featured image (16:9 recommended)." },
    },

    // ── Source attribution (for curated/aggregated news) ─────────────
    {
      type: "row",
      fields: [
        {
          name: "source",
          type: "text",
          label: "Source name",
          admin: {
            width: "50%",
            description:
              'e.g. "The Daily Star", "Solar Power World". Leave blank for original content.',
          },
        },
        {
          name: "sourceUrl",
          type: "text",
          label: "Source URL",
          admin: { width: "50%", description: "Original article URL (if curated)." },
        },
      ],
    },

    // ── Tags ──────────────────────────────────────────────────────────
    {
      name: "tags",
      type: "array",
      labels: { singular: "Tag", plural: "Tags" },
      admin: { description: "Keywords: solar, earthing, BESS, Bangladesh, etc." },
      fields: [{ name: "tag", type: "text", required: true }],
    },

    // ── Citations (structured sources behind any numbers) ─────────────
    citationsField,
    claimsField,

    // ── GEO/AEO: FAQ (generates FAQPage schema) ───────────────────────
    {
      name: "faq",
      type: "array",
      labels: { singular: "Q&A", plural: "FAQ" },
      admin: {
        description:
          "Questions & answers related to this news. Each Q&A becomes FAQPage schema — " +
          "the single highest-citability signal for AI engines. Add 2–5 per article.",
      },
      fields: [
        { name: "question", type: "text", required: true },
        { name: "answer", type: "textarea", required: true },
      ],
    },

    // ── SEO ───────────────────────────────────────────────────────────
    seoField,

    // ── Pipeline / revision state ─────────────────────────────────────
    revisionMetaField,

    // ── Hermes metadata (for audit trail) ────────────────────────────
    {
      name: "agentMeta",
      type: "group",
      label: "Agent metadata",
      admin: {
        description: "Set automatically by Hermes. Do not edit manually.",
        condition: (_, siblingData) => Boolean(siblingData?.agentMeta?.generatedBy),
      },
      fields: [
        {
          name: "generatedBy",
          type: "text",
          label: "Generated by",
          admin: { readOnly: true },
        },
        {
          name: "model",
          type: "text",
          label: "AI model used",
          admin: { readOnly: true },
        },
        {
          name: "sourceUrls",
          type: "textarea",
          label: "Source URLs used in generation",
          admin: { readOnly: true },
        },
        {
          name: "generatedAt",
          type: "date",
          label: "Generated at",
          admin: { readOnly: true },
        },
      ],
    },
  ],
};
