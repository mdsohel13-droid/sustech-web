export const serverUrl =
  process.env.NEXT_PUBLIC_SERVER_URL ?? process.env.SITE_URL ?? "http://localhost:4123";

/** Map a page slug to its public path. The "home" slug lives at "/". */
export const pagePath = (slug?: string | null): string =>
  slug && slug !== "home" ? `/${slug}` : "/";

/** Draft-preview entry point: sets Next draftMode then redirects to `path`.
 * Not under /api — that path is owned by Payload's REST catch-all.
 *
 * Security note: the secret is passed as a query-string token which is logged
 * by proxies and browser history. This is acceptable for a short-lived preview
 * workflow, but PREVIEW_SECRET must be set and must not be empty — an empty
 * secret would allow anyone to trigger preview mode. */
export const previewUrl = (path: string): string => {
  const secret = process.env.PREVIEW_SECRET;
  if (!secret) {
    throw new Error("PREVIEW_SECRET env var must be set to enable draft preview");
  }
  return `/preview?secret=${encodeURIComponent(secret)}&path=${encodeURIComponent(path)}`;
};
