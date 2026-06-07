import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { GridMotif } from "@/components/ui/grid-motif";
import { cn } from "@/lib/utils";
import type {
  AccentColour,
  BlockWidth,
  HeadingFont,
  HeadingSize,
  PaddingSize,
  SectionTone,
} from "@/lib/block-styles";

interface SectionProps {
  children: ReactNode;
  id?: string;
  /** Small-caps label above the title (e.g. "What we do"). */
  eyebrow?: string;
  /** Rendered as an `<h2>` (sections sit below the page `<h1>`). */
  title?: string;
  lede?: string;
  /**
   * Background + text colour scheme.
   * Extended from the legacy 3-tone set to the full brand palette.
   */
  tone?: SectionTone;
  /** Heading + lede alignment inside the section header. */
  align?: "left" | "center";
  /**
   * Content width. Controls the inner Container max-width.
   * Supersedes the legacy `containerSize` prop.
   */
  width?: BlockWidth;
  /** @deprecated Use `width` instead. */
  containerSize?: "default" | "wide";
  /** Top and bottom padding preset. */
  paddingSize?: PaddingSize;
  /** Override the section heading (h2) size. */
  headingSize?: HeadingSize;
  /** Override the heading typeface. */
  headingFont?: HeadingFont;
  /** Colour of the eyebrow label and inline accent elements. */
  eyebrowAccent?: AccentColour;
  /** Add the faint engineering-grid texture to the section background. */
  withGrid?: boolean;
  className?: string;
  /** Visually-hidden heading for sections whose visible title is omitted. */
  srTitle?: string;
}

/* ── Colour maps ─────────────────────────────────────────────────────────── */

const toneClass: Record<SectionTone, string> = {
  light: "bg-surface text-text",
  muted: "bg-surface-2 text-text",
  dark: "bg-ink-900 text-text-invert",
  brand: "bg-brand text-white",
  energy: "bg-energy text-white",
  solar: "bg-solar text-solar-text",
};

const headingColour: Record<SectionTone, string> = {
  light: "text-ink-900",
  muted: "text-ink-900",
  dark: "text-text-invert",
  brand: "text-white",
  energy: "text-white",
  solar: "text-solar-text",
};

const ledeColour: Record<SectionTone, string> = {
  light: "text-text-soft",
  muted: "text-text-soft",
  dark: "text-text-invert-soft",
  brand: "text-white/80",
  energy: "text-white/80",
  solar: "text-solar-text/70",
};

const eyebrowColour: Record<AccentColour, { light: string; dark: string }> = {
  brand: { light: "text-brand", dark: "text-brand-300" },
  energy: { light: "text-energy", dark: "text-energy-300" },
  solar: { light: "text-solar", dark: "text-solar-600" },
};

/* ── Padding presets ─────────────────────────────────────────────────────── */

const paddingClass: Record<PaddingSize, string> = {
  compact: "py-8 md:py-12",
  standard: "py-16 md:py-24 lg:py-32",
  spacious: "py-24 md:py-32 lg:py-40",
};

/* ── Heading size ────────────────────────────────────────────────────────── */

const headingSizeClass: Record<HeadingSize, string> = {
  default: "text-h2",
  large: "text-h1",
  xl: "text-display",
};

const headingFontClass: Record<HeadingFont, string> = {
  display: "font-display",
  mono: "font-mono",
};

/* ── Component ───────────────────────────────────────────────────────────── */

export function Section({
  children,
  id,
  eyebrow,
  title,
  lede,
  tone = "light",
  align = "left",
  width,
  containerSize,
  paddingSize = "standard",
  headingSize = "default",
  headingFont = "display",
  eyebrowAccent = "brand",
  withGrid = false,
  className,
  srTitle,
}: SectionProps) {
  const isDark = tone === "dark" || tone === "brand" || tone === "energy";
  const hasHeader = Boolean(eyebrow || title || lede);

  // Resolve accent eyebrow colour: on coloured backgrounds always use the
  // "dark" (accessible) variant; on light/muted use the normal variant.
  const eyebrowClass =
    isDark || tone === "solar"
      ? eyebrowColour[eyebrowAccent].dark
      : eyebrowColour[eyebrowAccent].light;

  // Width resolution: new `width` prop > legacy `containerSize` > default
  const resolvedWidth: BlockWidth = width ?? (containerSize === "wide" ? "wide" : "default");

  return (
    <section
      id={id}
      className={cn("relative scroll-mt-24", paddingClass[paddingSize], toneClass[tone], className)}
    >
      {withGrid && <GridMotif tone={isDark ? "dark" : "light"} />}

      <Container width={resolvedWidth} className="relative">
        {srTitle && <h2 className="sr-only">{srTitle}</h2>}

        {hasHeader && (
          /* Section header always gets a gentle fade-rise entrance.
             The content (children) gets the CMS-selected animation style. */
          <header
            data-reveal="fade-rise"
            className={cn("mb-10 max-w-2xl md:mb-14", align === "center" && "mx-auto text-center")}
          >
            {eyebrow && (
              <Eyebrow onDark={isDark} className={eyebrowClass}>
                {eyebrow}
              </Eyebrow>
            )}
            {title && (
              <h2
                className={cn(
                  headingSizeClass[headingSize],
                  headingFontClass[headingFont],
                  "font-semibold text-balance",
                  headingSize === "xl" && "font-bold",
                  eyebrow && "mt-3",
                  headingColour[tone],
                )}
              >
                {title}
              </h2>
            )}
            {lede && <p className={cn("text-lede mt-4", ledeColour[tone])}>{lede}</p>}
          </header>
        )}

        {children}
      </Container>
    </section>
  );
}
