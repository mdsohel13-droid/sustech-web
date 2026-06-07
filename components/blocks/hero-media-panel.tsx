"use client";

/**
 * HeroMediaPanel — a foreground, framed crossfade carousel of images/videos
 * shown beside the hero text (fills the empty space on the right of the hero).
 *
 * Distinct from HeroCarousel (which is a faint, full-bleed BACKGROUND layer):
 * this panel is a crisp, bordered card at full opacity.
 *
 * Behaviour:
 *   • Crossfade between slides every N seconds (GPU-only opacity transition).
 *   • Videos play muted/looping only while they are the active slide.
 *   • prefers-reduced-motion → auto-advance stops; the visitor steps through
 *     with the dots (and the crossfade itself is instant).
 *   • A pause/play toggle is always available (WCAG 2.2.2 — auto-moving content
 *     that sits alongside other content must be pausable).
 *
 * The first slide is server-rendered (the markup is in the SSR HTML), so the
 * panel is visible to crawlers and paints immediately.
 */

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

export interface HeroPanelItem {
  url: string;
  mimeType?: string | null;
  alt?: string | null;
  caption?: string | null;
}

interface HeroMediaPanelProps {
  items: HeroPanelItem[];
  /** Seconds between auto-advances (default 5). */
  interval?: number;
  /** Hero is a dark band — adjusts the frame treatment. */
  dark?: boolean;
  className?: string;
}

function isVideoItem(item: HeroPanelItem): boolean {
  return item.mimeType?.startsWith("video/") ?? item.url.toLowerCase().endsWith(".mp4");
}

export function HeroMediaPanel({ items, interval = 5, dark, className }: HeroMediaPanelProps) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Detect prefers-reduced-motion (and react to changes).
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Auto-advance, unless paused, reduced-motion, or only one slide.
  useEffect(() => {
    if (items.length <= 1 || paused || reduced) return;
    timerRef.current = setTimeout(() => setActive((a) => (a + 1) % items.length), interval * 1000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [active, paused, reduced, interval, items.length]);

  if (!items.length) return null;

  const multiple = items.length > 1;
  const activeCaption = items[active]?.caption;

  return (
    <div
      className={cn(
        "group relative aspect-[4/3] w-full overflow-hidden rounded-2xl",
        dark
          ? "border border-white/10 shadow-[0_18px_60px_rgba(0,0,0,0.45)]"
          : "border-border border shadow-[0_12px_50px_rgba(2,12,27,0.14)]",
        className,
      )}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured media"
    >
      {items.map((item, i) => {
        const isActive = i === active;
        const video = isVideoItem(item);
        return (
          <div
            key={i}
            className={cn(
              "absolute inset-0 transition-opacity duration-[900ms] ease-in-out motion-reduce:transition-none",
              isActive ? "opacity-100" : "opacity-0",
            )}
            aria-hidden={!isActive}
          >
            {/* Backdrop fill — a blurred, zoomed copy of the image (or a dark wash
                for video) so the panel is always full while the real media sits
                fully CONTAINED on top and is never cropped or clipped. */}
            {video ? (
              <div className="bg-ink-950 absolute inset-0" aria-hidden />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.url}
                alt=""
                aria-hidden
                loading={i === 0 ? "eager" : "lazy"}
                className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl brightness-[0.6]"
              />
            )}

            {/* Foreground media — object-contain → the whole image/video fits
                inside the panel with nothing extending outside it. */}
            {video ? (
              <video
                src={item.url}
                // Only the active slide plays; others stay paused to save bandwidth.
                autoPlay={isActive}
                muted
                loop
                playsInline
                preload={i === 0 ? "metadata" : "none"}
                aria-label={item.alt ?? undefined}
                className="absolute inset-0 h-full w-full object-contain"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.url}
                alt={item.alt ?? ""}
                loading={i === 0 ? "eager" : "lazy"}
                className="absolute inset-0 h-full w-full object-contain"
              />
            )}
          </div>
        );
      })}

      {/* Caption */}
      {activeCaption && (
        <p className="from-ink-950/80 absolute inset-x-0 bottom-0 bg-gradient-to-t to-transparent px-4 pt-10 pb-4 text-sm font-medium text-white">
          {activeCaption}
        </p>
      )}

      {/* Controls — pause/play + dots. Visible always; only shown when >1 slide. */}
      {multiple && (
        <div className="absolute right-3 bottom-3 left-3 flex items-center justify-between gap-3">
          <div className="flex gap-1.5" role="tablist" aria-label="Choose slide">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={`Show slide ${i + 1} of ${items.length}`}
                onClick={() => setActive(i)}
                className={cn(
                  "ease-standard h-1.5 rounded-full transition-all duration-300",
                  i === active ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80",
                )}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "Play slideshow" : "Pause slideshow"}
            className="focus-visible:outline-brand-300 grid h-7 w-7 place-items-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {paused ? (
              <Play className="h-3.5 w-3.5 translate-x-[1px]" aria-hidden />
            ) : (
              <Pause className="h-3.5 w-3.5" aria-hidden />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
