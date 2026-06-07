import { ProofCounter } from "@/components/ui/proof-counter";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { getBlockStyle, itemRevealProps, resolveBlockStyle } from "@/lib/block-styles";
import type { StatsCountersBlock } from "@/payload-types";

export function StatsCountersView({ block }: { block: StatsCountersBlock }) {
  const bs = resolveBlockStyle(getBlockStyle(block), block.appearance);
  return (
    <Section
      tone={bs.tone}
      width={bs.width}
      paddingSize={bs.paddingSize}
      align={bs.textAlign}
      headingSize={bs.headingSize}
      headingFont={bs.headingFont}
      eyebrowAccent={bs.accentColour}
      srTitle="Key figures"
    >
      {block.intro && (
        <p className="text-text-soft mb-10 text-center font-mono text-xs font-medium tracking-[0.08em] uppercase">
          {block.intro}
        </p>
      )}
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
        {(block.stats ?? []).map((s, i) => (
          <Reveal key={s.id ?? i} {...itemRevealProps(bs, i)}>
            <ProofCounter value={s.value ?? null} label={s.label} suffix={s.suffix ?? undefined} />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
