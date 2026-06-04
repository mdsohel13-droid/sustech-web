import { RichText } from "@payloadcms/richtext-lexical/react";
import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import type { ComponentProps } from "react";
import { JsonLd } from "@/components/seo/json-ld";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { GridMotif } from "@/components/ui/grid-motif";
import { Section } from "@/components/ui/section";
import { getProjectBySlug } from "@/lib/payload";
import { serverUrl } from "@/lib/seo";

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
  const p = await getProjectBySlug(slug);
  if (!p) return {};
  const noindex = process.env.SITE_INDEXABLE !== "true";
  return {
    title: { absolute: `${p.name} · Sustech Technology Ltd` },
    description: p.summary,
    alternates: { canonical: `/projects/${p.slug}` },
    robots: noindex ? { index: false, follow: false } : undefined,
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { isEnabled } = await draftMode();
  const p = await getProjectBySlug(slug, isEnabled);
  if (!p) notFound();

  const sector = p.sector && typeof p.sector === "object" ? p.sector.title : null;
  const facts = [
    sector && { label: "Sector", value: sector },
    p.location && { label: "Location", value: p.location },
    p.capacity && { label: "Scale", value: p.capacity },
    p.year && { label: "Year", value: String(p.year) },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: p.name,
          abstract: p.summary,
          url: `${serverUrl}/projects/${p.slug}`,
        }}
      />
      <section className="bg-ink-900 text-text-invert relative isolate overflow-hidden">
        <GridMotif tone="dark" />
        <Container className="relative py-20 md:py-28">
          <Eyebrow onDark>Case study</Eyebrow>
          <h1 className="text-display mt-4 max-w-3xl font-bold text-balance">{p.name}</h1>
          <p className="text-lede text-text-invert-soft mt-4 max-w-2xl">{p.summary}</p>
          {facts.length > 0 && (
            <dl className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {facts.map((f) => (
                <div key={f.label}>
                  <dt className="text-text-invert-soft font-mono text-xs tracking-[0.08em] uppercase">
                    {f.label}
                  </dt>
                  <dd className="mt-1 font-semibold">{f.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </Container>
      </section>

      <Section>
        <div className="richtext max-w-prose space-y-10">
          {p.challenge ? (
            <div>
              <h2 className="text-h2 font-semibold">The challenge</h2>
              <RichText data={p.challenge as RichData} />
            </div>
          ) : null}
          {p.solution ? (
            <div>
              <h2 className="text-h2 font-semibold">Our solution</h2>
              <RichText data={p.solution as RichData} />
            </div>
          ) : null}
          {p.outcome ? (
            <div>
              <h2 className="text-h2 font-semibold">The outcome</h2>
              <RichText data={p.outcome as RichData} />
            </div>
          ) : null}
        </div>
      </Section>
    </>
  );
}
