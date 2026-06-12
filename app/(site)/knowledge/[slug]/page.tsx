import { RichText } from "@payloadcms/richtext-lexical/react";
import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import type { ComponentProps } from "react";
import { CitedRichText } from "@/components/sections/cited-rich-text";
import { SourcesReferences } from "@/components/sections/sources-references";
import { JsonLd } from "@/components/seo/json-ld";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Section } from "@/components/ui/section";
import { getArticleBySlug } from "@/lib/payload";
import { articleJsonLd } from "@/lib/seo";

type RichData = ComponentProps<typeof RichText>["data"];

export const revalidate = 3600;
export const dynamicParams = true;
export const generateStaticParams = (): { slug: string }[] => [];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = await getArticleBySlug(slug);
  if (!a) return {};
  const noindex = process.env.SITE_INDEXABLE !== "true";
  return {
    title: { absolute: `${a.title} · Sustech Technology Ltd` },
    description: a.excerpt ?? undefined,
    alternates: { canonical: `/knowledge/${a.slug}` },
    robots: noindex ? { index: false, follow: false } : undefined,
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { isEnabled } = await draftMode();
  const a = await getArticleBySlug(slug, isEnabled);
  if (!a) notFound();

  const faq = a.faq ?? [];

  return (
    <>
      <JsonLd data={articleJsonLd(a, "/knowledge")} />
      <Section containerSize="default">
        <article className="mx-auto max-w-3xl">
          <Eyebrow>Knowledge</Eyebrow>
          <h1 className="text-h1 mt-3 font-bold text-balance">{a.title}</h1>
          {(a.author || a.publishedDate) && (
            <p className="text-text-soft mt-3 text-sm">
              {[
                a.author,
                a.publishedDate ? new Date(a.publishedDate).toLocaleDateString("en-GB") : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
          {a.excerpt && <p className="text-lede text-text-soft mt-6">{a.excerpt}</p>}
          <div className="richtext mt-8">
            <CitedRichText data={a.body as RichData} />
          </div>

          <SourcesReferences citations={a.citations} />

          {faq.length > 0 && (
            <section className="mt-12">
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
              <h2 className="text-h2 font-semibold">FAQ</h2>
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
        </article>
      </Section>
    </>
  );
}
