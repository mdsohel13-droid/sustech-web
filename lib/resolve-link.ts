import { pagePath } from "@/cms/utils/preview";
import type { Page } from "@/payload-types";

export interface CmsLink {
  type?: ("page" | "custom") | null;
  page?: (number | Page) | null;
  url?: string | null;
  label?: string | null;
  newTab?: boolean | null;
}

/** Resolve a CMS link (internal page reference or custom URL) to an href. */
export function resolveHref(link?: CmsLink | null): string {
  if (!link) return "#";
  if (link.type === "custom") return link.url || "#";
  if (link.page && typeof link.page === "object") return pagePath(link.page.slug);
  return "#";
}
