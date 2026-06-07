import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { serviceIcons } from "@/components/icons";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { getBlockStyle, itemRevealProps, resolveBlockStyle } from "@/lib/block-styles";
import { getServices } from "@/lib/payload";
import type { Service } from "@/payload-types";
import { objs } from "./shared";

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
  const bs = resolveBlockStyle(getBlockStyle(block), block.appearance as string | null);
  const services =
    block.source === "selected" ? objs<Service>(block.services) : await getServices();
  return (
    <Section
      id="services"
      tone={bs.tone}
      width={bs.width}
      paddingSize={bs.paddingSize}
      align={bs.textAlign}
      headingSize={bs.headingSize}
      headingFont={bs.headingFont}
      eyebrowAccent={bs.accentColour}
      eyebrow="What we do"
      title={block.heading ?? undefined}
      lede={block.lede ?? undefined}
    >
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {services.map((svc, i) => {
          const Icon = serviceIcons[svc.icon] ?? serviceIcons.solar;
          return (
            <li key={svc.id}>
              <Reveal {...itemRevealProps(bs, i)} className="h-full">
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
