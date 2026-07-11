import type { Metadata } from "next";
import type { Article, Media, NewsItem, Page, SiteSetting, Source } from "@/payload-types";

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
  // Prefer an explicit image; otherwise generate a titled, on-brand card per page
  // (plan 3·4) rather than falling back to one static jpg for every page.
  const ogTitle =
    page?.title && page.slug !== "home"
      ? page.title
      : settings.defaultTitle || settings.companyName;
  const og =
    mediaUrl(seo?.image) ||
    mediaUrl(settings.ogImage) ||
    `/api/og?title=${encodeURIComponent(ogTitle)}`;
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

// ── Structured data helpers ──────────────────────────────────────────────────

/**
 * BreadcrumbList JSON-LD helper.
 * Pass an ordered array of { name, url? } items — the last item typically
 * has no `url` (it's the current page). Returns a ready-to-embed schema object.
 */
export function breadcrumbJsonLd(
  crumbs: { name: string; url?: string }[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      ...(c.url ? { item: c.url } : {}),
    })),
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
  const logo = mediaUrl(settings.logo);
  if (logo) org.logo = logo.startsWith("http") ? logo : `${serverUrl}${logo}`;
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
  const primaryEmail = settings.emails?.[0]?.address;
  if (primaryEmail) lb.email = primaryEmail;
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

/**
 * Article JSON-LD with Schema.org `citation` markup (master plan §3.1c) — so
 * AI engines and search see exactly which authoritative sources back the page.
 * `citation` lists every reference; `isBasedOn` highlights tier-1 sources.
 * `dateModified` reflects the last review (drives freshness signals).
 */
export function articleJsonLd(
  article: Pick<
    Article | NewsItem,
    "title" | "slug" | "publishedDate" | "updatedAt" | "citations"
  > & { excerpt?: string | null; summary?: string | null; author?: string | null },
  basePath: "/knowledge" | "/news",
): Record<string, unknown> {
  const citations = (article.citations ?? []) as NonNullable<Article["citations"]>;
  const citationNodes = citations.map((c) => {
    const source = (typeof c.source === "object" ? c.source : null) as Source | null;
    return {
      "@type": "CreativeWork",
      name: c.title || c.quotedClaim || source?.name || "Source",
      url: c.url,
      ...(c.sourcePublishedDate ? { datePublished: c.sourcePublishedDate } : {}),
      ...(source ? { publisher: { "@type": "Organization", name: source.name } } : {}),
    };
  });
  const tier1Urls = citations
    .filter((c) => {
      const t = (typeof c.source === "object" ? c.source : null) as Source | null;
      return t?.tier === "tier1-gov" || t?.tier === "tier1-multilateral";
    })
    .map((c) => c.url);

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt ?? article.summary ?? undefined,
    author: article.author ? { "@type": "Person", name: article.author } : undefined,
    datePublished: article.publishedDate ?? undefined,
    dateModified: article.updatedAt ?? article.publishedDate ?? undefined,
    url: `${serverUrl}${basePath}/${article.slug}`,
    ...(citationNodes.length ? { citation: citationNodes } : {}),
    ...(tier1Urls.length ? { isBasedOn: tier1Urls } : {}),
    publisher: { "@type": "Organization", name: settingsName() },
  };
}

// The org name is stable; avoid threading settings through every call site.
function settingsName(): string {
  return "Sustech Technology Ltd";
}
