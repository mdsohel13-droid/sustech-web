import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge class names with Tailwind-aware conflict resolution (shadcn/ui convention). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Payload returns CMS media URLs as ABSOLUTE same-origin URLs
 * (e.g. `http://localhost:4123/api/media/file/logo.webp` in dev,
 * `https://sustechltd.com/api/media/file/logo.webp` in prod).
 *
 * Next 16's `/_next/image` optimizer treats any absolute URL as remote, runs an SSRF check,
 * and REFUSES upstream URLs that resolve to private IPs (localhost, 10.x, 192.168.x). That
 * kills our same-origin pattern in dev and in any private-network deployment.
 *
 * Fix: when the URL points at our own origin, strip the scheme+host so it becomes a relative
 * path. The optimizer then treats it as a local image and skips the SSRF check entirely.
 * Falls through unchanged for genuinely external URLs.
 */
export function toRelativeIfSameOrigin(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("/")) return url; // already relative
  const ownOrigin = process.env.NEXT_PUBLIC_SERVER_URL ?? process.env.SITE_URL;
  try {
    const u = new URL(url);
    if (ownOrigin) {
      const own = new URL(ownOrigin);
      if (u.host === own.host) return u.pathname + u.search;
    }
    // Dev/CI safety net: localhost/127.0.0.1 hosts are always same-origin in this app.
    if (u.hostname === "localhost" || u.hostname === "127.0.0.1") {
      return u.pathname + u.search;
    }
    return url;
  } catch {
    return url;
  }
}
