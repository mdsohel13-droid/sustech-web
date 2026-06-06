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
    // Images for everything visual; mp4 for short hero/explainer loops (autoplay-muted, ≤10s).
    mimeTypes: ["image/*", "video/mp4"],
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
