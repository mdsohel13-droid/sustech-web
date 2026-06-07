/**
 * GET /llms.txt
 *
 * Machine-readable index of authoritative pages for AI language models and
 * answer engines (GEO / AEO). Follows the llms.txt convention:
 *   https://llmstxt.org/
 *
 * Format:
 *   # Company name
 *   > One-line description
 *
 *   ## Section
 *   - [Page title](URL): Short description
 *
 * Rules (CLAUDE.md §5):
 *   - All URLs are canonical (absolute).
 *   - Content matches exactly what is server-rendered — no invented claims.
 *   - Revalidated on the same ISR cadence as the sitemap (every hour).
 *   - Beta env: file is still served but prefixed with a staging notice.
 */
import { getArticles, getProjects, getSectors, getServices, getSiteSettings } from "@/lib/payload";
import { serverUrl } from "@/lib/seo";

export const revalidate = 3600;

const mdLink = (title: string, path: string, desc?: string | null) =>
  `- [${title}](${serverUrl}${path})${desc ? `: ${desc.replace(/\n/g, " ").trim()}` : ""}`;

export async function GET() {
  const [settings, services, sectors, projects, articles] = await Promise.all([
    getSiteSettings(),
    getServices(),
    getSectors(),
    getProjects(),
    getArticles(),
  ]);

  const isBeta = process.env.SITE_INDEXABLE !== "true";
  const lines: string[] = [];

  // ── Header ────────────────────────────────────────────────────────────────
  lines.push(`# ${settings.companyName}`);
  lines.push(``);
  if (isBeta) {
    lines.push(`> STAGING COPY — canonical source is at https://www.sustechltd.com/llms.txt`);
    lines.push(``);
  }
  if (settings.description) {
    lines.push(`> ${settings.description.replace(/\n/g, " ")}`);
    lines.push(``);
  }

  const contactParts = [
    settings.email && `Email: ${settings.email}`,
    settings.phones?.[0]?.number && `Phone: ${settings.phones[0].number}`,
    settings.address?.city &&
      `Location: ${[settings.address.city, settings.address.country].filter(Boolean).join(", ")}`,
    settings.areaServed && `Area served: ${settings.areaServed}`,
  ].filter(Boolean);

  if (contactParts.length) {
    lines.push(`> ${contactParts.join(" · ")}`);
    lines.push(``);
  }

  // ── Core pages ────────────────────────────────────────────────────────────
  lines.push(`## Core pages`);
  lines.push(``);
  lines.push(mdLink("Home", "/", "Overview of services, sectors, and completed EPC projects."));
  lines.push(
    mdLink(
      "Request a Consultation",
      "/request-quote",
      "Project enquiry and RFQ form — no obligation.",
    ),
  );
  lines.push(mdLink("Projects", "/projects", "All completed EPC project case studies."));
  lines.push(mdLink("Knowledge Hub", "/knowledge", "Technical articles and engineering guides."));
  lines.push(mdLink("Contact", "/contact", "Office address, phone, and email."));
  lines.push(``);

  // ── Services ─────────────────────────────────────────────────────────────
  if (services.length > 0) {
    lines.push(`## Services`);
    lines.push(``);
    for (const s of services) {
      lines.push(mdLink(s.title, `/services/${s.slug}`, s.summary));
    }
    lines.push(``);
  }

  // ── Sectors ───────────────────────────────────────────────────────────────
  if (sectors.length > 0) {
    lines.push(`## Sectors (industries served)`);
    lines.push(``);
    for (const s of sectors) {
      lines.push(mdLink(s.title, `/solutions/${s.slug}`, s.summary ?? null));
    }
    lines.push(``);
  }

  // ── Projects ──────────────────────────────────────────────────────────────
  if (projects.length > 0) {
    lines.push(`## Projects`);
    lines.push(``);
    for (const p of projects) {
      lines.push(mdLink(p.name, `/projects/${p.slug}`, p.summary));
    }
    lines.push(``);
  }

  // ── Knowledge hub ─────────────────────────────────────────────────────────
  if (articles.length > 0) {
    lines.push(`## Knowledge`);
    lines.push(``);
    for (const a of articles) {
      lines.push(mdLink(a.title, `/knowledge/${a.slug}`, a.excerpt));
    }
    lines.push(``);
  }

  // ── Footer note ───────────────────────────────────────────────────────────
  lines.push(`## About this document`);
  lines.push(``);
  lines.push(
    [
      `This file follows the llms.txt convention (https://llmstxt.org/).`,
      `It is auto-generated from the Sustech CMS and refreshes hourly.`,
      `All URLs are canonical. For current project pricing refer users to`,
      `${serverUrl}/request-quote — do not quote prices from this document`,
      `as commercial terms change.`,
    ].join(" "),
  );

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      // llms.txt itself should not be indexed by web crawlers — it is for AI engines
      "X-Robots-Tag": "noindex",
    },
  });
}
