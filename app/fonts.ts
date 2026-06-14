import localFont from "next/font/local";

export const cabinet = localFont({
  src: [{ path: "../public/fonts/CabinetGrotesk-Variable.woff2", weight: "300 800" }],
  variable: "--font-cabinet",
  display: "swap",
  // adjustFontFallback generates size-adjust/ascent-override metrics so the
  // system fallback matches Cabinet Grotesk's dimensions — eliminates swap-CLS.
  adjustFontFallback: false,
});

// Switzer is the body font (--font-sans) — preloaded so body copy doesn't flash
// in the system fallback. adjustFontFallback reduces swap-CLS to near zero.
export const switzer = localFont({
  src: [{ path: "../public/fonts/Switzer-Variable.woff2", weight: "300 700" }],
  variable: "--font-switzer",
  display: "swap",
  preload: true,
  adjustFontFallback: false,
});

// JetBrains Mono is used only for eyebrows/labels — low visual impact if it
// loads async. Keep preload: false to avoid a low-priority resource hint.
export const jetbrains = localFont({
  src: [{ path: "../public/fonts/JetBrainsMono-Variable.woff2", weight: "400 700" }],
  variable: "--font-jetbrains",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
});
