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
import { getActiveSources, getNewsItems, getServices, getSectors } from "@/lib/payload";

// ── Canonical standards / world-class references ────────────────────────────
// Stable, published engineering standards & authorities the topics map to. These
// are real, citable references (not company facts) — the engine must ground claims
// in these plus the live `sources` registry, never invent.
const STANDARDS_REFERENCES: { name: string; publisher: string; url: string; topic: string }[] = [
  {
    name: "IEC 62305",
    publisher: "IEC",
    url: "https://webstore.iec.ch/publication/6793",
    topic: "lightning protection",
  },
  {
    name: "NFPA 780",
    publisher: "NFPA",
    url: "https://www.nfpa.org/codes-and-standards/nfpa-780-standard-development/780",
    topic: "lightning protection",
  },
  {
    name: "IEEE 80",
    publisher: "IEEE",
    url: "https://standards.ieee.org/ieee/80/4ft_priority/",
    topic: "substation earthing/grounding",
  },
  {
    name: "IEC 60364",
    publisher: "IEC",
    url: "https://webstore.iec.ch/publication/64977",
    topic: "low-voltage electrical installations",
  },
  {
    name: "BNBC 2020",
    publisher: "HBRI / Government of Bangladesh",
    url: "https://hbri.gov.bd",
    topic: "building & electrical code (Bangladesh)",
  },
  {
    name: "SREDA Net Metering Guidelines",
    publisher: "SREDA",
    url: "https://sreda.gov.bd",
    topic: "rooftop solar net metering (Bangladesh)",
  },
  {
    name: "IEC 62446",
    publisher: "IEC",
    url: "https://webstore.iec.ch/publication/61667",
    topic: "PV system commissioning & testing",
  },
  {
    name: "IEC 62619",
    publisher: "IEC",
    url: "https://webstore.iec.ch/publication/64073",
    topic: "BESS / Li-ion battery safety",
  },
];

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
6. NEVER invent statistics about Sustech projects, client names, or certifications.
   Only reference confirmed facts. When you state a standard, figure, tariff or rule,
   it MUST come from the provided authoritativeSources / standardsReferences below.
7. GROUND EVERY ARTICLE IN THE PROVIDED REFERENCES. Use at least 2 entries from
   authoritativeSources or standardsReferences, and put them in the article's
   sources (source + sourceUrl). Prefer tier1-gov / standards bodies (IEC, NFPA,
   IEEE, SREDA, BERC, BNBC). If you cannot ground a claim in a provided reference,
   omit the claim — do not guess a number or a URL.
8. Cite the exact standard designation where relevant (e.g. "IEC 62305" for LPS,
   "IEEE 80" for substation earthing, "SREDA net-metering guidelines" for rooftop
   solar) — these are the terms buyers and evaluators screen on.
9. Keep body between 400–800 words. Quality over length.
`.trim();

// ── Route handler ────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [recentNews, services, sectors, sources] = await Promise.all([
    getNewsItems({ limit: 60 }),
    getServices(),
    getSectors(),
    getActiveSources(),
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

  // Evergreen topic calendar — each entry maps to a canonical standard/authority so
  // the generated article can be grounded in a real reference (see standardsReferences).
  const suggestedTopics: string[] = [
    "IEC 62305 lightning protection design explained for Bangladesh factories",
    "IEEE 80 substation earthing: why sub-1Ω matters and how it's tested",
    "SREDA net metering in Bangladesh: current rules and factory rooftop ROI",
    "Commercial rooftop solar payback for RMG factories — a worked example",
    "BESS for C&I facilities: LFP vs lead-acid and IEC 62619 safety",
    "IEC 62446 PV commissioning tests every rooftop plant should pass",
    "DIFE / RSC electrical inspection readiness checklist for garment factories",
    "IEC 60364 low-voltage installation essentials for industrial buildings",
    "BNBC 2020 electrical & lightning provisions: what a factory must comply with",
    "Power factor correction: cutting industrial electricity bills the right way",
    "BERC tariff changes and their impact on C&I solar ROI",
    "Grid-tie vs hybrid vs off-grid solar: choosing for a Bangladeshi industry",
  ];

  // World-class reference set the engine must cite from (live registry + standards).
  const authoritativeSources = sources
    .map((s) => ({ name: s.name, url: s.url, tier: s.tier ?? null }))
    .filter((s) => s.name && s.url);

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    existingTopics: recentTitles,
    existingServices: services.map((s) => s.title),
    existingSectors: sectors.map((s) => s.title),
    contentGaps,
    categoryCounts,
    suggestedTopics,
    authoritativeSources,
    standardsReferences: STANDARDS_REFERENCES,
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
