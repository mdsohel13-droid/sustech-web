import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Wordmark + fine-line grid glyph (no raster asset). The glyph nods to the engineering-grid
 * motif. Accessible name covers the full legal name for crawlers and screen readers.
 */
export function Logo({ className, onDark = false }: { className?: string; onDark?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Sustech Technology Ltd — home"
      className={cn(
        "group focus-visible:outline-brand inline-flex items-center gap-2.5 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2",
        className,
      )}
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className={cn("h-7 w-7", onDark ? "text-brand-300" : "text-brand")}
        fill="none"
        stroke="currentColor"
      >
        <rect x="1.5" y="1.5" width="21" height="21" rx="3" strokeWidth="1.5" />
        <path d="M8 1.5v21M16 1.5v21M1.5 8h21M1.5 16h21" strokeWidth="0.75" opacity="0.6" />
        <path d="M13 6l-5 7h4l-2 5 7-8h-4z" fill="currentColor" stroke="none" />
      </svg>
      <span
        className={cn(
          "font-display text-xl font-bold tracking-tight",
          onDark ? "text-text-invert" : "text-ink-900",
        )}
      >
        Sustech
      </span>
    </Link>
  );
}
