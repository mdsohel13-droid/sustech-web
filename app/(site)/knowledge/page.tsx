/**
 * /knowledge — Knowledge Hub index
 *
 * Shows three sections driven by URL search param `?tab=`:
 *   articles    — CMS-authored engineering guides and notes
 *   calculators — Built-in interactive calculators (CMS-enabled)
 *   downloads   — Sample documents and templates (CMS-managed)
 *
 * Each section is server-rendered → fully crawlable and citable by AI engines.
 * The tab strip uses <a href="?tab=..."> links so JS is not required for navigation.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { GridMotif } from "@/components/ui/grid-motif";
import { Section } from "@/components/ui/section";
import type { KnowledgeResource } from "@/payload-types";
import { CALCULATOR_REGISTRY } from "@/components/calculators/calculator-registry";
import { getArticles, getKnowledgeResources } from "@/lib/payload";
import { serverUrl } from "@/lib/seo";

export const revalidate = 3600;

const TITLE = "Knowledge Hub";
const LEDE =
  "Engineering guides, interactive calculators, and downloadable templates for industrial power, solar, grounding, and lightning protection — written and curated by Sustech's engineering team.";

const TABS = [
  { key: "articles", label: "Articles & Guides" },
  { key: "calculators", label: "Calculators" },
  { key: "downloads", label: "Downloads" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

export function generateMetadata(): Metadata {
  const noindex = process.env.SITE_INDEXABLE !== "true";
  return {
    title: { absolute: `${TITLE} · Sustech Technology Ltd` },
    description: LEDE,
    alternates: { canonical: "/knowledge" },
    robots: noindex ? { index: false, follow: false } : undefined,
  };
}

function formatDate(value?: string | null): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "long" }).format(d);
}

// ── Media URL helper ──────────────────────────────────────────────────────────
function resolveDownloadUrl(r: KnowledgeResource): string | null {
  if (r.fileUrl) return r.fileUrl;
  if (r.fileUpload && typeof r.fileUpload === "object" && "url" in r.fileUpload) {
    return (r.fileUpload as { url?: string }).url ?? null;
  }
  return null;
}

const FORMAT_BADGE: Record<string, { label: string; colour: string }> = {
  pdf: { label: "PDF", colour: "bg-red-100 text-red-700" },
  docx: { label: "DOCX", colour: "bg-blue-100 text-blue-700" },
  xlsx: { label: "XLSX", colour: "bg-green-100 text-green-700" },
  zip: { label: "ZIP", colour: "bg-amber-100 text-amber-700" },
  other: { label: "FILE", colour: "bg-gray-100 text-gray-700" },
};

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function KnowledgeIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab: rawTab } = await searchParams;
  const activeTab: TabKey =
    rawTab === "calculators" || rawTab === "downloads" ? rawTab : "articles";

  const [articles, resources] = await Promise.all([getArticles(), getKnowledgeResources()]);

  const calculators = resources.filter((r) => r.type === "calculator");
  const downloads = resources.filter((r) => r.type === "sample");

  // Build ItemList entities for schema
  const allItems = [
    ...articles.map((a, i) => ({
      "@type": "ListItem" as const,
      position: i + 1,
      url: `${serverUrl}/knowledge/${a.slug}`,
      name: a.title,
    })),
    ...calculators.map((c, i) => ({
      "@type": "ListItem" as const,
      position: articles.length + i + 1,
      url: `${serverUrl}/knowledge/calculators/${c.calcType ?? ""}`,
      name: c.title,
    })),
  ];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: TITLE,
          description: LEDE,
          url: `${serverUrl}/knowledge`,
          mainEntity: {
            "@type": "ItemList",
            itemListElement: allItems,
          },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: serverUrl },
            { "@type": "ListItem", position: 2, name: TITLE, item: `${serverUrl}/knowledge` },
          ],
        }}
      />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="bg-ink-900 text-text-invert relative isolate overflow-hidden">
        <GridMotif tone="dark" />
        <Container className="relative py-20 md:py-28">
          <Eyebrow onDark>Insights</Eyebrow>
          <h1 className="text-display mt-4 max-w-3xl font-bold text-balance">{TITLE}</h1>
          <p className="text-lede text-text-invert-soft mt-4 max-w-2xl">{LEDE}</p>
        </Container>
      </section>

      {/* ── Tabs ─────────────────────────────────────────────────────── */}
      <div className="border-border sticky top-0 z-10 border-b bg-white/95 backdrop-blur-sm">
        <Container>
          <nav
            aria-label="Knowledge Hub sections"
            className="flex [scrollbar-width:none] gap-1 overflow-x-auto py-0 [-ms-overflow-style:none]"
          >
            {TABS.map((t) => {
              const isActive = activeTab === t.key;
              return (
                <a
                  key={t.key}
                  href={`/knowledge?tab=${t.key}`}
                  aria-current={isActive ? "page" : undefined}
                  className={`border-b-2 px-4 py-3.5 text-sm font-semibold whitespace-nowrap transition-colors ${
                    isActive
                      ? "border-brand text-brand"
                      : "text-text-soft hover:text-ink-900 border-transparent"
                  }`}
                >
                  {t.label}
                  {t.key === "calculators" && calculators.length > 0 && (
                    <span className="bg-surface-3 text-text-soft ml-1.5 rounded-full px-1.5 py-0.5 text-xs">
                      {calculators.length}
                    </span>
                  )}
                  {t.key === "downloads" && downloads.length > 0 && (
                    <span className="bg-surface-3 text-text-soft ml-1.5 rounded-full px-1.5 py-0.5 text-xs">
                      {downloads.length}
                    </span>
                  )}
                </a>
              );
            })}
          </nav>
        </Container>
      </div>

      {/* ── Articles ─────────────────────────────────────────────────── */}
      {activeTab === "articles" && (
        <Section id="articles" srTitle="Articles & Guides">
          {articles.length === 0 ? (
            <p className="text-text-soft border-border bg-surface-2 rounded-lg border border-dashed px-6 py-12 text-center">
              Articles are on the way — check back soon.
            </p>
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((a) => {
                const date = formatDate(a.publishedDate);
                return (
                  <li key={a.id}>
                    <Card interactive className="relative flex h-full flex-col p-6">
                      <h2 className="text-h3 text-ink-900 font-semibold">{a.title}</h2>
                      {a.excerpt && (
                        <p className="text-text-soft mt-2 flex-1 text-[0.9375rem]">{a.excerpt}</p>
                      )}
                      {(a.author || date) && (
                        <p className="text-text-soft mt-4 font-mono text-xs tracking-[0.04em] uppercase">
                          {[a.author, date].filter(Boolean).join(" · ")}
                        </p>
                      )}
                      <Link
                        href={`/knowledge/${a.slug}`}
                        prefetch={false}
                        aria-label={`${a.title} — read article`}
                        className="focus-visible:outline-brand absolute inset-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2"
                      />
                    </Card>
                  </li>
                );
              })}
            </ul>
          )}
        </Section>
      )}

      {/* ── Calculators ──────────────────────────────────────────────── */}
      {activeTab === "calculators" && (
        <Section id="calculators" srTitle="Engineering Calculators">
          <div className="mb-8">
            <h2 className="text-h2 font-bold">Engineering Calculators</h2>
            <p className="text-text-soft mt-2 max-w-2xl">
              Interactive tools based on IEC standards and Bangladesh local data. All calculations
              are performed client-side — no data is sent to our servers.
            </p>
          </div>
          {calculators.length === 0 ? (
            <p className="text-text-soft border-border bg-surface-2 rounded-lg border border-dashed px-6 py-12 text-center">
              Calculators coming soon.
            </p>
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {calculators.map((c) => {
                const regMeta = c.calcType ? CALCULATOR_REGISTRY[c.calcType] : null;
                const icon = regMeta?.icon ?? "⚙️";
                const standards = regMeta?.standards ?? [];
                const href = `/knowledge/calculators/${c.calcType ?? ""}`;
                return (
                  <li key={c.id}>
                    <Card interactive className="relative flex h-full flex-col p-6">
                      <div className="mb-3 text-3xl" aria-hidden>
                        {icon}
                      </div>
                      <h3 className="text-h3 text-ink-900 font-semibold">{c.title}</h3>
                      {c.description && (
                        <p className="text-text-soft mt-2 flex-1 text-[0.9375rem]">
                          {c.description}
                        </p>
                      )}
                      {standards.length > 0 && (
                        <p className="text-text-soft mt-4 text-xs">
                          {standards.map((s) => (
                            <code
                              key={s}
                              className="bg-surface-3 mr-1 rounded px-1.5 py-0.5 font-mono text-[10px]"
                            >
                              {s}
                            </code>
                          ))}
                        </p>
                      )}
                      <Link
                        href={href}
                        prefetch={false}
                        aria-label={`Open ${c.title} calculator`}
                        className="focus-visible:outline-brand absolute inset-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2"
                      />
                    </Card>
                  </li>
                );
              })}
            </ul>
          )}
          <p className="text-text-soft mt-8 text-sm">
            All calculators use simplified models for estimation only. For bankable feasibility
            studies or site-specific designs,{" "}
            <Link href="/request-quote" className="text-brand font-medium hover:underline">
              request a consultation
            </Link>
            .
          </p>
        </Section>
      )}

      {/* ── Downloads ────────────────────────────────────────────────── */}
      {activeTab === "downloads" && (
        <Section id="downloads" srTitle="Sample Documents & Templates">
          <div className="mb-8">
            <h2 className="text-h2 font-bold">Sample Documents & Templates</h2>
            <p className="text-text-soft mt-2 max-w-2xl">
              RFQ templates, test report formats, spec sheets, and engineering checklists. Free to
              download and adapt for your projects.
            </p>
          </div>
          {downloads.length === 0 ? (
            <p className="text-text-soft border-border bg-surface-2 rounded-lg border border-dashed px-6 py-12 text-center">
              Sample documents are coming soon. Check back or{" "}
              <Link href="/contact" className="text-brand hover:underline">
                contact us
              </Link>{" "}
              for project-specific templates.
            </p>
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {downloads.map((d) => {
                const url = resolveDownloadUrl(d);
                const fmtInfo = d.fileFormat ? FORMAT_BADGE[d.fileFormat] : null;
                return (
                  <li key={d.id}>
                    <Card className="flex h-full flex-col p-6">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-h3 text-ink-900 font-semibold">{d.title}</h3>
                        {fmtInfo && (
                          <span
                            className={`shrink-0 rounded px-2 py-0.5 text-xs font-bold tracking-wide uppercase ${fmtInfo.colour}`}
                          >
                            {fmtInfo.label}
                          </span>
                        )}
                      </div>
                      {d.description && (
                        <p className="text-text-soft mt-2 flex-1 text-[0.9375rem]">
                          {d.description}
                        </p>
                      )}
                      {d.fileSize && <p className="text-text-soft mt-3 text-xs">{d.fileSize}</p>}
                      {url ? (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="bg-brand hover:bg-brand-dark focus-visible:outline-brand mt-4 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                        >
                          {d.downloadLabel ?? "Download"}
                        </a>
                      ) : (
                        <p className="text-text-soft mt-4 text-sm italic">
                          Contact us to request this document.
                        </p>
                      )}
                    </Card>
                  </li>
                );
              })}
            </ul>
          )}
        </Section>
      )}
    </>
  );
}
