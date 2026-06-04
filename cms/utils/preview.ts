export const serverUrl =
  process.env.NEXT_PUBLIC_SERVER_URL ?? process.env.SITE_URL ?? "http://localhost:4123";

/** Map a page slug to its public path. The "home" slug lives at "/". */
export const pagePath = (slug?: string | null): string =>
  slug && slug !== "home" ? `/${slug}` : "/";

/** Draft-preview entry point: sets Next draftMode then redirects to `path`.
 * Not under /api — that path is owned by Payload's REST catch-all. */
export const previewUrl = (path: string): string => {
  const secret = process.env.PREVIEW_SECRET ?? "";
  return `/preview?secret=${encodeURIComponent(secret)}&path=${encodeURIComponent(path)}`;
};
