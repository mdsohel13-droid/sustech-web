import { ArrowRight, Calculator } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { toolsTeaser } from "@/lib/home-content";

export function ToolsTeaser() {
  return (
    <Section>
      <Reveal>
        <div className="border-border bg-surface-2 relative overflow-hidden rounded-xl border p-8 md:p-12">
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <span className="bg-brand/10 text-brand inline-flex h-11 w-11 items-center justify-center rounded-md">
                <Calculator className="h-6 w-6" aria-hidden />
              </span>
              <h2 className="text-h2 text-ink-900 mt-5 font-semibold text-balance">
                {toolsTeaser.heading}
              </h2>
              <p className="text-text-soft mt-3 text-[1.0625rem]">{toolsTeaser.body}</p>
            </div>
            <div className="shrink-0">
              <Button asChild variant="secondary" size="lg">
                <Link href={toolsTeaser.cta.href}>
                  {toolsTeaser.cta.label}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
