import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { serviceIcons } from "@/components/icons";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { whatWeDo } from "@/lib/home-content";

export function WhatWeDo() {
  return (
    <Section id="services" eyebrow="What we do" title={whatWeDo.heading} lede={whatWeDo.lede}>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {whatWeDo.items.map((item, i) => {
          const Icon = serviceIcons[item.icon];
          return (
            <li key={item.href}>
              <Reveal delay={i * 0.06} className="h-full">
                <Card interactive className="relative flex h-full flex-col p-6">
                  <span className="bg-brand/10 text-brand inline-flex h-11 w-11 items-center justify-center rounded-md">
                    <Icon className="h-6 w-6" aria-hidden />
                  </span>
                  <h3 className="text-h3 text-ink-900 mt-5 font-semibold">{item.title}</h3>
                  <p className="text-text-soft mt-2 flex-1 text-[0.9375rem]">{item.outcome}</p>
                  <span className="text-brand mt-5 inline-flex items-center gap-1.5 text-sm font-medium">
                    Explore
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </span>
                  <Link
                    href={item.href}
                    aria-label={`${item.title} — explore this service`}
                    className="focus-visible:outline-brand absolute inset-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2"
                  />
                </Card>
              </Reveal>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
