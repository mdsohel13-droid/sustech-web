import type { CSSProperties, ReactNode } from "react";
import type { AnimationStyle } from "@/lib/block-styles";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /**
   * Scroll-entrance animation style. Maps to `data-reveal` attribute values
   * handled by the CSS scroll-timeline rules in styles/motion.css.
   *
   * - "fade-rise"   — opacity + translateY (default, most blocks)
   * - "slide-left"  — opacity + translateX from left  (timelines, steps)
   * - "slide-right" — opacity + translateX from right (alternating sections)
   * - "scale-up"    — opacity + scale 0.96→1 (cards, stats, callouts)
   * - "stagger"     — cascade: each child gets an 80 ms incremental delay
   *                   (handled at the block level via itemRevealProps())
   * - "none"        — no animation; renders a plain div
   *
   * AI/SEO: all animations use opacity/transform only — content is always in
   * the SSR HTML and is fully crawlable by Google, Claude, Perplexity etc.
   */
  animation?: AnimationStyle;
  /**
   * Delay in milliseconds before the animation plays. Used to stagger
   * multiple Reveal instances in a grid (block renderer computes per-item
   * delay via itemRevealProps() from lib/block-styles).
   */
  delay?: number;
}

/**
 * Server component — renders a `[data-reveal]` wrapper whose scroll-entrance
 * animation is driven entirely by CSS (scroll-driven timelines + IO fallback).
 * Zero client JS, zero hydration cost. Content is visible in raw SSR HTML.
 */
export function Reveal({ children, className, animation = "fade-rise", delay }: RevealProps) {
  if (animation === "none") {
    return <div className={className}>{children}</div>;
  }

  const style: CSSProperties | undefined = delay
    ? ({ "--reveal-delay": `${delay}ms` } as CSSProperties)
    : undefined;

  return (
    <div data-reveal={animation} style={style} className={className}>
      {children}
    </div>
  );
}
