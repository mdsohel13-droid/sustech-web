import config from "@payload-config";
import { getPayload, type Payload } from "payload";
import { cache } from "react";
import type {
  Article,
  Client,
  Navigation,
  Page,
  Project,
  Sector,
  Service,
  SiteSetting,
  Testimonial,
} from "@/payload-types";

let client: Promise<Payload> | null = null;

/** Memoised Payload local-API client (same process as the CMS; no network hop). */
export function getPayloadClient(): Promise<Payload> {
  if (!client) client = getPayload({ config });
  return client;
}

// Pages ----------------------------------------------------------------------

export const getPageBySlug = cache(async (slug: string, draft = false): Promise<Page | null> => {
  const payload = await getPayloadClient();
  const res = await payload.find({
    collection: "pages",
    draft,
    depth: 2,
    limit: 1,
    overrideAccess: true,
    where: draft
      ? { slug: { equals: slug } }
      : { and: [{ slug: { equals: slug } }, { _status: { equals: "published" } }] },
  });
  return res.docs[0] ?? null;
});

export const getPublishedPageSlugs = cache(async (): Promise<string[]> => {
  try {
    const payload = await getPayloadClient();
    const res = await payload.find({
      collection: "pages",
      depth: 0,
      limit: 500,
      where: { _status: { equals: "published" } },
      select: { slug: true },
    });
    return res.docs.map((d) => d.slug).filter(Boolean);
  } catch {
    return []; // DB unavailable at build → render on demand
  }
});

// Collection documents -------------------------------------------------------

export const getProjectBySlug = cache(
  async (slug: string, draft = false): Promise<Project | null> => {
    const payload = await getPayloadClient();
    const res = await payload.find({
      collection: "projects",
      draft,
      depth: 2,
      limit: 1,
      overrideAccess: true,
      where: draft
        ? { slug: { equals: slug } }
        : { and: [{ slug: { equals: slug } }, { _status: { equals: "published" } }] },
    });
    return res.docs[0] ?? null;
  },
);

export const getArticleBySlug = cache(
  async (slug: string, draft = false): Promise<Article | null> => {
    const payload = await getPayloadClient();
    const res = await payload.find({
      collection: "articles",
      draft,
      depth: 2,
      limit: 1,
      overrideAccess: true,
      where: draft
        ? { slug: { equals: slug } }
        : { and: [{ slug: { equals: slug } }, { _status: { equals: "published" } }] },
    });
    return res.docs[0] ?? null;
  },
);

// Lists ----------------------------------------------------------------------

export const getServices = cache(async (): Promise<Service[]> => {
  const payload = await getPayloadClient();
  const res = await payload.find({ collection: "services", depth: 1, limit: 50, sort: "order" });
  return res.docs;
});

export const getSectors = cache(async (): Promise<Sector[]> => {
  const payload = await getPayloadClient();
  const res = await payload.find({ collection: "sectors", depth: 1, limit: 50, sort: "order" });
  return res.docs;
});

export const getClients = cache(async (): Promise<Client[]> => {
  const payload = await getPayloadClient();
  const res = await payload.find({ collection: "clients", depth: 1, limit: 100, sort: "order" });
  return res.docs;
});

export const getTestimonials = cache(async (): Promise<Testimonial[]> => {
  const payload = await getPayloadClient();
  const res = await payload.find({ collection: "testimonials", depth: 1, limit: 50 });
  return res.docs;
});

export const getFeaturedProjects = cache(async (limit = 3): Promise<Project[]> => {
  const payload = await getPayloadClient();
  const res = await payload.find({
    collection: "projects",
    depth: 2,
    limit,
    where: { and: [{ _status: { equals: "published" } }, { featured: { equals: true } }] },
    sort: "-year",
  });
  return res.docs;
});

// Globals --------------------------------------------------------------------

export const getSiteSettings = cache(async (): Promise<SiteSetting> => {
  const payload = await getPayloadClient();
  return payload.findGlobal({ slug: "site-settings", depth: 1 });
});

export const getNavigation = cache(async (): Promise<Navigation> => {
  const payload = await getPayloadClient();
  return payload.findGlobal({ slug: "navigation", depth: 1 });
});
