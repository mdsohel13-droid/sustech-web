import type { Article, NewsItem, Source } from "@/payload-types";

/**
 * Sources & References (master plan §3.1c). Server component, auto-appended
 * when a doc has citations. Renders a numbered `<ol>` with `id="ref-n"`
 * anchors that the in-body `[cite:n]` superscripts link to. Outbound links to
 * tier-1/2 sources are NOT nofollow — authoritative outbound links help GEO.
 *
 * AI/SEO: this is real server-rendered HTML, so crawlers and AI engines see
 * the full bibliography alongside the Schema.org `citation` graph.
 */

type Citation =
  | NonNullable<Article["citations"]>[number]
  | NonNullable<NewsItem["citations"]>[number];

const TIER_LABEL: Record<string, string> = {
  "tier1-gov": "Government",
  "tier1-multilateral": "Multilateral",
  "tier2-analyst": "Analyst",
  "tier3-press": "Press",
};

const TIER_CLASS: Record<string, string> = {
  "tier1-gov": "bg-brand/10 text-brand",
  "tier1-multilateral": "bg-brand/10 text-brand",
  "tier2-analyst": "bg-solar/15 text-solar-text",
  "tier3-press": "bg-surface-2 text-text-soft",
};

function fmtDate(d?: string | null): string | null {
  if (!d) return null;
  const date = new Date(d);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString("en-GB");
}

export function SourcesReferences({ citations }: { citations?: Citation[] | null }) {
  if (!citations || citations.length === 0) return null;

  return (
    <section aria-labelledby="sources-heading" className="border-border mt-12 border-t pt-8">
      <h2 id="sources-heading" className="text-h3 font-semibold">
        Sources &amp; references
      </h2>
      <ol className="mt-4 space-y-3 text-sm">
        {citations.map((c, i) => {
          const n = i + 1;
          const source = (typeof c.source === "object" ? c.source : null) as Source | null;
          const tier = source?.tier ?? "tier3-press";
          const published = fmtDate(c.sourcePublishedDate);
          const accessed = fmtDate(c.accessedDate);
          return (
            <li key={c.id ?? n} id={`ref-${n}`} className="scroll-mt-24">
              <span className="text-text-soft mr-1 font-semibold">{n}.</span>
              <a
                href={c.url}
                target="_blank"
                rel="noopener"
                className="text-brand font-medium underline-offset-2 hover:underline"
              >
                {c.title || c.quotedClaim}
              </a>
              {source && (
                <>
                  {" "}
                  <span className="text-text-soft">— {source.name}</span>{" "}
                  <span
                    className={`ml-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      TIER_CLASS[tier] ?? TIER_CLASS["tier3-press"]
                    }`}
                  >
                    {TIER_LABEL[tier] ?? "Press"}
                  </span>
                </>
              )}
              {c.locator && <span className="text-text-soft"> · {c.locator}</span>}
              <span className="text-text-soft block text-xs">
                {published && <>Published {published}. </>}
                {accessed && <>Accessed {accessed}.</>}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
