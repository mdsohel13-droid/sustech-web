import type { GlobalConfig } from "payload";
import { isAdminOrEditor } from "../access";

/**
 * Next-best-action rules (master plan §3.3). A small rule table the
 * `nextBestAction` block consults to show the most relevant CTA for a page's
 * segment. Rule-based, no ML; falls back to the RFQ CTA when nothing matches.
 */
export const NextBestActions: GlobalConfig = {
  slug: "next-best-actions",
  label: "Next-best actions",
  admin: {
    group: "Lead Engine",
    description: "Per-segment call-to-action rules used by the Next-best-action block.",
  },
  access: { read: () => true, update: isAdminOrEditor },
  fields: [
    {
      name: "rules",
      type: "array",
      labels: { singular: "Rule", plural: "Rules" },
      fields: [
        {
          name: "segment",
          type: "select",
          required: true,
          options: [
            { label: "Foreign investor", value: "foreign-investor" },
            { label: "RMG factory", value: "rmg-factory" },
            { label: "Real estate developer", value: "real-estate" },
            { label: "Commercial building", value: "commercial-building" },
            { label: "Bank / financial", value: "bank-financial" },
          ],
        },
        { name: "note", type: "text", admin: { description: "Short line above the button." } },
        {
          type: "row",
          fields: [
            { name: "ctaLabel", type: "text", required: true, admin: { width: "50%" } },
            { name: "ctaHref", type: "text", required: true, admin: { width: "50%" } },
          ],
        },
      ],
    },
    {
      type: "collapsible",
      label: "Fallback (when no rule matches)",
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "fallbackLabel",
              type: "text",
              defaultValue: "Request a free assessment",
              admin: { width: "50%" },
            },
            {
              name: "fallbackHref",
              type: "text",
              defaultValue: "/request-quote",
              admin: { width: "50%" },
            },
          ],
        },
        { name: "fallbackNote", type: "text", defaultValue: "Not sure where to start?" },
      ],
    },
  ],
};
