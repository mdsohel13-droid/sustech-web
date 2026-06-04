import { cn } from "@/lib/utils";

/**
 * Loading placeholder for CMS-ready blocks. Uses `animate-pulse`, which the global
 * `prefers-reduced-motion` rule neutralises automatically.
 */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("bg-surface-3 animate-pulse rounded-md", className)} />;
}
