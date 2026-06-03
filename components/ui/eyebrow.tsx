import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EyebrowProps {
  children: ReactNode;
  onDark?: boolean;
  className?: string;
}

/** Small-caps brand label (DESIGN-SYSTEM.md §2, §6). */
export function Eyebrow({ children, onDark = false, className }: EyebrowProps) {
  return (
    <p
      className={cn(
        "font-mono text-xs font-medium tracking-[0.08em] uppercase",
        onDark ? "text-brand-300" : "text-brand",
        className,
      )}
    >
      {children}
    </p>
  );
}
