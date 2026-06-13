/**
 * Rule-based related content (master plan §3.3) — no ML. Picks supporting
 * articles by recency, excluding the current one. Server-only; results are
 * server-rendered as crawlable internal links.
 */
import { getArticles } from "@/lib/payload";
import type { Article } from "@/payload-types";

export interface RelatedQuery {
  excludeSlug?: string;
  limit?: number;
}

/** Most-recent published articles, excluding the current slug. */
export async function getRelatedArticles({
  excludeSlug,
  limit = 3,
}: RelatedQuery): Promise<Article[]> {
  const all = await getArticles();
  return all.filter((a) => a.slug !== excludeSlug).slice(0, Math.max(0, limit));
}
