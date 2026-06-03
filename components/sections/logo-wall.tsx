import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/skeleton";
import { logoWall } from "@/lib/home-content";

/** CMS-ready: client logos are published via the CMS. Skeletons until wired. */
export function LogoWall() {
  return (
    <Section tone="muted">
      <h2 className="text-text-soft text-center text-base font-medium">{logoWall.heading}</h2>
      <Reveal className="mt-10">
        <ul
          className="grid grid-cols-2 items-center gap-x-8 gap-y-6 sm:grid-cols-3 lg:grid-cols-6"
          aria-busy="true"
          aria-label="Client logos — loading from the content system"
        >
          {Array.from({ length: 6 }, (_, i) => (
            <li key={i} className="flex justify-center">
              <Skeleton className="bg-surface-3 h-10 w-28" />
            </li>
          ))}
        </ul>
      </Reveal>
      <p className="sr-only">Client logos will appear here once published in the CMS.</p>
    </Section>
  );
}
