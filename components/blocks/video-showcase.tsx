"use client";

/**
 * VideoShowcaseClient — the interactive facade video player for the
 * VideoShowcase block. Server-rendered markup (poster + title + description)
 * is fully crawlable; the heavy video/iframe is mounted only when the user
 * clicks play. This is the "facade" pattern:
 *
 *   • Fast first paint — no autoplay video bandwidth, LCP-safe poster image.
 *   • Privacy-preserving — YouTube uses youtube-nocookie and is only loaded
 *     after an explicit click, so no third-party cookie is set up-front.
 *   • Accessible — every play target is a real <button> with an aria-label,
 *     keyboard operable, and honours prefers-reduced-motion.
 *
 * Two CMS-driven layouts:
 *   • "spotlight" — one large featured video + a supporting grid below.
 *   • "grid"      — equal-sized cards in a responsive grid.
 */

import { useState } from "react";
import { cn } from "@/lib/utils";
import { withAutoplay, type VideoItem } from "@/lib/video";

/* ── Play button ─────────────────────────────────────────────────────────── */

function PlayButton({ large }: { large?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "ease-standard relative z-10 flex items-center justify-center rounded-full",
        "text-brand bg-white/95 shadow-[0_8px_30px_rgba(0,0,0,0.35)] ring-1 ring-black/5 backdrop-blur",
        "transition-transform duration-[var(--duration-base)] group-hover:scale-110 group-focus-visible:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100",
        large ? "h-18 w-18 md:h-24 md:w-24" : "h-14 w-14",
      )}
    >
      {/* Soft brand glow ring — brightens on hover, no constant animation (restraint). */}
      <span
        aria-hidden
        className="ease-standard absolute -inset-2 rounded-full ring-2 ring-white/0 transition-[box-shadow,--tw-ring-color] duration-[var(--duration-base)] group-hover:shadow-[0_0_40px_rgba(96,180,245,0.45)] group-hover:ring-white/30"
      />
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
        className={cn("translate-x-[2px]", large ? "h-8 w-8 md:h-10 md:w-10" : "h-6 w-6")}
      >
        <path d="M8 5v14l11-7z" />
      </svg>
    </span>
  );
}

/* ── Single video facade ─────────────────────────────────────────────────── */

function VideoFacade({
  video,
  large,
  priority,
}: {
  video: VideoItem;
  large?: boolean;
  priority?: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  const canPlay = video.source === "upload" ? Boolean(video.mp4Url) : Boolean(video.embed);

  return (
    <figure
      className={cn(
        "group bg-ink-800 ease-standard relative overflow-hidden rounded-2xl border border-white/10",
        "shadow-[0_8px_40px_rgba(0,0,0,0.35)] transition-[transform,box-shadow] duration-[var(--duration-base)]",
        !playing && "hover:-translate-y-0.5 hover:shadow-[0_18px_60px_rgba(0,0,0,0.45)]",
      )}
    >
      <div className="relative aspect-video w-full">
        {playing && canPlay ? (
          video.source === "upload" && video.mp4Url ? (
            <video
              className="absolute inset-0 h-full w-full bg-black"
              src={video.mp4Url}
              poster={video.posterUrl ?? undefined}
              controls
              autoPlay
              playsInline
            >
              Your browser does not support the video tag.
            </video>
          ) : video.embed ? (
            <iframe
              className="absolute inset-0 h-full w-full"
              src={withAutoplay(video.embed.embedUrl)}
              title={video.title}
              loading="lazy"
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : null
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            disabled={!canPlay}
            aria-label={
              canPlay ? `Play video: ${video.title}` : `${video.title} — video unavailable`
            }
            className="focus-visible:outline-brand-300 absolute inset-0 flex items-center justify-center focus-visible:outline-2 focus-visible:-outline-offset-4 disabled:cursor-not-allowed"
          >
            {video.posterUrl ? (
              // Decorative inside a labelled play button — empty alt avoids
              // redundant SR output and prevents broken-image alt text if the
              // (possibly external) thumbnail ever fails to load.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={video.posterUrl}
                alt=""
                loading={priority ? "eager" : "lazy"}
                className="ease-standard absolute inset-0 h-full w-full object-cover transition-transform duration-[var(--duration-slow)] group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
            ) : (
              <div
                aria-hidden
                className="from-ink-800 to-ink-950 absolute inset-0 bg-gradient-to-br"
              />
            )}

            {/* Legibility scrim — darkens the bottom for the title overlay. */}
            <span
              aria-hidden
              className="from-ink-950/95 via-ink-950/45 absolute inset-0 bg-gradient-to-t to-transparent"
            />

            <PlayButton large={large} />

            {video.duration && (
              <span className="absolute right-3 bottom-3 rounded-md bg-black/70 px-2 py-1 font-mono text-xs font-medium text-white tabular-nums backdrop-blur-sm">
                {video.duration}
              </span>
            )}

            <span
              className={cn("absolute inset-x-0 bottom-0 p-4 text-left md:p-5", large && "md:p-6")}
            >
              <span
                className={cn(
                  "font-display block font-semibold text-balance text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.7)]",
                  large ? "text-h3 md:text-h2" : "text-base",
                )}
              >
                {video.title}
              </span>
            </span>
          </button>
        )}
      </div>

      {/* Description stays in the DOM (crawlable). Hidden once the player mounts
          so the controls aren't crowded. */}
      {video.description && !playing && (
        <figcaption className="border-t border-white/5 px-4 py-3 text-sm text-white/65 md:px-5">
          {video.description}
        </figcaption>
      )}
    </figure>
  );
}

/* ── Exported component ──────────────────────────────────────────────────── */

export interface VideoShowcaseClientProps {
  videos: VideoItem[];
  layout: "spotlight" | "grid";
}

export function VideoShowcaseClient({ videos, layout }: VideoShowcaseClientProps) {
  if (!videos.length) return null;

  if (layout === "spotlight") {
    const featuredIndex = Math.max(
      0,
      videos.findIndex((v) => v.featured),
    );
    const feature = videos[featuredIndex];
    if (!feature) return null;
    const rest = videos.filter((_, i) => i !== featuredIndex);

    return (
      <div className="space-y-6">
        <VideoFacade video={feature} large priority />
        {rest.length > 0 && (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((v, i) => (
              <li key={i}>
                <VideoFacade video={v} />
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {videos.map((v, i) => (
        <li key={i}>
          <VideoFacade video={v} priority={i === 0} />
        </li>
      ))}
    </ul>
  );
}
