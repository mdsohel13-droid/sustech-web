import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from "payload";
import { pagePath } from "../utils/preview";

type PathSpec = [path: string, type?: "page" | "layout"];

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

export const revalidatePages: CollectionAfterChangeHook = async ({ doc, previousDoc }) => {
  const paths: PathSpec[] = [[pagePath(doc?.slug as string)]];
  if (previousDoc?.slug && previousDoc.slug !== doc?.slug) {
    paths.push([pagePath(previousDoc.slug as string)]);
  }
  await revalidate(paths);
  return doc;
};

export const revalidatePagesAfterDelete: CollectionAfterDeleteHook = async ({ doc }) => {
  await revalidate(doc?.slug ? [[pagePath(doc.slug as string)]] : [["/"]]);
  return doc;
};

/** Collection that has its own `/[prefix]/[slug]` route (projects, articles). Also refresh home. */
export const revalidateCollectionRoute =
  (prefix: string): CollectionAfterChangeHook =>
  async ({ doc, previousDoc }) => {
    const paths: PathSpec[] = [["/"], [prefix]];
    if (doc?.slug) paths.push([`${prefix}/${doc.slug}`]);
    if (previousDoc?.slug && previousDoc.slug !== doc?.slug) {
      paths.push([`${prefix}/${previousDoc.slug}`]);
    }
    await revalidate(paths);
    return doc;
  };

/** Content surfaced on the home page (services, sectors, clients, testimonials). */
export const revalidateHome: CollectionAfterChangeHook = async ({ doc }) => {
  await revalidate([["/"]]);
  return doc;
};

export const revalidateHomeAfterDelete: CollectionAfterDeleteHook = async ({ doc }) => {
  await revalidate([["/"]]);
  return doc;
};

/** Globals (nav, settings) live in the root layout → revalidate the whole tree. */
export const revalidateLayout: GlobalAfterChangeHook = async ({ doc }) => {
  await revalidate([["/", "layout"]]);
  return doc;
};
