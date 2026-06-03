/**
 * Company / site configuration.
 *
 * Fields typed `string | null` are real-world data that MUST be confirmed by the MD
 * or sourced from the ERP via Hermes before launch. They render as honest "pending"
 * states while null — never as invented values (see CLAUDE.md §6).
 */

export interface PostalAddress {
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
  postalCode: string;
  addressCountry: string; // ISO 3166-1 alpha-2
}

export interface SiteContact {
  /** TODO: source from CMS/MD — e.g. "+880 …". */
  phone: string | null;
  /** TODO: source from CMS/MD. */
  email: string | null;
  /** TODO: source from CMS/MD. */
  address: PostalAddress | null;
  /** TODO: source from CMS/MD — e.g. "Sun–Thu, 9:00–18:00". */
  hours: string | null;
}

export interface SocialLink {
  label: string;
  href: string;
}

export const siteUrl = process.env.SITE_URL ?? "https://beta.sustechltd.com";

// Typed separately so the nullable TODO fields keep their `… | null` types
// (a blanket `as const` would narrow them to the literal `null`).
const contact: SiteContact = {
  phone: null,
  email: null,
  address: null,
  hours: null,
};

/** TODO: add real, owned profiles only. Empty until confirmed — never fabricate links. */
const social: SocialLink[] = [];

export const site = {
  name: "Sustech Technology Ltd",
  shortName: "Sustech",
  /** Stated publicly as "SINCE 2017" — confirmed, not invented. */
  foundingYear: 2017,
  tagline: "Single-point EPC for industrial power, solar and safety.",
  description:
    "Single-point EPC for commercial and industrial clients in Bangladesh: solar plants, " +
    "substations, lightning protection and smart electrical systems, engineered to IEC, " +
    "BNBC and NFPA standards.",
  areaServed: "Bangladesh",
  url: siteUrl,
  contact,
  social,
} as const;
