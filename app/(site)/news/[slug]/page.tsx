/**
 * /news/[slug] — Individual news article page
 *
 * Server-rendered with full GEO/AEO schema:
 *   - NewsArticle (schema.org)
 *   - FAQPage (when faq array is populated)
 *   - BreadcrumbList
 */
import { RichText } from "@payloadcms/richtext-lexical/react";
import type { Metadata } from "next";
import Link from "next/link";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import type { ComponentProps } from "react";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Section } from "@/components/ui/section";
import { getNewsItemBySlug, getNewsItems } from "@/lib/payload";
import { serverUrl } from "@/lib/seo";

type RichData = ComponentProps<typeof RichText>["data"];

export const revalidate = 3600;
export const dynamicParams = true;
export const generateStaticParams = (): { slug: string }[] => [];

const CATEGORY_LABELS: Record<string, string> = {
  "company-update": "Company Update",
  "industry-news": "Industry News",
  "product-update": "Product Update",
  "ai-tech": "AI & Technology",
  "market-insight": "Market Insight",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await getNewsItemBySlug(slug);
  if (!item) return {};
  const noindex = process.env.SITE_INDEXABLE !== "true";
  const ogUrl = `/api/og?title=${encodeURIComponent(item.title)}&section=Insight${item.summary ? `&description=${encodeURIComponent(item.summary.slice(0, 120))}` : ""}`;
  return {
    title: { absolute: `${item.title} · Sustech Technology Ltd` },
    description: item.summary ?? undefined,
    alternates: { canonical: `/news/${item.slug}` },
    robots: noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "article",
      title: item.title,
      description: item.summary ?? undefined,
      url: `/news/${item.slug}`,
      publishedTime: item.publishedDate ?? undefined,
      images: [{ url: ogUrl, width: 1200, height: 630, alt: item.title }],
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function NewsArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { isEnabled } = await draftMode();
  const item = await getNewsItemBySlug(slug, isEnabled);
  if (!item) notFound();

  const faq = item.faq ?? [];
  const categoryLabel = CATEGORY_LABELS[item.category] ?? item.category;

  // Related: 3 latest from the same category (excluding this one)
  const related = await getNewsItems({ limit: 4, category: item.category });
  const relatedFiltered = related.filter((n) => n.slug !== item.slug).slice(0, 3);

  return (
    <>
      {/* NewsArticle schema — primary GEO/AEO signal */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          "@id": `${serverUrl}/news/${item.slug}`,
          headline: item.title,
          description: item.summary ?? undefined,
          datePublished: item.publishedDate ?? undefined,
          dateModified: item.updatedAt ?? undefined,
          url: `${serverUrl}/news/${item.slug}`,
          publisher: {
            "@type": "Organization",
            name: "Sustech Technology Ltd",
            url: serverUrl,
          },
          author: {
            "@type": "Organization",
            name: item.agentMeta?.generatedBy ?? "Sustech Technology Ltd",
          },
          articleSection: categoryLabel,
          ...(item.source ? { creditText: item.source, acquireLicensePage: item.sourceUrl } : {}),
        }}
      />
      {/* FAQPage schema (highest-citability GEO signal) */}
      {faq.length > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faq.map((f) => ({
              "@type": "Question",
              name: f.question,
              acceptedAnswer: { "@type": "Answer", text: f.answer },
            })),
          }}
        />
      )}

      {/* Article header */}
      <section className="bg-ink-900 text-text-invert relative isolate overflow-hidden">
        <Container className="relative py-14 md:py-20">
          <Breadcrumbs
            items={[
              { name: "Home", href: "/" },
              { name: "News", href: "/news" },
              { name: item.title },
            ]}
            onDark
            className="mb-6"
          />
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Link
              href={`/news?category=${item.category}`}
              className="bg-brand/20 text-brand-200 hover:bg-brand/30 rounded-full px-3 py-1 font-mono text-xs transition"
            >
              {categoryLabel}
            </Link>
            {item.publishedDate && (
              <time
                dateTime={item.publishedDate}
                className="text-text-invert-soft font-mono text-xs"
              >
                {new Date(item.publishedDate).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </time>
            )}
            {item.agentMeta?.generatedBy && (
              <span className="text-text-invert-soft font-mono text-xs">
                · {item.agentMeta.generatedBy}
              </span>
            )}
          </div>
          <h1 className="text-display mt-2 max-w-3xl font-bold text-balance">{item.title}</h1>
          {item.summary && (
            <p className="text-lede text-text-invert-soft mt-4 max-w-2xl">{item.summary}</p>
          )}
        </Container>
      </section>

      {/* Article body */}
      <Section containerSize="default">
        <article className="mx-auto max-w-3xl">
          {/* Source attribution */}
          {item.source && (
            <div className="border-border mb-6 flex items-center gap-2 rounded-lg border bg-slate-50 px-4 py-3 text-sm">
              <Eyebrow>Source</Eyebrow>
              {item.sourceUrl ? (
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-brand hover:underline"
                >
                  {item.source}
                </a>
              ) : (
                <span className="text-text-soft">{item.source}</span>
              )}
            </div>
          )}

          <div className="richtext">
            <RichText data={item.body as RichData} />
          </div>

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-2">
              {item.tags.map((t) => (
                <span
                  key={t.id}
                  className="bg-ink-50 text-ink-700 rounded-full px-3 py-1 font-mono text-xs"
                >
                  #{t.tag}
                </span>
              ))}
            </div>
          )}

          {/* FAQ */}
          {faq.length > 0 && (
            <section className="mt-12">
              <h2 className="text-h2 font-semibold">Frequently asked questions</h2>
              <dl className="divide-border mt-4 divide-y">
                {faq.map((f, i) => (
                  <div key={f.id ?? i} className="py-5">
                    <dt className="text-ink-900 text-lg font-semibold">{f.question}</dt>
                    <dd className="text-text-soft mt-2">{f.answer}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {/* Agent disclosure */}
          {item.agentMeta?.generatedBy && (
            <p className="text-text-soft mt-12 border-t pt-4 font-mono text-xs">
              This article was drafted by the Hermes AI agent
              {item.agentMeta.model ? ` (${item.agentMeta.model})` : ""} and reviewed by the Sustech
              editorial team before publication.
            </p>
          )}
        </article>
      </Section>

      {/* Related articles */}
      {relatedFiltered.length > 0 && (
        <Section tone="muted" title="Related updates">
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedFiltered.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/news/${r.slug}`}
                  className="border-border bg-surface hover:border-brand/30 focus-visible:outline-brand block h-full rounded-xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  <p className="text-ink-900 leading-snug font-semibold">{r.title}</p>
                  {r.summary && (
                    <p className="text-text-soft mt-2 line-clamp-2 text-sm">{r.summary}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* CTA */}
      <section className="bg-ink-900 text-text-invert relative isolate overflow-hidden">
        <Container className="relative py-14 text-center">
          <h2 className="text-h2 mx-auto max-w-xl font-semibold text-balance">
            Have an EPC project in mind?
          </h2>
          <p className="text-text-invert-soft mx-auto mt-3 max-w-lg text-sm">
            Our engineers are ready to scope it with you — no obligation.
          </p>
          <Link
            href="/request-quote"
            className="bg-brand hover:bg-brand-600 focus-visible:outline-brand mt-6 inline-block rounded-lg px-6 py-3 font-semibold text-white transition focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Request a Consultation
          </Link>
        </Container>
      </section>
    </>
  );
}
