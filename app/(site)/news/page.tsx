/**
 * /news — Daily news & updates feed
 *
 * Server-rendered, ISR (hourly). All content visible in raw HTML for
 * crawlers and AI engines (GEO/AEO). Displays published NewsItems in
 * reverse-chronological order with category filtering via URL search params.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { getNewsItems, getSiteSettings } from "@/lib/payload";
import { serverUrl } from "@/lib/seo";
import type { NewsItem } from "@/payload-types";

export const revalidate = 3600;

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "company-update", label: "Company Updates" },
  { value: "industry-news", label: "Industry News" },
  { value: "product-update", label: "Product Updates" },
  { value: "ai-tech", label: "AI & Technology" },
  { value: "market-insight", label: "Market Insights" },
] as const;

const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c.label]),
);

export async function generateMetadata(): Promise<Metadata> {
  const noindex = process.env.SITE_INDEXABLE !== "true";
  return {
    title: { absolute: "News & Updates · Sustech Technology Ltd" },
    description:
      "Daily updates on the solar energy sector, electrical EPC, smart buildings, " +
      "and market insights from Sustech Technology Ltd, Bangladesh.",
    alternates: { canonical: "/news" },
    robots: noindex ? { index: false, follow: false } : undefined,
  };
}

function formatDate(d: string | null | undefined): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function CategoryBadge({ category }: { category: string }) {
  const colourMap: Record<string, string> = {
    "company-update": "bg-brand/10 text-brand-700",
    "industry-news": "bg-energy/10 text-energy-700",
    "product-update": "bg-solar/10 text-solar-700",
    "ai-tech": "bg-ink-100 text-ink-700",
    "market-insight": "bg-slate-100 text-slate-700",
  };
  const cls = colourMap[category] ?? "bg-slate-100 text-slate-700";
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 font-mono text-xs tracking-wide ${cls}`}
    >
      {CATEGORY_LABELS[category] ?? category}
    </span>
  );
}

function NewsCard({ item }: { item: NewsItem }) {
  return (
    <article>
      <Link
        href={`/news/${item.slug}`}
        className="border-border bg-surface hover:border-brand/30 focus-visible:outline-brand block h-full rounded-xl border p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <div className="mb-3 flex items-center gap-3">
          <CategoryBadge category={item.category} />
          {item.publishedDate && (
            <time dateTime={item.publishedDate} className="text-text-soft font-mono text-xs">
              {formatDate(item.publishedDate)}
            </time>
          )}
        </div>
        <h2 className="text-ink-900 text-lg leading-snug font-semibold">{item.title}</h2>
        {item.summary && (
          <p className="text-text-soft mt-2 line-clamp-3 text-sm leading-relaxed">{item.summary}</p>
        )}
        {item.source && (
          <p className="text-text-soft mt-3 font-mono text-xs">Source: {item.source}</p>
        )}
      </Link>
    </article>
  );
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category = "all" } = await searchParams;
  const validCategory = CATEGORIES.find((c) => c.value === category)?.value ?? "all";

  const [newsItems, settings] = await Promise.all([
    getNewsItems({ category: validCategory }),
    getSiteSettings(),
  ]);

  return (
    <>
      {/* ItemList schema for the news feed */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Sustech News & Updates",
          url: `${serverUrl}/news`,
          numberOfItems: newsItems.length,
          itemListElement: newsItems.slice(0, 20).map((item, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${serverUrl}/news/${item.slug}`,
            name: item.title,
          })),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: serverUrl },
            { "@type": "ListItem", position: 2, name: "News & Updates", item: `${serverUrl}/news` },
          ],
        }}
      />

      {/* Hero */}
      <section className="bg-ink-900 text-text-invert relative isolate overflow-hidden">
        <Container className="relative py-16 md:py-20">
          <Eyebrow onDark>Latest</Eyebrow>
          <h1 className="text-display mt-3 max-w-2xl font-bold text-balance">News &amp; Updates</h1>
          <p className="text-lede text-text-invert-soft mt-4 max-w-xl">
            Daily updates on solar energy, electrical EPC, smart buildings, AI technology, and
            Bangladesh market insights — curated and written by our team and the Hermes AI agent.
          </p>
          <p className="text-text-invert-soft mt-2 font-mono text-xs">
            Updated by {settings.companyName}
          </p>
        </Container>
      </section>

      {/* Category tabs */}
      <div className="border-border sticky top-[var(--header-h,64px)] z-30 border-b bg-white/90 backdrop-blur-sm">
        <Container>
          <nav aria-label="Filter by category" className="-mb-px flex gap-1 overflow-x-auto py-1">
            {CATEGORIES.map((c) => {
              const active = c.value === validCategory;
              return (
                <Link
                  key={c.value}
                  href={c.value === "all" ? "/news" : `/news?category=${c.value}`}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-full px-4 py-2 font-mono text-sm whitespace-nowrap transition ${
                    active
                      ? "bg-brand text-white"
                      : "text-text-soft hover:bg-ink-50 hover:text-ink-900"
                  }`}
                >
                  {c.label}
                </Link>
              );
            })}
          </nav>
        </Container>
      </div>

      {/* Grid */}
      <Container className="py-12 md:py-16">
        {newsItems.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-text-soft text-lg">No articles in this category yet.</p>
            <p className="text-text-soft mt-2 text-sm">
              The Hermes AI agent publishes daily — check back tomorrow.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {newsItems.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
