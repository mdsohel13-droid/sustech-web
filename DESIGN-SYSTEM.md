# DESIGN-SYSTEM.md — Sustech Website

Aesthetic direction, design tokens, and the concrete config Claude Code implements. Every color, space, and motion value comes from here — never hardcode.

## 1. Aesthetic direction — "Engineered Institutional"

A premium, capital-grade engineering brand. The feeling: **precise, grounded, quietly confident** — a firm that commissions substations and 25 MW solar plants, not a gadget shop.

- **Mood:** institutional weight + clean modern engineering. Deep ink base for gravitas, light surfaces for readable content, one warm solar accent that owns every primary action.
- **Restraint over flash.** White space, strong typography, sharp alignment. Motion *guides* attention; it never performs. "Simple on arrival, subtly alive on scroll."
- **Atmosphere, not flat color.** Subtle technical textures: a faint blueprint/grid, low-opacity gradient meshes in dark bands, fine 1px borders, soft layered shadows. Depth, never noise.
- **Memorable detail:** a recurring fine-line "engineering grid" motif and animated real-data counters that make competence tangible.

Light-dominant content with **dark anchor bands** (hero, CTA strips, footer) gives the premium dark feel *and* maximum readability/accessibility/crawlability.

## 2. Typography (self-hosted — distinctive, not generic)

Do **not** use Inter/Roboto/Arial/system fonts. Self-host via `next/font/local` (best performance + no external request + crawler-safe).

- **Display / headlines:** **Cabinet Grotesk** (Fontshare, free commercial) — geometric, characterful, authoritative.
- **Body / UI:** **Switzer** (Fontshare, free commercial) — clean, neutral, highly legible at all sizes.
- **Mono (specs, figures, code-like data):** **JetBrains Mono** or **Geist Mono** — for technical figures, model numbers, kWp values.

> Download `.woff2` from fontshare.com → `/public/fonts/`. Load with `next/font/local`, `display: swap`, preload the display weight.
>
> Alternative pairing if more gravitas wanted: headline **Fraunces** (serif, optical) + body **Switzer**. Pick one system and stay consistent.

Type scale (fluid, 1.25 ratio), via `clamp()`:

| Token | Size (clamp) | Use |
|---|---|---|
| `--fs-display` | `clamp(2.75rem, 6vw, 4.5rem)` | hero h1 |
| `--fs-h1` | `clamp(2rem, 4vw, 3rem)` | page h1 |
| `--fs-h2` | `clamp(1.5rem, 3vw, 2.25rem)` | section |
| `--fs-h3` | `clamp(1.25rem, 2vw, 1.5rem)` | sub |
| `--fs-body` | `1.0625rem` (17px) | body |
| `--fs-sm` | `0.9375rem` | meta |
| `--fs-xs` | `0.8125rem` | labels |

Line-height: headings 1.1, body 1.6. Letter-spacing: tighten display (-0.02em), open small-caps labels (0.08em).

## 3. Color tokens

Designed for WCAG AA. Use semantic tokens in components; the raw scale only defines them.

```
INK (institutional base)
--ink-950  #070C16   (deepest bg / footer)
--ink-900  #0B1220   (dark band bg)
--ink-800  #131C2E
--ink-700  #1E293B

SURFACE (light content)
--surface     #FFFFFF
--surface-2   #F5F7FA   (alt sections)
--surface-3   #EDF1F6   (cards on light)
--border      #E2E8F0
--border-dark #24314A   (borders on ink)

TEXT
--text        #0B1220   (on light)
--text-muted  #54607240
--text-soft   #5B6675
--text-invert #E9EFF7   (on ink)
--text-invert-soft #A7B4C6

BRAND
--brand       #0E5FD8   (engineering blue — trust; links, secondary)
--brand-600   #0B4FB5
--brand-300   #6EA4F2   (on dark)
--energy      #16A34A   (sustainability green — accents, success)
--energy-300  #4ADE80
--solar       #F59E0B   (PRIMARY CTA only — amber)
--solar-600   #D97706
--solar-text  #1A1206   (text on amber buttons)

FUNCTIONAL
--success #16A34A  --warn #D97706  --error #DC2626  --info #0E5FD8
```

**Usage rules**
- **Solar amber is reserved for the single primary action** on a screen. Scarcity = clarity. Secondary actions use brand blue outline/ghost.
- Brand blue carries trust (links, highlights, icons). Green signals sustainability/energy and positive states.
- Dark bands use `--ink-900/950` bg with `--text-invert`; ensure AA (amber + ink text on buttons passes; blue use `--brand-300` on dark).
- Never put low-contrast muted text on colored backgrounds.

## 4. Spacing, radius, shadow, layout

- **Spacing scale (4px base):** 1=4, 2=8, 3=12, 4=16, 6=24, 8=32, 12=48, 16=64, 24=96, 32=128. Section vertical rhythm: 96–128px desktop, 64px mobile.
- **Container:** max-width 1200px content / 1320px wide; 24px gutters mobile, 48px desktop.
- **Radius:** `--r-sm 6px`, `--r-md 10px`, `--r-lg 16px`, `--r-xl 24px`, pill 9999px. Cards `--r-lg`; buttons `--r-md`.
- **Shadow (soft, layered):** `--shadow-sm 0 1px 2px rgba(11,18,32,.06)`, `--shadow-md 0 6px 20px rgba(11,18,32,.08)`, `--shadow-lg 0 18px 50px rgba(11,18,32,.12)`. On dark, use subtle inner/glow instead of drop shadow.
- **Grid motif:** a 1px `--border` grid background at low opacity for technical texture in select bands.

## 5. Motion

Purposeful, fast, accessible. Always wrap in `prefers-reduced-motion`.

- **Tokens:** durations `--t-fast 150ms`, `--t 250ms`, `--t-slow 450ms`; easing `--ease [cubic-bezier(0.22,1,0.36,1)]` (gentle overshoot-free).
- **Page load:** ONE orchestrated staggered reveal of hero elements (50–80ms stagger). Not scattered everywhere.
- **Scroll:** sections fade-rise 16px on enter (once). Counters animate to real values when in view.
- **Hover:** cards lift 2px + border brighten; buttons subtle scale 1.02 + shadow. Links underline-grow.
- **Never:** parallax overload, autoplay carousels that hijack, motion that delays content or causes CLS.

## 6. Component conventions

- **Buttons:** `primary` (solar amber, dark text), `secondary` (brand outline), `ghost` (text+icon), `dark` (on light bands). Min 44px touch target. Visible focus ring (`--brand`, 2px offset).
- **Cards:** 1px border, `--r-lg`, `--shadow-sm` → `--shadow-md` on hover. Used for services, projects, articles.
- **Section shell:** consistent vertical padding, optional eyebrow label (small-caps, brand), h2, lede, content.
- **Proof counters:** large mono number + label; animate on view; real CMS values.
- **Logo wall:** grayscale → color on hover; contextual subsets per page.
- **Forms (RFQ):** generous spacing, inline validation, clear labels (no placeholder-only), success state. Server-action backed.
- **Nav:** sticky, condenses on scroll; mega-menu for Solutions/Services on desktop, accordion on mobile; persistent primary CTA.

## 7. `tailwind.config.ts` (Tailwind v4 — tokens wired)

> Tailwind v4 reads tokens from CSS `@theme`. Keep the source of truth in `globals.css`; this file stays minimal.

```ts
import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx,mdx}", "./components/**/*.{ts,tsx}", "./content/**/*.{md,mdx}"],
  theme: { extend: {} }, // tokens defined via @theme in globals.css
  plugins: [],
} satisfies Config;
```

## 8. `styles/globals.css` (tokens + base)

```css
@import "tailwindcss";

@theme {
  /* color */
  --color-ink-950: #070C16;
  --color-ink-900: #0B1220;
  --color-ink-800: #131C2E;
  --color-ink-700: #1E293B;
  --color-surface: #FFFFFF;
  --color-surface-2: #F5F7FA;
  --color-surface-3: #EDF1F6;
  --color-border: #E2E8F0;
  --color-border-dark: #24314A;
  --color-text: #0B1220;
  --color-text-soft: #5B6675;
  --color-text-invert: #E9EFF7;
  --color-text-invert-soft: #A7B4C6;
  --color-brand: #0E5FD8;
  --color-brand-600: #0B4FB5;
  --color-brand-300: #6EA4F2;
  --color-energy: #16A34A;
  --color-solar: #F59E0B;
  --color-solar-600: #D97706;
  --color-solar-text: #1A1206;
  /* radius */
  --radius-sm: 6px; --radius-md: 10px; --radius-lg: 16px; --radius-xl: 24px;
  /* fonts (mapped to next/font/local CSS vars) */
  --font-display: var(--font-cabinet);
  --font-sans: var(--font-switzer);
  --font-mono: var(--font-jetbrains);
}

:root {
  --t-fast: 150ms; --t: 250ms; --t-slow: 450ms;
  --ease: cubic-bezier(0.22, 1, 0.36, 1);
  --shadow-sm: 0 1px 2px rgba(11,18,32,.06);
  --shadow-md: 0 6px 20px rgba(11,18,32,.08);
  --shadow-lg: 0 18px 50px rgba(11,18,32,.12);
}

* { box-sizing: border-box; }
html { -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
body {
  background: var(--color-surface);
  color: var(--color-text);
  font-family: var(--font-sans), sans-serif;
  font-size: 1.0625rem; line-height: 1.6;
}
h1,h2,h3 { font-family: var(--font-display), sans-serif; line-height: 1.1; letter-spacing: -0.02em; }

/* focus visibility */
:focus-visible { outline: 2px solid var(--color-brand); outline-offset: 2px; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .001ms !important; transition-duration: .001ms !important; }
}
```

## 9. Font loading (`app/fonts.ts`)

```ts
import localFont from "next/font/local";

export const cabinet = localFont({
  src: [{ path: "../public/fonts/CabinetGrotesk-Variable.woff2", weight: "300 800" }],
  variable: "--font-cabinet", display: "swap",
});
export const switzer = localFont({
  src: [{ path: "../public/fonts/Switzer-Variable.woff2", weight: "300 700" }],
  variable: "--font-switzer", display: "swap",
});
export const jetbrains = localFont({
  src: [{ path: "../public/fonts/JetBrainsMono-Variable.woff2", weight: "400 700" }],
  variable: "--font-jetbrains", display: "swap",
});
```

Apply the variables on `<html>` in `layout.tsx`:
`className={`${cabinet.variable} ${switzer.variable} ${jetbrains.variable}`}`
