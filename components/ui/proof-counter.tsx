"use client";

import { useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ProofCounterProps {
  /** null until the real ERP figure is wired (renders a skeleton, never a fake number). */
  value: number | null;
  label: string;
  className?: string;
}

/** Large mono figure that counts up to its value when scrolled into view. */
export function ProofCounter({ value, label, className }: ProofCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (value === null) return;
    const el = ref.current;
    if (!el) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || started.current) return;
        started.current = true;
        observer.disconnect();
        if (reduce) {
          setDisplay(value);
          return;
        }
        const duration = 1200;
        const begin = performance.now();
        const step = (now: number) => {
          const t = Math.min(1, (now - begin) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          setDisplay(Math.round(value * eased));
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className={cn("text-center", className)}>
      <div className="text-text font-mono text-4xl font-semibold tabular-nums md:text-5xl">
        {value === null ? (
          <Skeleton className="mx-auto h-10 w-28 md:h-12" />
        ) : (
          <span>{display.toLocaleString("en-US")}</span>
        )}
      </div>
      <p className="text-text-soft mt-2 text-sm">{label}</p>
    </div>
  );
}
