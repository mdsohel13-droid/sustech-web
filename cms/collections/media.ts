import path from "path";
import { fileURLToPath } from "url";
import type { CollectionConfig } from "payload";
import { anyone, isAdminOrEditor, isContentWriter } from "../access";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export const Media: CollectionConfig = {
  slug: "media",
  admin: { group: "Content" },
  access: {
    read: anyone,
    create: isContentWriter,
    update: isContentWriter,
    delete: isAdminOrEditor,
  },
  upload: {
    staticDir: path.resolve(dirname, "../../media"),
    // Explicit MIME allowlist — do NOT use "image/*" because it includes image/svg+xml.
    // SVG files can contain embedded <script> tags that execute in the browser
    // context if served same-origin (stored XSS). Enumerate safe types only.
    // Images + video for visual content; documents (PDF/Word/Excel/ZIP) for the
    // Knowledge Hub downloads. Uploads are restricted to authenticated content
    // writers (see access.create), so these document types are trusted input.
    mimeTypes: [
      // Images & video
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
      "image/gif",
      "video/mp4",
      // Documents (downloads)
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/zip",
    ],
    // Generate resized, optimized WebP variants for images only (videos pass through unchanged).
    formatOptions: { format: "webp", options: { quality: 78 } },
    imageSizes: [
      {
        name: "thumbnail",
        width: 400,
        formatOptions: { format: "webp", options: { quality: 78 } },
      },
      { name: "card", width: 768, formatOptions: { format: "webp", options: { quality: 78 } } },
      { name: "feature", width: 1200, formatOptions: { format: "webp", options: { quality: 80 } } },
      {
        name: "og",
        width: 1200,
        height: 630,
        position: "centre",
        formatOptions: { format: "webp", options: { quality: 80 } },
      },
    ],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
      admin: {
        description: "Describe the image for screen readers and search engines (required).",
      },
    },
    { name: "caption", type: "text" },
  ],
};
