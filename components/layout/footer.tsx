import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { Container } from "@/components/ui/container";
import type { FooterColumn } from "@/lib/nav";
import type { SiteSetting } from "@/payload-types";

interface FooterProps {
  columns: FooterColumn[];
  settings: SiteSetting;
}

export function Footer({ columns, settings }: FooterProps) {
  const year = new Date().getFullYear();
  const phone = settings.phones?.[0]?.number;

  return (
    <footer className="bg-ink-950 text-text-invert">
      <Container className="py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-sm">
            <Logo onDark />
            {settings.description && (
              <p className="text-text-invert-soft mt-4 text-sm leading-relaxed">
                {settings.description}
              </p>
            )}
            <p className="text-text-invert-soft mt-4 text-sm">
              Engineering for industry in {settings.areaServed ?? "Bangladesh"}, since{" "}
              {settings.foundingYear ?? 2017}.
            </p>
          </div>

          {columns.slice(0, 3).map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="text-text-invert-soft font-mono text-xs font-medium tracking-[0.08em] uppercase">
                {col.title}
              </h2>
              <ul className="mt-4 grid gap-2.5">
                {col.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      prefetch={false}
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

        <div className="border-border-dark mt-14 flex flex-col gap-6 border-t pt-8 md:flex-row md:items-center md:justify-between">
          <div className="text-text-invert-soft text-sm">
            <span className="text-text-invert font-medium">Get in touch:</span>{" "}
            {phone ? (
              <a href={`tel:${phone}`} className="hover:text-text-invert">
                {phone}
              </a>
            ) : settings.email ? (
              <a href={`mailto:${settings.email}`} className="hover:text-text-invert">
                {settings.email}
              </a>
            ) : (
              <Link
                href="/contact"
                prefetch={false}
                className="hover:text-text-invert underline-offset-4 hover:underline"
              >
                Contact details are being finalised — send an enquiry
              </Link>
            )}
          </div>
          <div className="flex gap-4">
            {(settings.social ?? []).map((s) => (
              <a
                key={s.url}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-invert-soft hover:text-text-invert text-sm"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>

        <div className="text-text-invert-soft mt-8 flex flex-col gap-3 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {settings.companyName}. All rights reserved.
          </p>
          <Link
            href="/privacy"
            prefetch={false}
            className="hover:text-text-invert focus-visible:outline-brand-300 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Privacy Policy
          </Link>
        </div>
      </Container>
    </footer>
  );
}
