"use client";

/**
 * GradientTracing — animated "circuit trace" lines sweeping across the hero.
 *
 * Adapted from the GradientTracing reference into a full-bleed background: a set
 * of faint horizontal rules, each with a brand-coloured gradient pulse tracing
 * along it (True Blue → Lime Green). Hero "Background effect" → Circuit traces.
 *
 * Pure SVG + motion (GPU transforms only). Reduced-motion → the static faint
 * rules render with no pulse. Decorative: aria-hidden, pointer-events-none.
 */
import { motion, useReducedMotion } from "motion/react";

const LINES = [
  { y: 18, delay: 0, duration: 2.6 },
  { y: 34, delay: 0.6, duration: 3.2 },
  { y: 50, delay: 1.1, duration: 2.9 },
  { y: 66, delay: 0.3, duration: 3.5 },
  { y: 82, delay: 1.4, duration: 2.4 },
];

export function GradientTracing() {
  const reduced = useReducedMotion();

  return (
    <svg
      aria-hidden
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
      className="pointer-events-none absolute inset-0 h-full w-full"
    >
      {LINES.map((line, i) => {
        const id = `trace-${i}`;
        return (
          <g key={id}>
            <line
              x1="0"
              y1={line.y}
              x2="100"
              y2={line.y}
              stroke="var(--color-brand)"
              strokeOpacity="0.12"
              strokeWidth="0.15"
            />
            {!reduced && (
              <>
                <line
                  x1="0"
                  y1={line.y}
                  x2="100"
                  y2={line.y}
                  stroke={`url(#${id})`}
                  strokeWidth="0.3"
                  strokeLinecap="round"
                />
                <motion.linearGradient
                  id={id}
                  gradientUnits="userSpaceOnUse"
                  initial={{ x1: -40, x2: 0 }}
                  animate={{ x1: [-40, 140], x2: [0, 180] }}
                  transition={{
                    duration: line.duration,
                    delay: line.delay,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <stop stopColor="var(--color-brand)" stopOpacity="0" />
                  <stop offset="0.5" stopColor="var(--color-brand)" />
                  <stop offset="1" stopColor="var(--color-energy)" stopOpacity="0" />
                </motion.linearGradient>
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}
