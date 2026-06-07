/**
 * CMS block definitions — every block an editor can stack inside a Page layout.
 *
 * Each block ends with `blockStyleGroup` — a collapsible "Style & Animation"
 * panel that lets admins control colour scheme, width, padding, heading size,
 * entrance animation and more without touching code or deploying. Defaults are
 * all set, so editors can ignore the panel entirely for the standard look.
 *
 * The legacy `appearance` field (default/muted/dark) is kept alongside the
 * new style group for backward compatibility — existing content continues to
 * render correctly while editors migrate to the richer controls.
 */
import type { Block, Field } from "payload";
import { ctaArray } from "../fields/link";
import { blockStyleGroup } from "./style-fields";

/** Legacy 3-option appearance select — kept for backward compat. */
const appearance: Field = {
  name: "appearance",
  type: "select",
  defaultValue: "default",
  options: [
    { label: "Default (white)", value: "default" },
    { label: "Muted (light grey)", value: "muted" },
    { label: "Dark (ink)", value: "dark" },
  ],
  admin: {
    width: "50%",
    description: "Quick colour override. Use 'Style & Animation' below for full control.",
  },
};

const sourceSelect = (entity: string): Field => ({
  name: "source",
  type: "radio",
  defaultValue: "auto",
  options: [
    { label: `All ${entity} (automatic)`, value: "auto" },
    { label: "Choose manually", value: "selected" },
  ],
  admin: { layout: "horizontal" },
});

/* ── Blocks ──────────────────────────────────────────────────────────────── */

const Hero: Block = {
  slug: "hero",
  interfaceName: "HeroBlock",
  labels: { singular: "Hero", plural: "Heroes" },
  fields: [
    { name: "eyebrow", type: "text", admin: { description: "Small label above the heading." } },
    { name: "heading", type: "text", required: true },
    { name: "subhead", type: "textarea" },
    {
      type: "row",
      fields: [
        {
          name: "tone",
          type: "select",
          defaultValue: "dark",
          options: [
            { label: "Dark band", value: "dark" },
            { label: "Light", value: "light" },
          ],
          admin: { width: "50%" },
        },
        {
          name: "backgroundImage",
          type: "upload",
          relationTo: "media",
          admin: {
            width: "50%",
            description: "Optional background image (also used as the video poster).",
          },
        },
      ],
    },
    {
      name: "backgroundVideo",
      type: "upload",
      relationTo: "media",
      admin: {
        description:
          "Optional MP4 (autoplay, muted, looping, ≤ 10s). Falls back to the image when motion is reduced.",
        condition: (_data, siblingData) => siblingData?.heroMode !== "carousel",
      },
    },
    /* ── Carousel mode ─────────────────────────────────────────────── */
    {
      name: "heroMode",
      type: "select",
      defaultValue: "single",
      label: "Hero mode",
      admin: {
        description:
          "Single: one background image/video. Carousel: cycle through multiple media items automatically.",
      },
      options: [
        { label: "Single background (default)", value: "single" },
        { label: "Carousel — auto-advance through media", value: "carousel" },
      ],
    },
    {
      name: "carouselItems",
      type: "array",
      label: "Carousel slides",
      minRows: 2,
      maxRows: 8,
      admin: {
        description: "Add images or videos. They cycle automatically every 5 seconds.",
        condition: (_data, siblingData) => siblingData?.heroMode === "carousel",
      },
      fields: [
        {
          name: "media",
          type: "upload",
          relationTo: "media",
          required: true,
          admin: { description: "Image (AVIF/WebP/JPG) or MP4 video." },
        },
        {
          name: "caption",
          type: "text",
          admin: { description: "Optional visible caption shown on this slide." },
        },
      ],
    },
    {
      name: "carouselInterval",
      type: "number",
      label: "Slide interval (seconds)",
      defaultValue: 5,
      min: 2,
      max: 30,
      admin: {
        description: "How long each slide shows before advancing. Default: 5 s.",
        condition: (_data, siblingData) => siblingData?.heroMode === "carousel",
      },
    },
    ctaArray,
    blockStyleGroup,
  ],
};

const ProductShowcase: Block = {
  slug: "productShowcase",
  interfaceName: "ProductShowcaseBlock",
  labels: { singular: "Product showcase", plural: "Product showcases" },
  fields: [
    { name: "heading", type: "text" },
    { name: "lede", type: "textarea" },
    {
      type: "row",
      fields: [
        {
          name: "source",
          type: "radio",
          defaultValue: "featured",
          options: [
            { label: "Featured products (automatic)", value: "featured" },
            { label: "Choose manually", value: "selected" },
          ],
          admin: { layout: "horizontal" },
        },
        appearance,
      ],
    },
    {
      name: "products",
      type: "relationship",
      relationTo: "products",
      hasMany: true,
      admin: { condition: (_d, s) => s?.source === "selected" },
    },
    { name: "viewAllLabel", type: "text", defaultValue: "View all products" },
    blockStyleGroup,
  ],
};

const RichText: Block = {
  slug: "richText",
  interfaceName: "RichTextBlock",
  labels: { singular: "Rich text", plural: "Rich text" },
  fields: [
    { type: "row", fields: [appearance] },
    { name: "content", type: "richText", required: true },
    blockStyleGroup,
  ],
};

const StatsCounters: Block = {
  slug: "statsCounters",
  interfaceName: "StatsCountersBlock",
  labels: { singular: "Stats / counters", plural: "Stats / counters" },
  fields: [
    { type: "row", fields: [{ name: "intro", type: "text" }, appearance] },
    {
      name: "stats",
      type: "array",
      minRows: 1,
      maxRows: 6,
      labels: { singular: "Stat", plural: "Stats" },
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "value",
              type: "number",
              admin: {
                width: "66%",
                description: "Leave blank until the real figure is confirmed (shows a skeleton).",
              },
            },
            {
              name: "suffix",
              type: "text",
              admin: { width: "34%", description: 'Optional, e.g. "+" or "MWp".' },
            },
          ],
        },
        { name: "label", type: "text", required: true },
      ],
    },
    blockStyleGroup,
  ],
};

const ServicesGrid: Block = {
  slug: "servicesGrid",
  interfaceName: "ServicesGridBlock",
  labels: { singular: "Services grid", plural: "Services grids" },
  fields: [
    { name: "heading", type: "text" },
    { name: "lede", type: "textarea" },
    { type: "row", fields: [sourceSelect("services"), appearance] },
    {
      name: "services",
      type: "relationship",
      relationTo: "services",
      hasMany: true,
      admin: { condition: (_d, s) => s?.source === "selected" },
    },
    blockStyleGroup,
  ],
};

const SectorTiles: Block = {
  slug: "sectorTiles",
  interfaceName: "SectorTilesBlock",
  labels: { singular: "Sector tiles", plural: "Sector tiles" },
  fields: [
    { name: "heading", type: "text" },
    { name: "lede", type: "textarea" },
    { type: "row", fields: [sourceSelect("sectors"), appearance] },
    {
      name: "sectors",
      type: "relationship",
      relationTo: "sectors",
      hasMany: true,
      admin: { condition: (_d, s) => s?.source === "selected" },
    },
    blockStyleGroup,
  ],
};

const ProjectsList: Block = {
  slug: "projectsList",
  interfaceName: "ProjectsListBlock",
  labels: { singular: "Projects list", plural: "Projects lists" },
  fields: [
    { name: "heading", type: "text" },
    { name: "lede", type: "textarea" },
    {
      type: "row",
      fields: [
        {
          name: "source",
          type: "radio",
          defaultValue: "featured",
          options: [
            { label: "Featured", value: "featured" },
            { label: "Choose manually", value: "selected" },
          ],
          admin: { layout: "horizontal" },
        },
        appearance,
      ],
    },
    {
      name: "projects",
      type: "relationship",
      relationTo: "projects",
      hasMany: true,
      admin: { condition: (_d, s) => s?.source === "selected" },
    },
    { name: "viewAllLabel", type: "text", defaultValue: "View all projects" },
    blockStyleGroup,
  ],
};

const ImageGallery: Block = {
  slug: "imageGallery",
  interfaceName: "ImageGalleryBlock",
  labels: { singular: "Image gallery", plural: "Image galleries" },
  fields: [
    { type: "row", fields: [{ name: "heading", type: "text" }, appearance] },
    {
      name: "images",
      type: "array",
      minRows: 1,
      labels: { singular: "Image", plural: "Images" },
      fields: [{ name: "image", type: "upload", relationTo: "media", required: true }],
    },
    blockStyleGroup,
  ],
};

const LogoWall: Block = {
  slug: "logoWall",
  interfaceName: "LogoWallBlock",
  labels: { singular: "Logo wall", plural: "Logo walls" },
  fields: [
    { name: "heading", type: "text" },
    { type: "row", fields: [sourceSelect("clients"), appearance] },
    {
      name: "clients",
      type: "relationship",
      relationTo: "clients",
      hasMany: true,
      admin: { condition: (_d, s) => s?.source === "selected" },
    },
    blockStyleGroup,
  ],
};

const TestimonialsBlock: Block = {
  slug: "testimonials",
  interfaceName: "TestimonialsBlock",
  labels: { singular: "Testimonials", plural: "Testimonials" },
  fields: [
    { name: "heading", type: "text" },
    { type: "row", fields: [sourceSelect("testimonials"), appearance] },
    {
      name: "testimonials",
      type: "relationship",
      relationTo: "testimonials",
      hasMany: true,
      admin: { condition: (_d, s) => s?.source === "selected" },
    },
    blockStyleGroup,
  ],
};

const Steps: Block = {
  slug: "steps",
  interfaceName: "StepsBlock",
  labels: { singular: "Steps / how it works", plural: "Steps / how it works" },
  fields: [
    { type: "row", fields: [{ name: "eyebrow", type: "text" }, appearance] },
    { name: "heading", type: "text" },
    {
      name: "steps",
      type: "array",
      minRows: 1,
      labels: { singular: "Step", plural: "Steps" },
      fields: [
        { name: "title", type: "text", required: true },
        { name: "body", type: "textarea", required: true },
      ],
    },
    blockStyleGroup,
  ],
};

const CTABand: Block = {
  slug: "ctaBand",
  interfaceName: "CTABandBlock",
  labels: { singular: "CTA band", plural: "CTA bands" },
  fields: [
    { name: "heading", type: "text", required: true },
    { name: "subhead", type: "textarea" },
    ctaArray,
    blockStyleGroup,
  ],
};

const FAQ: Block = {
  slug: "faq",
  interfaceName: "FAQBlock",
  labels: { singular: "FAQ", plural: "FAQs" },
  fields: [
    { type: "row", fields: [{ name: "heading", type: "text" }, appearance] },
    {
      name: "items",
      type: "array",
      minRows: 1,
      labels: { singular: "Q&A", plural: "Q&A" },
      fields: [
        { name: "question", type: "text", required: true },
        { name: "answer", type: "textarea", required: true },
      ],
    },
    blockStyleGroup,
  ],
};

const CalculatorEmbed: Block = {
  slug: "calculatorEmbed",
  interfaceName: "CalculatorEmbedBlock",
  labels: { singular: "Calculator embed", plural: "Calculator embeds" },
  fields: [
    { type: "row", fields: [{ name: "heading", type: "text" }, appearance] },
    { name: "body", type: "textarea" },
    {
      name: "tool",
      type: "select",
      defaultValue: "solarcalc",
      options: [
        { label: "SolarCalc Pro", value: "solarcalc" },
        { label: "ROI calculator", value: "roi" },
      ],
    },
    { name: "ctaLabel", type: "text", defaultValue: "Try the calculator" },
    blockStyleGroup,
  ],
};

const ContactRFQ: Block = {
  slug: "contactRFQ",
  interfaceName: "ContactRFQBlock",
  labels: { singular: "Contact / RFQ", plural: "Contact / RFQ" },
  fields: [
    { type: "row", fields: [{ name: "heading", type: "text" }, appearance] },
    { name: "subhead", type: "textarea" },
    blockStyleGroup,
  ],
};

const Spacer: Block = {
  slug: "spacer",
  interfaceName: "SpacerBlock",
  labels: { singular: "Spacer / divider", plural: "Spacers / dividers" },
  fields: [
    {
      type: "row",
      fields: [
        {
          name: "size",
          type: "select",
          defaultValue: "md",
          options: [
            { label: "Small", value: "sm" },
            { label: "Medium", value: "md" },
            { label: "Large", value: "lg" },
          ],
          admin: { width: "50%" },
        },
        {
          name: "divider",
          type: "checkbox",
          label: "Show a divider line",
          admin: { width: "50%" },
        },
      ],
    },
    // No blockStyleGroup for Spacer — it has no visual content to style.
  ],
};

const TeamGrid: Block = {
  slug: "teamGrid",
  interfaceName: "TeamGridBlock",
  labels: { singular: "Team grid", plural: "Team grids" },
  fields: [
    { name: "heading", type: "text" },
    { name: "lede", type: "textarea" },
    { type: "row", fields: [sourceSelect("team members"), appearance] },
    {
      name: "members",
      type: "relationship",
      relationTo: "team",
      hasMany: true,
      admin: {
        condition: (_d, s) => s?.source === "selected",
        description: "Pick and order the people to show.",
      },
    },
    blockStyleGroup,
  ],
};

const PartnerBar: Block = {
  slug: "partnerBar",
  interfaceName: "PartnerBarBlock",
  labels: { singular: "Partner bar", plural: "Partner bars" },
  fields: [
    { type: "row", fields: [{ name: "heading", type: "text" }, appearance] },
    {
      name: "partners",
      type: "array",
      labels: { singular: "Partner", plural: "Partners" },
      fields: [
        { name: "name", type: "text", required: true },
        {
          name: "logo",
          type: "upload",
          relationTo: "media",
          admin: { description: "Optional logo; the name is shown until a logo is added." },
        },
      ],
    },
    blockStyleGroup,
  ],
};

const ArticlesList: Block = {
  slug: "articlesList",
  interfaceName: "ArticlesListBlock",
  labels: { singular: "Articles list", plural: "Articles lists" },
  fields: [
    { name: "heading", type: "text" },
    { name: "lede", type: "textarea" },
    { type: "row", fields: [appearance] },
    { name: "viewAllLabel", type: "text", defaultValue: "Read the knowledge hub" },
    blockStyleGroup,
  ],
};

/**
 * Photo Strip — infinite-scroll horizontal marquee of images.
 * Two display modes:
 *  - "marquee"   : images scroll continuously left (no JS, CSS-only)
 *  - "carousel"  : images advance one-by-one with prev/next controls
 */
const PhotoStrip: Block = {
  slug: "photoStrip",
  interfaceName: "PhotoStripBlock",
  labels: { singular: "Photo strip", plural: "Photo strips" },
  fields: [
    { type: "row", fields: [{ name: "heading", type: "text" }, appearance] },
    {
      name: "displayMode",
      type: "select",
      defaultValue: "marquee",
      label: "Display mode",
      options: [
        {
          label: "Marquee — continuous infinite scroll",
          value: "marquee",
        },
        {
          label: "Carousel — one at a time with arrows",
          value: "carousel",
        },
      ],
    },
    {
      name: "speed",
      type: "select",
      defaultValue: "normal",
      label: "Scroll speed (marquee only)",
      admin: { condition: (_d, s) => s?.displayMode !== "carousel" },
      options: [
        { label: "Slow", value: "slow" },
        { label: "Normal", value: "normal" },
        { label: "Fast", value: "fast" },
      ],
    },
    {
      name: "photos",
      type: "array",
      minRows: 2,
      labels: { singular: "Photo", plural: "Photos" },
      fields: [
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          required: true,
        },
        { name: "caption", type: "text" },
      ],
    },
    blockStyleGroup,
  ],
};

/** Every block type an editor can stack inside a Page's layout. */
export const layoutBlocks: Block[] = [
  Hero,
  RichText,
  StatsCounters,
  ServicesGrid,
  SectorTiles,
  ProjectsList,
  ImageGallery,
  PhotoStrip,
  LogoWall,
  PartnerBar,
  ProductShowcase,
  ArticlesList,
  TestimonialsBlock,
  TeamGrid,
  Steps,
  CTABand,
  FAQ,
  CalculatorEmbed,
  ContactRFQ,
  Spacer,
];
