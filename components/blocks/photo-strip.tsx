"use client";

/**
 * PhotoStrip — two display modes driven by the CMS:
 *
 *  • "marquee"  — infinite CSS-scroll marquee. Completely GPU: uses
 *    `translate3d` on a doubled list so the loop is seamless. No JS timer.
 *    Under prefers-reduced-motion the marquee pauses.
 *
 *  • "carousel" — one photo at a time with prev/next arrow controls +
 *    swipe support via pointer events. Keyboard accessible.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface Photo {
  url: string;
  alt?: string | null;
  caption?: string | null;
}

/* ── Marquee ─────────────────────────────────────────────────────────────── */

const SPEED_DURATION: Record<string, string> = {
  slow: "60s",
  normal: "35s",
  fast: "20s",
};

function Marquee({ photos, speed = "normal" }: { photos: Photo[]; speed?: string }) {
  // Duplicate the list so the marquee loops seamlessly
  const all = [...photos, ...photos];
  const duration = SPEED_DURATION[speed] ?? SPEED_DURATION.normal;

  return (
    <div className="overflow-hidden" aria-label="Photo gallery" role="region">
      <div
        className="flex gap-4 motion-reduce:[animation-play-state:paused]"
        style={{
          animation: `marquee-scroll ${duration} linear infinite`,
          width: `${all.length * 320}px`,
        }}
      >
        {all.map((photo, i) => (
          <figure
            key={i}
            className="relative h-56 w-72 flex-shrink-0 overflow-hidden rounded-xl md:h-64 md:w-80"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.url}
              alt={photo.alt ?? ""}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            {photo.caption && (
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2 text-xs text-white">
                {photo.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </div>
  );
}

/* ── Carousel ────────────────────────────────────────────────────────────── */

function Carousel({ photos }: { photos: Photo[] }) {
  const [current, setCurrent] = useState(0);
  const startX = useRef<number | null>(null);

  const prev = useCallback(
    () => setCurrent((c) => (c - 1 + photos.length) % photos.length),
    [photos.length],
  );
  const next = useCallback(() => setCurrent((c) => (c + 1) % photos.length), [photos.length]);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [prev, next]);

  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      role="region"
      aria-label={`Photo ${current + 1} of ${photos.length}`}
      onPointerDown={(e) => {
        startX.current = e.clientX;
      }}
      onPointerUp={(e) => {
        if (startX.current === null) return;
        const dx = e.clientX - startX.current;
        if (dx > 50) prev();
        else if (dx < -50) next();
        startX.current = null;
      }}
    >
      <div
        className="flex transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {photos.map((photo, i) => (
          <figure key={i} className="relative aspect-video w-full flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.url}
              alt={photo.alt ?? ""}
              className="h-full w-full object-cover"
              loading={i === 0 ? "eager" : "lazy"}
            />
            {photo.caption && (
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-4 py-3 text-sm text-white">
                {photo.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>

      {/* Arrows */}
      {photos.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous photo"
            className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition hover:bg-black/60 focus-visible:outline-white"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next photo"
            className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition hover:bg-black/60 focus-visible:outline-white"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              />
            </svg>
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {photos.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrent(i)}
                aria-label={`Go to photo ${i + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === current ? "w-5 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80",
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Exported component ──────────────────────────────────────────────────── */

export interface PhotoStripClientProps {
  photos: Photo[];
  displayMode?: "marquee" | "carousel" | null;
  speed?: string | null;
}

export function PhotoStripClient({
  photos,
  displayMode = "marquee",
  speed = "normal",
}: PhotoStripClientProps) {
  if (!photos.length) return null;
  return displayMode === "carousel" ? (
    <Carousel photos={photos} />
  ) : (
    <Marquee photos={photos} speed={speed ?? "normal"} />
  );
}
