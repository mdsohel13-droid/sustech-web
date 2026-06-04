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
