import { RichText } from "@payloadcms/richtext-lexical/react";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { resolveHref, type CmsLink } from "@/lib/resolve-link";
import type { Media } from "@/payload-types";

// ── Shared data types ────────────────────────────────────────────────────────

export type RichData = ComponentProps<typeof RichText>["data"];

// ── Shared utilities ─────────────────────────────────────────────────────────

/** Inline RichText renderer — returns null when data is empty. */
export function Rich({ data, className }: { data: unknown; className?: string }) {
  if (!data) return null;
  return <RichText data={data as RichData} className={className} />;
}

/**
 * Filter a Payload population array down to only the resolved objects,
 * discarding any that are still plain IDs (number).
 */
export const objs = <T,>(arr?: (number | T)[] | null): T[] =>
  (arr ?? []).filter((x): x is T => typeof x === "object" && x !== null);

/** Extract a typed { url, alt } pair from a Payload Media relation. */
export function mediaUrl(m?: number | Media | null): { url: string; alt: string } | null {
  if (!m || typeof m !== "object" || !m.url) return null;
  return { url: m.url, alt: m.alt ?? "" };
}

/**
 * Smoothly expands a description below the card's persistent header on hover/focus.
 * Uses `grid-template-rows: 0fr → 1fr` — pure CSS, GPU-only, no JS.
 */
export function HoverRevealText({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="ease-standard grid grid-rows-[0fr] transition-[grid-template-rows] delay-0 duration-[var(--duration-base)] group-focus-within:grid-rows-[1fr] group-focus-within:delay-[var(--delay-reveal)] group-hover:grid-rows-[1fr] group-hover:delay-[var(--delay-reveal)] motion-reduce:grid-rows-[1fr]">
      <div className="overflow-hidden">
        <p
          className={cn(
            "text-text-soft ease-standard -translate-y-1 text-[0.9375rem] opacity-0 transition-[opacity,transform] duration-[var(--duration-base)] group-focus-within:translate-y-0 group-focus-within:opacity-100 group-focus-within:delay-[var(--delay-reveal)] group-hover:translate-y-0 group-hover:opacity-100 group-hover:delay-[var(--delay-reveal)] motion-reduce:translate-y-0 motion-reduce:opacity-100",
            className,
          )}
        >
          {children}
        </p>
      </div>
    </div>
  );
}

export type Appearance = "default" | "muted" | "dark" | null | undefined;
export type SectionTone = "light" | "muted" | "dark";

export const toneOf = (a: Appearance): SectionTone =>
  a === "dark" ? "dark" : a === "muted" ? "muted" : "light";

export type Cta = CmsLink & { style?: ("primary" | "secondary") | null };

export function CtaButtons({
  ctas,
  onDark = false,
  className = "mt-9",
}: {
  ctas?: Cta[] | null;
  onDark?: boolean;
  className?: string;
}) {
  if (!ctas?.length) return null;
  return (
    <div className={`flex flex-col gap-3 sm:flex-row ${className}`}>
      {ctas.map((cta, i) => (
        <Button
          key={i}
          asChild
          size="lg"
          variant={cta.style === "secondary" ? "secondary" : "primary"}
          onDark={onDark}
        >
          <Link
            href={resolveHref(cta)}
            prefetch={false}
            target={cta.newTab ? "_blank" : undefined}
            rel={cta.newTab ? "noopener noreferrer" : undefined}
          >
            {cta.label}
          </Link>
        </Button>
      ))}
    </div>
  );
}
