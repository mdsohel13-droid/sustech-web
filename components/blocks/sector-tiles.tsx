import Link from "next/link";
import { sectorIcons } from "@/components/icons";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { getBlockStyle, itemRevealProps, resolveBlockStyle } from "@/lib/block-styles";
import { getSectors } from "@/lib/payload";
import type { Sector } from "@/payload-types";
import { objs } from "./shared";

export async function SectorTilesView({
  block,
}: {
  block: {
    heading?: string | null;
    lede?: string | null;
    appearance?: string | null;
    source?: string | null;
    sectors?: (number | Sector)[] | null;
  };
}) {
  const bs = resolveBlockStyle(getBlockStyle(block), block.appearance);
  const sectors = block.source === "selected" ? objs<Sector>(block.sectors) : await getSectors();
  return (
    <Section
      id="solutions"
      tone={bs.tone}
      width={bs.width}
      paddingSize={bs.paddingSize}
      align={bs.textAlign}
      headingSize={bs.headingSize}
      headingFont={bs.headingFont}
      eyebrowAccent={bs.accentColour}
      eyebrow="Solutions by sector"
      title={block.heading ?? undefined}
      lede={block.lede ?? undefined}
    >
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {sectors.map((sec, i) => {
          const Icon = sectorIcons[sec.icon] ?? sectorIcons.industrial;
          return (
            <li key={sec.id}>
              <Reveal {...itemRevealProps(bs, i)} className="h-full">
                <Card interactive className="relative flex h-full flex-col p-6">
                  <span className="bg-ink-900/[0.06] text-ink-900 inline-flex h-11 w-11 items-center justify-center rounded-md">
                    <Icon className="h-6 w-6" aria-hidden />
                  </span>
                  <h3 className="text-h3 text-ink-900 mt-5 font-semibold">{sec.title}</h3>
                  <p className="text-text-soft mt-2 flex-1 text-[0.9375rem]">{sec.summary}</p>
                  <Link
                    href={`/solutions/${sec.slug}`}
                    prefetch={false}
                    aria-label={`${sec.title} — view sector solutions`}
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
