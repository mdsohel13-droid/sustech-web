"use client";

import type { ReactNode } from "react";
import { capture } from "@/lib/analytics/client";

/**
 * The WhatsApp button's anchor, with click tracking (plan 3·4 — WhatsApp is a
 * primary conversion path, so the funnel is blind without it).
 *
 * Still a plain `<a href>`: it navigates even if JS never runs or hydration
 * fails — hydration only adds the analytics ping, so the widget keeps the
 * zero-JS guarantee it was designed with. No PII: only the allow-listed
 * `cta` property is sent.
 */
export function WhatsAppLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className={className}
      onClick={() => capture("cta_clicked", { cta: "whatsapp" })}
    >
      {children}
    </a>
  );
}
