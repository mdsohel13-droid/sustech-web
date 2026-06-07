import config from "@payload-config";
import { unstable_cache } from "next/cache";
import { getPayload } from "payload";
import type { Where } from "payload";
import { cache } from "react";
import type {
  Article,
  Client,
  Navigation,
  NewsItem,
  Page,
  Product,
  Project,
  Sector,
  Service,
  SiteSetting,
  Team,
  Testimonial,
} from "@/payload-types";

/**
 * Returns a memoised Payload local-API client.
 *
 * Uses React cache() for request-level deduplication. Resets the reference on
 * rejection so the next call retries instead of serving a stale rejection.
 */
export const getPayloadClient = cache(async () => {
  return getPayload({ config });
});

// Pages ----------------------------------------------------------------------

export const getPageBySlug = cache(async (slug: string, draft = false): Promise<Page | null> => {
  try {
    const payload = await getPayloadClient();
    const res = await payload.find({
      collection: "pages",
      draft,
      depth: 2,
      limit: 1,
      // Only override access when previewing a draft (editor session required)
      ...(draft ? { overrideAccess: true } : {}),
      where: draft
        ? { slug: { equals: slug } }
        : { and: [{ slug: { equals: slug } }, { _status: { equals: "published" } }] },
    });
    return res.docs[0] ?? null;
  } catch {
    return null;
  }
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
    try {
      const payload = await getPayloadClient();
      const res = await payload.find({
        collection: "projects",
        draft,
        depth: 2,
        limit: 1,
        ...(draft ? { overrideAccess: true } : {}),
        where: draft
          ? { slug: { equals: slug } }
          : { and: [{ slug: { equals: slug } }, { _status: { equals: "published" } }] },
      });
      return res.docs[0] ?? null;
    } catch {
      return null;
    }
  },
);

export const getArticleBySlug = cache(
  async (slug: string, draft = false): Promise<Article | null> => {
    try {
      const payload = await getPayloadClient();
      const res = await payload.find({
        collection: "articles",
        draft,
        depth: 2,
        limit: 1,
        ...(draft ? { overrideAccess: true } : {}),
        where: draft
          ? { slug: { equals: slug } }
          : { and: [{ slug: { equals: slug } }, { _status: { equals: "published" } }] },
      });
      return res.docs[0] ?? null;
    } catch {
      return null;
    }
  },
);

export const getArticles = cache(async (): Promise<Article[]> => {
  try {
    const payload = await getPayloadClient();
    const res = await payload.find({
      collection: "articles",
      depth: 1,
      limit: 100,
      where: { _status: { equals: "published" } },
      sort: "-publishedDate",
    });
    return res.docs;
  } catch {
    return []; // DB unavailable at build → render the empty state
  }
});

export const getServiceBySlug = cache(async (slug: string): Promise<Service | null> => {
  try {
    const payload = await getPayloadClient();
    const res = await payload.find({
      collection: "services",
      depth: 1,
      limit: 1,
      where: { slug: { equals: slug } },
    });
    return res.docs[0] ?? null;
  } catch {
    return null;
  }
});

export const getProjectsByService = cache(async (serviceId: number): Promise<Project[]> => {
  try {
    const payload = await getPayloadClient();
    const res = await payload.find({
      collection: "projects",
      depth: 1,
      limit: 6,
      where: { and: [{ _status: { equals: "published" } }, { services: { in: [serviceId] } }] },
      sort: "-year",
    });
    return res.docs;
  } catch {
    return [];
  }
});

// Lists ----------------------------------------------------------------------

export const getServices = cache(async (): Promise<Service[]> => {
  try {
    const payload = await getPayloadClient();
    const res = await payload.find({ collection: "services", depth: 1, limit: 50, sort: "order" });
    return res.docs;
  } catch {
    return [];
  }
});

export const getSectors = cache(async (): Promise<Sector[]> => {
  try {
    const payload = await getPayloadClient();
    const res = await payload.find({ collection: "sectors", depth: 1, limit: 50, sort: "order" });
    return res.docs;
  } catch {
    return [];
  }
});

export const getSectorBySlug = cache(async (slug: string): Promise<Sector | null> => {
  try {
    const payload = await getPayloadClient();
    const res = await payload.find({
      collection: "sectors",
      depth: 2,
      limit: 1,
      where: { slug: { equals: slug } },
    });
    return res.docs[0] ?? null;
  } catch {
    return null;
  }
});

export const getProjectsBySector = cache(async (sectorId: number): Promise<Project[]> => {
  try {
    const payload = await getPayloadClient();
    const res = await payload.find({
      collection: "projects",
      depth: 1,
      limit: 6,
      where: { and: [{ _status: { equals: "published" } }, { sector: { equals: sectorId } }] },
      sort: "-year",
    });
    return res.docs;
  } catch {
    return [];
  }
});

export const getClients = cache(async (): Promise<Client[]> => {
  try {
    const payload = await getPayloadClient();
    const res = await payload.find({
      collection: "clients",
      depth: 1,
      limit: 100,
      sort: "order",
    });
    return res.docs;
  } catch {
    return [];
  }
});

export const getTestimonials = cache(async (): Promise<Testimonial[]> => {
  try {
    const payload = await getPayloadClient();
    const res = await payload.find({ collection: "testimonials", depth: 1, limit: 50 });
    return res.docs;
  } catch {
    return [];
  }
});

export const getTeam = cache(async (): Promise<Team[]> => {
  try {
    const payload = await getPayloadClient();
    const res = await payload.find({ collection: "team", depth: 1, limit: 100, sort: "order" });
    return res.docs;
  } catch {
    return [];
  }
});

export const getProjects = cache(async (): Promise<Project[]> => {
  try {
    const payload = await getPayloadClient();
    const res = await payload.find({
      collection: "projects",
      depth: 2,
      limit: 200,
      where: { _status: { equals: "published" } },
      sort: "-year",
    });
    return res.docs;
  } catch {
    return []; // DB unavailable at build → render the empty state
  }
});

export const getProducts = cache(async (): Promise<Product[]> => {
  try {
    const payload = await getPayloadClient();
    const res = await payload.find({
      collection: "products",
      depth: 1,
      limit: 50,
      sort: "order",
    });
    return res.docs;
  } catch {
    return [];
  }
});

export const getFeaturedProducts = cache(async (limit = 6): Promise<Product[]> => {
  try {
    const payload = await getPayloadClient();
    const res = await payload.find({
      collection: "products",
      depth: 1,
      limit,
      where: { featured: { equals: true } },
      sort: "order",
    });
    return res.docs;
  } catch {
    return [];
  }
});

export const getFeaturedProjects = cache(async (limit = 3): Promise<Project[]> => {
  try {
    const payload = await getPayloadClient();
    const res = await payload.find({
      collection: "projects",
      depth: 2,
      limit,
      where: { and: [{ _status: { equals: "published" } }, { featured: { equals: true } }] },
      sort: "-year",
    });
    return res.docs;
  } catch {
    return [];
  }
});

// News items -----------------------------------------------------------------

export const getNewsItems = cache(
  async (opts?: { limit?: number; category?: string }): Promise<NewsItem[]> => {
    try {
      const payload = await getPayloadClient();
      const where: Where =
        opts?.category && opts.category !== "all"
          ? {
              and: [{ _status: { equals: "published" } }, { category: { equals: opts.category } }],
            }
          : { _status: { equals: "published" } };
      const res = await payload.find({
        collection: "news-items",
        depth: 1,
        limit: opts?.limit ?? 50,
        sort: "-publishedDate",
        where,
      });
      return res.docs;
    } catch {
      return [];
    }
  },
);

export const getNewsItemBySlug = cache(
  async (slug: string, draft = false): Promise<NewsItem | null> => {
    try {
      const payload = await getPayloadClient();
      const res = await payload.find({
        collection: "news-items",
        depth: 1,
        limit: 1,
        ...(draft ? { overrideAccess: true } : {}),
        where: draft
          ? { slug: { equals: slug } }
          : { and: [{ slug: { equals: slug } }, { _status: { equals: "published" } }] },
      });
      return res.docs[0] ?? null;
    } catch {
      return null;
    }
  },
);

// Globals --------------------------------------------------------------------

/**
 * Site settings — cached across ISR revalidation cycles via Next.js Data Cache.
 * Call `revalidateTag('site-settings')` in a Payload afterChange hook when the
 * global is updated to flush the cache on demand.
 */
export const getSiteSettings = unstable_cache(
  async (): Promise<SiteSetting> => {
    const payload = await getPayloadClient();
    return payload.findGlobal({ slug: "site-settings", depth: 1 });
  },
  ["site-settings"],
  { revalidate: 3600, tags: ["site-settings"] },
);

/**
 * Navigation — cached across ISR cycles; flush via revalidateTag('navigation').
 */
export const getNavigation = unstable_cache(
  async (): Promise<Navigation> => {
    const payload = await getPayloadClient();
    return payload.findGlobal({ slug: "navigation", depth: 1 });
  },
  ["navigation"],
  { revalidate: 3600, tags: ["navigation"] },
);
