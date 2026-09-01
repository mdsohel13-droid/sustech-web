import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, serverUrl } from "@/lib/seo";
import { cn } from "@/lib/utils";

export interface Crumb {
  name: string;
  /** Site-relative path. Omit on the current (last) page. */
  href?: string;
}

/**
 * Visible breadcrumb trail + matching BreadcrumbList JSON-LD from a single
 * source. Google only shows the breadcrumb rich result when the visible trail
 * and the structured data agree, so emitting both here keeps them in lock-step.
 * `onDark` styles it for the dark hero sections.
 */
export function Breadcrumbs({
  items,
  onDark,
  className,
}: {
  items: Crumb[];
  onDark?: boolean;
  className?: string;
}) {
  if (items.length === 0) return null;
  const schema = breadcrumbJsonLd(
    items.map((c) => ({ name: c.name, url: c.href ? `${serverUrl}${c.href}` : undefined })),
  );

  return (
    <>
      <JsonLd data={schema} />
      <nav aria-label="Breadcrumb" className={className}>
        <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs font-medium">
          {items.map((c, i) => {
            const last = i === items.length - 1;
            return (
              <li key={i} className="flex items-center gap-x-1.5">
                {c.href && !last ? (
                  <Link
                    href={c.href}
                    prefetch={false}
                    className={cn(
                      "underline-offset-4 hover:underline",
                      onDark
                        ? "text-text-invert-soft hover:text-white"
                        : "text-text-soft hover:text-ink-900",
                    )}
                  >
                    {c.name}
                  </Link>
                ) : (
                  <span aria-current="page" className={onDark ? "text-white" : "text-ink-900"}>
                    {c.name}
                  </span>
                )}
                {!last && (
                  <ChevronRight
                    className={cn(
                      "h-3 w-3 shrink-0",
                      onDark ? "text-text-invert-soft" : "text-text-soft",
                    )}
                    aria-hidden
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
