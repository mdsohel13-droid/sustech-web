/**
 * Per-navigation template for the public site.
 *
 * Unlike layout.tsx, a template re-mounts on every route change — so its CSS
 * entrance animation re-runs and each new page fades in smoothly, masking the
 * brief navigation delay with a deliberate, premium feel.
 *
 * Why pure CSS (not Motion):
 *  - Content is always present in the SSR HTML and animates via CSS, which runs
 *    without JS — so crawlers and no-JS visitors always see the content (it is
 *    never trapped at opacity:0 waiting for hydration).
 *  - The fade+rise uses animation-fill-mode `backwards`, so the transform only
 *    exists while the animation runs and reverts afterwards — sticky/fixed
 *    descendants (e.g. the Knowledge tab bar) keep working once the page settles.
 *  - prefers-reduced-motion disables the animation entirely (see motion.css).
 */
import type { ReactNode } from "react";

export default function SiteTemplate({ children }: { children: ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
