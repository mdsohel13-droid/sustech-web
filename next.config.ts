import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const securityHeaders = [
  // X-Frame-Options: kept as IE fallback; CSP frame-ancestors 'none' covers modern browsers.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Expanded to deny all non-required powerful browser features.
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=(), bluetooth=(), display-capture=(), ambient-light-sensor=(), accelerometer=(), gyroscope=(), magnetometer=()",
  },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

// Beta safety: until the production cutover flips SITE_INDEXABLE=true, send an
// X-Robots-Tag: noindex header on every response (belt-and-suspenders alongside
// robots.txt and per-page robots meta). See DEPLOYMENT-AND-VPS.md §4.
const indexable = process.env.SITE_INDEXABLE === "true";

// Payload serves CMS media at same-origin absolute URLs (e.g.
// `https://sustechltd.com/api/media/file/logo.webp`). next/image rejects external hosts
// unless they're in `remotePatterns`, so we whitelist the configured server URL host (it's
// "external" only in name — same Next.js process serves it) plus the dev hosts.
const serverUrlHost = (() => {
  try {
    const u = process.env.NEXT_PUBLIC_SERVER_URL ?? process.env.SITE_URL;
    return u ? new URL(u).hostname : null;
  } catch {
    return null;
  }
})();

// Dev-only local hostnames — HTTP allowed
const devHosts = ["localhost", "127.0.0.1"];
const prodHosts = Array.from(new Set([serverUrlHost].filter((h): h is string => Boolean(h))));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Never expose the Next.js version to potential attackers.
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    // Cache optimised image variants for 24 h (default is 60 s — too short for a CMS site).
    minimumCacheTTL: 86400,
    // Breakpoints tuned to the design system viewport targets.
    deviceSizes: [640, 768, 1024, 1280, 1440],
    imageSizes: [16, 32, 64, 128, 256],
    remotePatterns: [
      // Production hostname — HTTPS only
      ...prodHosts.flatMap((hostname) => [{ protocol: "https" as const, hostname }]),
      // Dev hosts — HTTP + HTTPS
      ...devHosts.flatMap((hostname) => [
        { protocol: "http" as const, hostname },
        { protocol: "https" as const, hostname },
      ]),
    ],
  },
  async headers() {
    const headers = indexable
      ? securityHeaders
      : [...securityHeaders, { key: "X-Robots-Tag", value: "noindex, nofollow" }];
    return [{ source: "/:path*", headers }];
  },
  async redirects() {
    return [
      // Prevent a stray /home link from 404-ing (CMS slug is "home" but route is /)
      { source: "/home", destination: "/", permanent: true },
    ];
  },
};

// CSP is injected per-request via middleware.ts using a nonce-based approach.
// output: "standalone" is injected at Docker packaging time (see DEPLOYMENT-AND-VPS.md).
export default withPayload(nextConfig);
