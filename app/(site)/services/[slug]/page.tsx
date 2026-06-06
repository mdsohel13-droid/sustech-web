import { RichText } from "@payloadcms/richtext-lexical/react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ComponentProps } from "react";
import { serviceIcons } from "@/components/icons";
import { JsonLd } from "@/components/seo/json-ld";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { GridMotif } from "@/components/ui/grid-motif";
import { Section } from "@/components/ui/section";
import { getProjectsByService, getServiceBySlug, getServices } from "@/lib/payload";
import { serverUrl } from "@/lib/seo";
import type { Project } from "@/payload-types";

type RichData = ComponentProps<typeof RichText>["data"];

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const services = await getServices().catch(() => []);
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return {};
  const noindex = process.env.SITE_INDEXABLE !== "true";
  return {
    title: { absolute: service.seo?.title ?? `${service.title} · Sustech Technology Ltd` },
    description: service.seo?.description ?? service.summary,
    alternates: { canonical: `/services/${service.slug}` },
    robots: noindex ? { index: false, follow: false } : undefined,
  };
}

function projectSectorName(p: Project): string | null {
  return p.sector && typeof p.sector === "object" ? p.sector.title : null;
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) notFound();

  const Icon = serviceIcons[service.icon] ?? serviceIcons.solar;
  const faq = service.faq ?? [];
  const related = await getProjectsByService(service.id);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: service.title,
          serviceType: service.title,
          description: service.summary,
          url: `${serverUrl}/services/${service.slug}`,
          provider: { "@type": "Organization", name: "Sustech Technology Ltd", url: serverUrl },
          areaServed: { "@type": "Country", name: "Bangladesh" },
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
              name: service.title,
              item: `${serverUrl}/services/${service.slug}`,
            },
          ],
        }}
      />
      {faq.length > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faq.map((it) => ({
              "@type": "Question",
              name: it.question,
              acceptedAnswer: { "@type": "Answer", text: it.answer },
            })),
          }}
        />
      )}

      <section className="bg-ink-900 text-text-invert relative isolate overflow-hidden">
        <GridMotif tone="dark" />
        {service.heroImage && typeof service.heroImage === "object" && service.heroImage.url ? (
          // CMS-driven hero image (CLAUDE.md §1). Sits behind the dark band at 25% opacity so the
          // copy stays readable, matching the home hero treatment.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={service.heroImage.url}
            alt={service.heroImage.alt ?? ""}
            className="absolute inset-0 -z-10 h-full w-full object-cover opacity-25"
          />
        ) : null}
        <Container className="relative py-20 md:py-28">
          <span className="bg-brand/15 text-brand-300 mb-6 inline-flex h-12 w-12 items-center justify-center rounded-md">
            <Icon className="h-6 w-6" aria-hidden />
          </span>
          <Eyebrow onDark>Service</Eyebrow>
          <h1 className="text-display mt-3 max-w-3xl font-bold text-balance">{service.title}</h1>
          <p className="text-lede text-text-invert-soft mt-4 max-w-2xl">{service.summary}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="primary">
              <Link href="/request-quote">Request a Consultation</Link>
            </Button>
            <Button asChild variant="ghost" onDark>
              <Link href="/projects">See Our Projects</Link>
            </Button>
          </div>
        </Container>
      </section>

      {service.explainerVideo &&
      typeof service.explainerVideo === "object" &&
      service.explainerVideo.url ? (
        // CMS-driven autoplay-muted-loop explainer (8–15s). The poster paints instantly (LCP-safe)
        // and is the entire experience under prefers-reduced-motion (the <video> is hidden).
        // GPU-accelerated rendering — no layout cost — and `preload="metadata"` keeps the page
        // fast on first paint.
        <Section eyebrow="See it in action" srTitle={`${service.title} explainer video`}>
          <div className="mx-auto max-w-3xl">
            <div className="border-border bg-ink-900 relative aspect-video overflow-hidden rounded-xl border shadow-lg">
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster={
                  service.explainerPoster &&
                  typeof service.explainerPoster === "object" &&
                  service.explainerPoster.url
                    ? service.explainerPoster.url
                    : undefined
                }
                aria-label={`${service.title} — short explainer animation`}
                className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
              >
                <source src={service.explainerVideo.url} type="video/mp4" />
              </video>
              {/* Reduced-motion fallback — show the poster as a still image. */}
              {service.explainerPoster &&
              typeof service.explainerPoster === "object" &&
              service.explainerPoster.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={service.explainerPoster.url}
                  alt={service.explainerPoster.alt ?? `${service.title} explainer`}
                  className="absolute inset-0 hidden h-full w-full object-cover motion-reduce:block"
                />
              ) : null}
            </div>
            <p className="text-text-soft mt-3 text-center text-xs">
              Animation for illustration. Real installations are engineered to your site and
              standards.
            </p>
          </div>
        </Section>
      ) : null}

      {service.scope ? (
        <Section title="What's included" srTitle="Scope of work">
          <div className="richtext max-w-prose">
            <RichText data={service.scope as RichData} />
          </div>
        </Section>
      ) : null}

      {service.standards ? (
        <Section tone="muted" title="Standards & methodology">
          <div className="richtext max-w-prose">
            <RichText data={service.standards as RichData} />
          </div>
        </Section>
      ) : null}

      {related.length > 0 && (
        <Section title="Related projects" eyebrow="Proof">
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
        </Section>
      )}

      {faq.length > 0 && (
        <Section tone={service.standards ? "light" : "muted"} title="Frequently asked questions">
          <dl className="divide-border mx-auto max-w-3xl divide-y">
            {faq.map((it, i) => (
              <div key={it.id ?? i} className="py-5">
                <dt className="text-ink-900 text-lg font-semibold">{it.question}</dt>
                <dd className="text-text-soft mt-2">{it.answer}</dd>
              </div>
            ))}
          </dl>
        </Section>
      )}

      <section className="bg-ink-900 text-text-invert relative isolate overflow-hidden">
        <GridMotif tone="dark" />
        <Container className="relative py-16 text-center md:py-20">
          <h2 className="text-h2 mx-auto max-w-2xl font-semibold text-balance">
            Planning a {service.title.toLowerCase()} project?
          </h2>
          <p className="text-text-invert-soft mx-auto mt-4 max-w-xl">
            Tell us what you&rsquo;re building — our engineers will scope it with you, no
            obligation.
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
