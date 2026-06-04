import type { Field } from "payload";

export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

/** URL slug, auto-derived from another field (default `title`) but editable. */
export const slugField = (from = "title"): Field => ({
  name: "slug",
  type: "text",
  required: true,
  unique: true,
  index: true,
  admin: {
    position: "sidebar",
    description: "The URL path segment. Auto-filled from the title — edit only if you must.",
  },
  hooks: {
    beforeValidate: [
      ({ value, data }) => {
        if (typeof value === "string" && value.length > 0) return slugify(value);
        const source = data?.[from];
        return typeof source === "string" ? slugify(source) : value;
      },
    ],
  },
});
