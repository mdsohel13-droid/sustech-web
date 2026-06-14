/**
 * Video helpers — shared by the server-rendered VideoShowcase view (for
 * VideoObject schema) and the client facade player (for the embed URL).
 *
 * Pure functions only (no React, no "use client") so both the server and
 * client bundles can import them without pulling in the other side.
 *
 * Privacy (CLAUDE.md §Privacy): YouTube embeds use the `youtube-nocookie.com`
 * domain and are only ever mounted AFTER the user clicks play (facade pattern),
 * so no third-party tracking cookie is set until the user opts in by clicking.
 */

/** Where a CMS video comes from. */
export type VideoSource = "upload" | "url";

/** A parsed third-party embed (YouTube / Vimeo). */
export interface VideoEmbed {
  provider: "youtube" | "vimeo";
  id: string;
  /** Base embed URL WITHOUT autoplay — add it at play time via withAutoplay(). */
  embedUrl: string;
}

/** Normalised, render-ready video item passed to the client player. */
export interface VideoItem {
  title: string;
  description?: string | null;
  posterUrl?: string | null;
  posterAlt?: string | null;
  /** Human-readable badge, e.g. "1:24". */
  duration?: string | null;
  source: VideoSource;
  /** Self-hosted MP4 URL (when source === "upload"). */
  mp4Url?: string | null;
  /** Parsed embed (when source === "url"). */
  embed?: VideoEmbed | null;
  /** Render large in the "spotlight" layout. */
  featured?: boolean;
}

const YT_RE =
  /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/i;
const VIMEO_RE = /vimeo\.com\/(?:video\/|channels\/[\w]+\/|groups\/[\w]+\/videos\/)?(\d+)/i;

/**
 * Parse a YouTube or Vimeo URL into a privacy-preserving embed descriptor.
 * Returns null if the URL is not a recognised provider (caller should fall
 * back to a plain link or hide the item).
 */
export function parseVideoEmbed(url?: string | null): VideoEmbed | null {
  if (!url || typeof url !== "string") return null;
  const u = url.trim();

  const yt = u.match(YT_RE);
  if (yt?.[1]) {
    return {
      provider: "youtube",
      id: yt[1],
      // nocookie domain + no related videos from other channels
      embedUrl: `https://www.youtube-nocookie.com/embed/${yt[1]}?rel=0`,
    };
  }

  const vm = u.match(VIMEO_RE);
  if (vm?.[1]) {
    return {
      provider: "vimeo",
      id: vm[1],
      embedUrl: `https://player.vimeo.com/video/${vm[1]}`,
    };
  }

  return null;
}

/** Append autoplay to an embed URL, respecting an existing query string. */
export function withAutoplay(embedUrl: string): string {
  const sep = embedUrl.includes("?") ? "&" : "?";
  return `${embedUrl}${sep}autoplay=1`;
}

/**
 * Convert a "M:SS" / "H:MM:SS" / "SS" duration string to an ISO-8601 duration
 * (e.g. "0:50" → "PT50S", "1:24" → "PT1M24S", "1:02:03" → "PT1H2M3S") for
 * VideoObject schema. Returns undefined when the input is empty or unparseable.
 */
export function toIso8601Duration(text?: string | null): string | undefined {
  if (!text) return undefined;
  const parts = text
    .trim()
    .split(":")
    .map((p) => Number.parseInt(p, 10));
  if (parts.length === 0 || parts.some((n) => Number.isNaN(n))) return undefined;

  let h = 0;
  let m = 0;
  let s = 0;
  if (parts.length === 3) [h, m, s] = parts as [number, number, number];
  else if (parts.length === 2) [m, s] = parts as [number, number];
  else if (parts.length === 1) [s] = parts as [number];
  else return undefined;

  let out = "PT";
  if (h) out += `${h}H`;
  if (m) out += `${m}M`;
  if (s) out += `${s}S`;
  return out === "PT" ? undefined : out;
}

/**
 * Best-effort poster for a third-party video when the editor didn't upload one.
 * YouTube exposes a stable thumbnail CDN; Vimeo does not without an API call,
 * so it returns null (the player shows a branded gradient placeholder).
 */
export function fallbackPoster(embed: VideoEmbed | null | undefined): string | null {
  if (embed?.provider === "youtube") {
    return `https://i.ytimg.com/vi/${embed.id}/hqdefault.jpg`;
  }
  return null;
}
