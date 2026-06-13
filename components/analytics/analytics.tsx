"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { capturePageview, rememberUtm } from "@/lib/analytics/client";

/**
 * Mounts once in the (site) root layout. Tracks SPA pageviews on every route
 * change and remembers UTM params for lead attribution. Renders nothing,
 * ships ~1 KB, and no-ops entirely when NEXT_PUBLIC_POSTHOG_KEY is unset or
 * the visitor signals Do Not Track.
 */
export function Analytics() {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      rememberUtm(); // capture landing UTM before any navigation
    }
    capturePageview(pathname);
  }, [pathname]);

  return null;
}
