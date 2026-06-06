import Image from "next/image";
import Link from "next/link";
import type { SiteSetting } from "@/payload-types";
import { cn } from "@/lib/utils";

function asMedia(logo?: SiteSetting["logo"]) {
  return logo && typeof logo === "object" && logo.url ? logo : null;
}

/**
 * Brand logo. Renders the CMS-managed logo (site-settings → Brand → logo) when present, so a
 * non-technical admin can swap it without a deploy. Falls back to a wordmark + grid glyph if the
 * CMS field is empty. On dark backgrounds the raster sits on a white chip for guaranteed contrast.
 * The accessible name carries the full legal name for crawlers and screen readers.
 */
export function Logo({
  className,
  onDark = false,
  logo,
}: {
  className?: string;
  onDark?: boolean;
  logo?: SiteSetting["logo"];
}) {
  const media = asMedia(logo);

  return (
    <Link
      href="/"
      aria-label="Sustech Technology Ltd — home"
      className={cn(
        "group focus-visible:outline-brand inline-flex items-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-2",
        media ? "" : "gap-2.5",
        className,
      )}
    >
      {media ? (
        <span
          className={cn("inline-flex items-center", onDark && "rounded-md bg-white px-2.5 py-1.5")}
        >
          {/*
           * next/image with intrinsic w/h from the CMS — same-origin (Payload serves at /api/media)
           * so no remotePatterns needed. The header logo is above-the-fold so we prioritise it for
           * LCP; the footer logo is lazy by default. CMS-driven sizing means a non-technical admin
           * can swap the asset without code changes.
           */}
          <Image
            src={media.url ?? ""}
            alt="Sustech Technology Ltd"
            width={media.width ?? 508}
            height={media.height ?? 268}
            priority={!onDark}
            sizes={onDark ? "120px" : "160px"}
            className={cn("w-auto", onDark ? "h-7" : "h-8 sm:h-9")}
          />
        </span>
      ) : (
        <>
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className={cn("h-7 w-7", onDark ? "text-brand-300" : "text-brand")}
            fill="none"
            stroke="currentColor"
          >
            <rect x="1.5" y="1.5" width="21" height="21" rx="3" strokeWidth="1.5" />
            <path d="M8 1.5v21M16 1.5v21M1.5 8h21M1.5 16h21" strokeWidth="0.75" opacity="0.6" />
            <path d="M13 6l-5 7h4l-2 5 7-8h-4z" fill="currentColor" stroke="none" />
          </svg>
          <span
            className={cn(
              "font-display text-xl font-bold tracking-tight",
              onDark ? "text-text-invert" : "text-ink-900",
            )}
          >
            Sustech
          </span>
        </>
      )}
    </Link>
  );
}
