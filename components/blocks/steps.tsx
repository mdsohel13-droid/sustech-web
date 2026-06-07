import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { getBlockStyle, itemRevealProps, resolveBlockStyle } from "@/lib/block-styles";
import type { StepsBlock } from "@/payload-types";

export function StepsView({ block }: { block: StepsBlock }) {
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
      eyebrow={block.eyebrow ?? "How we work"}
      title={block.heading ?? undefined}
    >
      <ol className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {(block.steps ?? []).map((step, i) => (
          <li key={step.id ?? i}>
            <Reveal {...itemRevealProps(bs, i)}>
              <div className="border-border border-t pt-5">
                <span className="text-brand font-mono text-sm font-medium tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-h3 text-ink-900 mt-3 font-semibold">{step.title}</h3>
                <p className="text-text-soft mt-2 text-[0.9375rem]">{step.body}</p>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}
