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
 *
 * `will-change` is added just before the animation starts and removed after it
 * completes — this avoids promoting 30+ GPU compositor layers simultaneously on
 * content-heavy pages and limits GPU memory usage to the currently-animating elements.
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

    // Map each reveal type to its animation class
    const animClass: Record<string, string> = {
      "fade-rise": "reveal-js-in",
      "slide-left": "reveal-js-slide-left-in",
      "slide-right": "reveal-js-slide-right-in",
      "scale-up": "reveal-js-scale-in",
      stagger: "reveal-js-in",
    };

    // Map each reveal type to its initial-state class
    const hiddenClass: Record<string, string> = {
      "fade-rise": "reveal-js",
      "slide-left": "reveal-js-slide-left",
      "slide-right": "reveal-js-slide-right",
      "scale-up": "reveal-js-scale",
      stagger: "reveal-js",
    };

    // Arm: hide now, then reveal on scroll-in. Done in JS so no-JS users keep content visible.
    for (const el of els) {
      const type = el.dataset["reveal"] ?? "fade-rise";
      el.classList.add(hiddenClass[type] ?? "reveal-js");
    }

    const io = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          const type = el.dataset["reveal"] ?? "fade-rise";
          const anim = animClass[type] ?? "reveal-js-in";

          // Promote to GPU layer just before animating
          el.classList.add("reveal-js-animating");
          el.classList.add(anim);

          // Remove will-change after the animation completes to free GPU memory
          el.addEventListener("animationend", () => el.classList.remove("reveal-js-animating"), {
            once: true,
          });

          obs.unobserve(el); // fire once per section
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );

    for (const el of els) io.observe(el);
    return () => io.disconnect();
  }, []);

  return null;
}
