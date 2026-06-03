import { Check } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { whySustech } from "@/lib/home-content";

export function WhySustech() {
  return (
    <Section tone="muted" eyebrow="Why Sustech" title={whySustech.heading}>
      <ul className="grid gap-x-12 gap-y-8 md:grid-cols-2">
        {whySustech.items.map((item, i) => {
          const credential = item.credentialSlot?.value;
          return (
            <li key={item.title}>
              <Reveal delay={i * 0.05}>
                <div className="flex gap-4">
                  <span className="bg-energy/10 text-energy mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full">
                    <Check className="h-4 w-4" aria-hidden />
                  </span>
                  <div>
                    <h3 className="text-h3 text-ink-900 font-semibold">{item.title}</h3>
                    <p className="text-text-soft mt-1.5 text-[0.9375rem]">
                      {credential ? `${credential} — ${item.body}` : item.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
