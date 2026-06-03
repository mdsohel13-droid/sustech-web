import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { GridMotif } from "@/components/ui/grid-motif";
import { ctaBand } from "@/lib/home-content";
import { site } from "@/lib/site";

export function CtaBand() {
  const phone = site.contact.phone;
  return (
    <section className="bg-ink-900 text-text-invert relative isolate overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(50%_60%_at_80%_110%,rgba(245,158,11,0.14),transparent_60%),radial-gradient(50%_60%_at_10%_-10%,rgba(14,95,216,0.22),transparent_60%)]"
      />
      <GridMotif tone="dark" />
      <Container className="relative py-20 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-h1 font-bold text-balance">{ctaBand.heading}</h2>
          <p className="text-lede text-text-invert-soft mt-4">{ctaBand.subhead}</p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href={ctaBand.primaryCta.href}>{ctaBand.primaryCta.label}</Link>
            </Button>
            {phone ? (
              <Button asChild size="lg" variant="ghost" onDark>
                <a href={`tel:${phone}`}>Or call {phone}</a>
              </Button>
            ) : (
              <Button asChild size="lg" variant="ghost" onDark>
                <Link href={ctaBand.contactFallback.href}>{ctaBand.contactFallback.label}</Link>
              </Button>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
