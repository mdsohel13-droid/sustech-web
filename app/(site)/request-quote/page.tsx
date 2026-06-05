import type { Metadata } from "next";
import { Check } from "lucide-react";
import { RfqForm } from "@/components/forms/rfq-form";
import { JsonLd } from "@/components/seo/json-ld";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { GridMotif } from "@/components/ui/grid-motif";
import { getServices } from "@/lib/payload";
import { serverUrl } from "@/lib/seo";

export const revalidate = 3600;

const TITLE = "Request a Consultation";
const LEDE =
  "Tell us about your industrial power, solar or safety project. One of our engineers will review it and get back to you with a scoped response — no obligation.";

export function generateMetadata(): Metadata {
  const noindex = process.env.SITE_INDEXABLE !== "true";
  return {
    title: { absolute: `${TITLE} · Sustech Technology Ltd` },
    description: LEDE,
    alternates: { canonical: "/request-quote" },
    robots: noindex ? { index: false, follow: false } : undefined,
  };
}

const ASSURANCES = [
  "Engineer-scoped — not a sales script",
  "No obligation, no spam",
  "We design to IEC, BNBC & NFPA standards",
  "Single accountable team from design to commissioning",
];

export default async function RequestQuotePage() {
  const services = await getServices().catch(() => []);
  const serviceTitles = services.map((s) => s.title);

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
              name: TITLE,
              item: `${serverUrl}/request-quote`,
            },
          ],
        }}
      />
      <section className="bg-ink-900 text-text-invert relative isolate overflow-hidden">
        <GridMotif tone="dark" />
        <Container className="relative py-16 md:py-20">
          <Eyebrow onDark>Get started</Eyebrow>
          <h1 className="text-display mt-3 max-w-3xl font-bold text-balance">{TITLE}</h1>
          <p className="text-lede text-text-invert-soft mt-4 max-w-2xl">{LEDE}</p>
        </Container>
      </section>

      <section className="bg-surface-2 relative py-16 md:py-24">
        <Container className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
          <div className="lg:pt-2">
            <h2 className="text-h3 text-ink-900 font-semibold">What to expect</h2>
            <ul className="mt-6 space-y-4">
              {ASSURANCES.map((a) => (
                <li key={a} className="text-text-soft flex items-start gap-3">
                  <Check className="text-energy mt-0.5 h-5 w-5 shrink-0" aria-hidden />
                  <span>{a}</span>
                </li>
              ))}
            </ul>
            <p className="text-text-soft mt-8 text-sm">
              Prefer to talk first? Share your number in the form and we&rsquo;ll call you back.
            </p>
          </div>

          <Card className="p-6 md:p-8">
            <RfqForm services={serviceTitles} sourcePath="/request-quote" />
          </Card>
        </Container>
      </section>
    </>
  );
}
