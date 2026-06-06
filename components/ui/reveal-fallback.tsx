"use client";

import { useEffect } from "react";

/**
 * Progressive-enhancement reveal for browsers without CSS scroll-driven animations.
 *
 * The primary scroll-reveal path is pure CSS (`animation-timeline: view()`, see motion.css) —
 * zero JS, runs on the compositor. Chromium has it; Firefox/Safari do not (yet). This component
 * fills that gap with an IntersectionObserver that fades + slides each `[data-reveal]` section in
 * once, matching the CSS keyframe. It self-disables where it isn't needed, so:
 *   - Chromium pays zero JS (returns immediately — CSS already handles it),
 *   - reduced-motion users are never animated,
 *   - no-JS users keep the visible resting state (content is always in the SSR HTML).
 *
 * Mounted once in the site layout. Renders nothing.
 */
export function RevealFallback() {
  useEffect(() => {
    // CSS scroll-timeline already drives the reveal here — don't double-animate.
    if (CSS.supports("animation-timeline", "view()")) return;
    // Honour the user's motion preference.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;

    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (els.length === 0) return;

    // Arm: hide now, then reveal on scroll-in. Done in JS so no-JS users keep content visible.
    for (const el of els) el.classList.add("reveal-js");

    const io = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("reveal-js-in");
          obs.unobserve(entry.target); // fire once per section
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );

    for (const el of els) io.observe(el);
    return () => io.disconnect();
  }, []);

  return null;
}
