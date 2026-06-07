import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/skeleton";
import { getBlockStyle, resolveBlockStyle } from "@/lib/block-styles";
import { getClients } from "@/lib/payload";
import type { Client, LogoWallBlock } from "@/payload-types";
import { mediaUrl, objs } from "./shared";

export async function LogoWallView({ block }: { block: LogoWallBlock }) {
  const bs = resolveBlockStyle(getBlockStyle(block), block.appearance);
  const clients = block.source === "selected" ? objs<Client>(block.clients) : await getClients();
  return (
    <Section
      tone={bs.tone}
      width={bs.width}
      paddingSize={bs.paddingSize}
      align={bs.textAlign}
      headingSize={bs.headingSize}
      headingFont={bs.headingFont}
      eyebrowAccent={bs.accentColour}
    >
      {block.heading && (
        <h2 className="text-text-soft text-center text-base font-medium">{block.heading}</h2>
      )}
      <Reveal animation={bs.animationStyle} delay={bs.delayMs} className="mt-10">
        <ul className="grid grid-cols-2 items-center gap-x-8 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
          {clients.length === 0
            ? Array.from({ length: 6 }, (_, i) => (
                <li key={i} className="flex justify-center">
                  <Skeleton className="bg-surface-3 h-10 w-28" />
                </li>
              ))
            : clients.map((c) => {
                const logo = mediaUrl(c.logo);
                return (
                  <li key={c.id} className="flex justify-center">
                    {logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={logo.url}
                        alt={c.name}
                        className="h-10 w-auto object-contain opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-text-soft text-sm font-medium">{c.name}</span>
                    )}
                  </li>
                );
              })}
        </ul>
      </Reveal>
    </Section>
  );
}
