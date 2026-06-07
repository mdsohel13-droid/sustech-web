"use client";

import { ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import type { NavItem, NavLeaf } from "@/lib/nav";
import type { SiteSetting } from "@/payload-types";
import { cn } from "@/lib/utils";

interface HeaderProps {
  items: NavItem[];
  cta: NavLeaf | null;
  logo?: SiteSetting["logo"];
}

export function Header({ items, cta, logo }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let ticking = false;
    const update = () => {
      setScrolled(window.scrollY > 8);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    };
    // Read scroll position once via rAF to avoid synchronous setState in effect
    requestAnimationFrame(update);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenMenu(null);
        setMobileOpen(false);
      }
    };
    const onClick = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) setOpenMenu(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <header
      ref={headerRef}
      className={cn(
        "bg-surface/90 ease-brand sticky top-0 z-50 border-b backdrop-blur transition-[height,box-shadow,border-color] duration-200",
        scrolled ? "border-border shadow-sm" : "border-transparent",
      )}
    >
      <Container className="flex items-center justify-between gap-4">
        <div
          className={cn(
            "ease-brand flex items-center transition-[height] duration-200",
            scrolled ? "h-16" : "h-20",
          )}
        >
          <Logo logo={logo} />
        </div>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {items.map((item) =>
            item.children?.length ? (
              <DesktopDropdown
                key={item.label}
                item={item}
                open={openMenu === item.label}
                onToggle={() => setOpenMenu((cur) => (cur === item.label ? null : item.label))}
                onClose={() => setOpenMenu(null)}
              />
            ) : (
              <Link
                key={item.label}
                href={item.href ?? "#"}
                prefetch={true}
                className="text-text-soft hover:text-ink-900 focus-visible:outline-brand rounded-md px-3 py-2 text-[0.9375rem] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2">
          {cta && (
            <Button asChild className="hidden sm:inline-flex">
              <Link href={cta.href} prefetch={true}>
                {cta.label}
              </Link>
            </Button>
          )}
          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls={mobileOpen ? "mobile-menu" : undefined}
            onClick={() => setMobileOpen((v) => !v)}
            className="text-ink-900 hover:bg-surface-2 focus-visible:outline-brand inline-flex h-11 w-11 items-center justify-center rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 lg:hidden"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </Container>

      {mobileOpen && <MobileMenu items={items} cta={cta} onNavigate={() => setMobileOpen(false)} />}
    </header>
  );
}

function DesktopDropdown({
  item,
  open,
  onToggle,
  onClose,
}: {
  item: NavItem;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const panelId = useId();
  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-haspopup="true"
        onClick={onToggle}
        className="text-text-soft hover:text-ink-900 focus-visible:outline-brand aria-expanded:text-ink-900 inline-flex items-center gap-1 rounded-md px-3 py-2 text-[0.9375rem] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {item.label}
        <ChevronDown
          className={cn(
            "ease-brand h-4 w-4 transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>
      {open && (
        <div
          id={panelId}
          className="border-border bg-surface absolute top-full left-0 z-50 mt-2 w-[22rem] rounded-lg border p-2 shadow-lg"
        >
          <ul className="grid gap-1">
            {item.children?.map((leaf) => (
              <li key={leaf.href + leaf.label}>
                <Link
                  href={leaf.href}
                  prefetch={true}
                  onClick={onClose}
                  className="group hover:bg-surface-2 focus-visible:outline-brand block rounded-md p-3 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  <span className="text-ink-900 block text-[0.9375rem] font-medium">
                    {leaf.label}
                  </span>
                  {leaf.description && (
                    // Hidden by default; the row collapses via grid-rows (reflow stays inside
                    // this absolutely-positioned panel, so the page never reflows). Reveals on
                    // hover AND keyboard focus of the item. The 150ms delay only applies on the
                    // way *in* (delay-0 at rest) so a fast mouse-sweep doesn't flicker, while
                    // leaving feels instant. Under reduced motion the description stays visible.
                    <span className="ease-standard grid grid-rows-[0fr] transition-[grid-template-rows] delay-0 duration-[var(--duration-base)] group-focus-within:grid-rows-[1fr] group-focus-within:delay-[var(--delay-reveal)] group-hover:grid-rows-[1fr] group-hover:delay-[var(--delay-reveal)] motion-reduce:grid-rows-[1fr]">
                      <span className="overflow-hidden">
                        <span className="text-text-soft ease-standard mt-0.5 block -translate-y-1 text-sm opacity-0 transition-[opacity,transform] duration-[var(--duration-base)] group-focus-within:translate-y-0 group-focus-within:opacity-100 group-focus-within:delay-[var(--delay-reveal)] group-hover:translate-y-0 group-hover:opacity-100 group-hover:delay-[var(--delay-reveal)] motion-reduce:translate-y-0 motion-reduce:opacity-100">
                          {leaf.description}
                        </span>
                      </span>
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function MobileMenu({
  items,
  cta,
  onNavigate,
}: {
  items: NavItem[];
  cta: NavLeaf | null;
  onNavigate: () => void;
}) {
  const [openSection, setOpenSection] = useState<string | null>(null);
  return (
    <div id="mobile-menu" className="border-border bg-surface border-t lg:hidden">
      <Container className="py-4">
        {cta && (
          <Button asChild className="mb-4 w-full">
            <Link href={cta.href} prefetch={true} onClick={onNavigate}>
              {cta.label}
            </Link>
          </Button>
        )}
        <nav aria-label="Mobile">
          <ul className="grid gap-1">
            {items.map((item) =>
              item.children?.length ? (
                <li key={item.label}>
                  <button
                    type="button"
                    aria-expanded={openSection === item.label}
                    onClick={() =>
                      setOpenSection((cur) => (cur === item.label ? null : item.label))
                    }
                    className="text-ink-900 hover:bg-surface-2 focus-visible:outline-brand flex w-full items-center justify-between rounded-md px-3 py-3 text-left text-base font-medium focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    {item.label}
                    <ChevronDown
                      className={cn(
                        "ease-brand h-5 w-5 transition-transform duration-200",
                        openSection === item.label && "rotate-180",
                      )}
                      aria-hidden
                    />
                  </button>
                  {openSection === item.label && (
                    <ul className="border-border mb-1 ml-3 grid gap-0.5 border-l pl-3">
                      {item.children.map((leaf) => (
                        <li key={leaf.href + leaf.label}>
                          <Link
                            href={leaf.href}
                            prefetch={true}
                            onClick={onNavigate}
                            className="text-text-soft hover:text-ink-900 focus-visible:outline-brand block rounded-md px-3 py-2.5 text-[0.9375rem] focus-visible:outline-2 focus-visible:outline-offset-2"
                          >
                            {leaf.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ) : (
                <li key={item.label}>
                  <Link
                    href={item.href ?? "#"}
                    prefetch={true}
                    onClick={onNavigate}
                    className="text-ink-900 hover:bg-surface-2 focus-visible:outline-brand block rounded-md px-3 py-3 text-base font-medium focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    {item.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>
      </Container>
    </div>
  );
}
