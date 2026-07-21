import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from "payload";
import { pagePath } from "../utils/preview";

type PathSpec = [path: string, type?: "page" | "layout"];

/**
 * GEO index routes that list the published URL set. Any content change that
 * adds/removes/renames a public page must refresh these too, or new URLs (e.g. a
 * newly-enabled calculator) won't appear until their own 1h ISR window elapses.
 */
const SEO_INDEX: PathSpec[] = [["/sitemap.xml"], ["/llms.txt"]];

/**
 * Lazy-load next/cache so the Payload config loads under the seed/CLI (no Next runtime).
 * Revalidation only matters at runtime inside the Next server.
 */
const revalidate = async (paths: PathSpec[]): Promise<void> => {
  try {
    const { revalidatePath } = await import("next/cache");
    for (const [p, type] of paths) revalidatePath(p, type);
  } catch {
    /* not in a Next request scope (e.g. seeding) */
  }
};

/**
 * Evergreen Tier-0: tell search engines to re-crawl a just-published URL
 * (IndexNow). Best-effort + lazy-imported so the config still loads under the
 * seed/CLI, and a no-op unless IndexNow is configured. Drafts are never pinged.
 */
const pingIndexNow = async (doc: unknown, paths: string[]): Promise<void> => {
  const status = (doc as { _status?: string } | null)?._status;
  if (status && status !== "published") return;
  try {
    const { submitIndexNow } = await import("../../lib/indexnow");
    await submitIndexNow(paths);
  } catch {
    /* best-effort — a failed ping must never block a publish */
  }
};

/**
 * Purge Cloudflare's edge cache for the changed paths, so a publish is visible to
 * visitors immediately instead of after the CDN TTL. Best-effort + lazy-imported;
 * no-op unless Cloudflare purge is configured. `all` purges the whole zone (for a
 * global/nav change that affects every page's header).
 */
const edgePurge = async (paths: string[], all = false): Promise<void> => {
  try {
    const cf = await import("../../lib/cloudflare-purge");
    if (all) await cf.purgeCloudflareEverything();
    else await cf.purgeCloudflare(paths);
  } catch {
    /* best-effort */
  }
};

const pathsOf = (specs: PathSpec[]): string[] => specs.map(([p]) => p);

export const revalidatePages: CollectionAfterChangeHook = async ({ doc, previousDoc }) => {
  const paths: PathSpec[] = [[pagePath(doc?.slug as string)], ...SEO_INDEX];
  if (previousDoc?.slug && previousDoc.slug !== doc?.slug) {
    paths.push([pagePath(previousDoc.slug as string)]);
  }
  await revalidate(paths);
  await pingIndexNow(doc, [pagePath(doc?.slug as string)]);
  await edgePurge(pathsOf(paths));
  return doc;
};

export const revalidatePagesAfterDelete: CollectionAfterDeleteHook = async ({ doc }) => {
  const paths: PathSpec[] = [doc?.slug ? [pagePath(doc.slug as string)] : ["/"], ...SEO_INDEX];
  await revalidate(paths);
  await edgePurge(pathsOf(paths));
  return doc;
};

/** Collection that has its own `/[prefix]/[slug]` route (projects, articles). Also refresh home. */
export const revalidateCollectionRoute =
  (prefix: string): CollectionAfterChangeHook =>
  async ({ doc, previousDoc }) => {
    const paths: PathSpec[] = [["/"], [prefix], ...SEO_INDEX];
    if (doc?.slug) paths.push([`${prefix}/${doc.slug}`]);
    if (previousDoc?.slug && previousDoc.slug !== doc?.slug) {
      paths.push([`${prefix}/${previousDoc.slug}`]);
    }
    await revalidate(paths);
    if (doc?.slug) await pingIndexNow(doc, [`${prefix}/${doc.slug}`]);
    await edgePurge(pathsOf(paths));
    return doc;
  };

/** Content surfaced on the home page (services, sectors, clients, testimonials). */
export const revalidateHome: CollectionAfterChangeHook = async ({ doc }) => {
  const paths: PathSpec[] = [["/"], ...SEO_INDEX];
  await revalidate(paths);
  await edgePurge(pathsOf(paths));
  return doc;
};

export const revalidateHomeAfterDelete: CollectionAfterDeleteHook = async ({ doc }) => {
  const paths: PathSpec[] = [["/"], ...SEO_INDEX];
  await revalidate(paths);
  await edgePurge(pathsOf(paths));
  return doc;
};

/** Globals (nav, settings) live in the root layout → revalidate the whole tree. */
export const revalidateLayout: GlobalAfterChangeHook = async ({ doc }) => {
  await revalidate([["/", "layout"]]);
  await edgePurge([], true); // header/footer change → purge the whole zone
  return doc;
};
