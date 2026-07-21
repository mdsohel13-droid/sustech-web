/**
 * Content-health audit (evergreen engine Tier-0). A read-only sweep over the CMS
 * that flags accessibility/SEO/funnel regressions so they can be fixed before they
 * cost ranking or citations. Pure check functions (testable) + a DB-backed runner.
 * Never throws — a failed audit must never break the cron that calls it.
 */

export interface HealthIssue {
  collection: string;
  id: number | string;
  title: string;
  /** where to fix it (public path or /admin link) */
  path: string;
  problem: string;
}

interface SeoDoc {
  id: number | string;
  slug?: string | null;
  title?: string | null;
  name?: string | null;
  _status?: string | null;
  seo?: { title?: string | null; description?: string | null } | null;
}
interface MediaDoc {
  id: number | string;
  alt?: string | null;
  filename?: string | null;
}
interface SectorDoc {
  id: number | string;
  slug?: string | null;
  title?: string | null;
  proofStats?: unknown[] | null;
  faqs?: unknown[] | null;
  leadMagnet?: unknown;
}

const isPublished = (d: { _status?: string | null }): boolean =>
  !d._status || d._status === "published";
const titleOf = (d: SeoDoc): string => d.title || d.name || String(d.id);
const blank = (s?: string | null): boolean => !s || !s.trim();

/** Media without alt text — an a11y + SEO gap (also what the site audit flagged). */
export function checkMediaAlt(media: MediaDoc[]): HealthIssue[] {
  return media
    .filter((m) => blank(m.alt))
    .map((m) => ({
      collection: "media",
      id: m.id,
      title: m.filename || String(m.id),
      path: `/admin/collections/media/${m.id}`,
      problem: "missing alt text",
    }));
}

/** Published documents missing an SEO meta description. */
export function checkSeoDescription(
  collection: string,
  docs: SeoDoc[],
  pathOf: (slug: string) => string,
): HealthIssue[] {
  return docs
    .filter(isPublished)
    .filter((d) => blank(d.seo?.description))
    .map((d) => ({
      collection,
      id: d.id,
      title: titleOf(d),
      path: d.slug ? pathOf(d.slug) : `/admin/collections/${collection}/${d.id}`,
      problem: "missing SEO meta description",
    }));
}

/** Sectors whose world-class funnel (plan 3·1) isn't filled in yet. */
export function checkSectorFunnel(sectors: SectorDoc[]): HealthIssue[] {
  const issues: HealthIssue[] = [];
  for (const s of sectors) {
    const gaps: string[] = [];
    if (!s.proofStats?.length) gaps.push("proof figures");
    if (!s.faqs?.length) gaps.push("FAQ");
    if (!s.leadMagnet) gaps.push("lead magnet");
    if (gaps.length > 0) {
      issues.push({
        collection: "sectors",
        id: s.id,
        title: s.title || String(s.id),
        path: s.slug ? `/solutions/${s.slug}` : `/admin/collections/sectors/${s.id}`,
        problem: `sector funnel incomplete: no ${gaps.join(", ")}`,
      });
    }
  }
  return issues;
}

export interface HealthReport {
  checkedAt: string;
  total: number;
  byProblem: Record<string, number>;
  issues: HealthIssue[];
}

export function summarise(issues: HealthIssue[]): HealthReport {
  const byProblem: Record<string, number> = {};
  for (const i of issues) {
    const key = i.problem.split(":")[0]?.trim() ?? i.problem;
    byProblem[key] = (byProblem[key] ?? 0) + 1;
  }
  return { checkedAt: new Date().toISOString(), total: issues.length, byProblem, issues };
}

export async function runContentHealthAudit(): Promise<HealthReport> {
  const issues: HealthIssue[] = [];
  try {
    // Lazy import so the pure checks above stay unit-testable without loading the
    // Payload config (which needs the Next/runtime alias).
    const { getPayloadClient } = await import("./payload");
    const payload = await getPayloadClient();
    const docs = async (collection: string): Promise<unknown[]> => {
      try {
        const res = await payload.find({
          collection: collection as never,
          depth: 0,
          limit: 500,
          overrideAccess: true,
        });
        return res.docs;
      } catch {
        return [];
      }
    };

    const [media, pages, services, projects, articles, news, sectors] = await Promise.all([
      docs("media"),
      docs("pages"),
      docs("services"),
      docs("projects"),
      docs("articles"),
      docs("news-items"),
      docs("sectors"),
    ]);

    issues.push(...checkMediaAlt(media as MediaDoc[]));
    issues.push(...checkSeoDescription("pages", pages as SeoDoc[], (s) => `/${s}`));
    issues.push(...checkSeoDescription("services", services as SeoDoc[], (s) => `/services/${s}`));
    issues.push(...checkSeoDescription("projects", projects as SeoDoc[], (s) => `/projects/${s}`));
    issues.push(...checkSeoDescription("articles", articles as SeoDoc[], (s) => `/knowledge/${s}`));
    issues.push(...checkSeoDescription("news-items", news as SeoDoc[], (s) => `/news/${s}`));
    issues.push(...checkSectorFunnel(sectors as SectorDoc[]));
  } catch {
    /* best-effort — never throw */
  }
  return summarise(issues);
}
