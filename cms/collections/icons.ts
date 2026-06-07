/**
 * Icons collection — separate from Media so editors have a dedicated, clean
 * folder for 3-D renders, AI-generated icons, SVG symbols, and brand marks.
 *
 * Design decisions:
 *  - SVG is allowed here (unlike general Media) because icons are trusted
 *    brand assets uploaded by authenticated admins, not public uploads.
 *  - No image-resize pipeline — icons are already small and optimised.
 *  - `category` field lets editors organise by type (service, sector, UI, brand).
 *  - `tags` field enables free-text filtering in the admin picker.
 *  - Separate static directory `/public/icons/` ensures icons are served from a
 *    predictable path and are easy to reference in templates.
 *
 * How to use in blocks / fields:
 *   { name: "icon", type: "upload", relationTo: "icons" }
 *
 * Security:
 *   SVG files CAN contain <script> tags. The upload handler here only accepts
 *   them from authenticated content writers. Never expose raw SVG as user-uploaded
 *   content without sanitisation — this collection is admin-only upload.
 */
import path from "path";
import { fileURLToPath } from "url";
import type { CollectionConfig } from "payload";
import { anyone, isAdminOrEditor, isContentWriter } from "../access";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export const Icons: CollectionConfig = {
  slug: "icons",
  labels: { singular: "Icon", plural: "Icons" },
  admin: {
    group: "Assets",
    useAsTitle: "name",
    defaultColumns: ["name", "category", "updatedAt"],
    description:
      "3-D renders, AI-generated icons, SVG symbols and brand marks. " +
      "Upload here to keep icons separate from general media.",
  },
  access: {
    read: anyone,
    create: isContentWriter,
    update: isContentWriter,
    delete: isAdminOrEditor,
  },
  upload: {
    staticDir: path.resolve(dirname, "../../public/icons"),
    // Icons accept SVG (trusted admin upload), PNG, WebP and AVIF.
    // SVG is intentionally allowed here — see security note above.
    mimeTypes: ["image/svg+xml", "image/png", "image/webp", "image/avif", "image/jpeg"],
    // No resize pipeline for icons — they are already small/optimised.
    disableLocalStorage: false,
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      admin: {
        description: "Human-readable name shown in the picker (e.g. 'Solar Panel 3D').",
      },
    },
    {
      name: "category",
      type: "select",
      defaultValue: "ui",
      admin: {
        description: "Organise icons by type so editors can find them quickly.",
      },
      options: [
        { label: "Service icon", value: "service" },
        { label: "Sector icon", value: "sector" },
        { label: "Feature / UI icon", value: "ui" },
        { label: "Brand / logo mark", value: "brand" },
        { label: "3-D render", value: "3d" },
        { label: "AI-generated", value: "ai" },
        { label: "Other", value: "other" },
      ],
    },
    {
      name: "tags",
      type: "text",
      admin: {
        description: "Comma-separated keywords for search (e.g. 'solar, panel, energy').",
      },
    },
    {
      name: "alt",
      type: "text",
      admin: {
        description:
          "Describe the icon for screen readers. Leave blank if purely decorative " +
          "(will be rendered as aria-hidden).",
      },
    },
  ],
};
