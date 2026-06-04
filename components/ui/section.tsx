import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { GridMotif } from "@/components/ui/grid-motif";
import { cn } from "@/lib/utils";

type Tone = "light" | "muted" | "dark";

interface SectionProps {
  children: ReactNode;
  id?: string;
  /** Optional small-caps label above the title. */
  eyebrow?: string;
  /** Rendered as an `<h2>` (sections sit below the page `<h1>`). */
  title?: string;
  lede?: string;
  tone?: Tone;
  align?: "left" | "center";
  containerSize?: "default" | "wide";
  withGrid?: boolean;
  className?: string;
  /** Visually-hidden heading for sections whose title is decorative/omitted. */
  srTitle?: string;
}

const toneClass: Record<Tone, string> = {
  light: "bg-surface text-text",
  muted: "bg-surface-2 text-text",
  dark: "bg-ink-900 text-text-invert",
};

export function Section({
  children,
  id,
  eyebrow,
  title,
  lede,
  tone = "light",
  align = "left",
  containerSize = "default",
  withGrid = false,
  className,
  srTitle,
}: SectionProps) {
  const dark = tone === "dark";
  const hasHeader = Boolean(eyebrow || title || lede);

  return (
    <section
      id={id}
      className={cn("relative scroll-mt-24 py-16 md:py-24 lg:py-32", toneClass[tone], className)}
    >
      {withGrid && <GridMotif tone={dark ? "dark" : "light"} />}
      <Container size={containerSize} className="relative">
        {srTitle && <h2 className="sr-only">{srTitle}</h2>}
        {hasHeader && (
          <header
            className={cn("mb-10 max-w-2xl md:mb-14", align === "center" && "mx-auto text-center")}
          >
            {eyebrow && <Eyebrow onDark={dark}>{eyebrow}</Eyebrow>}
            {title && (
              <h2 className={cn("text-h2 font-semibold text-balance", eyebrow && "mt-3")}>
                {title}
              </h2>
            )}
            {lede && (
              <p
                className={cn("text-lede mt-4", dark ? "text-text-invert-soft" : "text-text-soft")}
              >
                {lede}
              </p>
            )}
          </header>
        )}
        {children}
      </Container>
    </section>
  );
}
