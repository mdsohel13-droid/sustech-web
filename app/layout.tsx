/**
 * Root layout — wraps ALL route groups ((site) and (payload)).
 *
 * Responsibility: provide the <html> and <body> shell, the viewport export,
 * and global font variables. Route-group layouts (site layout, payload layout)
 * layer their own chrome on top without duplicating these primitives.
 */
import type { Viewport } from "next";
import type { ReactNode } from "react";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Brand True Blue chrome colour for Android Chrome / iOS Safari PWA mode.
  themeColor: "#0073CF",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  // Font CSS variables are applied by the (site) layout which knows the font
  // instances. This root shell only sets the lang attribute and body structure
  // so the (payload) admin group also gets a valid HTML document.
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
