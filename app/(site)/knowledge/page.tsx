import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { GridMotif } from "@/components/ui/grid-motif";
import { Section } from "@/components/ui/section";
import { getArticles } from "@/lib/payload";
import { serverUrl } from "@/lib/seo";

export const revalidate = 3600;

const TITLE = "Knowledge";
const LEDE =
  "Engineering notes, guides and standards explainers for industrial power, solar and safety — written by the team that builds them.";

export function generateMetadata(): Metadata {
  const noindex = process.env.SITE_INDEXABLE !== "true";
  return {
    title: { absolute: `${TITLE} · Sustech Technology Ltd` },
    description: LEDE,
    alternates: { canonical: "/knowledge" },
    robots: noindex ? { index: false, follow: false } : undefined,
  };
}

function formatDate(value?: string | null): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "long" }).format(d);
}

export default async function KnowledgeIndexPage() {
  const articles = await getArticles();

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: TITLE,
          description: LEDE,
          url: `${serverUrl}/knowledge`,
          mainEntity: {
            "@type": "ItemList",
            itemListElement: articles.map((a, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${serverUrl}/knowledge/${a.slug}`,
              name: a.title,
            })),
          },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: serverUrl },
            { "@type": "ListItem", position: 2, name: TITLE, item: `${serverUrl}/knowledge` },
          ],
        }}
      />

      <section className="bg-ink-900 text-text-invert relative isolate overflow-hidden">
        <GridMotif tone="dark" />
        <Container className="relative py-20 md:py-28">
          <Eyebrow onDark>Insights</Eyebrow>
          <h1 className="text-display mt-4 max-w-3xl font-bold text-balance">{TITLE}</h1>
          <p className="text-lede text-text-invert-soft mt-4 max-w-2xl">{LEDE}</p>
        </Container>
      </section>

      <Section srTitle="Articles">
        {articles.length === 0 ? (
          <p className="text-text-soft border-border bg-surface-2 rounded-lg border border-dashed px-6 py-12 text-center">
            Articles are on the way — check back soon.
          </p>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => {
              const date = formatDate(a.publishedDate);
              return (
                <li key={a.id}>
                  <Card interactive className="relative flex h-full flex-col p-6">
                    <h2 className="text-h3 text-ink-900 font-semibold">{a.title}</h2>
                    {a.excerpt && (
                      <p className="text-text-soft mt-2 flex-1 text-[0.9375rem]">{a.excerpt}</p>
                    )}
                    {(a.author || date) && (
                      <p className="text-text-soft mt-4 font-mono text-xs tracking-[0.04em] uppercase">
                        {[a.author, date].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    <Link
                      href={`/knowledge/${a.slug}`}
                      prefetch={false}
                      aria-label={`${a.title} — read article`}
                      className="focus-visible:outline-brand absolute inset-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2"
                    />
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </Section>
    </>
  );
}
