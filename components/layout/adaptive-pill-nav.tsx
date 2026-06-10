"use client";

/**
 * AdaptivePillNav — optional header style (Site Settings → Display → Nav style).
 *
 * A brand-tuned take on the "adaptive pill": collapses to the CURRENT page and
 * expands on hover / focus / tap to reveal all top-level links. Unlike the
 * reference it is real navigation — every item is an <a> to its route, the
 * active state is derived from the URL (not local state), it reads the CMS
 * Navigation, uses brand glass + Switzer (NO Inter), and is keyboard- and
 * touch-operable. Parents that only have children (Solutions/Services) link to
 * their first child so the pill always navigates somewhere sensible.
 *
 * Non-destructive: the classic mega-menu Header remains the default; this is
 * chosen per the navStyle flag. Reduced-motion → no width animation.
 */
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import type { NavItem, NavLeaf } from "@/lib/nav";
import type { SiteSetting } from "@/payload-types";
import { cn } from "@/lib/utils";

interface PillLink {
  label: string;
  href: string;
}

function toPillLinks(items: NavItem[]): PillLink[] {
  return items
    .map((it) => {
      const href = it.href ?? it.children?.[0]?.href;
      return href ? { label: it.label, href } : null;
    })
    .filter((x): x is PillLink => x !== null);
}

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function AdaptivePillNav({
  items,
  cta,
  logo,
}: {
  items: NavItem[];
  cta: NavLeaf | null;
  logo?: SiteSetting["logo"];
}) {
  const links = toPillLinks(items);
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const [expanded, setExpanded] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLElement>(null);

  const active = links.find((l) => isActive(pathname, l.href)) ?? null;

  // Close on Escape and on outside click.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setExpanded(false);
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setExpanded(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, []);

  // Collapse when the route changes (a link was followed). React's
  // store-previous-value pattern — set state during render, not in an effect
  // (avoids the cascading-render lint and is the recommended approach).
  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setExpanded(false);
  }

  const openNow = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setExpanded(true);
  };
  const closeSoon = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setExpanded(false), 400);
  };

  return (
    <header
      ref={navRef}
      className="sticky top-0 z-50 w-full"
      onMouseEnter={openNow}
      onMouseLeave={closeSoon}
    >
      <Container className="flex items-center justify-between gap-4 py-3">
        <Link href="/" aria-label="Sustech — home" className="shrink-0">
          <Logo logo={logo} />
        </Link>

        {/* The adaptive pill (centred). layout animates the width change. */}
        <motion.nav
          aria-label="Primary"
          layout={!reduced}
          transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 220, damping: 26 }}
          onFocusCapture={openNow}
          onBlurCapture={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) closeSoon();
          }}
          className={cn(
            "border-border bg-surface/80 ease-brand relative hidden items-center rounded-full border",
            "shadow-[0_2px_8px_-2px_rgba(11,18,32,0.18),0_12px_28px_-16px_rgba(0,115,207,0.35)]",
            "px-2 py-1.5 backdrop-blur-xl transition-colors md:flex",
          )}
        >
          {!expanded ? (
            <button
              type="button"
              aria-expanded={false}
              aria-label="Open navigation"
              onClick={() => setExpanded(true)}
              className="text-ink-900 focus-visible:outline-brand flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {active?.label ?? "Menu"}
              <ChevronDown className="text-brand h-3.5 w-3.5" aria-hidden />
            </button>
          ) : (
            <ul className="flex items-center gap-0.5">
              {links.map((l) => {
                const current = active?.href === l.href;
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      prefetch={false}
                      aria-current={current ? "page" : undefined}
                      className={cn(
                        "ease-brand block rounded-full px-4 py-1.5 text-sm whitespace-nowrap transition-colors",
                        "focus-visible:outline-brand focus-visible:outline-2 focus-visible:outline-offset-2",
                        current
                          ? "bg-brand/10 text-brand font-semibold"
                          : "text-text-soft hover:text-ink-900 hover:bg-surface-2 font-medium",
                      )}
                    >
                      {l.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </motion.nav>

        <div className="flex items-center gap-2">
          {cta && (
            <Button asChild className="hidden sm:inline-flex">
              <Link href={cta.href} prefetch={true}>
                {cta.label}
              </Link>
            </Button>
          )}
          {/* Mobile: a plain disclosure of the same links (no hover needed). */}
          <details className="group/m relative md:hidden">
            <summary className="border-border text-ink-900 flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full border [&::-webkit-details-marker]:hidden">
              <ChevronDown
                className="h-4 w-4 transition-transform group-open/m:rotate-180"
                aria-hidden
              />
            </summary>
            <ul className="border-border bg-surface absolute right-0 z-50 mt-2 w-56 rounded-lg border p-1.5 shadow-lg">
              {links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    prefetch={false}
                    aria-current={active?.href === l.href ? "page" : undefined}
                    className={cn(
                      "block rounded-md px-3 py-2 text-sm",
                      active?.href === l.href
                        ? "bg-brand/10 text-brand font-medium"
                        : "text-text-soft hover:bg-surface-2 hover:text-ink-900",
                    )}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        </div>
      </Container>
    </header>
  );
}
