/**
 * Awards & Certifications — company credentials (awards, ISO/IEC certifications,
 * accreditations). Pre-built so admins can populate it now; a public page/block
 * can render it later without a schema change.
 */
import type { CollectionConfig } from "payload";
import { anyone, isAdminOrEditor } from "../access";

export const Awards: CollectionConfig = {
  slug: "awards",
  labels: { singular: "Award / Certification", plural: "Awards & Certifications" },
  admin: {
    useAsTitle: "title",
    group: "Company",
    defaultColumns: ["title", "kind", "issuer", "dateAwarded", "order"],
    description:
      "Awards, certifications and accreditations. Populate as needed — these can be surfaced on a page later.",
  },
  access: {
    read: anyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  defaultSort: "order",
  fields: [
    { name: "title", type: "text", required: true },
    {
      name: "kind",
      type: "select",
      defaultValue: "certification",
      options: [
        { label: "Award", value: "award" },
        { label: "Certification", value: "certification" },
        { label: "Accreditation", value: "accreditation" },
      ],
    },
    {
      name: "issuer",
      type: "text",
      admin: { description: "Body that issued it (e.g. Bureau Veritas, SREDA, ISO)." },
    },
    {
      type: "row",
      fields: [
        {
          name: "dateAwarded",
          type: "date",
          admin: { width: "50%", date: { pickerAppearance: "dayOnly" } },
        },
        {
          name: "validUntil",
          type: "date",
          admin: {
            width: "50%",
            date: { pickerAppearance: "dayOnly" },
            description: "Leave blank if it does not expire.",
          },
        },
      ],
    },
    { name: "description", type: "textarea" },
    {
      name: "certificate",
      type: "upload",
      relationTo: "media",
      admin: { description: "Scan or photo of the certificate (PDF or image)." },
    },
    {
      name: "referenceUrl",
      type: "text",
      label: "Reference URL",
      admin: { description: "Optional link to verify the award/certificate." },
    },
    {
      name: "order",
      type: "number",
      defaultValue: 10,
      admin: { step: 1, description: "Lower numbers appear first." },
    },
  ],
};
