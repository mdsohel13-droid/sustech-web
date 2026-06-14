import { resolveHref } from "@/lib/resolve-link";
import type { Navigation } from "@/payload-types";

export interface NavLeaf {
  label: string;
  href: string;
  description?: string;
  newTab?: boolean;
}

export interface NavItem {
  label: string;
  href?: string;
  newTab?: boolean;
  children?: NavLeaf[];
}

export function buildHeaderNav(nav: Navigation): { items: NavItem[]; cta: NavLeaf | null } {
  const items: NavItem[] = (nav.header ?? []).map((it) => {
    const children = (it.children ?? []).map((c) => ({
      label: c.label,
      href: resolveHref(c),
      description: c.description ?? undefined,
      newTab: c.newTab ?? undefined,
    }));
    return children.length > 0
      ? { label: it.label, children }
      : { label: it.label, href: resolveHref(it), newTab: it.newTab ?? undefined };
  });
  const cta =
    nav.headerCta && nav.headerCta.label
      ? { label: nav.headerCta.label, href: resolveHref(nav.headerCta) }
      : null;
  return { items, cta };
}

/** A flat top-level link for the compact header styles (pill / tabs / dock). */
export interface TopLink {
  label: string;
  href: string;
}

/**
 * Flatten header items to top-level links. Parents that only carry children
 * (e.g. Solutions/Services) link to their first child so every entry navigates.
 */
export function toTopLevelLinks(items: NavItem[]): TopLink[] {
  return items
    .map((it) => {
      const href = it.href ?? it.children?.[0]?.href;
      return href ? { label: it.label, href } : null;
    })
    .filter((x): x is TopLink => x !== null);
}

/** Whether `href` is the active route for the current pathname. */
export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export interface FooterColumn {
  title: string;
  links: NavLeaf[];
}

export function buildFooterColumns(nav: Navigation): FooterColumn[] {
  return (nav.footerColumns ?? []).map((col) => ({
    title: col.title,
    links: (col.links ?? []).map((l) => ({
      label: l.label,
      href: resolveHref(l),
      newTab: l.newTab ?? undefined,
    })),
  }));
}
