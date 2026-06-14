/**
 * Site 404 — rendered when a Server Component in the (site) group calls
 * notFound() (e.g. a missing project/article slug) or a path doesn't match.
 * It renders inside the (site) root layout, so it gets the full header/footer
 * chrome and a valid <html>/<body>. (The root app/not-found.tsx is a minimal
 * self-contained fallback for the rare unmatched-global case.)
 */
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export const metadata = {
  title: "Page Not Found · Sustech Technology Ltd",
  description: "The page you were looking for doesn't exist or has been moved.",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="bg-surface flex min-h-[70vh] flex-col items-center justify-center">
      <Container className="py-24 text-center">
        <p
          className="text-brand/10 font-bold select-none"
          style={{ fontSize: "clamp(6rem, 20vw, 14rem)", lineHeight: 1 }}
          aria-hidden
        >
          404
        </p>
        <h1 className="text-h1 -mt-4 font-bold">Page not found</h1>
        <p className="text-text-soft mx-auto mt-4 max-w-md text-lg">
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you
          back on track.
        </p>
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button asChild variant="primary" size="lg">
            <Link href="/">Return to homepage</Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link href="/contact">Contact us</Link>
          </Button>
        </div>

        <nav aria-label="Key pages" className="mt-12">
          <p className="text-text-soft mb-4 text-sm font-medium tracking-wider uppercase">
            Explore
          </p>
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {[
              { href: "/services", label: "Services" },
              { href: "/projects", label: "Projects" },
              { href: "/about", label: "About" },
              { href: "/knowledge", label: "Knowledge" },
            ].map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="text-brand hover:text-brand-600 text-sm font-medium">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </div>
  );
}
