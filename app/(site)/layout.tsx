import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/styles/globals.css";
import { cabinet, jetbrains, switzer } from "@/app/fonts";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { WhatsAppFab } from "@/components/layout/whatsapp-fab";
import { JsonLd } from "@/components/seo/json-ld";
import { buildFooterColumns, buildHeaderNav } from "@/lib/nav";
import { getNavigation, getSiteSettings } from "@/lib/payload";
import { serverUrl, siteJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(serverUrl),
  title: { default: "Sustech Technology Ltd", template: "%s · Sustech Technology Ltd" },
  openGraph: {
    type: "website",
    siteName: "Sustech Technology Ltd",
    images: [{ url: "/og-default.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og-default.jpg"] },
};

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const [nav, settings] = await Promise.all([getNavigation(), getSiteSettings()]);
  const { items, cta } = buildHeaderNav(nav);
  const columns = buildFooterColumns(nav);

  return (
    <html lang="en" className={`${cabinet.variable} ${switzer.variable} ${jetbrains.variable}`}>
      <body>
        <a
          href="#main"
          className="focus:bg-ink-900 focus:text-text-invert sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:px-4 focus:py-2"
        >
          Skip to content
        </a>
        <JsonLd data={siteJsonLd(settings)} />
        <Header items={items} cta={cta} />
        <main id="main">{children}</main>
        <WhatsAppFab phone={settings.phones?.[0]?.number} />
        <Footer columns={columns} settings={settings} />
        <noscript>
          <style>{`[data-reveal]{opacity:1 !important;transform:none !important;}`}</style>
        </noscript>
      </body>
    </html>
  );
}
