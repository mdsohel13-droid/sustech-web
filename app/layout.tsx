import type { Metadata } from "next";
import "@/styles/globals.css";
import { cabinet, jetbrains, switzer } from "./fonts";
import { site, siteUrl } from "@/lib/site";

// Beta safety: stay noindex until the production cutover flips SITE_INDEXABLE=true.
const indexable = process.env.SITE_INDEXABLE === "true";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Sustech Technology Ltd — Industrial EPC Engineering",
    template: "%s · Sustech Technology Ltd",
  },
  description: site.description,
  applicationName: site.name,
  robots: indexable ? undefined : { index: false, follow: false },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_US",
    url: siteUrl,
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${cabinet.variable} ${switzer.variable} ${jetbrains.variable}`}>
      <body>
        <a
          href="#main"
          className="focus:bg-ink-900 focus:text-text-invert sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:px-4 focus:py-2"
        >
          Skip to content
        </a>
        {children}
        {/* Keep scroll-reveal content visible when JavaScript is unavailable. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1 !important;transform:none !important;}`}</style>
        </noscript>
      </body>
    </html>
  );
}
