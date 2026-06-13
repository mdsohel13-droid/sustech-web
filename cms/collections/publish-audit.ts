import type { CollectionConfig } from "payload";
import { isAdminOrEditor } from "../access";

/**
 * publish-audit (Lead Engine master plan §3.0) — the IMMUTABLE record of every
 * publish-affecting action. `update`/`delete` are hard-false so the history can
 * never be rewritten: who/what published or rolled back, and when. `actor`
 * distinguishes owner approval from the 24 h auto path (never conflated).
 * Written only by the publish guard / approval routes (overrideAccess).
 */
export const PublishAudit: CollectionConfig = {
  slug: "publish-audit",
  labels: { singular: "Publish audit", plural: "Publish audit log" },
  admin: {
    useAsTitle: "at",
    group: "Lead Engine",
    defaultColumns: ["at", "action", "docCollection", "docId", "actor"],
    description: "Immutable publish/approval history. Cannot be edited or deleted.",
  },
  access: {
    read: isAdminOrEditor,
    create: () => false, // routes use overrideAccess
    update: () => false, // immutable
    delete: () => false, // immutable
  },
  fields: [
    { name: "at", type: "date", required: true, admin: { readOnly: true } },
    {
      name: "action",
      type: "select",
      required: true,
      options: [
        { label: "Drafted", value: "drafted" },
        { label: "Approval email sent", value: "approval-email-sent" },
        { label: "Approval email delivered", value: "approval-email-delivered" },
        { label: "Approved by owner", value: "approved-by-owner" },
        { label: "Rejected", value: "rejected" },
        { label: "Auto-published (24h)", value: "auto-published-24h" },
        { label: "Killed", value: "killed" },
        { label: "Rolled back", value: "rolled-back" },
      ],
      admin: { readOnly: true },
    },
    {
      type: "row",
      fields: [
        { name: "docCollection", type: "text", admin: { readOnly: true, width: "50%" } },
        { name: "docId", type: "text", admin: { readOnly: true, width: "50%" } },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "versionIdFrom", type: "text", admin: { readOnly: true, width: "50%" } },
        { name: "versionIdTo", type: "text", admin: { readOnly: true, width: "50%" } },
      ],
    },
    {
      name: "actor",
      type: "text",
      required: true,
      admin: {
        readOnly: true,
        description: "owner | pipeline | admin:<id> — auto-publish is never recorded as owner.",
      },
    },
    { name: "tokenJti", type: "text", admin: { readOnly: true } },
    { name: "claimDiffSnapshot", type: "json", admin: { readOnly: true } },
  ],
};
