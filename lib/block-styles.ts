/**
 * Block style system — lib/block-styles.ts
 *
 * Single source of truth that maps CMS `style.*` field values to Tailwind
 * utility classes. Components never inspect raw field strings; they call
 * resolveBlockStyle() and receive a typed, safe object.
 *
 * All options come from the brand design-token set (DESIGN-SYSTEM.md §3) so
 * WCAG AA contrast and brand integrity are guaranteed by construction.
 *
 * AI/SEO crawlability guarantee: all style choices affect only CSS classes
 * (opacity, transform, background) — never content visibility or DOM presence.
 * Text lives in SSR HTML and is always crawlable by Google, Claude, Perplexity.
 */

/* ── Types ──────────────────────────────────────────────────────────────── */

export type ColourScheme = "default" | "muted" | "dark" | "brand" | "energy" | "solar";
export type BlockWidth = "narrow" | "default" | "wide" | "full-bleed";
export type PaddingSize = "compact" | "standard" | "spacious";
export type TextAlign = "left" | "center";
export type HeadingSize = "default" | "large" | "xl";
export type HeadingFont = "display" | "mono";
export type BodyFont = "sans" | "display" | "mono";
export type BodySize = "sm" | "base" | "lg" | "xl";
export type AnimationStyle =
  | "fade-rise"
  | "slide-left"
  | "slide-right"
  | "scale-up"
  | "stagger"
  | "none";
export type AnimationDelay = "none" | "short" | "medium" | "long";
export type AccentColour = "brand" | "energy" | "solar";
export type GapBelow = "none" | "small" | "default" | "large";

/** Section tone values — extends the base light/muted/dark with brand colours */
export type SectionTone = "light" | "muted" | "dark" | "brand" | "energy" | "solar";

/** Shape of the CMS `style` group field on a block (all fields are optional/nullable) */
export interface BlockStyleInput {
  colorScheme?: string | null;
  width?: string | null;
  paddingSize?: string | null;
  textAlign?: string | null;
  headingSize?: string | null;
  headingFont?: string | null;
  animationStyle?: string | null;
  animationDelay?: string | null;
  accentColour?: string | null;
  /** Whether to render the section with a card border + depth shadow. */
  withBorder?: boolean | null;
  /** Body text font family override. */
  bodyFont?: string | null;
  /** Body text size override. */
  bodySize?: string | null;
  /** Vertical gap rendered after this block. */
  gapBelow?: string | null;
}

/* ── Value sets (used for safe coercion) ─────────────────────────────── */

const COLOUR_SCHEMES: ColourScheme[] = ["default", "muted", "dark", "brand", "energy", "solar"];
const BLOCK_WIDTHS: BlockWidth[] = ["narrow", "default", "wide", "full-bleed"];
const PADDING_SIZES: PaddingSize[] = ["compact", "standard", "spacious"];
const TEXT_ALIGNS: TextAlign[] = ["left", "center"];
const HEADING_SIZES: HeadingSize[] = ["default", "large", "xl"];
const HEADING_FONTS: HeadingFont[] = ["display", "mono"];
const BODY_FONTS: BodyFont[] = ["sans", "display", "mono"];
const BODY_SIZES: BodySize[] = ["sm", "base", "lg", "xl"];
const ANIMATION_STYLES: AnimationStyle[] = [
  "fade-rise",
  "slide-left",
  "slide-right",
  "scale-up",
  "stagger",
  "none",
];
const ANIMATION_DELAYS: AnimationDelay[] = ["none", "short", "medium", "long"];
const ACCENT_COLOURS: AccentColour[] = ["brand", "energy", "solar"];
const GAP_BELOWS: GapBelow[] = ["none", "small", "default", "large"];

/** Margin applied to the bottom of a section to control the gap to the next block. */
export const gapBelowClass: Record<GapBelow, string> = {
  none: "mb-0",
  small: "mb-4 md:mb-6",
  default: "", // no extra margin — sections already carry their own padding
  large: "mb-12 md:mb-20",
};

const DELAY_MS: Record<AnimationDelay, number> = {
  none: 0,
  short: 150,
  medium: 300,
  long: 500,
};

/* ── Maps ────────────────────────────────────────────────────────────── */

/** Tailwind classes for text-level colour accents (eyebrows, icons, links) */
export const accentTextClass: Record<AccentColour, string> = {
  brand: "text-brand",
  energy: "text-energy",
  solar: "text-solar",
};

/** Tailwind classes for the section padding */
export const paddingClass: Record<PaddingSize, string> = {
  compact: "py-8 md:py-12",
  standard: "py-16 md:py-24 lg:py-32",
  spacious: "py-24 md:py-32 lg:py-40",
};

/** Tailwind classes for the container max-width */
export const widthClass: Record<BlockWidth, string> = {
  narrow: "max-w-2xl",
  default: "max-w-[1200px]",
  wide: "max-w-[1400px]",
  "full-bleed": "w-full max-w-none",
};

/** Tailwind classes for heading sizes */
export const headingSizeClass: Record<HeadingSize, string> = {
  default: "text-h2",
  large: "text-h1",
  xl: "text-display",
};

/** Tailwind classes for heading fonts */
export const headingFontClass: Record<HeadingFont, string> = {
  display: "font-display",
  mono: "font-mono",
};

/** Tailwind classes for body/paragraph font families */
export const bodyFontClass: Record<BodyFont, string> = {
  sans: "font-sans",
  display: "font-display",
  mono: "font-mono",
};

/** Tailwind classes for body/paragraph text sizes */
export const bodySizeClass: Record<BodySize, string> = {
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-lede",
};

/* ── Safe coercion helper ─────────────────────────────────────────────── */

function safe<T extends string>(
  val: string | null | undefined,
  allowed: readonly T[],
  fallback: T,
): T {
  return (allowed as readonly string[]).includes(val ?? "") ? (val as T) : fallback;
}

/* ── Main resolver ────────────────────────────────────────────────────── */

export interface ResolvedBlockStyle {
  /** Colour scheme → maps directly to <Section tone> */
  tone: SectionTone;
  /** Raw width enum → pass directly to <Section width> */
  width: BlockWidth;
  /** Raw padding enum → pass directly to <Section paddingSize> */
  paddingSize: PaddingSize;
  /** Text align value for <Section align> */
  textAlign: TextAlign;
  /** Raw heading size enum → pass directly to <Section headingSize> */
  headingSize: HeadingSize;
  /** Raw heading font enum → pass directly to <Section headingFont> */
  headingFont: HeadingFont;
  /** Animation style for <Reveal animation> and the section header */
  animationStyle: AnimationStyle;
  /** Animation delay in ms (pass to Reveal or stagger calc) */
  delayMs: number;
  /** Accent colour for <Section eyebrowAccent> */
  accentColour: AccentColour;
  /** Whether to add card border + depth shadow to the section */
  withBorder: boolean;
  /** True when the colour scheme is a dark background */
  isDark: boolean;
  /** Body text font family */
  bodyFont: BodyFont;
  /** Body text size */
  bodySize: BodySize;
  /** Pre-computed Tailwind class strings for renderers that bypass Section */
  widthClass: string;
  paddingClass: string;
  headingSizeClass: string;
  headingFontClass: string;
  bodyFontClass: string;
  bodySizeClass: string;
  /** Margin-bottom class controlling the gap to the next block. */
  gapBelowClass: string;
}

/**
 * Resolve CMS block style fields to concrete Tailwind class strings and props.
 *
 * @param style        - The `style` group object from the CMS block
 * @param legacyAppearance - The old `appearance` field (default/muted/dark) for backward compat
 */
export function resolveBlockStyle(
  style: BlockStyleInput | null | undefined,
  legacyAppearance?: string | null,
): ResolvedBlockStyle {
  // Resolve colour scheme — new field wins, legacy appearance is the fallback
  let rawScheme = style?.colorScheme;
  if (!rawScheme && legacyAppearance) {
    const legacyMap: Record<string, ColourScheme> = {
      default: "default",
      muted: "muted",
      dark: "dark",
    };
    rawScheme = legacyMap[legacyAppearance] ?? "default";
  }
  const colourScheme = safe(rawScheme, COLOUR_SCHEMES, "default");

  const width = safe(style?.width, BLOCK_WIDTHS, "default");
  const padding = safe(style?.paddingSize, PADDING_SIZES, "standard");
  const align = safe(style?.textAlign, TEXT_ALIGNS, "left");
  const hSize = safe(style?.headingSize, HEADING_SIZES, "default");
  const hFont = safe(style?.headingFont, HEADING_FONTS, "display");
  const anim = safe(style?.animationStyle, ANIMATION_STYLES, "fade-rise");
  const delay = safe(style?.animationDelay, ANIMATION_DELAYS, "none");
  const accent = safe(style?.accentColour, ACCENT_COLOURS, "brand");
  const bFont = safe(style?.bodyFont, BODY_FONTS, "sans");
  const bSize = safe(style?.bodySize, BODY_SIZES, "base");
  const gap = safe(style?.gapBelow, GAP_BELOWS, "default");

  // Map colourScheme → SectionTone (default → light for Section's existing API)
  const tone: SectionTone = colourScheme === "default" ? "light" : colourScheme;

  return {
    tone,
    width,
    paddingSize: padding,
    textAlign: align,
    headingSize: hSize,
    headingFont: hFont,
    animationStyle: anim,
    delayMs: DELAY_MS[delay],
    accentColour: accent,
    withBorder: Boolean(style?.withBorder),
    isDark: tone === "dark",
    bodyFont: bFont,
    bodySize: bSize,
    // Pre-computed class strings for custom renderers that bypass <Section>
    widthClass: widthClass[width],
    paddingClass: paddingClass[padding],
    headingSizeClass: headingSizeClass[hSize],
    headingFontClass: headingFontClass[hFont],
    bodyFontClass: bodyFontClass[bFont],
    bodySizeClass: bodySizeClass[bSize],
    gapBelowClass: gapBelowClass[gap],
  };
}

/**
 * Safely extract the `style` group from any CMS block object without needing
 * the generated Payload types to include it. Avoids `any` while deferring the
 * type-generation step.
 */
export function getBlockStyle(block: unknown): BlockStyleInput | null {
  if (typeof block !== "object" || block === null) return null;
  const b = block as Record<string, unknown>;
  if (typeof b["style"] !== "object" || b["style"] === null) return null;
  return b["style"] as BlockStyleInput;
}

/**
 * Helper for grid blocks: given the block-level resolved style, returns the
 * per-item animation props. When "stagger" is chosen, all items use fade-rise
 * but each gets an incremental 80 ms delay so they cascade naturally.
 */
export function itemRevealProps(
  bs: ResolvedBlockStyle,
  index: number,
): { animation: AnimationStyle; delay: number } {
  if (bs.animationStyle === "stagger") {
    return { animation: "fade-rise", delay: bs.delayMs + index * 80 };
  }
  return { animation: bs.animationStyle, delay: bs.delayMs };
}
