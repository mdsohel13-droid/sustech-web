import Image from "next/image";
import type { ComponentType } from "react";
import type { Media } from "@/payload-types";

/**
 * EntityIcon — the icon shown on service cards / sector tiles.
 *
 * If the admin uploaded a custom icon (e.g. a 3D PNG with transparent
 * background — `pnpm icons:3d` pre-loads an MIT-licensed set), it renders that
 * image; otherwise it falls back to the built-in line-SVG so nothing ever
 * looks empty. Decorative (alt="") — the card title carries the meaning.
 */
export function EntityIcon({
  customIcon,
  Fallback,
}: {
  customIcon?: number | Media | null;
  Fallback: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}) {
  const img = customIcon && typeof customIcon === "object" && customIcon.url ? customIcon : null;
  if (img?.url) {
    // Payload returns ABSOLUTE media URLs (serverURL-based). Serve them as
    // same-origin relative paths so next/image optimises without needing
    // remotePatterns, and the URL stays correct on every host.
    const src = img.url.startsWith("http") ? img.url.replace(/^https?:\/\/[^/]+/, "") : img.url;
    return (
      <Image
        src={src}
        alt=""
        width={64}
        height={64}
        className="h-8 w-8 object-contain"
        loading="lazy"
      />
    );
  }
  return <Fallback className="h-6 w-6" aria-hidden />;
}
