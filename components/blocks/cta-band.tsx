import { Container } from "@/components/ui/container";
import { GridMotif } from "@/components/ui/grid-motif";
import { Reveal } from "@/components/ui/reveal";
import { getBlockStyle, resolveBlockStyle } from "@/lib/block-styles";
import type { CTABandBlock } from "@/payload-types";
import { CtaButtons, type Cta } from "./shared";

export function CTABandView({ block }: { block: CTABandBlock }) {
  // CTABand has no legacy `appearance` field — style group only.
  const bs = resolveBlockStyle(getBlockStyle(block));
  return (
    <section className="bg-ink-900 text-text-invert relative isolate overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(50%_60%_at_80%_110%,rgba(245,158,11,0.14),transparent_60%),radial-gradient(50%_60%_at_10%_-10%,rgba(14,95,216,0.22),transparent_60%)]"
      />
      <GridMotif tone="dark" />
      <Container className="relative py-20 md:py-28">
        <Reveal animation={bs.animationStyle} delay={bs.delayMs}>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-h1 font-bold text-balance">{block.heading}</h2>
            {block.subhead && (
              <p className="text-lede text-text-invert-soft mt-4">{block.subhead}</p>
            )}
            <div className="flex justify-center">
              <CtaButtons
                ctas={block.ctas as Cta[] | null}
                onDark
                className="mt-9 justify-center"
              />
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
