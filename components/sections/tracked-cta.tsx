"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { capture } from "@/lib/analytics/client";

/**
 * A CTA link that fires a typed `cta_clicked` analytics event tagged with the
 * page segment (e.g. the sector slug) so we can read conversion per sector.
 * No PII — only the segment + a short cta label (both allow-listed props).
 */
export function TrackedCta({
  href,
  segment,
  cta,
  variant,
  onDark,
  children,
}: {
  href: string;
  segment: string;
  cta: string;
  variant?: ComponentProps<typeof Button>["variant"];
  onDark?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Button asChild variant={variant} onDark={onDark}>
      <Link href={href} onClick={() => capture("cta_clicked", { segment, cta })}>
        {children}
      </Link>
    </Button>
  );
}
