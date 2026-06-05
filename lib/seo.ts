import type { Metadata } from "next";
import type { Media, Page, SiteSetting } from "@/payload-types";

export const serverUrl =
  process.env.NEXT_PUBLIC_SERVER_URL ?? process.env.SITE_URL ?? "http://localhost:4123";
const indexable = process.env.SITE_INDEXABLE === "true";

const mediaUrl = (m?: number | Media | null): string | undefined =>
  m && typeof m === "object" && m.url ? m.url : undefined;

export function pageMetadata(page: Page | null, settings: SiteSetting, path: string): Metadata {
  const seo = page?.seo;
  const fullTitle =
    seo?.title ||
    (page?.title && page.slug !== "home"
      ? `${page.title} · ${settings.companyName}`
      : settings.defaultTitle || settings.companyName);
  const description =
    seo?.description || settings.defaultDescription || settings.description || undefined;
  const og = mediaUrl(seo?.image) || mediaUrl(settings.ogImage);
  const noindex = !indexable || Boolean(seo?.noindex);

  return {
    title: { absolute: fullTitle },
    description,
    alternates: { canonical: seo?.canonical || path },
    robots: noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "website",
      siteName: settings.companyName,
      title: fullTitle,
      description,
      url: path,
      images: og ? [og] : undefined,
    },
    twitter: { card: "summary_large_image" },
  };
}

/** Organization + LocalBusiness + WebSite, from confirmed SiteSettings only. */
export function siteJsonLd(settings: SiteSetting): Record<string, unknown> {
  const orgId = `${serverUrl}/#organization`;
  const org: Record<string, unknown> = {
    "@type": "Organization",
    "@id": orgId,
    name: settings.companyName,
    url: serverUrl,
    description: settings.description || undefined,
    foundingDate: settings.foundingYear ? String(settings.foundingYear) : undefined,
    areaServed: settings.areaServed || undefined,
  };
  const social = (settings.social ?? []).map((s) => s.url).filter(Boolean);
  if (social.length) org.sameAs = social;

  const lb: Record<string, unknown> = {
    "@type": "LocalBusiness",
    "@id": `${serverUrl}/#localbusiness`,
    name: settings.companyName,
    url: serverUrl,
    description: settings.description || undefined,
    areaServed: settings.areaServed || undefined,
    parentOrganization: { "@id": orgId },
  };
  const phone = settings.phones?.[0]?.number;
  if (phone) lb.telephone = phone;
  if (settings.email) lb.email = settings.email;
  if (settings.hours) lb.openingHours = settings.hours;
  const a = settings.address;
  if (a && (a.street || a.city)) {
    lb.address = {
      "@type": "PostalAddress",
      streetAddress: a.street || undefined,
      addressLocality: a.city || undefined,
      addressRegion: a.region || undefined,
      postalCode: a.postalCode || undefined,
      addressCountry: a.country || undefined,
    };
  }
  const geo = settings.geo;
  if (geo && typeof geo.latitude === "number" && typeof geo.longitude === "number") {
    lb.geo = { "@type": "GeoCoordinates", latitude: geo.latitude, longitude: geo.longitude };
  }

  const web = {
    "@type": "WebSite",
    "@id": `${serverUrl}/#website`,
    url: serverUrl,
    name: settings.companyName,
    description: settings.description || undefined,
    inLanguage: "en",
    publisher: { "@id": orgId },
  };

  return { "@context": "https://schema.org", "@graph": [org, lb, web] };
}
