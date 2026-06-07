/**
 * /knowledge/calculators/[type]
 *
 * Interactive engineering calculator page. The [type] segment is the CalcType value
 * (e.g. "solar-roi", "earthing-resistance").
 *
 * - The calculator component itself is "use client" (interactive).
 * - The page shell and meta are Server Components.
 * - generateStaticParams() returns all known calc types for static generation.
 * - Schema.org: SoftwareApplication + BreadcrumbList
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/json-ld";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Section } from "@/components/ui/section";
import { CALCULATOR_REGISTRY, getCalcMeta } from "@/components/calculators/calculator-registry";
import { serverUrl } from "@/lib/seo";

export const revalidate = 3600;
export const dynamicParams = false; // only the known types are valid

export function generateStaticParams() {
  return Object.keys(CALCULATOR_REGISTRY).map((type) => ({ type }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }>;
}): Promise<Metadata> {
  const { type } = await params;
  const meta = getCalcMeta(type);
  if (!meta) return {};
  const noindex = process.env.SITE_INDEXABLE !== "true";
  return {
    title: { absolute: `${meta.title} · Knowledge · Sustech Technology Ltd` },
    description: meta.description,
    alternates: { canonical: `/knowledge/calculators/${type}` },
    robots: noindex ? { index: false, follow: false } : undefined,
  };
}

export default async function CalculatorPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const meta = getCalcMeta(type);
  if (!meta) notFound();

  const { component: CalcComponent } = meta;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: meta.title,
          description: meta.description,
          url: `${serverUrl}/knowledge/calculators/${type}`,
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Web browser",
          offers: { "@type": "Offer", price: "0", priceCurrency: "BDT" },
          author: {
            "@type": "Organization",
            name: "Sustech Technology Ltd",
            url: serverUrl,
          },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: serverUrl },
            {
              "@type": "ListItem",
              position: 2,
              name: "Knowledge",
              item: `${serverUrl}/knowledge`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: "Calculators",
              item: `${serverUrl}/knowledge#calculators`,
            },
            {
              "@type": "ListItem",
              position: 4,
              name: meta.title,
              item: `${serverUrl}/knowledge/calculators/${type}`,
            },
          ],
        }}
      />

      {/* Page header */}
      <div className="bg-ink-900 text-text-invert relative">
        <Container className="py-16 md:py-20">
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="text-text-invert-soft flex items-center gap-1.5 text-sm">
              <li>
                <Link href="/knowledge" className="hover:text-text-invert transition-colors">
                  Knowledge
                </Link>
              </li>
              <li aria-hidden className="opacity-50 select-none">
                /
              </li>
              <li>
                <Link
                  href="/knowledge?tab=calculators"
                  className="hover:text-text-invert transition-colors"
                >
                  Calculators
                </Link>
              </li>
              <li aria-hidden className="opacity-50 select-none">
                /
              </li>
              <li className="text-text-invert font-medium">{meta.title}</li>
            </ol>
          </nav>
          <Eyebrow onDark>{meta.category}</Eyebrow>
          <h1 className="text-h1 mt-3 font-bold">
            {meta.icon} {meta.title}
          </h1>
          <p className="text-text-invert-soft mt-3 max-w-2xl text-[0.9375rem]">
            {meta.description}
          </p>

          {meta.standards && meta.standards.length > 0 && (
            <p className="mt-4 text-sm">
              <span className="text-text-invert-soft">Standards: </span>
              {meta.standards.map((s, i) => (
                <span key={s}>
                  <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">{s}</code>
                  {i < meta.standards!.length - 1 && " "}
                </span>
              ))}
            </p>
          )}
        </Container>
      </div>

      {/* Calculator body */}
      <Section>
        <CalcComponent />
      </Section>

      {/* Back link + CTA */}
      <Section className="border-t">
        <Container>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/knowledge?tab=calculators"
              className="text-text-soft hover:text-ink-900 text-sm font-medium transition-colors"
            >
              ← All calculators
            </Link>
            <div className="flex items-center gap-3">
              <p className="text-text-soft text-sm">Need a detailed engineering study?</p>
              <Link
                href="/request-quote"
                className="bg-brand hover:bg-brand-dark focus-visible:outline-brand rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                Request a consultation
              </Link>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
