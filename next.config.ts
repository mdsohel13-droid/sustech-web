import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

// Beta safety: until the production cutover flips SITE_INDEXABLE=true, send an
// X-Robots-Tag: noindex header on every response (belt-and-suspenders alongside
// robots.txt and per-page robots meta). See DEPLOYMENT-AND-VPS.md §4.
const indexable = process.env.SITE_INDEXABLE === "true";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: { formats: ["image/avif", "image/webp"] },
  async headers() {
    const headers = indexable
      ? securityHeaders
      : [...securityHeaders, { key: "X-Robots-Tag", value: "noindex, nofollow" }];
    return [{ source: "/:path*", headers }];
  },
};

// NOTE: Content-Security-Policy is added via middleware once the asset/domain list
// (chat widget, analytics) is known. `output: "standalone"` is added at the Docker
// packaging stage (see DEPLOYMENT-AND-VPS.md).
export default withPayload(nextConfig);
