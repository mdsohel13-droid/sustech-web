import type { CollectionConfig, FieldAccess } from "payload";
import { hasRole, isAdminOrEditor } from "../access";

/**
 * Source registry (Lead Engine master plan §3.0 / §3.1b) — the authoritative
 * list of citable sources behind every published number. Seeded with 26 real
 * sources (`pnpm seed:sources`). The nightly watcher (Phase 4) hashes each
 * source's `checkUrl`, diffs, and queues drafts for the articles that cite it.
 *
 * Access: admins/editors manage it; the n8n pipeline service identity may
 * update ONLY the watch bookkeeping fields (lastCheckedAt, hashes, failures)
 * via /api/pipeline/sources — enforced here field-by-field. NOT publicly
 * readable: nothing on the site reads this collection (citations render from
 * the article doc), and exposing it would map our crawl behaviour.
 */

/** Field-level: the n8n pipeline identity (or any editor) may write watch state. */
const watchFieldUpdate: FieldAccess = ({ req }) =>
  hasRole(req.user, "superAdmin", "admin", "editor", "hermes");

export const Sources: CollectionConfig = {
  slug: "sources",
  labels: { singular: "Source", plural: "Source Registry" },
  admin: {
    useAsTitle: "name",
    group: "Lead Engine",
    defaultColumns: ["name", "tier", "checkFrequency", "active", "lastCheckedAt"],
    description:
      "Authoritative sources behind every cited number. Seed with `pnpm seed:sources`. " +
      "Not shown on the public site.",
  },
  access: {
    read: isAdminOrEditor, // never public
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    { name: "name", type: "text", required: true },
    {
      name: "url",
      type: "text",
      required: true,
      unique: true,
      admin: { description: "Canonical homepage." },
    },
    {
      name: "checkUrl",
      type: "text",
      admin: { description: "Specific page the nightly job hashes (tariff page, circular index)." },
    },
    {
      name: "tier",
      type: "select",
      required: true,
      defaultValue: "tier1-gov",
      options: [
        { label: "Tier 1 — Government", value: "tier1-gov" },
        { label: "Tier 1 — Multilateral", value: "tier1-multilateral" },
        { label: "Tier 2 — Analyst / Standards", value: "tier2-analyst" },
        { label: "Tier 3 — Press", value: "tier3-press" },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "fetchMethod",
          type: "select",
          defaultValue: "html",
          options: [
            { label: "RSS", value: "rss" },
            { label: "HTML", value: "html" },
            { label: "PDF link", value: "pdf-link" },
          ],
          admin: { width: "33%" },
        },
        {
          name: "fetchPolicy",
          type: "select",
          defaultValue: "auto",
          options: [
            { label: "Auto", value: "auto" },
            { label: "Manual only", value: "manual-only" },
          ],
          admin: {
            width: "33%",
            description: "Auto-flips to manual-only if robots.txt disallows.",
          },
        },
        {
          name: "checkFrequency",
          type: "select",
          defaultValue: "weekly",
          options: [
            { label: "Daily", value: "daily" },
            { label: "Weekly", value: "weekly" },
            { label: "Monthly", value: "monthly" },
            { label: "Quarterly", value: "quarterly" },
          ],
          admin: { width: "33%" },
        },
      ],
    },
    {
      name: "contentSelector",
      type: "text",
      admin: { description: "CSS selector isolating meaningful content (kills false diffs)." },
    },
    {
      type: "row",
      fields: [
        {
          name: "language",
          type: "select",
          defaultValue: "en",
          options: [
            { label: "English", value: "en" },
            { label: "Bangla", value: "bn" },
            { label: "Both", value: "both" },
          ],
          admin: { width: "50%" },
        },
        {
          name: "paywalled",
          type: "checkbox",
          defaultValue: false,
          admin: { width: "50%", description: "Cite headline + link only; never quote body." },
        },
      ],
    },
    {
      name: "active",
      type: "checkbox",
      defaultValue: true,
      admin: { position: "sidebar", description: "Per-source kill switch." },
    },
    { name: "notes", type: "textarea" },

    // ── Watch bookkeeping (pipeline-writable; read-only in the admin UI) ──────
    {
      type: "collapsible",
      label: "Watch state (automated)",
      admin: { initCollapsed: true },
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "lastContentHash",
              type: "text",
              access: { update: watchFieldUpdate },
              admin: { width: "50%", readOnly: true },
            },
            {
              name: "etag",
              type: "text",
              access: { update: watchFieldUpdate },
              admin: { width: "50%", readOnly: true },
            },
          ],
        },
        {
          type: "row",
          fields: [
            {
              name: "lastModified",
              type: "text",
              access: { update: watchFieldUpdate },
              admin: { width: "50%", readOnly: true },
            },
            {
              name: "consecutiveFailures",
              type: "number",
              defaultValue: 0,
              access: { update: watchFieldUpdate },
              admin: {
                width: "50%",
                readOnly: true,
                description: "Alert at 3, auto-deactivate at 10.",
              },
            },
          ],
        },
        {
          type: "row",
          fields: [
            {
              name: "lastCheckedAt",
              type: "date",
              access: { update: watchFieldUpdate },
              admin: { width: "33%", readOnly: true },
            },
            {
              name: "lastChangedAt",
              type: "date",
              access: { update: watchFieldUpdate },
              admin: { width: "33%", readOnly: true },
            },
            {
              name: "robotsCheckedAt",
              type: "date",
              access: { update: watchFieldUpdate },
              admin: { width: "33%", readOnly: true },
            },
          ],
        },
      ],
    },
  ],
};
