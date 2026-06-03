import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { howWeWork } from "@/lib/home-content";

export function HowWeWork() {
  return (
    <Section eyebrow="How we work" title={howWeWork.heading}>
      <ol className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {howWeWork.steps.map((step, i) => (
          <li key={step.title}>
            <Reveal delay={i * 0.06}>
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
