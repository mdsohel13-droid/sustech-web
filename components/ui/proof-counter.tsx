"use client";

import { useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ProofCounterProps {
  /** null until the real ERP figure is wired (renders a skeleton, never a fake number). */
  value: number | null;
  label: string;
  /** Optional unit/suffix shown after the figure, e.g. "+" or "MWp". */
  suffix?: string;
  className?: string;
}

/** Large mono figure that counts up to its value when scrolled into view. */
export function ProofCounter({ value, label, suffix, className }: ProofCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  // Initialise to the REAL value so the figure is present in the server-rendered
  // HTML for crawlers / AI engines / no-JS visitors (the whole point of a proof
  // stat). JS then enhances it with a count-up for figures that scroll into view.
  const [display, setDisplay] = useState(value ?? 0);
  const started = useRef(false);

  useEffect(() => {
    if (value === null) return;
    const el = ref.current;
    if (!el) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return; // keep the SSR value, no animation

    // Figures already on screen at mount keep the SSR value (no reset flash).
    // Figures below the fold reset to 0 off-screen, then count up when revealed.
    const rect = el.getBoundingClientRect();
    const inViewAtMount = rect.top < window.innerHeight && rect.bottom > 0;
    if (inViewAtMount) return;
    setDisplay(0);

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || started.current) return;
        started.current = true;
        observer.disconnect();
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
          <span>
            {display.toLocaleString("en-US")}
            {suffix ? <span>{suffix}</span> : null}
          </span>
        )}
      </div>
      <p className="text-text-soft mt-2 text-sm">{label}</p>
    </div>
  );
}
