import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Edge middleware — Content-Security-Policy + security hardening.
 *
 * Most routes are statically prerendered for performance (Lighthouse ~98), so
 * scripts cannot carry a per-request nonce — a nonce + 'strict-dynamic' would
 * block every baked-in <script> and the app would never hydrate (pages stuck on
 * their loading skeletons in production). We therefore allow same-origin chunks
 * ('self') + Next's inline RSC-streaming scripts ('unsafe-inline'). Every other
 * directive stays strict (object-src none, base-uri self, frame-ancestors none,
 * connect-src self, form-action self), so the XSS surface stays small.
 *
 * CSP domains to expand once confirmed:
 *   connect-src — add PostHog/analytics host when analytics is configured
 *   img-src     — add any external image CDN URLs if used
 */
export function proxy(_request: NextRequest) {
  // ── Content-Security-Policy ─────────────────────────────────────────────
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? "";

  // Build media host for img-src (same host as CMS uploads)
  const mediaHost = (() => {
    try {
      return serverUrl ? new URL(serverUrl).hostname : "";
    } catch {
      return "";
    }
  })();

  // i.ytimg.com = YouTube poster thumbnails used by the Video Showcase block
  // when an editor links a YouTube video without uploading a custom poster.
  const imgSrc = [
    "'self'",
    "data:",
    "blob:",
    "https://i.ytimg.com",
    mediaHost && `https://${mediaHost}`,
  ]
    .filter(Boolean)
    .join(" ");

  // frame-src = the only third-party domains we ever iframe: privacy-enhanced
  // YouTube and Vimeo players, mounted lazily by the Video Showcase block ONLY
  // after the visitor clicks play (so no third-party cookie is set up-front).
  const frameSrc =
    "frame-src 'self' https://www.youtube-nocookie.com https://www.youtube.com https://player.vimeo.com";

  const csp = [
    `default-src 'self'`,
    // 'unsafe-inline' needed for Tailwind v4's injected CSS (style-src cannot use nonces for styles)
    `style-src 'self' 'unsafe-inline'`,
    // Static prerendering can't carry a per-request nonce, so allow same-origin
    // chunks ('self') + Next's inline streaming scripts ('unsafe-inline').
    // 'unsafe-eval' only in dev (React error overlay + Turbopack HMR).
    process.env.NODE_ENV === "development"
      ? `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://growth.sustechltd.com`
      : `script-src 'self' 'unsafe-inline' https://growth.sustechltd.com`,
    `img-src ${imgSrc}`,
    `font-src 'self'`,
    // connect-src: self + WebSocket for Next.js HMR in dev
    process.env.NODE_ENV === "development"
      ? `connect-src 'self' ws://localhost:* wss://localhost:* https://growth.sustechltd.com`
      : `connect-src 'self' https://growth.sustechltd.com`,
    `media-src 'self' blob: ${mediaHost && `https://${mediaHost}`}`,
    frameSrc,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    // frame-ancestors supersedes X-Frame-Options for modern browsers
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
  ]
    .map((d) => d.trim())
    .join("; ");

  const response = NextResponse.next();
  response.headers.set("Content-Security-Policy", csp);

  // ── Additional security headers ─────────────────────────────────────────
  // These are belt-and-suspenders alongside next.config.ts headers.
  // Middleware headers take precedence because they run at the edge.

  // Expand Permissions-Policy to deny all non-required powerful features
  response.headers.set(
    "Permissions-Policy",
    [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "payment=()",
      "usb=()",
      "serial=()",
      "bluetooth=()",
      "display-capture=()",
      "ambient-light-sensor=()",
      "accelerometer=()",
      "gyroscope=()",
      "magnetometer=()",
    ].join(", "),
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image  (Next.js image optimiser)
     * - favicon.ico
     * - public assets (fonts, images, llms.txt, robots.txt, sitemap.xml)
     */
    "/((?!_next/static|_next/image|favicon.ico|fonts|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff2?|ttf|txt|xml)$).*)",
  ],
};
