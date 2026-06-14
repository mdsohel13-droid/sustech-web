/**
 * /review (Lead Engine master plan §3.2c). Admin-session-gated queue of pending
 * pipeline drafts. The email is the notifier; this page + /admin are the system
 * of record (every pending draft is always visible here even if email fails).
 * Always dynamic + noindex.
 */
import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { Section } from "@/components/ui/section";
import { Eyebrow } from "@/components/ui/eyebrow";
import { getPayloadClient } from "@/lib/payload";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Review queue · Sustech" },
  robots: { index: false, follow: false },
};

interface PendingDoc {
  collection: "articles" | "news-items";
  id: string | number;
  title: string;
  category?: string | null;
  changeSummary?: string;
  riskFlags: string[];
  pendingSince?: string | null;
}

export default async function ReviewPage() {
  const payload = await getPayloadClient();
  const h = await headers();
  const { user } = await payload.auth({ headers: h });
  const role = (user as { role?: string } | null)?.role;
  const allowed = role === "superAdmin" || role === "admin" || role === "editor";

  if (!allowed) {
    return (
      <Section containerSize="default">
        <div className="mx-auto max-w-xl text-center">
          <Eyebrow>Review queue</Eyebrow>
          <h1 className="text-h2 mt-3 font-bold">Please sign in</h1>
          <p className="text-text-soft mt-3">
            This page is for Sustech editors. Sign in to the{" "}
            <Link href="/admin" className="text-brand underline">
              admin
            </Link>{" "}
            first, then return here.
          </p>
        </div>
      </Section>
    );
  }

  const pending: PendingDoc[] = [];
  for (const collection of ["articles", "news-items"] as const) {
    const res = await payload.find({
      collection,
      where: { "revisionMeta.approvalState": { equals: "pending" } },
      draft: true,
      depth: 0,
      limit: 100,
      overrideAccess: true,
    });
    for (const d of res.docs) {
      const rm = (d as { revisionMeta?: Record<string, unknown> }).revisionMeta ?? {};
      pending.push({
        collection,
        id: d.id,
        title: (d as { title?: string }).title ?? "(untitled)",
        category: (d as { category?: string | null }).category,
        changeSummary: (rm.changeSummary as string) ?? "",
        riskFlags: (rm.riskFlags as string[]) ?? [],
        pendingSince: (rm.pendingSince as string) ?? null,
      });
    }
  }

  return (
    <Section containerSize="default">
      <Eyebrow>Review queue</Eyebrow>
      <h1 className="text-h1 mt-3 font-bold">Pending approvals</h1>
      <p className="text-text-soft mt-2">
        {pending.length === 0
          ? "Nothing waiting — you're all caught up."
          : `${pending.length} draft${pending.length > 1 ? "s" : ""} awaiting your approval.`}
      </p>

      <ul className="mt-8 space-y-4">
        {pending.map((d) => (
          <li
            key={`${d.collection}-${d.id}`}
            className="border-border bg-surface rounded-xl border p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-ink-900 font-semibold">{d.title}</p>
                <p className="text-text-soft text-sm">
                  {d.collection}
                  {d.category ? ` · ${d.category}` : ""}
                  {d.pendingSince
                    ? ` · pending since ${new Date(d.pendingSince).toLocaleString("en-GB")}`
                    : " · clock not started (email not delivered)"}
                </p>
              </div>
              {d.riskFlags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {d.riskFlags.map((f) => (
                    <span
                      key={f}
                      className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {d.changeSummary && (
              <p className="text-text-soft border-border mt-3 border-l-2 pl-3 text-sm">
                {d.changeSummary}
              </p>
            )}
            <div className="mt-4 flex gap-3 text-sm">
              <Link
                href={`/admin/collections/${d.collection}/${d.id}`}
                className="text-brand font-medium hover:underline"
              >
                Open in admin →
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
