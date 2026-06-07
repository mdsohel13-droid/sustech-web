import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/skeleton";
import { getBlockStyle, itemRevealProps, resolveBlockStyle } from "@/lib/block-styles";
import { getFeaturedProjects } from "@/lib/payload";
import type { Media, Project } from "@/payload-types";
import { HoverRevealText, mediaUrl, objs } from "./shared";

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
  const bs = resolveBlockStyle(getBlockStyle(block), block.appearance);
  const projects =
    block.source === "selected" ? objs<Project>(block.projects) : await getFeaturedProjects(3);
  return (
    <Section
      tone={bs.tone}
      width={bs.width}
      paddingSize={bs.paddingSize}
      align={bs.textAlign}
      headingSize={bs.headingSize}
      headingFont={bs.headingFont}
      eyebrowAccent={bs.accentColour}
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
                <Reveal {...itemRevealProps(bs, i)}>
                  {/*
                   * `group` enables the hover/focus-within reveal of the summary below the
                   * meta line. The image + sector + name stay always visible so the card is
                   * scannable at a glance; the longer summary expands smoothly on interaction.
                   */}
                  <Card
                    interactive
                    className="group focus-within:border-brand/30 relative h-full overflow-hidden focus-within:-translate-y-0.5 focus-within:shadow-md"
                  >
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={img.url}
                        alt={img.alt}
                        className="ease-standard aspect-[4/3] w-full object-cover transition-transform duration-[var(--duration-slow)] group-focus-within:scale-[1.03] group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-focus-within:scale-100 motion-reduce:group-hover:scale-100"
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
                      {p.summary && <HoverRevealText className="mt-2">{p.summary}</HoverRevealText>}
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
