/**
 * Job Openings — current vacancies. Pre-built for the admin; drives a future
 * Careers page (the slug is ready for /careers/[slug]) without a schema change.
 */
import type { CollectionConfig } from "payload";
import { anyone, isAdminOrEditor } from "../access";
import { slugField } from "../fields/slug";

export const JobOpenings: CollectionConfig = {
  slug: "job-openings",
  labels: { singular: "Job Opening", plural: "Job Openings" },
  admin: {
    useAsTitle: "title",
    group: "Company",
    defaultColumns: ["title", "department", "location", "employmentType", "status"],
    description: "Open roles. Ready to drive a Careers page when you want one.",
  },
  access: {
    read: anyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    { name: "title", type: "text", required: true },
    slugField(),
    {
      type: "row",
      fields: [
        {
          name: "department",
          type: "text",
          admin: { width: "50%", description: "e.g. Engineering, Sales, Operations." },
        },
        {
          name: "location",
          type: "text",
          admin: { width: "50%", description: "e.g. Chattogram, BD or Remote." },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "employmentType",
          type: "select",
          defaultValue: "full-time",
          admin: { width: "50%" },
          options: [
            { label: "Full-time", value: "full-time" },
            { label: "Part-time", value: "part-time" },
            { label: "Contract", value: "contract" },
            { label: "Internship", value: "internship" },
          ],
        },
        {
          name: "status",
          type: "select",
          defaultValue: "open",
          admin: { width: "50%" },
          options: [
            { label: "Open", value: "open" },
            { label: "Closed", value: "closed" },
          ],
        },
      ],
    },
    {
      name: "summary",
      type: "textarea",
      admin: { description: "One or two sentences shown on the careers list." },
    },
    {
      name: "description",
      type: "textarea",
      label: "Full description",
      admin: { description: "Full role description, responsibilities and requirements." },
    },
    {
      type: "row",
      fields: [
        {
          name: "applyEmail",
          type: "email",
          label: "Application email",
          admin: { width: "50%", description: "Where applicants send their CV." },
        },
        {
          name: "applyUrl",
          type: "text",
          label: "Application URL",
          admin: { width: "50%", description: "Optional external application link." },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "closingDate",
          type: "date",
          admin: { width: "50%", date: { pickerAppearance: "dayOnly" } },
        },
        { name: "order", type: "number", defaultValue: 10, admin: { width: "50%", step: 1 } },
      ],
    },
  ],
};
