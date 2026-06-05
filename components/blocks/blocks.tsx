import { RichText } from "@payloadcms/richtext-lexical/react";
import { ArrowRight, Calculator, Check, Quote } from "lucide-react";
import Link from "next/link";
import type { ComponentProps } from "react";
import { sectorIcons, serviceIcons } from "@/components/icons";
import { JsonLd } from "@/components/seo/json-ld";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { GridMotif } from "@/components/ui/grid-motif";
import { ProofCounter } from "@/components/ui/proof-counter";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getClients,
  getFeaturedProjects,
  getSectors,
  getServices,
  getTeam,
  getTestimonials,
} from "@/lib/payload";
import { pagePath } from "@/cms/utils/preview";
import type {
  CalculatorEmbedBlock,
  Client,
  ContactRFQBlock,
  CTABandBlock,
  FAQBlock,
  HeroBlock,
  ImageGalleryBlock,
  LogoWallBlock,
  Media,
  PartnerBarBlock,
  Project,
  Sector,
  Service,
  SpacerBlock,
  StatsCountersBlock,
  StepsBlock,
  Team,
  Testimonial,
} from "@/payload-types";
import { CtaButtons, toneOf, type Cta } from "./shared";

type RichData = ComponentProps<typeof RichText>["data"];
function Rich({ data, className }: { data: unknown; className?: string }) {
  if (!data) return null;
  return <RichText data={data as RichData} className={className} />;
}

const objs = <T,>(arr?: (number | T)[] | null): T[] =>
  (arr ?? []).filter((x): x is T => typeof x === "object" && x !== null);

function mediaUrl(m?: number | Media | null): { url: string; alt: string } | null {
  if (!m || typeof m !== "object" || !m.url) return null;
  return { url: m.url, alt: m.alt ?? "" };
}

// --- Hero -------------------------------------------------------------------

export function HeroView({ block, isFirst }: { block: HeroBlock; isFirst: boolean }) {
  const dark = block.tone !== "light";
  const bg = mediaUrl(block.backgroundImage);
  const Heading = isFirst ? "h1" : "h2";
  return (
    <section
      className={
        dark
          ? "bg-ink-900 text-text-invert relative isolate overflow-hidden"
          : "bg-surface text-text relative isolate overflow-hidden"
      }
    >
      {dark && (
        <>
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(60%_55%_at_18%_-5%,rgba(14,95,216,0.28),transparent_60%),radial-gradient(45%_40%_at_92%_8%,rgba(245,158,11,0.12),transparent_55%)]"
          />
          <GridMotif tone="dark" />
        </>
      )}
      {bg && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={bg.url}
          alt={bg.alt}
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-25"
        />
      )}
      <Container className="relative py-24 md:py-32 lg:py-40">
        <div className="max-w-3xl">
          {block.eyebrow && (
            <Eyebrow onDark={dark} className="hero-rise [animation-delay:0ms]">
              {block.eyebrow}
            </Eyebrow>
          )}
          <Heading className="text-display mt-4 font-bold text-balance">{block.heading}</Heading>
          {block.subhead && (
            <p
              className={`text-lede hero-rise mt-6 max-w-2xl [animation-delay:140ms] ${dark ? "text-text-invert-soft" : "text-text-soft"}`}
            >
              {block.subhead}
            </p>
          )}
          <div className="hero-rise [animation-delay:210ms]">
            <CtaButtons ctas={block.ctas as Cta[] | null} onDark={dark} />
          </div>
        </div>
      </Container>
    </section>
  );
}

// --- RichText ---------------------------------------------------------------

export function RichTextView({
  block,
}: {
  block: { content?: unknown; appearance?: string | null };
}) {
  return (
    <Section tone={toneOf(block.appearance as never)}>
      <Rich data={block.content} className="richtext max-w-prose" />
    </Section>
  );
}

// --- StatsCounters ----------------------------------------------------------

export function StatsCountersView({ block }: { block: StatsCountersBlock }) {
  return (
    <Section tone={toneOf(block.appearance)} srTitle="Key figures">
      {block.intro && (
        <p className="text-text-soft mb-10 text-center font-mono text-xs font-medium tracking-[0.08em] uppercase">
          {block.intro}
        </p>
      )}
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
        {(block.stats ?? []).map((s, i) => (
          <Reveal key={s.id ?? i} delay={i * 0.06}>
            <ProofCounter value={s.value ?? null} label={s.label} suffix={s.suffix ?? undefined} />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

// --- ServicesGrid -----------------------------------------------------------

export async function ServicesGridView({
  block,
}: {
  block: {
    heading?: string | null;
    lede?: string | null;
    appearance?: Service["icon"] extends never ? never : string | null;
    source?: string | null;
    services?: (number | Service)[] | null;
  };
}) {
  const services =
    block.source === "selected" ? objs<Service>(block.services) : await getServices();
  return (
    <Section
      id="services"
      tone={toneOf(block.appearance as never)}
      eyebrow="What we do"
      title={block.heading ?? undefined}
      lede={block.lede ?? undefined}
    >
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {services.map((svc, i) => {
          const Icon = serviceIcons[svc.icon] ?? serviceIcons.solar;
          return (
            <li key={svc.id}>
              <Reveal delay={i * 0.06} className="h-full">
                <Card interactive className="relative flex h-full flex-col p-6">
                  <span className="bg-brand/10 text-brand inline-flex h-11 w-11 items-center justify-center rounded-md">
                    <Icon className="h-6 w-6" aria-hidden />
                  </span>
                  <h3 className="text-h3 text-ink-900 mt-5 font-semibold">{svc.title}</h3>
                  <p className="text-text-soft mt-2 flex-1 text-[0.9375rem]">{svc.summary}</p>
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
              </Reveal>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

// --- SectorTiles ------------------------------------------------------------

export async function SectorTilesView({
  block,
}: {
  block: {
    heading?: string | null;
    lede?: string | null;
    appearance?: string | null;
    source?: string | null;
    sectors?: (number | Sector)[] | null;
  };
}) {
  const sectors = block.source === "selected" ? objs<Sector>(block.sectors) : await getSectors();
  return (
    <Section
      id="solutions"
      tone={toneOf(block.appearance as never)}
      eyebrow="Solutions by sector"
      title={block.heading ?? undefined}
      lede={block.lede ?? undefined}
    >
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {sectors.map((sec, i) => {
          const Icon = sectorIcons[sec.icon] ?? sectorIcons.industrial;
          return (
            <li key={sec.id}>
              <Reveal delay={i * 0.06} className="h-full">
                <Card interactive className="relative flex h-full flex-col p-6">
                  <span className="bg-ink-900/[0.06] text-ink-900 inline-flex h-11 w-11 items-center justify-center rounded-md">
                    <Icon className="h-6 w-6" aria-hidden />
                  </span>
                  <h3 className="text-h3 text-ink-900 mt-5 font-semibold">{sec.title}</h3>
                  <p className="text-text-soft mt-2 flex-1 text-[0.9375rem]">{sec.summary}</p>
                  <Link
                    href={`/solutions/${sec.slug}`}
                    prefetch={false}
                    aria-label={`${sec.title} — view sector solutions`}
                    className="focus-visible:outline-brand absolute inset-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2"
                  />
                </Card>
              </Reveal>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

// --- ProjectsList -----------------------------------------------------------

export async function ProjectsListView({
  block,
}: {
  block: {
    heading?: string | null;
    lede?: string | null;
    appearance?: string | null;
    source?: string | null;
    projects?: (number | Project)[] | null;
    viewAllLabel?: string | null;
  };
}) {
  const projects =
    block.source === "selected" ? objs<Project>(block.projects) : await getFeaturedProjects(3);
  return (
    <Section
      tone={toneOf(block.appearance as never)}
      eyebrow="Featured projects"
      title={block.heading ?? undefined}
      lede={block.lede ?? undefined}
    >
      {projects.length === 0 ? (
        <ul
          className="grid gap-6 md:grid-cols-3"
          aria-busy="true"
          aria-label="Featured projects — loading from the content system"
        >
          {[0, 1, 2].map((i) => (
            <li key={i}>
              <Card className="overflow-hidden">
                <Skeleton className="aspect-[4/3] w-full rounded-none" />
                <div className="space-y-3 p-6">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="grid gap-6 md:grid-cols-3">
          {projects.map((p, i) => {
            const img = mediaUrl(objs<{ image?: number | Media | null }>(p.gallery)[0]?.image);
            const sectorName = p.sector && typeof p.sector === "object" ? p.sector.title : null;
            return (
              <li key={p.id}>
                <Reveal delay={i * 0.06}>
                  <Card interactive className="relative h-full overflow-hidden">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={img.url}
                        alt={img.alt}
                        className="aspect-[4/3] w-full object-cover"
                      />
                    ) : (
                      <Skeleton className="aspect-[4/3] w-full rounded-none" />
                    )}
                    <div className="p-6">
                      {sectorName && (
                        <p className="text-brand font-mono text-xs tracking-[0.08em] uppercase">
                          {sectorName}
                        </p>
                      )}
                      <h3 className="text-h3 text-ink-900 mt-2 font-semibold">{p.name}</h3>
                      <p className="text-text-soft mt-2 text-[0.9375rem]">{p.summary}</p>
                    </div>
                    <Link
                      href={`/projects/${p.slug}`}
                      prefetch={false}
                      aria-label={`${p.name} — read case study`}
                      className="focus-visible:outline-brand absolute inset-0 focus-visible:outline-2 focus-visible:outline-offset-2"
                    />
                  </Card>
                </Reveal>
              </li>
            );
          })}
        </ul>
      )}
      <div className="mt-10">
        <Link
          href="/projects"
          prefetch={false}
          className="text-brand focus-visible:outline-brand inline-flex items-center gap-1.5 font-medium underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {block.viewAllLabel ?? "View all projects"} <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </Section>
  );
}

// --- TeamGrid ---------------------------------------------------------------

export async function TeamGridView({
  block,
}: {
  block: {
    heading?: string | null;
    lede?: string | null;
    appearance?: string | null;
    source?: string | null;
    members?: (number | Team)[] | null;
  };
}) {
  const members = block.source === "selected" ? objs<Team>(block.members) : await getTeam();
  if (members.length === 0) return null;
  return (
    <Section
      tone={toneOf(block.appearance as never)}
      eyebrow="Our team"
      title={block.heading ?? undefined}
      lede={block.lede ?? undefined}
    >
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {members.map((m, i) => {
          const photo = mediaUrl(m.photo);
          return (
            <li key={m.id}>
              <Reveal delay={Math.min(i, 6) * 0.05} className="h-full">
                <Card className="flex h-full flex-col overflow-hidden">
                  <div className="bg-surface-2 aspect-square w-full">
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photo.url} alt={photo.alt} className="h-full w-full object-cover" />
                    ) : (
                      <Skeleton className="h-full w-full rounded-none" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-h3 text-ink-900 font-semibold">{m.name}</h3>
                    <p className="text-brand mt-1 font-mono text-xs tracking-[0.08em] uppercase">
                      {m.role}
                    </p>
                    {m.bio && <p className="text-text-soft mt-3 text-[0.9375rem]">{m.bio}</p>}
                  </div>
                </Card>
              </Reveal>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

// --- PartnerBar -------------------------------------------------------------

export function PartnerBarView({ block }: { block: PartnerBarBlock }) {
  const partners = block.partners ?? [];
  if (partners.length === 0) return null;
  return (
    <Section tone={toneOf(block.appearance)} srTitle="Technology partners">
      {block.heading && (
        <p className="text-text-soft mb-6 text-center font-mono text-xs font-medium tracking-[0.08em] uppercase">
          {block.heading}
        </p>
      )}
      <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
        {partners.map((p, i) => {
          const logo = mediaUrl(p.logo);
          return (
            <li key={p.id ?? i} className="text-text-soft text-lg font-semibold">
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logo.url}
                  alt={logo.alt || p.name}
                  className="h-8 w-auto object-contain"
                />
              ) : (
                p.name
              )}
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

// --- ImageGallery -----------------------------------------------------------

export function ImageGalleryView({ block }: { block: ImageGalleryBlock }) {
  const images = (block.images ?? [])
    .map((row) => mediaUrl(row.image))
    .filter((x): x is { url: string; alt: string } => Boolean(x));
  return (
    <Section tone={toneOf(block.appearance)} title={block.heading ?? undefined}>
      <ul className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {images.map((img, i) => (
          <li key={i} className="border-border overflow-hidden rounded-lg border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.url}
              alt={img.alt}
              className="aspect-[4/3] w-full object-cover"
              loading="lazy"
            />
          </li>
        ))}
      </ul>
    </Section>
  );
}

// --- LogoWall ---------------------------------------------------------------

export async function LogoWallView({ block }: { block: LogoWallBlock }) {
  const clients = block.source === "selected" ? objs<Client>(block.clients) : await getClients();
  return (
    <Section tone={toneOf(block.appearance)}>
      {block.heading && (
        <h2 className="text-text-soft text-center text-base font-medium">{block.heading}</h2>
      )}
      <Reveal className="mt-10">
        <ul className="grid grid-cols-2 items-center gap-x-8 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
          {clients.length === 0
            ? Array.from({ length: 6 }, (_, i) => (
                <li key={i} className="flex justify-center">
                  <Skeleton className="bg-surface-3 h-10 w-28" />
                </li>
              ))
            : clients.map((c) => {
                const logo = mediaUrl(c.logo);
                return (
                  <li key={c.id} className="flex justify-center">
                    {logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={logo.url}
                        alt={c.name}
                        className="h-10 w-auto object-contain opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-text-soft text-sm font-medium">{c.name}</span>
                    )}
                  </li>
                );
              })}
        </ul>
      </Reveal>
    </Section>
  );
}

// --- Testimonials -----------------------------------------------------------

export async function TestimonialsView({
  block,
}: {
  block: {
    heading?: string | null;
    appearance?: string | null;
    source?: string | null;
    testimonials?: (number | Testimonial)[] | null;
  };
}) {
  const items =
    block.source === "selected" ? objs<Testimonial>(block.testimonials) : await getTestimonials();
  return (
    <Section
      tone={toneOf(block.appearance as never)}
      eyebrow="Testimonials"
      title={block.heading ?? undefined}
    >
      {items.length === 0 ? (
        <ul
          className="grid gap-6 md:grid-cols-2"
          aria-busy="true"
          aria-label="Client testimonials — loading from the content system"
        >
          {[0, 1].map((i) => (
            <li key={i}>
              <Card className="flex h-full flex-col gap-5 p-8">
                <Quote className="text-brand/30 h-7 w-7" aria-hidden />
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-11/12" />
                </div>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="grid gap-6 md:grid-cols-2">
          {items.map((t, i) => (
            <li key={t.id}>
              <Reveal delay={i * 0.06}>
                <Card className="flex h-full flex-col gap-5 p-8">
                  <Quote className="text-brand/30 h-7 w-7" aria-hidden />
                  <blockquote className="text-ink-900 text-lg">“{t.quote}”</blockquote>
                  <footer className="mt-auto">
                    <p className="text-ink-900 font-semibold">{t.person}</p>
                    <p className="text-text-soft text-sm">
                      {[t.role, t.company].filter(Boolean).join(", ")}
                    </p>
                  </footer>
                </Card>
              </Reveal>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

// --- Steps ------------------------------------------------------------------

export function StepsView({ block }: { block: StepsBlock }) {
  return (
    <Section
      tone={toneOf(block.appearance)}
      eyebrow={block.eyebrow ?? "How we work"}
      title={block.heading ?? undefined}
    >
      <ol className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {(block.steps ?? []).map((step, i) => (
          <li key={step.id ?? i}>
            <Reveal delay={i * 0.06}>
              <div className="border-border border-t pt-5">
                <span className="text-brand font-mono text-sm font-medium tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-h3 text-ink-900 mt-3 font-semibold">{step.title}</h3>
                <p className="text-text-soft mt-2 text-[0.9375rem]">{step.body}</p>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}

// --- CTABand ----------------------------------------------------------------

export function CTABandView({ block }: { block: CTABandBlock }) {
  return (
    <section className="bg-ink-900 text-text-invert relative isolate overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(50%_60%_at_80%_110%,rgba(245,158,11,0.14),transparent_60%),radial-gradient(50%_60%_at_10%_-10%,rgba(14,95,216,0.22),transparent_60%)]"
      />
      <GridMotif tone="dark" />
      <Container className="relative py-20 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-h1 font-bold text-balance">{block.heading}</h2>
          {block.subhead && <p className="text-lede text-text-invert-soft mt-4">{block.subhead}</p>}
          <div className="flex justify-center">
            <CtaButtons ctas={block.ctas as Cta[] | null} onDark className="mt-9 justify-center" />
          </div>
        </div>
      </Container>
    </section>
  );
}

// --- FAQ --------------------------------------------------------------------

export function FAQView({ block }: { block: FAQBlock }) {
  const items = block.items ?? [];
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.question,
      acceptedAnswer: { "@type": "Answer", text: it.answer },
    })),
  };
  return (
    <Section tone={toneOf(block.appearance)} title={block.heading ?? "Frequently asked questions"}>
      {items.length > 0 && <JsonLd data={schema} />}
      <dl className="divide-border mx-auto max-w-3xl divide-y">
        {items.map((it, i) => (
          <div key={it.id ?? i} className="py-5">
            <dt className="text-ink-900 text-lg font-semibold">{it.question}</dt>
            <dd className="text-text-soft mt-2">{it.answer}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}

// --- CalculatorEmbed (placeholder) ------------------------------------------

export function CalculatorEmbedView({ block }: { block: CalculatorEmbedBlock }) {
  return (
    <Section tone={toneOf(block.appearance)}>
      <Reveal>
        <div className="border-border bg-surface-2 relative overflow-hidden rounded-xl border p-8 md:p-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <span className="bg-brand/10 text-brand inline-flex h-11 w-11 items-center justify-center rounded-md">
                <Calculator className="h-6 w-6" aria-hidden />
              </span>
              <h2 className="text-h2 text-ink-900 mt-5 font-semibold text-balance">
                {block.heading ?? "Engineering calculators"}
              </h2>
              {block.body && <p className="text-text-soft mt-3 text-[1.0625rem]">{block.body}</p>}
            </div>
            <Button asChild variant="secondary" size="lg">
              <Link href="/tools" prefetch={false}>
                {block.ctaLabel ?? "Try the calculator"}{" "}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

// --- ContactRFQ (placeholder CTA; full server-action form lands in a later phase) ----

export function ContactRFQView({ block }: { block: ContactRFQBlock }) {
  return (
    <Section
      tone={toneOf(block.appearance)}
      title={block.heading ?? "Request a consultation"}
      lede={block.subhead ?? undefined}
    >
      <ul className="text-text-soft flex flex-wrap items-center gap-3">
        <li className="flex items-center gap-2">
          <Check className="text-energy h-4 w-4" aria-hidden /> No obligation
        </li>
        <li className="flex items-center gap-2">
          <Check className="text-energy h-4 w-4" aria-hidden /> Engineer-scoped
        </li>
      </ul>
      <div className="mt-6">
        <Button asChild size="lg">
          <Link href={pagePath("request-quote")} prefetch={false}>
            Request a Consultation
          </Link>
        </Button>
      </div>
    </Section>
  );
}

// --- Spacer -----------------------------------------------------------------

export function SpacerView({ block }: { block: SpacerBlock }) {
  const h = block.size === "lg" ? "h-24" : block.size === "sm" ? "h-8" : "h-16";
  return (
    <div className={`bg-surface ${h}`}>
      {block.divider && (
        <Container>
          <hr className="border-border" />
        </Container>
      )}
    </div>
  );
}
