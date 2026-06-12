import type { CollectionConfig } from "payload";
import { isAdminOrEditor } from "../access";

/**
 * Leads — the canonical store for every consented hand-raiser (Lead Engine
 * master plan §3.3 / Phase 1). One row per person (deduped by lowercased
 * email; phone-only leads dedupe by phone). Fed by: RFQ submissions
 * (afterChange hook on rfq-requests), the chat widget, calculators and gated
 * assets (captureLead server action), and the GrowthOS promotion door
 * (POST /api/leads/ingest — consent fields force-stripped there).
 *
 * Privacy: this collection and rfq-requests are the ONLY places PII lives on
 * the web tier. Admin-only access; the public REST/GraphQL API can neither
 * read nor write it. Raw emails never leave this box — the suppression feed
 * (/api/leads/suppression-hashes) exports SHA-256 hashes only.
 *
 * Consent: `marketingOptIn` is set ONLY by an explicit, unticked checkbox the
 * visitor ticked themselves, then confirmed via double opt-in. A cold-email
 * reply or an outbound promotion is correspondence, not consent — the ingest
 * route strips consent fields server-side regardless of payload.
 */
export const Leads: CollectionConfig = {
  slug: "leads",
  labels: { singular: "Lead", plural: "Leads" },
  admin: {
    useAsTitle: "displayName",
    group: "Leads",
    defaultColumns: ["displayName", "segment", "source", "score", "status", "updatedAt"],
    description:
      "Consented hand-raisers from RFQ, chat, calculators, gated assets and outbound promotion. " +
      "Sorted hottest-first by score.",
  },
  access: {
    create: isAdminOrEditor, // public paths go through server code (overrideAccess)
    read: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    // Computed display title — "Name — Company" (hooks keep it in sync)
    {
      name: "displayName",
      type: "text",
      admin: { hidden: true },
      hooks: {
        beforeChange: [
          ({ data }) => {
            const name = (data?.name as string | undefined)?.trim() || "Unknown";
            const company = (data?.company as string | undefined)?.trim();
            return company ? `${name} — ${company}` : name;
          },
        ],
      },
    },
    {
      type: "row",
      fields: [
        { name: "name", type: "text", admin: { width: "50%" } },
        { name: "company", type: "text", admin: { width: "50%" } },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "email",
          type: "email",
          unique: true,
          index: true,
          admin: { width: "50%", description: "Stored lowercased; dedupe key." },
        },
        { name: "phone", type: "text", index: true, admin: { width: "50%" } },
      ],
    },
    {
      name: "segment",
      type: "select",
      options: [
        { label: "Foreign investor", value: "investor" },
        { label: "RMG / factory", value: "rmg" },
        { label: "Real estate", value: "real-estate" },
        { label: "Commercial building", value: "commercial" },
        { label: "Bank / financial", value: "bank" },
        { label: "Government / NGO", value: "gov-ngo" },
        { label: "Home / retail", value: "home" },
        { label: "Other / unknown", value: "other" },
      ],
      defaultValue: "other",
    },
    {
      name: "source",
      type: "select",
      required: true,
      options: [
        { label: "RFQ form", value: "rfq" },
        { label: "Chat widget", value: "chat" },
        { label: "Calculator", value: "calculator" },
        { label: "Gated asset", value: "gated-asset" },
        { label: "Outbound promotion (GrowthOS)", value: "outbound" },
        { label: "Manual entry", value: "manual" },
      ],
      defaultValue: "manual",
      admin: { description: "First-touch source. Later touches append to the timeline." },
    },
    {
      name: "score",
      type: "number",
      defaultValue: 0,
      min: 0,
      max: 100,
      index: true,
      admin: {
        position: "sidebar",
        description: "Rule-based heat score (0–100). ≥60 = hot. Recomputed on every touch.",
      },
    },
    {
      name: "status",
      type: "select",
      defaultValue: "new",
      index: true,
      options: [
        { label: "New", value: "new" },
        { label: "Contacted", value: "contacted" },
        { label: "Qualified", value: "qualified" },
        { label: "Won", value: "won" },
        { label: "Lost", value: "lost" },
      ],
      admin: { position: "sidebar" },
    },
    // ── Consent (set only by the visitor's own explicit action) ──────────────
    {
      type: "collapsible",
      label: "Consent",
      admin: { initCollapsed: true },
      fields: [
        {
          name: "marketingOptIn",
          type: "checkbox",
          defaultValue: false,
          admin: {
            description:
              "True only if the visitor ticked the (unticked) marketing checkbox themselves.",
          },
        },
        {
          name: "optInConfirmedAt",
          type: "date",
          admin: { description: "Set by the double-opt-in confirm link. Empty = unconfirmed." },
        },
        {
          name: "doNotContact",
          type: "checkbox",
          defaultValue: false,
          index: true,
          admin: {
            description:
              "Unsubscribe / opt-out. Exported (as a hash) to the outbound suppression feed.",
          },
        },
      ],
    },
    // ── Attribution ──────────────────────────────────────────────────────────
    {
      type: "collapsible",
      label: "Attribution",
      admin: { initCollapsed: true },
      fields: [
        {
          type: "row",
          fields: [
            { name: "utmSource", type: "text", admin: { width: "33%" } },
            { name: "utmMedium", type: "text", admin: { width: "33%" } },
            { name: "utmCampaign", type: "text", admin: { width: "33%" } },
          ],
        },
        { name: "sourcePath", type: "text", admin: { description: "Page the lead came from." } },
      ],
    },
    // ── Touch timeline (append-only, kept by code) ───────────────────────────
    {
      name: "touches",
      type: "array",
      admin: {
        description: "Append-only interaction history (newest last). Written by code on upsert.",
        readOnly: true,
      },
      fields: [
        { name: "at", type: "date", required: true },
        { name: "channel", type: "text", required: true }, // rfq | chat | calculator | gated-asset | outbound | manual
        { name: "note", type: "textarea" },
      ],
    },
    { name: "notes", type: "textarea", admin: { description: "Free-form notes for follow-up." } },
  ],
};
