import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Check, ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { sectorIcons } from "@/components/icons";
import { JsonLd } from "@/components/seo/json-ld";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { GridMotif } from "@/components/ui/grid-motif";
import { HoverRevealText } from "@/components/ui/hover-reveal-text";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/skeleton";
import { getProjects, getSiteSettings } from "@/lib/payload";
import { isHorizontal } from "@/lib/content-layout";
import { pageIntro } from "@/lib/page-intro";
import { ProofCounter } from "@/components/ui/proof-counter";
import { serverUrl } from "@/lib/seo";
import { cn } from "@/lib/utils";
import type { Project, Service } from "@/payload-types";

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
type Filters = { sector?: string; service?: string; year?: string };

function projectSector(p: Project): SectorRef | null {
  return p.sector && typeof p.sector === "object" ? p.sector : null;
}

function projectServices(p: Project): Service[] {
  return (p.services ?? []).filter((x): x is Service => typeof x === "object" && x !== null);
}

function coverImage(p: Project): { url: string; alt: string } | null {
  const img = p.gallery?.[0]?.image;
  if (!img || typeof img !== "object" || !img.url) return null;
  return { url: img.url, alt: img.alt ?? "" };
}

/**
 * One project card. `horizontal` mirrors the Knowledge Hub / Our Team
 * interaction: a thumbnail beside the text with the summary revealed on hover.
 * The summary stays in the DOM either way, so it remains crawlable.
 */
function ProjectCard({ p, index, horizontal }: { p: Project; index: number; horizontal: boolean }) {
  const img = coverImage(p);
  const sectorName = projectSector(p)?.title ?? null;
  const meta = [sectorName, p.year].filter(Boolean).join(" · ");
  const imgCls = horizontal ? "aspect-[4/3] w-32 shrink-0 sm:w-44" : "aspect-[4/3] w-full";
  return (
    <li>
      <Reveal delay={Math.min(index, 5) * 50}>
        <Card
          interactive
          className={cn("group relative overflow-hidden", horizontal ? "flex flex-row" : "h-full")}
        >
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element -- CMS media; <img> matches existing pattern in this file
            <img src={img.url} alt={img.alt} className={cn("object-cover", imgCls)} />
          ) : (
            <Skeleton className={cn("rounded-none", imgCls)} />
          )}
          <div className={horizontal ? "min-w-0 flex-1 p-5" : "p-6"}>
            <p className="text-brand font-mono text-xs tracking-[0.08em] uppercase">{meta}</p>
            <h3 className="text-h3 text-ink-900 mt-2 font-semibold">{p.name}</h3>
            {p.summary &&
              (horizontal ? (
                <HoverRevealText className="mt-2">{p.summary}</HoverRevealText>
              ) : (
                <p className="text-text-soft mt-2 text-[0.9375rem]">{p.summary}</p>
              ))}
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
}

/** Build a /projects URL that toggles one filter while preserving the others. */
function hrefWith(current: Filters, key: keyof Filters, value?: string): string {
  const next: Filters = { ...current, [key]: value };
  const qs = new URLSearchParams();
  if (next.sector) qs.set("sector", next.sector);
  if (next.service) qs.set("service", next.service);
  if (next.year) qs.set("year", next.year);
  const s = qs.toString();
  return s ? `/projects?${s}` : "/projects";
}

export default async function ProjectsIndexPage({
  searchParams,
}: {
  searchParams: Promise<Filters>;
}) {
  const current = await searchParams;
  const { sector: activeSector, service: activeService, year: activeYear } = current;
  const [all, settings] = await Promise.all([getProjects(), getSiteSettings()]);
  const intro = pageIntro(settings, "projects");

  // CMS-driven layout: vertical grid (default) or horizontal hover-reveal rows.
  const horizontal = isHorizontal(settings, "projects");
  const listCls = horizontal ? "flex flex-col gap-4" : "grid gap-6 sm:grid-cols-2 lg:grid-cols-3";

  // CMS-driven headline stats (real numbers only; band hides when empty).
  const stats = settings.stats ?? [];

  // Derive filter options + counts across the full published set.
  const sectorCounts = new Map<
    string,
    { title: string; icon: SectorRef["icon"]; iconUrl: string | null; count: number }
  >();
  const serviceCounts = new Map<string, { title: string; count: number }>();
  const yearCounts = new Map<number, number>();
  for (const p of all) {
    const sec = projectSector(p);
    if (sec) {
      const e = sectorCounts.get(sec.slug);
      if (e) e.count += 1;
      else
        sectorCounts.set(sec.slug, {
          title: sec.title,
          icon: sec.icon,
          iconUrl:
            sec.customIcon && typeof sec.customIcon === "object" && sec.customIcon.url
              ? sec.customIcon.url.replace(/^https?:\/\/[^/]+/, "")
              : null,
          count: 1,
        });
    }
    for (const svc of projectServices(p)) {
      const e = serviceCounts.get(svc.slug);
      if (e) e.count += 1;
      else serviceCounts.set(svc.slug, { title: svc.title, count: 1 });
    }
    if (typeof p.year === "number") yearCounts.set(p.year, (yearCounts.get(p.year) ?? 0) + 1);
  }
  const sectorFilters = [...sectorCounts.entries()].sort((a, b) =>
    a[1].title.localeCompare(b[1].title),
  );
  const serviceFilters = [...serviceCounts.entries()].sort((a, b) =>
    a[1].title.localeCompare(b[1].title),
  );
  const yearFilters = [...yearCounts.keys()].sort((a, b) => b - a);
  const hasFilters =
    sectorFilters.length > 0 || serviceFilters.length > 0 || yearFilters.length > 0;
  const anyActive = Boolean(activeSector || activeService || activeYear);

  const projects = all.filter((p) => {
    if (activeSector && projectSector(p)?.slug !== activeSector) return false;
    if (activeService && !projectServices(p).some((s) => s.slug === activeService)) return false;
    if (activeYear && String(p.year ?? "") !== activeYear) return false;
    return true;
  });

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
          <Eyebrow onDark>{intro.eyebrow ?? "Our work"}</Eyebrow>
          <h1 className="text-display mt-4 max-w-3xl font-bold text-balance">
            {intro.heading ?? TITLE}
          </h1>
          <p className="text-lede text-text-invert-soft mt-4 max-w-2xl">{intro.lede ?? LEDE}</p>
        </Container>
      </section>

      {stats.length > 0 && (
        <section className="bg-surface border-border border-b" aria-label="Project statistics">
          <Container className="py-8">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {stats.map((s, i) => (
                <Reveal key={s.label} delay={i * 60}>
                  <ProofCounter
                    value={s.value ?? 0}
                    suffix={s.suffix ?? ""}
                    label={s.label ?? ""}
                  />
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      )}

      <Section srTitle="All projects">
        {hasFilters && (
          <nav aria-label="Filter projects" className="mb-10 flex flex-wrap items-center gap-3">
            {sectorFilters.length > 0 && (
              <FilterDropdown
                label="Sector"
                activeLabel={
                  activeSector
                    ? (sectorCounts.get(activeSector)?.title ?? "—")
                    : `All (${all.length})`
                }
              >
                <FilterOption
                  href={hrefWith(current, "sector", undefined)}
                  active={!activeSector}
                  label={`All sectors (${all.length})`}
                />
                {sectorFilters.map(([slug, f]) => {
                  const Icon = sectorIcons[f.icon] ?? sectorIcons.industrial;
                  return (
                    <FilterOption
                      key={slug}
                      href={hrefWith(current, "sector", slug)}
                      active={activeSector === slug}
                      label={`${f.title} (${f.count})`}
                      icon={
                        f.iconUrl ? (
                          <Image
                            src={f.iconUrl}
                            alt=""
                            width={32}
                            height={32}
                            className="h-4 w-4 object-contain"
                          />
                        ) : (
                          <Icon className="h-4 w-4" aria-hidden />
                        )
                      }
                    />
                  );
                })}
              </FilterDropdown>
            )}
            {serviceFilters.length > 0 && (
              <FilterDropdown
                label="Service"
                activeLabel={
                  activeService ? (serviceCounts.get(activeService)?.title ?? "—") : "All"
                }
              >
                <FilterOption
                  href={hrefWith(current, "service", undefined)}
                  active={!activeService}
                  label="All services"
                />
                {serviceFilters.map(([slug, f]) => (
                  <FilterOption
                    key={slug}
                    href={hrefWith(current, "service", slug)}
                    active={activeService === slug}
                    label={`${f.title} (${f.count})`}
                  />
                ))}
              </FilterDropdown>
            )}
            {yearFilters.length > 0 && (
              <FilterDropdown label="Year" activeLabel={activeYear ?? "All"}>
                <FilterOption
                  href={hrefWith(current, "year", undefined)}
                  active={!activeYear}
                  label="All years"
                />
                {yearFilters.map((y) => (
                  <FilterOption
                    key={y}
                    href={hrefWith(current, "year", String(y))}
                    active={activeYear === String(y)}
                    label={`${y} (${yearCounts.get(y)})`}
                  />
                ))}
              </FilterDropdown>
            )}
            {anyActive && (
              <Link
                href="/projects"
                prefetch={false}
                className="text-text-soft hover:text-brand focus-visible:outline-brand rounded-md px-2 py-1.5 text-sm font-medium underline-offset-2 hover:underline focus-visible:outline-2"
              >
                Clear filters
              </Link>
            )}
          </nav>
        )}

        {projects.length === 0 ? (
          <p className="text-text-soft border-border bg-surface-2 rounded-lg border border-dashed px-6 py-12 text-center">
            {anyActive
              ? "No published projects match these filters."
              : "Project case studies are being published — check back soon."}
          </p>
        ) : (
          <ul className={listCls}>
            {projects.map((p, i) => (
              <ProjectCard key={p.id} p={p} index={i} horizontal={horizontal} />
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}

/**
 * A native <details> disclosure used as a filter dropdown. No JS required — the
 * summary toggles the panel and each option is a server-rendered <a>, so the
 * filters remain crawlable and work without hydration. The current selection is
 * shown in the trigger; selecting an option navigates (panel closes on reload).
 */
function FilterDropdown({
  label,
  activeLabel,
  children,
}: {
  label: string;
  activeLabel: string;
  children: ReactNode;
}) {
  return (
    <details className="group/filter relative">
      <summary
        className="border-border text-ink-900 hover:border-brand/40 focus-visible:outline-brand ease-brand flex cursor-pointer list-none items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 [&::-webkit-details-marker]:hidden"
        aria-label={`Filter by ${label.toLowerCase()}`}
      >
        <span className="text-text-soft font-mono text-[0.6875rem] tracking-[0.08em] uppercase">
          {label}
        </span>
        <span className="max-w-[12rem] truncate">{activeLabel}</span>
        <ChevronDown
          className="text-text-soft ease-brand h-3.5 w-3.5 transition-transform duration-200 group-open/filter:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="border-border bg-surface absolute top-full left-0 z-20 mt-2 max-h-72 w-64 overflow-auto rounded-lg border p-1.5 shadow-lg">
        {children}
      </div>
    </details>
  );
}

function FilterOption({
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
        "focus-visible:outline-brand flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2",
        active
          ? "bg-brand/10 text-brand font-medium"
          : "text-text-soft hover:bg-surface-2 hover:text-ink-900",
      )}
    >
      {icon}
      <span className="flex-1 truncate">{label}</span>
      {active && <Check className="h-4 w-4 shrink-0" aria-hidden />}
    </Link>
  );
}
