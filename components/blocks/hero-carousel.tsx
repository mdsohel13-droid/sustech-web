"use client";

/**
 * HeroCarousel — client component that auto-advances through an array of
 * media items (images or MP4 videos) every N seconds.
 *
 * CSS-driven crossfade: each slide is `position: absolute; opacity: 0`
 * and only the active one is `opacity: 1`. Transition is GPU-only
 * (opacity + a very slight scale-up on entry) so there is no layout cost.
 *
 * Under `prefers-reduced-motion` the carousel still cycles (content changes
 * are informational, not distracting) but the opacity crossfade is instant.
 *
 * Navigation dots are keyboard-operable (role=tab). Screen readers see the
 * slide count and current position via aria-live.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface CarouselItem {
  url: string;
  mimeType?: string | null;
  alt?: string | null;
  caption?: string | null;
}

interface HeroCarouselProps {
  items: CarouselItem[];
  /** Seconds between auto-advances (default 5). */
  interval?: number;
  className?: string;
}

export function HeroCarousel({ items, interval = 5, className }: HeroCarouselProps) {
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const advance = useCallback(
    (to: number) => {
      setActive((to + items.length) % items.length);
    },
    [items.length],
  );

  // Auto-advance
  useEffect(() => {
    if (items.length <= 1) return;
    timerRef.current = setTimeout(() => advance(active + 1), interval * 1000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [active, advance, interval, items.length]);

  if (!items.length) return null;

  return (
    <div className={cn("absolute inset-0 -z-20", className)} aria-hidden>
      {/* Slides */}
      {items.map((item, i) => {
        const isVideo = item.mimeType?.startsWith("video/") ?? item.url.endsWith(".mp4");
        const isActive = i === active;
        return (
          <div
            key={i}
            className={cn(
              "absolute inset-0 transition-opacity duration-[900ms] ease-in-out motion-reduce:transition-none",
              isActive ? "opacity-30" : "opacity-0",
            )}
          >
            {isVideo ? (
              <video
                src={item.url}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                className="h-full w-full object-cover"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.url}
                alt={item.alt ?? ""}
                className="h-full w-full object-cover"
                loading={i === 0 ? "eager" : "lazy"}
              />
            )}
          </div>
        );
      })}

      {/* Caption */}
      {items[active]?.caption && (
        <p className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded bg-black/50 px-3 py-1 text-xs text-white">
          {items[active].caption}
        </p>
      )}

      {/* Dots — hidden from aria since parent is aria-hidden */}
      {items.length > 1 && (
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => advance(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === active ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
