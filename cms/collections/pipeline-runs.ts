import type { CollectionConfig } from "payload";
import { isAdminOrEditor } from "../access";

/**
 * pipeline-runs (Lead Engine master plan §3.0) — one row per nightly watcher
 * run (and per fallback/heartbeat). The heartbeat the daily report reads to
 * prove the pipeline is alive, plus the totals for the report. Written by the
 * pipeline via PIPELINE_SECRET routes; read-only in the admin.
 */
export const PipelineRuns: CollectionConfig = {
  slug: "pipeline-runs",
  labels: { singular: "Pipeline run", plural: "Pipeline runs" },
  admin: {
    useAsTitle: "runDate",
    group: "Lead Engine",
    defaultColumns: ["runDate", "trigger", "sourcesChecked", "sourcesChanged", "draftsCreated"],
    description: "Nightly source-watch runs (and fallback/heartbeat). Read-only.",
  },
  access: {
    read: isAdminOrEditor,
    create: () => false, // only via PIPELINE_SECRET routes (overrideAccess)
    update: () => false,
    delete: isAdminOrEditor,
  },
  fields: [
    { name: "runDate", type: "date", required: true, admin: { readOnly: true } },
    {
      name: "trigger",
      type: "select",
      required: true,
      options: [
        { label: "n8n", value: "n8n" },
        { label: "Fallback (VPS cron)", value: "fallback" },
        { label: "Heartbeat", value: "heartbeat" },
      ],
      admin: { readOnly: true },
    },
    {
      type: "row",
      fields: [
        {
          name: "sourcesChecked",
          type: "number",
          defaultValue: 0,
          admin: { readOnly: true, width: "33%" },
        },
        {
          name: "sourcesChanged",
          type: "number",
          defaultValue: 0,
          admin: { readOnly: true, width: "33%" },
        },
        {
          name: "draftsCreated",
          type: "number",
          defaultValue: 0,
          admin: { readOnly: true, width: "33%" },
        },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "startedAt", type: "date", admin: { readOnly: true, width: "50%" } },
        { name: "finishedAt", type: "date", admin: { readOnly: true, width: "50%" } },
      ],
    },
    { name: "errors", type: "json", admin: { readOnly: true } },
  ],
};
