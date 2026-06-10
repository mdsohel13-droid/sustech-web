import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { sectorIcons } from "@/components/icons";
import { JsonLd } from "@/components/seo/json-ld";
import { Card } from "@/components/ui/card";
import { EntityIcon } from "@/components/ui/entity-icon";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { GridMotif } from "@/components/ui/grid-motif";
import { HoverRevealText } from "@/components/ui/hover-reveal-text";
import { Section } from "@/components/ui/section";
import { getSectors, getSiteSettings } from "@/lib/payload";
import { isHorizontal } from "@/lib/content-layout";
import { pageIntro } from "@/lib/page-intro";
import { serverUrl } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const revalidate = 3600;

const TITLE = "Solutions by sector";
const LEDE =
  "We engineer to the realities of your industry — its loads, standards, downtime costs and compliance. Explore the sectors Sustech serves across Bangladesh.";

export function generateMetadata(): Metadata {
  const noindex = process.env.SITE_INDEXABLE !== "true";
  return {
    title: { absolute: `Solutions · Sustech Technology Ltd` },
    description: LEDE,
    alternates: { canonical: "/solutions" },
    robots: noindex ? { index: false, follow: false } : undefined,
  };
}

export default async function SolutionsIndexPage() {
  const [sectors, settings] = await Promise.all([getSectors(), getSiteSettings()]);
  const intro = pageIntro(settings, "solutions");
  const horizontal = isHorizontal(settings, "sectors");
  const listCls = horizontal ? "flex flex-col gap-3" : "grid gap-6 sm:grid-cols-2 lg:grid-cols-4";

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: TITLE,
          description: LEDE,
          url: `${serverUrl}/solutions`,
          mainEntity: {
            "@type": "ItemList",
            itemListElement: sectors.map((s, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${serverUrl}/solutions/${s.slug}`,
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
            { "@type": "ListItem", position: 2, name: "Solutions", item: `${serverUrl}/solutions` },
          ],
        }}
      />

      <section className="bg-ink-900 text-text-invert relative isolate overflow-hidden">
        <GridMotif tone="dark" />
        <Container className="relative py-20 md:py-28">
          <Eyebrow onDark>{intro.eyebrow ?? "Solutions by sector"}</Eyebrow>
          <h1 className="text-display mt-4 max-w-3xl font-bold text-balance">
            {intro.heading ?? TITLE}
          </h1>
          <p className="text-lede text-text-invert-soft mt-4 max-w-2xl">{intro.lede ?? LEDE}</p>
        </Container>
      </section>

      <Section srTitle="All sectors">
        {sectors.length === 0 ? (
          <p className="text-text-soft border-border bg-surface-2 rounded-lg border border-dashed px-6 py-12 text-center">
            Sector solutions are on the way — check back soon.
          </p>
        ) : (
          <ul className={listCls}>
            {sectors.map((sec) => {
              const Icon = sectorIcons[sec.icon] ?? sectorIcons.industrial;
              return (
                <li key={sec.id}>
                  <Card
                    interactive
                    className={cn(
                      "group relative",
                      horizontal
                        ? "flex flex-row items-center gap-4 p-5"
                        : "flex h-full flex-col p-6",
                    )}
                  >
                    <span className="bg-ink-900/[0.06] text-ink-900 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md">
                      <EntityIcon customIcon={sec.customIcon} Fallback={Icon} />
                    </span>
                    <div className={horizontal ? "min-w-0 flex-1" : "contents"}>
                      <h2
                        className={cn(
                          "text-h3 text-ink-900 font-semibold",
                          horizontal ? "" : "mt-5",
                        )}
                      >
                        {sec.title}
                      </h2>
                      {sec.summary &&
                        (horizontal ? (
                          <HoverRevealText className="mt-1">{sec.summary}</HoverRevealText>
                        ) : (
                          <p className="text-text-soft mt-2 flex-1 text-[0.9375rem]">
                            {sec.summary}
                          </p>
                        ))}
                      {!horizontal && (
                        <span className="text-brand mt-5 inline-flex items-center gap-1.5 text-sm font-medium">
                          View sector <ArrowRight className="h-4 w-4" aria-hidden />
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/solutions/${sec.slug}`}
                      prefetch={false}
                      aria-label={`${sec.title} — view sector solutions`}
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
