import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { GridMotif } from "@/components/ui/grid-motif";
import { Section } from "@/components/ui/section";
import { getSiteSettings } from "@/lib/payload";
import { serverUrl } from "@/lib/seo";

export const revalidate = 3600;

const TITLE = "Privacy Policy";
const LEDE =
  "How Sustech Technology Ltd collects, uses, and protects the information you share with us — and the choices you have.";
const LAST_UPDATED = "26 June 2026";

export function generateMetadata(): Metadata {
  const noindex = process.env.SITE_INDEXABLE !== "true";
  return {
    title: { absolute: `${TITLE} · Sustech Technology Ltd` },
    description: LEDE,
    alternates: { canonical: "/privacy" },
    robots: noindex ? { index: false, follow: false } : undefined,
  };
}

export default async function PrivacyPage() {
  const settings = await getSiteSettings();
  const email = settings.emails?.[0]?.address ?? "info@sustechltd.com";
  const phone = settings.phones?.[0]?.number ?? "+880 1722-002125";
  const a = settings.address;
  const address = a
    ? [a.street, a.city, a.region, a.postalCode].filter(Boolean).join(", ")
    : "Chattogram, Bangladesh";

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: TITLE,
          description: LEDE,
          url: `${serverUrl}/privacy`,
          isPartOf: { "@type": "WebSite", url: serverUrl },
          dateModified: "2026-06-26",
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: serverUrl },
            { "@type": "ListItem", position: 2, name: TITLE, item: `${serverUrl}/privacy` },
          ],
        }}
      />

      <section className="bg-ink-900 text-text-invert relative isolate overflow-hidden">
        <GridMotif tone="dark" />
        <Container className="relative py-20 md:py-24">
          <Eyebrow onDark>Legal</Eyebrow>
          <h1 className="text-display mt-4 max-w-3xl font-bold text-balance">{TITLE}</h1>
          <p className="text-lede text-text-invert-soft mt-4 max-w-2xl">{LEDE}</p>
          <p className="text-text-invert-soft mt-3 font-mono text-xs tracking-[0.04em] uppercase">
            Last updated: {LAST_UPDATED}
          </p>
        </Container>
      </section>

      <Section containerSize="default">
        <div className="prose-policy mx-auto max-w-3xl space-y-8 text-[0.9375rem] leading-relaxed">
          <p className="text-text-soft">
            This policy explains what information Sustech Technology Ltd (&ldquo;Sustech&rdquo;,
            &ldquo;we&rdquo;, &ldquo;us&rdquo;) collects when you use{" "}
            <strong>{serverUrl.replace(/^https?:\/\//, "")}</strong>, why we collect it, and how we
            handle it. We collect only what we need to respond to engineering enquiries and improve
            the site.
          </p>

          <div>
            <h2 className="text-h3 text-ink-900 font-semibold">1. Information we collect</h2>
            <ul className="text-text-soft mt-3 list-disc space-y-2 pl-5">
              <li>
                <strong>Enquiry &amp; consultation details</strong> — when you submit the Request a
                Consultation / RFQ form or a calculator&rsquo;s &ldquo;email me this report&rdquo;
                gate, we receive the name, company, email, phone, service interest, and any message
                you provide.
              </li>
              <li>
                <strong>Calculator inputs</strong> — engineering calculators run entirely in your
                browser; their inputs are not sent to our servers unless you choose to email
                yourself a report.
              </li>
              <li>
                <strong>Privacy-friendly analytics</strong> — we measure aggregate, anonymised usage
                (pages viewed, broad device type){" "}
                <em>without advertising or cross-site tracking cookies</em> to understand what
                content is useful.
              </li>
              <li>
                <strong>Standard server logs</strong> — like any website, our servers record
                technical data such as IP address and browser type for security and reliability.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-h3 text-ink-900 font-semibold">2. How we use it</h2>
            <p className="text-text-soft mt-3">
              We use your information to respond to your enquiry, scope and prepare quotations or
              BOQs, follow up on a project, and improve our website and services. We rely on your
              consent and our legitimate interest in serving prospective and existing clients.
            </p>
          </div>

          <div>
            <h2 className="text-h3 text-ink-900 font-semibold">3. Sharing &amp; disclosure</h2>
            <p className="text-text-soft mt-3">
              We <strong>never sell or rent</strong> your information. We share it only with our
              internal sales/CRM systems to follow up with you, and with trusted service providers
              that operate our site and email delivery on our behalf under confidentiality. We may
              disclose information where required by law or to protect our rights.
            </p>
          </div>

          <div>
            <h2 className="text-h3 text-ink-900 font-semibold">4. Cookies &amp; tracking</h2>
            <p className="text-text-soft mt-3">
              Our analytics are cookieless and do not track you across other websites. We do not use
              advertising cookies. Essential cookies may be used only where needed for core site
              security and functionality.
            </p>
          </div>

          <div>
            <h2 className="text-h3 text-ink-900 font-semibold">5. Data retention</h2>
            <p className="text-text-soft mt-3">
              We keep enquiry information only as long as needed to handle your request and for
              reasonable follow-up, plus any period required by law, after which it is deleted or
              anonymised.
            </p>
          </div>

          <div>
            <h2 className="text-h3 text-ink-900 font-semibold">6. Security</h2>
            <p className="text-text-soft mt-3">
              The site is served over HTTPS and access to enquiry data is restricted to authorised
              staff. No method of transmission is perfectly secure, but we take reasonable technical
              and organisational measures to protect your information.
            </p>
          </div>

          <div>
            <h2 className="text-h3 text-ink-900 font-semibold">7. Your rights</h2>
            <p className="text-text-soft mt-3">
              You may ask us to access, correct, or delete the personal information you have given
              us, or to stop contacting you. Email{" "}
              <a href={`mailto:${email}`} className="text-brand font-medium hover:underline">
                {email}
              </a>{" "}
              and we will action your request.
            </p>
          </div>

          <div>
            <h2 className="text-h3 text-ink-900 font-semibold">8. Children</h2>
            <p className="text-text-soft mt-3">
              This site is intended for businesses and professionals and is not directed at
              children.
            </p>
          </div>

          <div>
            <h2 className="text-h3 text-ink-900 font-semibold">9. Changes to this policy</h2>
            <p className="text-text-soft mt-3">
              We may update this policy from time to time. The &ldquo;Last updated&rdquo; date above
              reflects the latest revision.
            </p>
          </div>

          <div>
            <h2 className="text-h3 text-ink-900 font-semibold">10. Contact us</h2>
            <p className="text-text-soft mt-3">
              Sustech Technology Ltd
              <br />
              {address}
              <br />
              Email:{" "}
              <a href={`mailto:${email}`} className="text-brand font-medium hover:underline">
                {email}
              </a>
              <br />
              Phone:{" "}
              <a
                href={`tel:${phone.replace(/\s+/g, "")}`}
                className="text-brand font-medium hover:underline"
              >
                {phone}
              </a>
            </p>
          </div>

          <p className="text-text-soft border-border border-t pt-6 text-xs italic">
            This policy is provided for transparency and should be reviewed by your legal adviser
            before being relied upon for regulatory compliance.
          </p>
        </div>
      </Section>
    </>
  );
}
