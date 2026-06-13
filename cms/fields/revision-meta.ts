import type { Field } from "payload";

/**
 * revisionMeta (Lead Engine master plan §3.0) — pipeline bookkeeping attached to
 * articles & news-items. Tracks why a draft exists, its approval state, the
 * 24 h clock (`pendingSince`, set ONLY on the Resend delivered event), the
 * single-use token jti, and the advisory risk flags re-derived server-side.
 * `staleSource` excludes a doc from the auto-publish path entirely.
 */
export const revisionMetaField: Field = {
  name: "revisionMeta",
  type: "group",
  label: "Revision / pipeline state",
  admin: {
    position: "sidebar",
    description: "Set by the content pipeline. Read-only.",
  },
  fields: [
    {
      name: "approvalState",
      type: "select",
      defaultValue: "none",
      options: [
        { label: "None", value: "none" },
        { label: "Pending", value: "pending" },
        { label: "Approved", value: "approved" },
        { label: "Rejected", value: "rejected" },
        { label: "Auto-published", value: "auto-published" },
      ],
      admin: { readOnly: true },
    },
    {
      name: "triggeredBySource",
      type: "relationship",
      relationTo: "sources",
      admin: { readOnly: true },
    },
    { name: "changeSummary", type: "textarea", admin: { readOnly: true } },
    {
      name: "riskFlags",
      type: "select",
      hasMany: true,
      options: [
        { label: "Pricing", value: "pricing" },
        { label: "Legal", value: "legal" },
        { label: "Stat claim", value: "stat-claim" },
        { label: "Tariff", value: "tariff" },
        { label: "Third-party name", value: "third-party-name" },
      ],
      admin: { readOnly: true },
    },
    {
      name: "pendingSince",
      type: "date",
      admin: {
        readOnly: true,
        description: "Set only when the approval email is DELIVERED — starts the 24 h clock.",
      },
    },
    {
      name: "staleSource",
      type: "checkbox",
      defaultValue: false,
      admin: {
        readOnly: true,
        description: "A cited source changed; excluded from auto-publish until reviewed.",
      },
    },
    { name: "tokenJti", type: "text", admin: { readOnly: true } },
    {
      type: "row",
      fields: [
        { name: "decidedBy", type: "text", admin: { readOnly: true, width: "50%" } },
        { name: "decidedAt", type: "date", admin: { readOnly: true, width: "50%" } },
      ],
    },
  ],
};
