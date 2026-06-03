import localFont from "next/font/local";

export const cabinet = localFont({
  src: [{ path: "../public/fonts/CabinetGrotesk-Variable.woff2", weight: "300 800" }],
  variable: "--font-cabinet",
  display: "swap",
});

export const switzer = localFont({
  src: [{ path: "../public/fonts/Switzer-Variable.woff2", weight: "300 700" }],
  variable: "--font-switzer",
  display: "swap",
});

export const jetbrains = localFont({
  src: [{ path: "../public/fonts/JetBrainsMono-Variable.woff2", weight: "400 700" }],
  variable: "--font-jetbrains",
  display: "swap",
});
