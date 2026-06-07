import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  /**
   * Content width preset.
   * - `narrow`    → max-w-2xl   (640 px) — prose, forms
   * - `default`   → max-w-[1200px]        — standard page grid
   * - `wide`      → max-w-[1400px]        — wide cards / galleries
   * - `full-bleed`→ no max-width, no horizontal padding
   *
   * Legacy alias: the old `size` prop ("default" | "wide") still works.
   */
  width?: "narrow" | "default" | "wide" | "full-bleed";
  /** @deprecated Use `width` instead. */
  size?: "default" | "wide";
}

const widthClasses = {
  narrow: "max-w-2xl mx-auto w-full px-6 md:px-12",
  default: "max-w-[1200px] mx-auto w-full px-6 md:px-12",
  wide: "max-w-[1400px] mx-auto w-full px-6 md:px-12",
  "full-bleed": "w-full",
} as const;

export function Container({ children, className, width, size }: ContainerProps) {
  // Resolve effective width: new `width` wins, then legacy `size`, then default
  const effective: keyof typeof widthClasses = width ?? (size === "wide" ? "wide" : "default");

  return <div className={cn(widthClasses[effective], className)}>{children}</div>;
}
