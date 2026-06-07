import { Calculator, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { getBlockStyle, resolveBlockStyle } from "@/lib/block-styles";
import type { CalculatorEmbedBlock } from "@/payload-types";

export function CalculatorEmbedView({ block }: { block: CalculatorEmbedBlock }) {
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
    >
      <Reveal animation={bs.animationStyle} delay={bs.delayMs}>
        <div className="border-border bg-surface-2 relative overflow-hidden rounded-xl border p-8 md:p-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <span className="bg-brand/10 text-brand inline-flex h-11 w-11 items-center justify-center rounded-md">
                <Calculator className="h-6 w-6" aria-hidden />
              </span>
              <h2 className="text-h2 text-ink-900 mt-5 font-semibold text-balance">
                {block.heading ?? "Engineering calculators"}
              </h2>
              {block.body && <p className="text-text-soft mt-3 text-[1.0625rem]">{block.body}</p>}
            </div>
            <Button asChild variant="secondary" size="lg">
              <Link href="/tools" prefetch={false}>
                {block.ctaLabel ?? "Try the calculator"}{" "}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
