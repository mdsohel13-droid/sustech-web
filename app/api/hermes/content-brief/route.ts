/**
 * GET /api/hermes/content-brief
 *
 * Returns a structured brief for the Hermes AI content agent so it can decide
 * what to write each day. Hermes calls this before generating content.
 *
 * Security: same Bearer token as /api/hermes/ingest
 *
 * Response JSON:
 * {
 *   generatedAt: string,           // ISO timestamp
 *   existingTopics: string[],      // titles of published news items (last 30 days)
 *   existingServices: string[],    // service names — context for relevance
 *   existingSectors: string[],     // sectors Sustech serves
 *   contentGaps: string[],         // categories with no recent content
 *   suggestedTopics: string[],     // AI-ready topic prompts
 *   geoInstructions: string,       // standing GEO/AEO writing instructions for Hermes
 *   ingestEndpoint: string,        // where to POST the finished draft
 *   categories: string[],          // valid category values
 * }
 */
import { NextRequest, NextResponse } from "next/server";
import { getNewsItems, getServices, getSectors } from "@/lib/payload";

// ── Auth ─────────────────────────────────────────────────────────────────────

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.HERMES_AGENT_SECRET;
  if (!secret) return false;
  const auth = req.headers.get("authorization") ?? "";
  return auth === `Bearer ${secret}`;
}

// ── Standing GEO/AEO writing instructions for Hermes ────────────────────────

const GEO_INSTRUCTIONS = `
You are writing GEO/AEO-optimized content for the Sustech Technology Ltd website.
Sustech is a Bangladesh-based EPC engineering firm specialising in Solar & Energy,
Electrical EPC, Grounding & Lightning Protection, and Smart Building Systems.
Target clients: corporate, commercial, and industrial (C&I) buyers in Bangladesh.

WRITING RULES:
1. LEAD WITH THE DIRECT ANSWER. The first 1–2 sentences of every section must
   directly answer the implied question — never bury the answer.
2. SUMMARY FIELD is the TL;DR. Write it as if answering "What is this article about?"
   in one sentence. AI engines use this as the citation snippet.
3. Be specific and factual. "Solar EPC contractors in Bangladesh" is better than
   "solar energy solutions". Specific numbers (MW capacity, % savings, kWh) are
   citable by AI engines; vague language is not.
4. FAQ ARRAY: add 3–5 question-answer pairs per article. Frame questions as buyers
   would ask them: "How much does...", "What is the payback period...", "Which
   standard applies to...". Answers must be direct (no "it depends" without specifics).
5. Use CATEGORY correctly:
   - company-update: Sustech news only (needs human approval before publishing)
   - industry-news: external industry/policy/market news
   - product-update: equipment or technology updates (needs human approval)
   - ai-tech: AI and emerging technology for EPC
   - market-insight: market analysis, regulatory changes, incentives
6. NEVER invent statistics about Sustech projects. Only reference confirmed facts.
7. For industry-news and market-insight, cite the source (source + sourceUrl fields).
8. Keep body between 400–800 words. Quality over length.
`.trim();

// ── Route handler ────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [recentNews, services, sectors] = await Promise.all([
    getNewsItems({ limit: 60 }),
    getServices(),
    getSectors(),
  ]);

  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:4123";

  // Topics published in the last 30 days
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recentTitles = recentNews
    .filter((n) => {
      const d = n.publishedDate ? new Date(n.publishedDate).getTime() : 0;
      return d > thirtyDaysAgo;
    })
    .map((n) => n.title);

  // Count recent articles per category
  const categoryCounts: Record<string, number> = {
    "company-update": 0,
    "industry-news": 0,
    "product-update": 0,
    "ai-tech": 0,
    "market-insight": 0,
  };
  recentNews.forEach((n) => {
    if (n.category && n.category in categoryCounts) {
      categoryCounts[n.category] = (categoryCounts[n.category] ?? 0) + 1;
    }
  });

  // Identify content gaps (categories with < 2 articles in the last 30 days)
  const contentGaps = Object.entries(categoryCounts)
    .filter(([, count]) => count < 2)
    .map(([cat]) => cat);

  // Suggested topics — generic enough to be useful daily
  const suggestedTopics: string[] = [
    "Bangladesh solar energy policy update and SREDA incentives 2025",
    "Commercial rooftop solar ROI guide for Dhaka factories",
    "IEC 62305 lightning protection standard explained for Bangladesh engineers",
    "BESS battery storage options for C&I facilities in Bangladesh",
    "Smart building automation trends for industrial facilities",
    "Electrical EPC project checklist: what to verify before commissioning",
    "Earthing system design for high-rise buildings — Bangladesh BNBC standards",
    "Net metering in Bangladesh: current rules and how factories benefit",
    "AI-driven solar yield prediction tools for project developers",
    "Grid-tie vs off-grid vs hybrid solar: comparison for Bangladeshi industries",
    "Why power factor correction matters for industrial electricity bills",
    "BERC electricity tariff update and impact on C&I solar ROI",
  ];

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    existingTopics: recentTitles,
    existingServices: services.map((s) => s.title),
    existingSectors: sectors.map((s) => s.title),
    contentGaps,
    categoryCounts,
    suggestedTopics,
    geoInstructions: GEO_INSTRUCTIONS,
    ingestEndpoint: `${serverUrl}/api/hermes/ingest`,
    categories: ["company-update", "industry-news", "product-update", "ai-tech", "market-insight"],
    autoPublishNote:
      "Set HERMES_AUTO_PUBLISH_CATEGORIES on the server to auto-publish low-risk categories " +
      "(e.g. 'industry-news,ai-tech,market-insight'). company-update and product-update always " +
      "require human review.",
  });
}

export function POST() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
