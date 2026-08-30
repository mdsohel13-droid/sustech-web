import type { MetadataRoute } from "next";
import { serverUrl } from "@/lib/seo";

// AI / answer-engine + search crawlers we explicitly welcome (GEO/AEO). Naming
// them documents intent and future-proofs against a tightened `*` group; the AI
// answer engines are the ones that increasingly decide B2B discovery.
const AI_AND_SEARCH_BOTS = [
  // Search
  "Googlebot",
  "Bingbot",
  "DuckDuckBot",
  "YandexBot",
  // OpenAI — training, search index, and on-demand browsing
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  // Anthropic
  "ClaudeBot",
  "anthropic-ai",
  "Claude-Web",
  // Perplexity — index + on-demand
  "PerplexityBot",
  "Perplexity-User",
  // Google Gemini / Vertex grounding
  "Google-Extended",
  // Apple Intelligence / Siri
  "Applebot",
  "Applebot-Extended",
  // Others that feed answer engines
  "Amazonbot",
  "meta-externalagent",
  "cohere-ai",
  "CCBot",
  "mistralai",
];

// /api/og is a public share-image endpoint — keep it crawlable even though the
// rest of /api (data + mutations) is disallowed. Longer, more specific `allow`
// path wins over the `disallow` for that URL.
const ALLOW = ["/", "/api/og"];
const PRIVATE = ["/admin", "/api/", "/preview", "/exit-preview"];

export default function robots(): MetadataRoute.Robots {
  const indexable = process.env.SITE_INDEXABLE === "true";

  // Beta / non-production: keep the whole site out of every index.
  if (!indexable) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [
      { userAgent: "*", allow: ALLOW, disallow: PRIVATE },
      ...AI_AND_SEARCH_BOTS.map((userAgent) => ({ userAgent, allow: ALLOW, disallow: PRIVATE })),
    ],
    sitemap: `${serverUrl}/sitemap.xml`,
    host: serverUrl,
  };
}
