import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Edge middleware — Content-Security-Policy + security hardening.
 *
 * Uses a per-request nonce so Next.js inline scripts and Payload admin UI work
 * without 'unsafe-inline'. The nonce is injected into <script> tags by
 * Next.js automatically when `nonce` is added to the headers (Next 13+).
 *
 * CSP domains to expand once confirmed:
 *   connect-src — add PostHog/analytics host when analytics is configured
 *   img-src     — add any external image CDN URLs if used
 */
export function proxy(_request: NextRequest) {
  const response = NextResponse.next();

  // ── Content-Security-Policy ─────────────────────────────────────────────
  // Nonce: cryptographically random, per-request, base64-encoded
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? "";

  // Build media host for img-src (same host as CMS uploads)
  const mediaHost = (() => {
    try {
      return serverUrl ? new URL(serverUrl).hostname : "";
    } catch {
      return "";
    }
  })();

  const imgSrc = ["'self'", "data:", "blob:", mediaHost && `https://${mediaHost}`]
    .filter(Boolean)
    .join(" ");

  const csp = [
    `default-src 'self'`,
    // 'unsafe-inline' needed for Tailwind v4's injected CSS (style-src cannot use nonces for styles)
    `style-src 'self' 'unsafe-inline'`,
    // Scripts: nonce + strict-dynamic for inline scripts.
    // 'unsafe-eval' is added only in development — React uses eval() for
    // error stack reconstruction and Turbopack HMR. Never present in production.
    process.env.NODE_ENV === "development"
      ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval'`
      : `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    `img-src ${imgSrc}`,
    `font-src 'self'`,
    // connect-src: self + WebSocket for Next.js HMR in dev
    process.env.NODE_ENV === "development"
      ? `connect-src 'self' ws://localhost:* wss://localhost:*`
      : `connect-src 'self'`,
    `media-src 'self' blob: ${mediaHost && `https://${mediaHost}`}`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    // frame-ancestors supersedes X-Frame-Options for modern browsers
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
  ]
    .map((d) => d.trim())
    .join("; ");

  response.headers.set("Content-Security-Policy", csp);
  // Make the nonce available to Next.js for automatic script nonce injection
  response.headers.set("x-nonce", nonce);

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
