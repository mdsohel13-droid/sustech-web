import type { CollectionConfig } from "payload";
import { isAdminOrEditor } from "../access";

/**
 * daily-reports (Lead Engine master plan §3.4) — the archived morning report.
 * n8n composes the email at 08:00 (Asia/Dhaka) and POSTs the rendered HTML +
 * metrics here, so the owner can always browse it in /admin even if the email
 * itself fails (email is a notifier, never the system of record). One row per
 * day (date is unique).
 */
export const DailyReports: CollectionConfig = {
  slug: "daily-reports",
  labels: { singular: "Daily report", plural: "Daily reports" },
  admin: {
    useAsTitle: "date",
    group: "Lead Engine",
    defaultColumns: ["date", "generatedAt"],
    description: "Archived morning reports (leads, traffic, approvals, pipeline). Read-only.",
  },
  access: {
    read: isAdminOrEditor,
    create: () => false, // only via PIPELINE_SECRET route (overrideAccess)
    update: () => false,
    delete: isAdminOrEditor,
  },
  fields: [
    {
      name: "date",
      type: "text",
      required: true,
      unique: true,
      admin: { readOnly: true, description: "YYYY-MM-DD (Asia/Dhaka)." },
    },
    { name: "generatedAt", type: "date", admin: { readOnly: true } },
    {
      name: "html",
      type: "textarea",
      admin: { readOnly: true, description: "Rendered report HTML (as emailed)." },
    },
    { name: "metrics", type: "json", admin: { readOnly: true } },
  ],
};
