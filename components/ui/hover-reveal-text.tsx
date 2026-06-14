import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * HoverRevealText — pure-CSS disclosure used by the "Our Team" cards and any
 * horizontal "hover to reveal" listing layout.
 *
 * The text is collapsed to height 0 (grid-rows-[0fr]) at rest and expands on
 * hover OR keyboard focus of the nearest ancestor with the `group` class. A
 * 150ms delay applies only on the way in (so a fast mouse-sweep doesn't
 * flicker). Under reduced motion the text is shown statically.
 *
 * SSR/AEO-safe: the text is always present in the DOM (only visually
 * collapsed), so it stays crawlable and citable.
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
