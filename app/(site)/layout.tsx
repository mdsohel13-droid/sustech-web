import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "@/styles/globals.css";
import { cabinet, jetbrains, switzer } from "@/app/fonts";
import { AdaptivePillNav } from "@/components/layout/adaptive-pill-nav";
import { DockNav } from "@/components/layout/dock-nav";
import { EngagementWidgets } from "@/components/layout/engagement-widgets";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { TabBarNav } from "@/components/layout/tab-bar-nav";
import { JsonLd } from "@/components/seo/json-ld";
import { RevealFallback } from "@/components/ui/reveal-fallback";
import { buildFooterColumns, buildHeaderNav } from "@/lib/nav";
import { getNavigation, getSiteSettings } from "@/lib/payload";
import { serverUrl, siteJsonLd } from "@/lib/seo";

/**
 * Root layout for the public site.
 *
 * This is a *root* layout — it owns <html> and <body>. The Payload admin lives
 * in the sibling `(payload)` route group, which ships its OWN root layout
 * (<html>/<body>). The two groups are independent roots, so there is no shared
 * `app/layout.tsx` — having one would nest a second <html>/<body> inside the
 * admin document and break hydration.
 */
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Brand True Blue chrome colour for Android Chrome / iOS Safari PWA mode.
  themeColor: "#0073CF",
};

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const [nav, settings] = await Promise.all([getNavigation(), getSiteSettings()]);
  const { items, cta } = buildHeaderNav(nav);
  const columns = buildFooterColumns(nav);

  // CMS-switchable visual theme: "classic" (default) or "pro" (glass + gradients).
  // Applied as data-design on <html>; the pro layer in styles/theme-pro.css is a
  // pure-CSS overlay (no JS), so content stays SSR-visible and crawlable either way.
  const design = settings.designVersion === "pro" ? "pro" : "classic";

  return (
    // Font CSS variables applied on <html> so they cascade to all site content.
    <html
      lang="en"
      data-design={design}
      className={`${cabinet.variable} ${switzer.variable} ${jetbrains.variable}`}
    >
      <body>
        <a
          href="#main"
          className="focus:bg-ink-900 focus:text-text-invert sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:px-4 focus:py-2"
        >
          Skip to content
        </a>
        {/* Organization JSON-LD emitted once here; individual pages add page-type schemas */}
        <JsonLd data={siteJsonLd(settings)} />
        {settings.navStyle === "pill" ? (
          <AdaptivePillNav items={items} cta={cta} logo={settings.logo} />
        ) : settings.navStyle === "tabs" ? (
          <TabBarNav items={items} cta={cta} logo={settings.logo} />
        ) : settings.navStyle === "dock" ? (
          <DockNav items={items} cta={cta} logo={settings.logo} />
        ) : (
          <Header items={items} cta={cta} logo={settings.logo} />
        )}
        <main id="main">{children}</main>
        {/* CMS-driven WhatsApp + chatbot widgets (enabled/configured in Settings) */}
        <EngagementWidgets />
        <Footer columns={columns} settings={settings} />
        <RevealFallback />
        <noscript>
          <style>{`[data-reveal]{opacity:1 !important;transform:none !important;}`}</style>
        </noscript>
      </body>
    </html>
  );
}
