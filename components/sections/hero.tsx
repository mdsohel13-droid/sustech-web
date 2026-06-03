import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { GridMotif } from "@/components/ui/grid-motif";
import { hero } from "@/lib/home-content";

export function Hero() {
  return (
    <section className="bg-ink-900 text-text-invert relative isolate overflow-hidden">
      {/* Atmosphere: gradient mesh + fine engineering grid (decorative). */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(60%_55%_at_18%_-5%,rgba(14,95,216,0.28),transparent_60%),radial-gradient(45%_40%_at_92%_8%,rgba(245,158,11,0.12),transparent_55%)]"
      />
      <GridMotif tone="dark" />

      <Container className="relative py-24 md:py-32 lg:py-40">
        <div className="max-w-3xl">
          <Eyebrow onDark className="hero-rise [animation-delay:0ms]">
            {hero.eyebrow}
          </Eyebrow>
          {/* No entrance animation on the LCP headline — it paints immediately. */}
          <h1 className="text-display mt-4 font-bold text-balance">{hero.title}</h1>
          <p className="text-lede hero-rise text-text-invert-soft mt-6 max-w-2xl [animation-delay:140ms]">
            {hero.subhead}
          </p>
          <div className="hero-rise mt-9 flex flex-col gap-3 [animation-delay:210ms] sm:flex-row">
            <Button asChild size="lg">
              <Link href={hero.primaryCta.href}>{hero.primaryCta.label}</Link>
            </Button>
            <Button asChild size="lg" variant="secondary" onDark>
              <Link href={hero.secondaryCta.href}>{hero.secondaryCta.label}</Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
