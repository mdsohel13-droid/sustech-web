import { Section } from "@/components/ui/section";
import { getBlockStyle, resolveBlockStyle } from "@/lib/block-styles";
import type { PartnerBarBlock } from "@/payload-types";
import { mediaUrl } from "./shared";

export function PartnerBarView({ block }: { block: PartnerBarBlock }) {
  const bs = resolveBlockStyle(getBlockStyle(block), block.appearance);
  const partners = block.partners ?? [];
  if (partners.length === 0) return null;
  return (
    <Section
      tone={bs.tone}
      width={bs.width}
      paddingSize={bs.paddingSize}
      align={bs.textAlign}
      headingSize={bs.headingSize}
      headingFont={bs.headingFont}
      eyebrowAccent={bs.accentColour}
      srTitle="Technology partners"
    >
      {block.heading && (
        <p className="text-text-soft mb-6 text-center font-mono text-xs font-medium tracking-[0.08em] uppercase">
          {block.heading}
        </p>
      )}
      <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
        {partners.map((p, i) => {
          const logo = mediaUrl(p.logo);
          return (
            <li key={p.id ?? i} className="text-text-soft text-lg font-semibold">
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logo.url}
                  alt={logo.alt || p.name}
                  className="h-8 w-auto object-contain"
                />
              ) : (
                p.name
              )}
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
