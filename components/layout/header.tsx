"use client";

import { ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/layout/logo";
import { mainNav, primaryCta, type NavGroup } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  // Condense on scroll.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Escape closes any open menu; outside-click closes desktop dropdowns.
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
          <Logo />
        </div>

        {/* Desktop nav */}
        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {mainNav.map((item) =>
            item.children ? (
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
                className="text-text-soft hover:text-ink-900 focus-visible:outline-brand rounded-md px-3 py-2 text-[0.9375rem] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild size="default" className="hidden sm:inline-flex">
            <Link href={primaryCta.href}>{primaryCta.label}</Link>
          </Button>
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

      {mobileOpen && <MobileMenu onNavigate={() => setMobileOpen(false)} />}
    </header>
  );
}

function DesktopDropdown({
  item,
  open,
  onToggle,
  onClose,
}: {
  item: NavGroup;
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
              <li key={leaf.href}>
                <Link
                  href={leaf.href}
                  onClick={onClose}
                  className="hover:bg-surface-2 focus-visible:outline-brand block rounded-md p-3 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  <span className="text-ink-900 block text-[0.9375rem] font-medium">
                    {leaf.label}
                  </span>
                  {leaf.description && (
                    <span className="text-text-soft mt-0.5 block text-sm">{leaf.description}</span>
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

function MobileMenu({ onNavigate }: { onNavigate: () => void }) {
  const [openSection, setOpenSection] = useState<string | null>(null);
  return (
    <div id="mobile-menu" className="border-border bg-surface border-t lg:hidden">
      <Container className="py-4">
        <Button asChild className="mb-4 w-full">
          <Link href={primaryCta.href} onClick={onNavigate}>
            {primaryCta.label}
          </Link>
        </Button>
        <nav aria-label="Mobile">
          <ul className="grid gap-1">
            {mainNav.map((item) =>
              item.children ? (
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
                        <li key={leaf.href}>
                          <Link
                            href={leaf.href}
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
