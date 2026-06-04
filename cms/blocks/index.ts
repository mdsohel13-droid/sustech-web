import type { Block, Field } from "payload";
import { ctaArray } from "../fields/link";

/** Optional band background so editors control the light/dark rhythm of a page. */
const appearance: Field = {
  name: "appearance",
  type: "select",
  defaultValue: "default",
  options: [
    { label: "Default (white)", value: "default" },
    { label: "Muted (light grey)", value: "muted" },
    { label: "Dark (ink)", value: "dark" },
  ],
  admin: { width: "50%" },
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
          admin: { width: "50%", description: "Optional background image." },
        },
      ],
    },
    ctaArray,
  ],
};

const RichText: Block = {
  slug: "richText",
  interfaceName: "RichTextBlock",
  labels: { singular: "Rich text", plural: "Rich text" },
  fields: [
    { type: "row", fields: [appearance] },
    { name: "content", type: "richText", required: true },
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
  ],
};

const ContactRFQ: Block = {
  slug: "contactRFQ",
  interfaceName: "ContactRFQBlock",
  labels: { singular: "Contact / RFQ", plural: "Contact / RFQ" },
  fields: [
    { type: "row", fields: [{ name: "heading", type: "text" }, appearance] },
    { name: "subhead", type: "textarea" },
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
  LogoWall,
  TestimonialsBlock,
  Steps,
  CTABand,
  FAQ,
  CalculatorEmbed,
  ContactRFQ,
  Spacer,
];
