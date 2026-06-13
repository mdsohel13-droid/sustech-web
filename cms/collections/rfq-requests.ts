import type { CollectionConfig } from "payload";
import { isAdminOrEditor } from "../access";

/**
 * Inbound RFQ / consultation requests. Created only via the server action
 * (overrideAccess) — the public REST API cannot create or read these, so
 * submissions stay private and the endpoint can't be scraped or spammed.
 *
 * Every new RFQ also upserts into the `leads` collection (afterChange hook)
 * so the pipeline view, scoring and the outbound-dedupe feed stay complete —
 * including RFQs an admin types in by hand.
 */
export const RfqRequests: CollectionConfig = {
  slug: "rfq-requests",
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== "create") return;
        try {
          // Dynamic import avoids a config-load cycle (lib/payload imports the config).
          const { upsertLead } = await import("../../lib/leads/upsert-lead");
          const { notifyLeadEvent } = await import("../../lib/leads/notify");
          const { isHot } = await import("../../lib/leads/scoring");
          const result = await upsertLead({
            source: "rfq",
            name: doc.name,
            email: doc.email ?? undefined,
            phone: doc.phone ?? undefined,
            company: doc.company ?? undefined,
            message: doc.message,
            sourcePath: doc.sourcePath ?? undefined,
          });
          if (result) {
            notifyLeadEvent({
              event: "rfq.submitted",
              email: doc.email ?? undefined,
              source: "rfq",
              score: result.score,
              hot: isHot(result.score),
            });
          }
        } catch (err) {
          // A lead-sync failure must never fail the RFQ itself.
          req.payload.logger.error({ err, msg: "rfq→lead upsert failed" });
        }
      },
    ],
  },
  labels: { singular: "RFQ Request", plural: "RFQ Requests" },
  admin: {
    useAsTitle: "name",
    group: "Leads",
    defaultColumns: ["name", "company", "serviceInterest", "status", "createdAt"],
    description: "Consultation / quote requests submitted from the website.",
  },
  access: {
    create: isAdminOrEditor, // public submits go through the server action (overrideAccess)
    read: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    {
      type: "row",
      fields: [
        { name: "name", type: "text", required: true, admin: { width: "50%" } },
        { name: "company", type: "text", admin: { width: "50%" } },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "email", type: "email", admin: { width: "50%" } },
        { name: "phone", type: "text", admin: { width: "50%" } },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "serviceInterest", type: "text", admin: { width: "50%" } },
        { name: "location", type: "text", admin: { width: "50%" } },
      ],
    },
    { name: "message", type: "textarea", required: true },
    {
      name: "status",
      type: "select",
      defaultValue: "new",
      options: [
        { label: "New", value: "new" },
        { label: "Contacted", value: "contacted" },
        { label: "Qualified", value: "qualified" },
        { label: "Won", value: "won" },
        { label: "Closed", value: "closed" },
      ],
      admin: { position: "sidebar" },
    },
    {
      name: "sourcePath",
      type: "text",
      admin: { position: "sidebar", readOnly: true, description: "Page the request came from." },
    },
  ],
};
