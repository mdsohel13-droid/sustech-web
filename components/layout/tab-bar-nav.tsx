"use client";

/**
 * TabBarNav — optional header style (Site Settings → Display → Nav style → Tabs).
 *
 * A brand-tuned adaptation of the segmented Tabs reference, fixed for a real
 * site: the tab triggers are REAL route links (not content-panel switchers),
 * the active tab is derived from the URL, and it reads the CMS Navigation.
 * No shadcn tabs/scroll-area dependency — plain semantic <nav>/<a> with a
 * horizontally scrollable strip on narrow screens. NO Inter; brand tokens only.
 *
 * Non-destructive: chosen via the navStyle flag; the classic header stays default.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { isNavActive, toTopLevelLinks, type NavItem, type NavLeaf } from "@/lib/nav";
import type { SiteSetting } from "@/payload-types";
import { cn } from "@/lib/utils";

export function TabBarNav({
  items,
  cta,
  logo,
}: {
  items: NavItem[];
  cta: NavLeaf | null;
  logo?: SiteSetting["logo"];
}) {
  const links = toTopLevelLinks(items);
  const pathname = usePathname();

  return (
    <header className="border-border bg-surface/90 sticky top-0 z-50 w-full border-b backdrop-blur-md">
      <Container className="flex items-center justify-between gap-4 py-2.5">
        <Link href="/" aria-label="Sustech — home" className="shrink-0">
          <Logo logo={logo} />
        </Link>

        {/* Segmented tab strip — scrolls horizontally if it overflows. */}
        <nav
          aria-label="Primary"
          className="-mx-1 flex max-w-full items-stretch overflow-x-auto px-1"
        >
          <ul className="flex items-stretch">
            {links.map((l, i) => {
              const active = isNavActive(pathname, l.href);
              return (
                <li key={l.href} className="flex">
                  <Link
                    href={l.href}
                    prefetch={false}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "border-border ease-brand relative -ms-px flex items-center border px-4 py-2 text-sm whitespace-nowrap transition-colors",
                      "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:content-['']",
                      "focus-visible:outline-brand focus-visible:z-10 focus-visible:outline-2 focus-visible:-outline-offset-2",
                      i === 0 && "rounded-s-md",
                      i === links.length - 1 && "rounded-e-md",
                      active
                        ? "text-ink-900 bg-surface-2 after:bg-brand font-semibold"
                        : "text-text-soft hover:text-ink-900 hover:bg-surface-2/60 font-medium after:bg-transparent",
                    )}
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {cta && (
          <Button asChild className="hidden shrink-0 sm:inline-flex">
            <Link href={cta.href} prefetch={true}>
              {cta.label}
            </Link>
          </Button>
        )}
      </Container>
    </header>
  );
}
