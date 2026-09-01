import { RichText } from "@payloadcms/richtext-lexical/react";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ComponentProps } from "react";
import { sectorIcons, serviceIcons } from "@/components/icons";
import { JsonLd } from "@/components/seo/json-ld";
import { GatedAssetForm } from "@/components/sections/gated-asset";
import { TrackedCta } from "@/components/sections/tracked-cta";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { EntityIcon } from "@/components/ui/entity-icon";
import { Eyebrow } from "@/components/ui/eyebrow";
import { GridMotif } from "@/components/ui/grid-motif";
import { ProofCounter } from "@/components/ui/proof-counter";
import { Section } from "@/components/ui/section";
import {
  getClientsBySector,
  getProjectsBySector,
  getSectorBySlug,
  getSectors,
} from "@/lib/payload";
import type {
  Client,
  KnowledgeResource,
  Media,
  Project,
  Service,
  Testimonial,
} from "@/payload-types";

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
  const desc = sector.seo?.description ?? sector.summary;
  const ogUrl = `/api/og?title=${encodeURIComponent(sector.title)}&section=Sector+solution${desc ? `&description=${encodeURIComponent(desc.slice(0, 120))}` : ""}`;
  return {
    title: { absolute: sector.seo?.title ?? `${sector.title} · Sustech Technology Ltd` },
    description: desc,
    alternates: { canonical: `/solutions/${sector.slug}` },
    robots: noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      title: sector.title,
      description: desc ?? undefined,
      url: `/solutions/${sector.slug}`,
      images: [{ url: ogUrl, width: 1200, height: 630, alt: sector.title }],
    },
    twitter: { card: "summary_large_image" },
  };
}

type Sector = NonNullable<Awaited<ReturnType<typeof getSectorBySlug>>>;

const services = (arr: Sector["services"]): Service[] =>
  (arr ?? []).filter((x): x is Service => typeof x === "object" && x !== null);

const testimonialObjs = (arr: Sector["testimonials"]): Testimonial[] =>
  (arr ?? []).filter((x): x is Testimonial => typeof x === "object" && x !== null);

function projectSectorName(p: Project): string | null {
  return p.sector && typeof p.sector === "object" ? p.sector.title : null;
}

/** next/image props from a Payload upload, or null when the media isn't populated. */
function logoImage(
  m: Client["logo"],
): { src: string; width: number; height: number; alt: string } | null {
  if (!m || typeof m !== "object") return null;
  const media = m as Media;
  if (!media.url || !media.width || !media.height) return null;
  return { src: media.url, width: media.width, height: media.height, alt: media.alt || "" };
}

export default async function SectorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sector = await getSectorBySlug(slug);
  if (!sector) notFound();

  const Icon = sectorIcons[sector.icon] ?? sectorIcons.industrial;
  const sectorServices = services(sector.services);
  const [related, clients] = await Promise.all([
    getProjectsBySector(sector.id),
    getClientsBySector(sector.id),
  ]);

  // Funnel data (plan 3·1). Proof figures never render "0" (same rule as the home bar).
  const proofStats = (sector.proofStats ?? []).filter(
    (s) => typeof s.value === "number" && s.value > 0,
  );
  const testimonials = testimonialObjs(sector.testimonials);
  const faqs = (sector.faqs ?? []).filter((f) => f.question && f.answer);
  const logos = clients
    .map((c) => ({ id: c.id, img: logoImage(c.logo), name: c.name }))
    .filter(
      (c): c is { id: number; img: NonNullable<ReturnType<typeof logoImage>>; name: string } =>
        c.img !== null,
    );
  const leadMagnet =
    sector.leadMagnet && typeof sector.leadMagnet === "object"
      ? (sector.leadMagnet as KnowledgeResource)
      : null;
  const gateLevel = (leadMagnet?.gateLevel ?? "open") as "open" | "email" | "email-company";
  const showMagnet = leadMagnet !== null && gateLevel !== "open";
  const lower = sector.title.toLowerCase();

  return (
    <>
      {faqs.length > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({
              "@type": "Question",
              name: f.question,
              acceptedAnswer: { "@type": "Answer", text: f.answer },
            })),
          }}
        />
      )}

      <section className="bg-ink-900 text-text-invert relative isolate overflow-hidden">
        <GridMotif tone="dark" />
        <Container className="relative py-20 md:py-28">
          <Breadcrumbs
            items={[
              { name: "Home", href: "/" },
              { name: "Solutions", href: "/solutions" },
              { name: sector.title },
            ]}
            onDark
            className="mb-6"
          />
          <span className="bg-brand/15 text-brand-300 mb-6 inline-flex h-12 w-12 items-center justify-center rounded-md">
            <EntityIcon customIcon={sector.customIcon} Fallback={Icon} />
          </span>
          <Eyebrow onDark>Sector solutions</Eyebrow>
          <h1 className="text-display mt-3 max-w-3xl font-bold text-balance">{sector.title}</h1>
          <p className="text-lede text-text-invert-soft mt-4 max-w-2xl">{sector.summary}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <TrackedCta
              href="/request-quote"
              segment={sector.slug}
              cta="hero_consultation"
              variant="primary"
            >
              Request a Consultation
            </TrackedCta>
            <TrackedCta
              href={`/projects?sector=${sector.slug}`}
              segment={sector.slug}
              cta="hero_projects"
              variant="ghost"
              onDark
            >
              See projects in this sector
            </TrackedCta>
          </div>
        </Container>
      </section>

      {proofStats.length > 0 && (
        <Section tone="muted" srTitle={`${sector.title} — proof`}>
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
            {proofStats.map((s) => (
              <ProofCounter
                key={s.id}
                value={s.value ?? null}
                label={s.label}
                suffix={s.suffix ?? undefined}
              />
            ))}
          </div>
        </Section>
      )}

      {sector.challenges ? (
        <Section title="Challenges we solve" srTitle="Sector challenges">
          <div className="richtext max-w-prose">
            <RichText data={sector.challenges as RichData} />
          </div>
        </Section>
      ) : null}

      {sectorServices.length > 0 && (
        <Section tone="muted" eyebrow="What we deliver" title={`Capabilities for ${lower}`}>
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
              View all {lower} projects <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </Section>
      )}

      {logos.length > 0 && (
        <Section tone="muted" eyebrow="Trusted in this sector" srTitle={`${sector.title} clients`}>
          <ul className="grid grid-cols-2 items-center gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
            {logos.map((c) => (
              <li key={c.id} className="flex items-center justify-center">
                <Image
                  src={c.img.src}
                  width={c.img.width}
                  height={c.img.height}
                  alt={c.img.alt || c.name}
                  className="h-10 w-auto max-w-[140px] object-contain opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0"
                />
              </li>
            ))}
          </ul>
        </Section>
      )}

      {testimonials.length > 0 && (
        <Section srTitle={`${sector.title} — testimonial`}>
          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
            {testimonials.map((t) => (
              <figure
                key={t.id}
                className="border-border bg-surface rounded-xl border p-8 shadow-sm"
              >
                <blockquote className="text-ink-900 text-lg leading-relaxed text-balance">
                  “{t.quote}”
                </blockquote>
                <figcaption className="text-text-soft mt-5 text-sm">
                  <span className="text-ink-900 font-semibold">{t.person}</span>
                  {t.role ? `, ${t.role}` : ""} · {t.company}
                </figcaption>
              </figure>
            ))}
          </div>
        </Section>
      )}

      {showMagnet && leadMagnet && (
        <Section
          tone="muted"
          eyebrow="Free resource"
          title={leadMagnet.title}
          srTitle={`${sector.title} — download`}
        >
          <div className="grid gap-8 md:grid-cols-[1fr_22rem] md:items-start">
            <div>
              {leadMagnet.description && (
                <p className="text-text-soft text-[1.0625rem] whitespace-pre-line">
                  {leadMagnet.description}
                </p>
              )}
            </div>
            <GatedAssetForm
              resourceId={leadMagnet.id}
              gateLevel={gateLevel === "email-company" ? "email-company" : "email"}
              downloadLabel={leadMagnet.downloadLabel}
              fileFormat={leadMagnet.fileFormat}
              fileSize={leadMagnet.fileSize}
              segment={sector.slug}
            />
          </div>
        </Section>
      )}

      {faqs.length > 0 && (
        <Section eyebrow="FAQ" title={`${sector.title} — frequently asked`} srTitle="Sector FAQ">
          <dl className="mx-auto max-w-3xl divide-y divide-[var(--color-border)]">
            {faqs.map((f) => (
              <div key={f.id} className="py-5">
                <dt className="text-ink-900 font-semibold">{f.question}</dt>
                <dd className="text-text-soft mt-2 whitespace-pre-line">{f.answer}</dd>
              </div>
            ))}
          </dl>
        </Section>
      )}

      <section className="bg-ink-900 text-text-invert relative isolate overflow-hidden">
        <GridMotif tone="dark" />
        <Container className="relative py-16 text-center md:py-20">
          <h2 className="text-h2 mx-auto max-w-2xl font-semibold text-balance">
            {sector.ctaHeading || `Engineering for ${lower}?`}
          </h2>
          <p className="text-text-invert-soft mx-auto mt-4 max-w-xl">
            {sector.ctaLede ||
              "Tell us about your facility — our engineers will scope it with you, no obligation."}
          </p>
          <div className="mt-8">
            <TrackedCta
              href="/request-quote"
              segment={sector.slug}
              cta="footer_consultation"
              variant="primary"
            >
              Request a Consultation
            </TrackedCta>
          </div>
        </Container>
      </section>
    </>
  );
}
