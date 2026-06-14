import type { CollectionBeforeValidateHook } from "payload";
import { CITATION_REQUIRED_CATEGORIES } from "../fields/citations";

/**
 * Citation + content guard (Lead Engine master plan §3.1d). Runs on
 * articles/news-items at validate time — so it fires on Hermes ingest drafts
 * AND on human publishes, not only at the nightly stage.
 *
 * Enforced ONLY when the document is being PUBLISHED (`_status === 'published'`)
 * — drafts may be incomplete while an editor works. At publish:
 *  1. Citation-required categories (market-data/tariffs/policy/finance/
 *     calculations) must carry ≥1 citation.
 *  2. Body must pass content-lint (no literal company stats, no guarantees).
 *
 * Throwing here blocks the save with a clear admin error.
 */
export const citationGuard: CollectionBeforeValidateHook = async ({ data, originalDoc }) => {
  if (!data) return data;

  // Only guard the published state; drafts/autosaves pass freely.
  const status = (data._status ?? originalDoc?._status) as string | undefined;
  if (status !== "published") return data;

  const category = (data.category ?? originalDoc?.category) as string | undefined;
  const citations = (data.citations ?? originalDoc?.citations ?? []) as unknown[];

  if (category && CITATION_REQUIRED_CATEGORIES.has(category) && citations.length === 0) {
    throw new Error(
      `Cannot publish a "${category}" item with no citations. Add at least one source ` +
        `in the Citations section (every number must be sourced).`,
    );
  }

  const body = data.body ?? originalDoc?.body;
  if (body) {
    // Dynamic import keeps this hook out of any client bundle graph.
    const { lintRichText } = await import("../../lib/content/lint");
    const findings = lintRichText(body);
    if (findings.length > 0) {
      const lines = findings.slice(0, 5).map((f) => `• "${f.match}" — ${f.hint}`);
      throw new Error(
        `Content check failed (${findings.length} issue${findings.length > 1 ? "s" : ""}):\n` +
          lines.join("\n"),
      );
    }
  }

  return data;
};
