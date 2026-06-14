import { RichText } from "@payloadcms/richtext-lexical/react";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ComponentProps } from "react";
import { sectorIcons, serviceIcons } from "@/components/icons";
import { EntityIcon } from "@/components/ui/entity-icon";
import { JsonLd } from "@/components/seo/json-ld";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { GridMotif } from "@/components/ui/grid-motif";
import { Section } from "@/components/ui/section";
import { getProjectsBySector, getSectorBySlug, getSectors } from "@/lib/payload";
import { serverUrl } from "@/lib/seo";
import type { Project, Service } from "@/payload-types";

type RichData = ComponentProps<typeof RichText>["data"];

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const sectors = await getSectors().catch(() => []);
  return sectors.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const sector = await getSectorBySlug(slug);
  if (!sector) return {};
  const noindex = process.env.SITE_INDEXABLE !== "true";
  return {
    title: { absolute: sector.seo?.title ?? `${sector.title} · Sustech Technology Ltd` },
    description: sector.seo?.description ?? sector.summary,
    alternates: { canonical: `/solutions/${sector.slug}` },
    robots: noindex ? { index: false, follow: false } : undefined,
  };
}

const services = (arr: Sector["services"]): Service[] =>
  (arr ?? []).filter((x): x is Service => typeof x === "object" && x !== null);

type Sector = NonNullable<Awaited<ReturnType<typeof getSectorBySlug>>>;

function projectSectorName(p: Project): string | null {
  return p.sector && typeof p.sector === "object" ? p.sector.title : null;
}

export default async function SectorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sector = await getSectorBySlug(slug);
  if (!sector) notFound();

  const Icon = sectorIcons[sector.icon] ?? sectorIcons.industrial;
  const sectorServices = services(sector.services);
  const related = await getProjectsBySector(sector.id);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: serverUrl },
            {
              "@type": "ListItem",
              position: 2,
              name: sector.title,
              item: `${serverUrl}/solutions/${sector.slug}`,
            },
          ],
        }}
      />
      <section className="bg-ink-900 text-text-invert relative isolate overflow-hidden">
        <GridMotif tone="dark" />
        <Container className="relative py-20 md:py-28">
          <span className="bg-brand/15 text-brand-300 mb-6 inline-flex h-12 w-12 items-center justify-center rounded-md">
            <EntityIcon customIcon={sector.customIcon} Fallback={Icon} />
          </span>
          <Eyebrow onDark>Sector solutions</Eyebrow>
          <h1 className="text-display mt-3 max-w-3xl font-bold text-balance">{sector.title}</h1>
          <p className="text-lede text-text-invert-soft mt-4 max-w-2xl">{sector.summary}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="primary">
              <Link href="/request-quote">Request a Consultation</Link>
            </Button>
            <Button asChild variant="ghost" onDark>
              <Link href={`/projects?sector=${sector.slug}`}>See projects in this sector</Link>
            </Button>
          </div>
        </Container>
      </section>

      {sector.challenges ? (
        <Section title="Challenges we solve" srTitle="Sector challenges">
          <div className="richtext max-w-prose">
            <RichText data={sector.challenges as RichData} />
          </div>
        </Section>
      ) : null}

      {sectorServices.length > 0 && (
        <Section
          tone="muted"
          eyebrow="What we deliver"
          title={`Capabilities for ${sector.title.toLowerCase()}`}
        >
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sectorServices.map((svc) => {
              const SvcIcon = serviceIcons[svc.icon] ?? serviceIcons.solar;
              return (
                <li key={svc.id}>
                  <Card interactive className="relative flex h-full flex-col p-6">
                    <span className="bg-brand/10 text-brand inline-flex h-11 w-11 items-center justify-center rounded-md">
                      <EntityIcon customIcon={svc.customIcon} Fallback={SvcIcon} />
                    </span>
                    <h3 className="text-h3 text-ink-900 mt-5 font-semibold">{svc.title}</h3>
                    <p className="text-text-soft mt-2 flex-1 text-[0.9375rem]">{svc.summary}</p>
                    <Link
                      href={`/services/${svc.slug}`}
                      prefetch={false}
                      aria-label={`${svc.title} — explore this service`}
                      className="focus-visible:outline-brand absolute inset-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2"
                    />
                  </Card>
                </li>
              );
            })}
          </ul>
        </Section>
      )}

      {related.length > 0 && (
        <Section eyebrow="Proof" title="Projects in this sector">
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/projects/${p.slug}`}
                  prefetch={false}
                  className="border-border bg-surface ease-brand hover:border-brand/30 focus-visible:outline-brand block h-full rounded-lg border p-6 shadow-sm transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  {projectSectorName(p) && (
                    <span className="text-brand font-mono text-xs tracking-[0.08em] uppercase">
                      {projectSectorName(p)}
                    </span>
                  )}
                  <span className="text-h3 text-ink-900 mt-2 block font-semibold">{p.name}</span>
                  {p.summary && (
                    <span className="text-text-soft mt-2 block text-sm">{p.summary}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-10">
            <Link
              href={`/projects?sector=${sector.slug}`}
              prefetch={false}
              className="text-brand focus-visible:outline-brand inline-flex items-center gap-1.5 font-medium underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              View all {sector.title.toLowerCase()} projects{" "}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </Section>
      )}

      <section className="bg-ink-900 text-text-invert relative isolate overflow-hidden">
        <GridMotif tone="dark" />
        <Container className="relative py-16 text-center md:py-20">
          <h2 className="text-h2 mx-auto max-w-2xl font-semibold text-balance">
            Engineering for {sector.title.toLowerCase()}?
          </h2>
          <p className="text-text-invert-soft mx-auto mt-4 max-w-xl">
            Tell us about your facility — our engineers will scope it with you, no obligation.
          </p>
          <div className="mt-8">
            <Button asChild variant="primary">
              <Link href="/request-quote">Request a Consultation</Link>
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
