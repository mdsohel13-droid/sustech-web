import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/skeleton";
import { featuredProjects } from "@/lib/home-content";

/** CMS-ready: case studies are published via Hermes → CMS. Renders skeletons until wired. */
export function FeaturedProjects() {
  return (
    <Section
      eyebrow="Featured projects"
      title={featuredProjects.heading}
      lede={featuredProjects.lede}
    >
      <ul
        className="grid gap-6 md:grid-cols-3"
        aria-busy="true"
        aria-label="Featured projects — loading from the content system"
      >
        {[0, 1, 2].map((i) => (
          <li key={i}>
            <Reveal delay={i * 0.06}>
              <Card className="overflow-hidden">
                <Skeleton className="aspect-[4/3] w-full rounded-none" />
                <div className="space-y-3 p-6">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </Card>
            </Reveal>
          </li>
        ))}
      </ul>
      <p className="sr-only">Project case studies will appear here once published in the CMS.</p>
      <div className="mt-10">
        <Link
          href={featuredProjects.viewAll.href}
          className="text-brand focus-visible:outline-brand inline-flex items-center gap-1.5 font-medium underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {featuredProjects.viewAll.label}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </Section>
  );
}
