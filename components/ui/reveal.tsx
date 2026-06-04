import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /**
   * Retained for call-site ergonomics. Stagger is now handled by the CSS scroll-driven
   * timeline (each element animates on its own scroll position), so this is a no-op.
   */
  delay?: number;
}

/**
 * Server component: renders a `[data-reveal]` wrapper that the stylesheet animates with a CSS
 * scroll-driven timeline. No client JS / hydration cost; content is in the SSR HTML and stays
 * visible when scroll-timelines are unsupported or `prefers-reduced-motion` is set.
 */
export function Reveal({ children, className }: RevealProps) {
  return (
    <div data-reveal className={className}>
      {children}
    </div>
  );
}
