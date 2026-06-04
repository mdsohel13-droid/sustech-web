import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { sectorIcons } from "@/components/icons";
import { JsonLd } from "@/components/seo/json-ld";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { GridMotif } from "@/components/ui/grid-motif";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/skeleton";
import { getProjects } from "@/lib/payload";
import { serverUrl } from "@/lib/seo";
import { cn } from "@/lib/utils";
import type { Project } from "@/payload-types";

export const revalidate = 3600;

const TITLE = "Projects";
const LEDE =
  "Completed engineering work for corporate, commercial and industrial clients across Bangladesh — solar, electrical EPC, grounding & lightning protection, smart systems, and testing.";

export function generateMetadata(): Metadata {
  const noindex = process.env.SITE_INDEXABLE !== "true";
  return {
    title: { absolute: `${TITLE} · Sustech Technology Ltd` },
    description: LEDE,
    alternates: { canonical: "/projects" },
    robots: noindex ? { index: false, follow: false } : undefined,
  };
}

type SectorRef = NonNullable<Extract<Project["sector"], object>>;

function projectSector(p: Project): SectorRef | null {
  return p.sector && typeof p.sector === "object" ? p.sector : null;
}

function coverImage(p: Project): { url: string; alt: string } | null {
  const img = p.gallery?.[0]?.image;
  if (!img || typeof img !== "object" || !img.url) return null;
  return { url: img.url, alt: img.alt ?? "" };
}

export default async function ProjectsIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ sector?: string }>;
}) {
  const { sector: activeSector } = await searchParams;
  const all = await getProjects();

  // Filter chips: only sectors that actually have published projects, with counts.
  const sectorCounts = new Map<string, { title: string; icon: SectorRef["icon"]; count: number }>();
  for (const p of all) {
    const s = projectSector(p);
    if (!s) continue;
    const entry = sectorCounts.get(s.slug);
    if (entry) entry.count += 1;
    else sectorCounts.set(s.slug, { title: s.title, icon: s.icon, count: 1 });
  }
  const filters = [...sectorCounts.entries()].sort((a, b) => a[1].title.localeCompare(b[1].title));

  const projects = activeSector ? all.filter((p) => projectSector(p)?.slug === activeSector) : all;

  const activeTitle = activeSector ? sectorCounts.get(activeSector)?.title : undefined;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: TITLE,
          description: LEDE,
          url: `${serverUrl}/projects`,
          mainEntity: {
            "@type": "ItemList",
            itemListElement: projects.map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${serverUrl}/projects/${p.slug}`,
              name: p.name,
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
            { "@type": "ListItem", position: 2, name: TITLE, item: `${serverUrl}/projects` },
          ],
        }}
      />

      <section className="bg-ink-900 text-text-invert relative isolate overflow-hidden">
        <GridMotif tone="dark" />
        <Container className="relative py-20 md:py-28">
          <Eyebrow onDark>Our work</Eyebrow>
          <h1 className="text-display mt-4 max-w-3xl font-bold text-balance">{TITLE}</h1>
          <p className="text-lede text-text-invert-soft mt-4 max-w-2xl">{LEDE}</p>
        </Container>
      </section>

      <Section srTitle={activeTitle ? `${activeTitle} projects` : "All projects"}>
        {filters.length > 0 && (
          <nav aria-label="Filter projects by sector" className="mb-10 flex flex-wrap gap-2">
            <FilterChip href="/projects" active={!activeSector} label={`All (${all.length})`} />
            {filters.map(([slug, f]) => {
              const Icon = sectorIcons[f.icon] ?? sectorIcons.manufacturing;
              return (
                <FilterChip
                  key={slug}
                  href={`/projects?sector=${slug}`}
                  active={activeSector === slug}
                  label={`${f.title} (${f.count})`}
                  icon={<Icon className="h-3.5 w-3.5" aria-hidden />}
                />
              );
            })}
          </nav>
        )}

        {projects.length === 0 ? (
          <p className="text-text-soft border-border bg-surface-2 rounded-lg border border-dashed px-6 py-12 text-center">
            {activeSector
              ? "No published projects in this sector yet."
              : "Project case studies are being published — check back soon."}
          </p>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p, i) => {
              const img = coverImage(p);
              const sectorName = projectSector(p)?.title ?? null;
              return (
                <li key={p.id}>
                  <Reveal delay={Math.min(i, 5) * 0.05}>
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
                        {p.summary && (
                          <p className="text-text-soft mt-2 text-[0.9375rem]">{p.summary}</p>
                        )}
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
      </Section>
    </>
  );
}

function FilterChip({
  href,
  active,
  label,
  icon,
}: {
  href: string;
  active: boolean;
  label: string;
  icon?: ReactNode;
}) {
  return (
    <Link
      href={href}
      prefetch={false}
      aria-current={active ? "page" : undefined}
      className={cn(
        "ease-brand focus-visible:outline-brand inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2",
        active
          ? "border-brand bg-brand text-text-invert"
          : "border-border text-text-soft hover:border-brand/40 hover:text-text",
      )}
    >
      {icon}
      {label}
    </Link>
  );
}
