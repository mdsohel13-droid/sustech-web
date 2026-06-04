import { cn } from "@/lib/utils";

interface GridMotifProps {
  tone?: "light" | "dark";
  className?: string;
}

/**
 * Recurring fine-line "engineering grid" motif (DESIGN-SYSTEM.md §1, §4).
 * Decorative only — aria-hidden, non-interactive, faded at the edges via a radial mask.
 */
export function GridMotif({ tone = "light", className }: GridMotifProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "grid-motif pointer-events-none absolute inset-0",
        "[mask-image:radial-gradient(ellipse_at_center,black,transparent_78%)]",
        tone === "dark" ? "text-white/[0.05]" : "text-ink-900/[0.035]",
        className,
      )}
    />
  );
}
