/**
 * Global root 404 — the fallback for routes that fall outside every route
 * group's root layout. Because there is no shared `app/layout.tsx` (the (site)
 * and (payload) groups are independent roots), this file must render its OWN
 * <html>/<body> to be a valid document.
 *
 * The richer, chrome-wrapped 404 lives at app/(site)/not-found.tsx and handles
 * the common case (a missing slug inside the public site).
 */
import Link from "next/link";
import "@/styles/globals.css";
import { cabinet, jetbrains, switzer } from "@/app/fonts";

export const metadata = {
  title: "Page Not Found · Sustech Technology Ltd",
  robots: { index: false },
};

export default function GlobalNotFound() {
  return (
    <html lang="en" className={`${cabinet.variable} ${switzer.variable} ${jetbrains.variable}`}>
      <body>
        <main className="bg-surface flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <p
            className="text-brand/10 font-bold select-none"
            style={{ fontSize: "clamp(6rem, 20vw, 14rem)", lineHeight: 1 }}
            aria-hidden
          >
            404
          </p>
          <h1 className="text-h1 -mt-4 font-bold">Page not found</h1>
          <p className="text-text-soft mx-auto mt-4 max-w-md text-lg">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <Link
            href="/"
            className="bg-solar text-solar-text hover:bg-solar-600 mt-10 inline-flex rounded-lg px-5 py-2.5 font-semibold transition-colors"
          >
            Return to homepage
          </Link>
        </main>
      </body>
    </html>
  );
}
