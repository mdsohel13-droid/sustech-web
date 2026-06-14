"use client";

/**
 * DockNav — optional header style (Site Settings → Display → Nav style → Dock).
 *
 * A brand-tuned adaptation of the floating bottom-dock reference, fixed for a
 * real site: links are REAL routes (not hardcoded icons/sections), the sliding
 * active indicator tracks the CURRENT route, and labels come from the CMS
 * Navigation. Because a dock has no top chrome, a minimal sticky top bar keeps
 * the logo + CTA. NO Inter; brand glass; reduced-motion → indicator jumps
 * instantly. Keyboard-operable (real links).
 *
 * Caveat (documented in the CMS field): the dock floats bottom-centre; the
 * WhatsApp button stays bottom-right, so they coexist. Body gets bottom padding
 * so content/footer clear the dock.
 *
 * Non-destructive: chosen via the navStyle flag; the classic header stays default.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { useLayoutEffect, useRef, useState } from "react";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { isNavActive, toTopLevelLinks, type NavItem, type NavLeaf } from "@/lib/nav";
import type { SiteSetting } from "@/payload-types";
import { cn } from "@/lib/utils";

export function DockNav({
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
  const reduced = useReducedMotion();

  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  const activeIndex = links.findIndex((l) => isNavActive(pathname, l.href));

  // Position the sliding indicator under the active item (measured post-layout).
  useLayoutEffect(() => {
    const list = listRef.current;
    const el = activeIndex >= 0 ? itemRefs.current[activeIndex] : null;
    if (!list || !el) {
      setIndicator(null);
      return;
    }
    setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
  }, [activeIndex, pathname, links.length]);

  return (
    <>
      {/* Minimal top bar keeps logo + CTA (a dock alone has no top chrome). */}
      <header className="border-border bg-surface/85 sticky top-0 z-50 w-full border-b backdrop-blur-md">
        <Container className="flex items-center justify-between gap-4 py-2.5">
          <Link href="/" aria-label="Sustech — home" className="shrink-0">
            <Logo logo={logo} />
          </Link>
          {cta && (
            <Button asChild className="hidden sm:inline-flex">
              <Link href={cta.href} prefetch={true}>
                {cta.label}
              </Link>
            </Button>
          )}
        </Container>
      </header>

      {/* Floating bottom dock with the primary links + sliding active indicator. */}
      <nav
        aria-label="Primary"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-50 mx-auto w-full max-w-xl px-4"
      >
        <ul
          ref={listRef}
          className="border-border bg-surface/85 pointer-events-auto relative flex items-stretch justify-between gap-1 rounded-full border p-1.5 shadow-[0_8px_30px_-10px_rgba(11,18,32,0.4)] backdrop-blur-xl"
        >
          {indicator && (
            <motion.span
              aria-hidden
              className="bg-brand/12 absolute inset-y-1.5 rounded-full"
              initial={false}
              animate={{ left: indicator.left, width: indicator.width }}
              transition={
                reduced ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 32 }
              }
            />
          )}
          {links.map((l, i) => {
            const active = i === activeIndex;
            return (
              <li
                key={l.href}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                className="relative z-10 flex flex-1"
              >
                <Link
                  href={l.href}
                  prefetch={false}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "ease-brand flex flex-1 items-center justify-center rounded-full px-3 py-2 text-center text-xs font-medium whitespace-nowrap transition-colors",
                    "focus-visible:outline-brand focus-visible:outline-2 focus-visible:-outline-offset-2",
                    active ? "text-brand font-semibold" : "text-text-soft hover:text-ink-900",
                  )}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
