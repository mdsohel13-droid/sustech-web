import { ProofCounter } from "@/components/ui/proof-counter";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { proof } from "@/lib/home-content";

export function ProofBar() {
  return (
    <Section tone="muted" srTitle="Sustech by the numbers">
      <p className="text-text-soft mb-10 text-center font-mono text-xs font-medium tracking-[0.08em] uppercase">
        {proof.intro}
      </p>
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-5">
        {proof.stats.map((stat, i) => (
          <Reveal key={stat.id} delay={i * 0.06}>
            <ProofCounter value={stat.value} label={stat.label} />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
