import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  /** Adds the hover lift + border-brighten interaction (DESIGN-SYSTEM.md §6). */
  interactive?: boolean;
}

export function Card({ children, className, interactive = false }: CardProps) {
  return (
    <div
      className={cn(
        "border-border bg-surface rounded-lg border shadow-sm",
        interactive &&
          "ease-standard hover:border-brand/30 transition-[transform,box-shadow,border-color] duration-[var(--duration-base)] hover:-translate-y-0.5 hover:shadow-md",
        className,
      )}
    >
      {children}
    </div>
  );
}
