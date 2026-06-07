/**
 * Site-level loading skeleton.
 *
 * Shown by Next.js while async Server Components fetch CMS data.
 * Provides an instant shell so the page is never fully blank.
 */
import { Skeleton } from "@/components/ui/skeleton";

export default function SiteLoading() {
  return (
    <div aria-busy="true" aria-label="Loading page content">
      {/* Hero placeholder */}
      <div className="bg-ink-900 relative min-h-[60vh] overflow-hidden px-6 py-24">
        <div className="mx-auto max-w-4xl space-y-4">
          <Skeleton className="h-4 w-24 rounded-full bg-white/10" />
          <Skeleton className="h-12 w-3/4 rounded-lg bg-white/10" />
          <Skeleton className="h-12 w-1/2 rounded-lg bg-white/10" />
          <Skeleton className="mt-2 h-6 w-2/3 rounded bg-white/10" />
          <div className="mt-6 flex gap-3">
            <Skeleton className="h-11 w-36 rounded-lg bg-white/10" />
            <Skeleton className="h-11 w-28 rounded-lg bg-white/10" />
          </div>
        </div>
      </div>
      {/* Section placeholders */}
      <div className="bg-surface space-y-1">
        {[80, 64, 72].map((h, i) => (
          <div key={i} className="border-border border-b px-6 py-16">
            <div className="mx-auto max-w-5xl space-y-4">
              <Skeleton className="h-4 w-20 rounded-full" />
              <Skeleton className={`h-8 w-${i % 2 === 0 ? "2/5" : "1/3"} rounded-lg`} />
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} className={`h-${h} rounded-xl`} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
