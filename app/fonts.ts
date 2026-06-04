import localFont from "next/font/local";

export const cabinet = localFont({
  src: [{ path: "../public/fonts/CabinetGrotesk-Variable.woff2", weight: "300 800" }],
  variable: "--font-cabinet",
  display: "swap",
});

// Only the display face (the hero <h1> / LCP element) is preloaded. Body + mono load on
// demand from a size-adjusted fallback (no CLS), keeping the high-priority font payload small.
export const switzer = localFont({
  src: [{ path: "../public/fonts/Switzer-Variable.woff2", weight: "300 700" }],
  variable: "--font-switzer",
  display: "swap",
  preload: false,
});

export const jetbrains = localFont({
  src: [{ path: "../public/fonts/JetBrainsMono-Variable.woff2", weight: "400 700" }],
  variable: "--font-jetbrains",
  display: "swap",
  preload: false,
});
