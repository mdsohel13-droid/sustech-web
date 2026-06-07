/**
 * Reusable Payload CMS field group — added to every block in cms/blocks/index.ts.
 *
 * Renders as a collapsible "Style & Animation" panel below each block's content
 * fields in the admin UI. Defaults are all set so an editor can ignore this panel
 * entirely and get the standard site look. Opening it unlocks per-block control of:
 *   · Colour scheme (background + text)
 *   · Content width and vertical padding
 *   · Text alignment, heading size and font
 *   · Scroll-entrance animation style and delay
 *   · Accent colour for eyebrows, icons and links
 *
 * All values map to pre-validated design-token classes in lib/block-styles.ts —
 * never raw CSS or hex. Brand integrity and WCAG AA contrast are guaranteed by
 * the token set; the editor picks from a curated menu.
 *
 * AI/SEO safety: all style choices affect only CSS classes (opacity/transform),
 * never content visibility — text is always in the SSR HTML and stays crawlable.
 */
import type { Field } from "payload";

export const blockStyleGroup: Field = {
  name: "style",
  type: "group",
  label: "Style & Animation",
  admin: {
    description:
      "Override visual style. All defaults give the standard site look — only open if you need a custom treatment.",
  },
  fields: [
    /* ── Colour ──────────────────────────────────────────────────────── */
    {
      type: "row",
      fields: [
        {
          name: "colorScheme",
          type: "select",
          label: "Colour scheme",
          defaultValue: "default",
          admin: {
            width: "50%",
            description: "Background + text colour for this block.",
          },
          options: [
            { label: "Default (white)", value: "default" },
            { label: "Muted (light grey)", value: "muted" },
            { label: "Dark (navy)", value: "dark" },
            { label: "Brand — True Blue", value: "brand" },
            { label: "Energy — Lime Green", value: "energy" },
            { label: "Solar — Golden Poppy", value: "solar" },
          ],
        },
        {
          name: "accentColour",
          type: "select",
          label: "Accent colour",
          defaultValue: "brand",
          admin: {
            width: "50%",
            description: "Colour of eyebrow labels, icons and inline links.",
          },
          options: [
            { label: "True Blue (default)", value: "brand" },
            { label: "Lime Green", value: "energy" },
            { label: "Golden Poppy", value: "solar" },
          ],
        },
      ],
    },

    /* ── Layout ──────────────────────────────────────────────────────── */
    {
      type: "row",
      fields: [
        {
          name: "width",
          type: "select",
          label: "Content width",
          defaultValue: "default",
          admin: {
            width: "33%",
            description: "Maximum width of the inner content area.",
          },
          options: [
            { label: "Narrow (640 px)", value: "narrow" },
            { label: "Standard (1 200 px)", value: "default" },
            { label: "Wide (1 400 px)", value: "wide" },
            { label: "Full bleed", value: "full-bleed" },
          ],
        },
        {
          name: "paddingSize",
          type: "select",
          label: "Vertical padding",
          defaultValue: "standard",
          admin: {
            width: "33%",
            description: "Top and bottom spacing of this block.",
          },
          options: [
            { label: "Compact", value: "compact" },
            { label: "Standard", value: "standard" },
            { label: "Spacious", value: "spacious" },
          ],
        },
        {
          name: "textAlign",
          type: "select",
          label: "Text alignment",
          defaultValue: "left",
          admin: {
            width: "34%",
            description: "Alignment of the section heading and body.",
          },
          options: [
            { label: "Left (default)", value: "left" },
            { label: "Centre", value: "center" },
          ],
        },
      ],
    },

    /* ── Typography ──────────────────────────────────────────────────── */
    {
      type: "row",
      fields: [
        {
          name: "headingSize",
          type: "select",
          label: "Heading size",
          defaultValue: "default",
          admin: {
            width: "50%",
            description: "Override the section heading font size.",
          },
          options: [
            { label: "Default (h2)", value: "default" },
            { label: "Large (h1)", value: "large" },
            { label: "XL — display", value: "xl" },
          ],
        },
        {
          name: "headingFont",
          type: "select",
          label: "Heading font",
          defaultValue: "display",
          admin: {
            width: "50%",
            description: "Typeface used for the block heading.",
          },
          options: [
            { label: "Display — Cabinet Grotesk", value: "display" },
            { label: "Mono — JetBrains", value: "mono" },
          ],
        },
      ],
    },

    /* ── Animation ───────────────────────────────────────────────────── */
    {
      type: "row",
      fields: [
        {
          name: "animationStyle",
          type: "select",
          label: "Entrance animation",
          defaultValue: "fade-rise",
          admin: {
            width: "50%",
            description: "How content enters the viewport as the user scrolls.",
          },
          options: [
            { label: "Fade + Rise (default)", value: "fade-rise" },
            { label: "Slide from Left", value: "slide-left" },
            { label: "Slide from Right", value: "slide-right" },
            { label: "Scale Up", value: "scale-up" },
            { label: "Stagger (cascade children)", value: "stagger" },
            { label: "None — instant", value: "none" },
          ],
        },
        {
          name: "animationDelay",
          type: "select",
          label: "Animation delay",
          defaultValue: "none",
          admin: {
            width: "50%",
            description: "Pause before this block's entrance animation begins.",
          },
          options: [
            { label: "None", value: "none" },
            { label: "Short — 150 ms", value: "short" },
            { label: "Medium — 300 ms", value: "medium" },
            { label: "Long — 500 ms", value: "long" },
          ],
        },
      ],
    },
  ],
};
