import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/layout/logo";
import { mainNav, primaryCta, sectors, services } from "@/lib/navigation";
import { site } from "@/lib/site";

interface FooterColumn {
  heading: string;
  links: { label: string; href: string }[];
}

const companyLinks = mainNav
  .filter((item) => item.href)
  .map((item) => ({ label: item.label, href: item.href as string }));

const columns: FooterColumn[] = [
  { heading: "Solutions", links: sectors.map((s) => ({ label: s.label, href: s.href })) },
  { heading: "Services", links: services.map((s) => ({ label: s.label, href: s.href })) },
  {
    heading: "Company",
    links: [...companyLinks, { label: "Contact", href: "/contact" }],
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink-950 text-text-invert">
      <Container className="py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Logo onDark />
            <p className="text-text-invert-soft mt-4 text-sm leading-relaxed">{site.description}</p>
            <p className="text-text-invert-soft mt-4 text-sm">
              Engineering for industry in {site.areaServed}, since {site.foundingYear}.
            </p>
          </div>

          {columns.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <h2 className="text-text-invert-soft font-mono text-xs font-medium tracking-[0.08em] uppercase">
                {col.heading}
              </h2>
              <ul className="mt-4 grid gap-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-text-invert-soft hover:text-text-invert focus-visible:outline-brand-300 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Contact block — honest pending states until confirmed via Hermes/MD. */}
        <div className="border-border-dark mt-14 flex flex-col gap-6 border-t pt-8 md:flex-row md:items-center md:justify-between">
          <div className="text-text-invert-soft text-sm">
            <span className="text-text-invert font-medium">Get in touch:</span>{" "}
            {site.contact.phone ? (
              <a href={`tel:${site.contact.phone}`} className="hover:text-text-invert">
                {site.contact.phone}
              </a>
            ) : (
              <Link
                href="/contact"
                className="hover:text-text-invert underline-offset-4 hover:underline"
              >
                Contact details are being finalised — send an enquiry
              </Link>
            )}
          </div>
          <Link
            href={primaryCta.href}
            className="text-brand-300 focus-visible:outline-brand-300 text-sm font-medium underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {primaryCta.label} →
          </Link>
        </div>

        <div className="text-text-invert-soft mt-8 flex flex-col gap-3 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.name}. All rights reserved.
          </p>
          <Link
            href="/privacy"
            className="hover:text-text-invert focus-visible:outline-brand-300 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Privacy Policy
          </Link>
        </div>
      </Container>
    </footer>
  );
}
