import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/seo/json-ld";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { GridMotif } from "@/components/ui/grid-motif";
import { Section } from "@/components/ui/section";
import { getSiteSettings } from "@/lib/payload";
import { pageIntro } from "@/lib/page-intro";
import { serverUrl } from "@/lib/seo";

export const revalidate = 3600;

const TITLE = "Contact us";
const LEDE =
  "Reach the Sustech team. For a new project, the fastest route is the consultation form — an engineer will scope it with you.";

export function generateMetadata(): Metadata {
  const noindex = process.env.SITE_INDEXABLE !== "true";
  return {
    title: { absolute: `${TITLE} · Sustech Technology Ltd` },
    description: LEDE,
    alternates: { canonical: "/contact" },
    robots: noindex ? { index: false, follow: false } : undefined,
  };
}

function formatAddress(
  a: NonNullable<Awaited<ReturnType<typeof getSiteSettings>>>["address"],
): string {
  if (!a) return "";
  return [a.street, a.city, a.region, a.postalCode, a.country].filter(Boolean).join(", ");
}

/** Small decorative 3D icon (static, MIT-licensed Fluent set in /public/icons-3d). */
function Icon3d({ src }: { src: string }) {
  return <Image src={src} alt="" width={40} height={40} className="h-5 w-5 object-contain" />;
}

function Detail({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="bg-brand/10 text-brand mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md">
        {icon}
      </span>
      <div>
        <p className="text-ink-900 text-sm font-semibold">{label}</p>
        <div className="text-text-soft mt-0.5 text-[0.9375rem]">{children}</div>
      </div>
    </div>
  );
}

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const intro = pageIntro(settings, "contact");
  const phones = (settings.phones ?? []).map((p) => p.number).filter(Boolean);
  const emails = (settings.emails ?? [])
    .map((e) => ({ address: e?.address?.trim() ?? "", label: e?.label?.trim() ?? "" }))
    .filter((e) => e.address);
  const primaryEmail = emails[0]?.address ?? null;
  const address = formatAddress(settings.address);
  const hours = settings.hours ?? null;
  const social = (settings.social ?? []).filter((s) => s.label && s.url);
  const hasDetails = phones.length > 0 || emails.length > 0 || address || hours;

  const contactPoint: Record<string, unknown> = { "@type": "ContactPoint", contactType: "sales" };
  if (phones[0]) contactPoint.telephone = phones[0];
  if (primaryEmail) contactPoint.email = primaryEmail;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: TITLE,
          url: `${serverUrl}/contact`,
          ...((phones[0] || primaryEmail) && {
            mainEntity: {
              "@type": "Organization",
              name: settings.companyName ?? "Sustech Technology Ltd",
              url: serverUrl,
              contactPoint: [contactPoint],
            },
          }),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: serverUrl },
            { "@type": "ListItem", position: 2, name: TITLE, item: `${serverUrl}/contact` },
          ],
        }}
      />

      <section className="bg-ink-900 text-text-invert relative isolate overflow-hidden">
        <GridMotif tone="dark" />
        <Container className="relative py-20 md:py-28">
          <Eyebrow onDark>{intro.eyebrow ?? "Contact"}</Eyebrow>
          <h1 className="text-display mt-4 max-w-3xl font-bold text-balance">
            {intro.heading ?? TITLE}
          </h1>
          <p className="text-lede text-text-invert-soft mt-4 max-w-2xl">{intro.lede ?? LEDE}</p>
        </Container>
      </section>

      <Section srTitle="Contact details">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="text-h3 text-ink-900 font-semibold">Ways to reach us</h2>
            {hasDetails ? (
              <div className="mt-6 space-y-5">
                {phones.length > 0 && (
                  <Detail icon={<Icon3d src="/icons-3d/telephone_receiver.webp" />} label="Phone">
                    {phones.map((p) => (
                      <a
                        key={p}
                        href={`tel:${p.replace(/\s+/g, "")}`}
                        className="hover:text-brand block"
                      >
                        {p}
                      </a>
                    ))}
                  </Detail>
                )}
                {emails.length > 0 && (
                  <Detail icon={<Icon3d src="/icons-3d/envelope.webp" />} label="Email">
                    <span className="flex flex-col gap-1">
                      {emails.map((e) => (
                        <a
                          key={e.address}
                          href={`mailto:${e.address}`}
                          className="hover:text-brand"
                        >
                          {e.address}
                          {e.label && <span className="text-text-soft"> · {e.label}</span>}
                        </a>
                      ))}
                    </span>
                  </Detail>
                )}
                {address && (
                  <Detail icon={<Icon3d src="/icons-3d/round_pushpin.webp" />} label="Office">
                    {address}
                  </Detail>
                )}
                {hours && (
                  <Detail icon={<Icon3d src="/icons-3d/alarm_clock.webp" />} label="Hours">
                    {hours}
                  </Detail>
                )}
              </div>
            ) : (
              <p className="text-text-soft mt-4">
                Our phone, email and office details will be published here shortly. In the meantime,
                the consultation form is the fastest way to reach an engineer.
              </p>
            )}
            {social.length > 0 && (
              <ul className="mt-8 flex flex-wrap gap-4">
                {social.map((s) => (
                  <li key={s.url}>
                    <a
                      href={s.url}
                      className="text-brand text-sm font-medium underline-offset-4 hover:underline"
                      rel="noopener noreferrer"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Card className="bg-surface-2 flex flex-col justify-center p-8">
            <h2 className="text-h3 text-ink-900 font-semibold">Starting a project?</h2>
            <p className="text-text-soft mt-2">
              Tell us about your industrial power, solar or safety project and an engineer will
              scope it with you — no obligation.
            </p>
            <div className="mt-6">
              <Button asChild size="lg">
                <Link href="/request-quote">Request a Consultation</Link>
              </Button>
            </div>
          </Card>
        </div>
      </Section>
    </>
  );
}
