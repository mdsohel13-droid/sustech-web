import { Quote } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/skeleton";
import { testimonials } from "@/lib/home-content";

/** CMS-ready: named, company-attributed quotes are published via the CMS. */
export function Testimonials() {
  return (
    <Section tone="muted" eyebrow="Testimonials" title={testimonials.heading}>
      <ul
        className="grid gap-6 md:grid-cols-2"
        aria-busy="true"
        aria-label="Client testimonials — loading from the content system"
      >
        {[0, 1].map((i) => (
          <li key={i}>
            <Reveal delay={i * 0.06}>
              <Card className="flex h-full flex-col gap-5 p-8">
                <Quote className="text-brand/30 h-7 w-7" aria-hidden />
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-11/12" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
                <div className="mt-auto flex items-center gap-3 pt-2">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-3.5 w-28" />
                    <Skeleton className="h-3 w-36" />
                  </div>
                </div>
              </Card>
            </Reveal>
          </li>
        ))}
      </ul>
      <p className="sr-only">Client testimonials will appear here once published in the CMS.</p>
    </Section>
  );
}
