import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  /** `default` = 1200px content width; `wide` = 1320px. */
  size?: "default" | "wide";
}

export function Container({ children, className, size = "default" }: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-6 md:px-12",
        size === "wide" ? "max-w-[1320px]" : "max-w-[1200px]",
        className,
      )}
    >
      {children}
    </div>
  );
}
