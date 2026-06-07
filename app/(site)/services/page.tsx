import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { serviceIcons } from "@/components/icons";
import { JsonLd } from "@/components/seo/json-ld";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { GridMotif } from "@/components/ui/grid-motif";
import { Section } from "@/components/ui/section";
import { getServices } from "@/lib/payload";
import { serverUrl } from "@/lib/seo";

export const revalidate = 3600;

const TITLE = "Services";
const LEDE =
  "End-to-end engineering for industrial power, solar, safety and compliance — design, supply, installation and commissioning, delivered by one accountable team.";

export function generateMetadata(): Metadata {
  const noindex = process.env.SITE_INDEXABLE !== "true";
  return {
    title: { absolute: `${TITLE} · Sustech Technology Ltd` },
    description: LEDE,
    alternates: { canonical: "/services" },
    robots: noindex ? { index: false, follow: false } : undefined,
  };
}

export default async function ServicesIndexPage() {
  const services = await getServices();

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: TITLE,
          description: LEDE,
          url: `${serverUrl}/services`,
          mainEntity: {
            "@type": "ItemList",
            itemListElement: services.map((s, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${serverUrl}/services/${s.slug}`,
              name: s.title,
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
            { "@type": "ListItem", position: 2, name: TITLE, item: `${serverUrl}/services` },
          ],
        }}
      />

      <section className="bg-ink-900 text-text-invert relative isolate overflow-hidden">
        <GridMotif tone="dark" />
        <Container className="relative py-20 md:py-28">
          <Eyebrow onDark>What we do</Eyebrow>
          <h1 className="text-display mt-4 max-w-3xl font-bold text-balance">{TITLE}</h1>
          <p className="text-lede text-text-invert-soft mt-4 max-w-2xl">{LEDE}</p>
        </Container>
      </section>

      <Section srTitle="All services">
        {services.length === 0 ? (
          <p className="text-text-soft border-border bg-surface-2 rounded-lg border border-dashed px-6 py-12 text-center">
            Services are on the way — check back soon.
          </p>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {services.map((svc) => {
              const Icon = serviceIcons[svc.icon] ?? serviceIcons.solar;
              return (
                <li key={svc.id}>
                  <Card interactive className="relative flex h-full flex-col p-6">
                    <span className="bg-brand/10 text-brand inline-flex h-11 w-11 items-center justify-center rounded-md">
                      <Icon className="h-6 w-6" aria-hidden />
                    </span>
                    <h2 className="text-h3 text-ink-900 mt-5 font-semibold">{svc.title}</h2>
                    {svc.summary && (
                      <p className="text-text-soft mt-2 flex-1 text-[0.9375rem]">{svc.summary}</p>
                    )}
                    <span className="text-brand mt-5 inline-flex items-center gap-1.5 text-sm font-medium">
                      Explore <ArrowRight className="h-4 w-4" aria-hidden />
                    </span>
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
        )}
      </Section>
    </>
  );
}
