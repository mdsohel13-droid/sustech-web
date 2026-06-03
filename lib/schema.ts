/**
 * Schema.org JSON-LD builders for the home route — Organization + LocalBusiness + WebSite.
 * Mirrors visible content only; nullable contact fields are omitted (never invented) until
 * confirmed via Hermes/MD (CLAUDE.md §5, §6).
 */

import { site, siteUrl } from "@/lib/site";

type JsonLdNode = Record<string, unknown>;

const ORG_ID = `${siteUrl}/#organization`;

export function organizationSchema(): JsonLdNode {
  const node: JsonLdNode = {
    "@type": "Organization",
    "@id": ORG_ID,
    name: site.name,
    url: siteUrl,
    description: site.description,
    foundingDate: String(site.foundingYear),
    areaServed: site.areaServed,
  };
  if (site.social.length > 0) {
    node.sameAs = site.social.map((s) => s.href);
  }
  return node;
}

export function localBusinessSchema(): JsonLdNode {
  const node: JsonLdNode = {
    "@type": "LocalBusiness",
    "@id": `${siteUrl}/#localbusiness`,
    name: site.name,
    url: siteUrl,
    description: site.description,
    areaServed: site.areaServed,
    parentOrganization: { "@id": ORG_ID },
  };
  const { phone, email, address, hours } = site.contact;
  if (phone) node.telephone = phone;
  if (email) node.email = email;
  if (hours) node.openingHours = hours;
  if (address) {
    node.address = { "@type": "PostalAddress", ...address };
  }
  return node;
}

export function webSiteSchema(): JsonLdNode {
  return {
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: siteUrl,
    name: site.name,
    description: site.description,
    inLanguage: "en",
    publisher: { "@id": ORG_ID },
  };
}

export function homeJsonLd(): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@graph": [organizationSchema(), localBusinessSchema(), webSiteSchema()],
  };
}
