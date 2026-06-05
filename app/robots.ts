import type { MetadataRoute } from "next";
import { serverUrl } from "@/lib/seo";

// AI / answer-engine crawlers we explicitly welcome (GEO/AEO).
const AI_AND_SEARCH_BOTS = [
  "GPTBot",
  "ClaudeBot",
  "PerplexityBot",
  "Google-Extended",
  "Bingbot",
  "Googlebot",
];

const PRIVATE = ["/admin", "/api/", "/preview", "/exit-preview"];

export default function robots(): MetadataRoute.Robots {
  const indexable = process.env.SITE_INDEXABLE === "true";

  // Beta / non-production: keep the whole site out of every index.
  if (!indexable) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE },
      ...AI_AND_SEARCH_BOTS.map((userAgent) => ({ userAgent, allow: "/", disallow: PRIVATE })),
    ],
    sitemap: `${serverUrl}/sitemap.xml`,
    host: serverUrl,
  };
}
