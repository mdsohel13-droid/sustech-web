import { Quote } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/skeleton";
import { getBlockStyle, itemRevealProps, resolveBlockStyle } from "@/lib/block-styles";
import { getTestimonials } from "@/lib/payload";
import type { Testimonial } from "@/payload-types";
import { objs } from "./shared";

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
  const bs = resolveBlockStyle(getBlockStyle(block), block.appearance);
  const items =
    block.source === "selected" ? objs<Testimonial>(block.testimonials) : await getTestimonials();
  return (
    <Section
      tone={bs.tone}
      width={bs.width}
      paddingSize={bs.paddingSize}
      align={bs.textAlign}
      headingSize={bs.headingSize}
      headingFont={bs.headingFont}
      eyebrowAccent={bs.accentColour}
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
              <Reveal {...itemRevealProps(bs, i)}>
                <Card className="flex h-full flex-col gap-5 p-8">
                  <Quote className="text-brand/30 h-7 w-7" aria-hidden />
                  <blockquote className="text-ink-900 text-lg">&ldquo;{t.quote}&rdquo;</blockquote>
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
