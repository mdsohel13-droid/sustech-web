/**
 * Seed the source registry with the 26 named real sources (master plan §3.1b).
 * Idempotent: upserts by `url`, so re-running updates metadata without
 * duplicating or clobbering the watcher's bookkeeping fields.
 *
 * Run: pnpm seed:sources
 */
import { getPayload } from "payload";
import config from "../../payload.config";

type Tier = "tier1-gov" | "tier1-multilateral" | "tier2-analyst" | "tier3-press";
type Freq = "daily" | "weekly" | "monthly" | "quarterly";
type Method = "rss" | "html" | "pdf-link";

interface SeedSource {
  name: string;
  url: string;
  checkUrl?: string;
  tier: Tier;
  checkFrequency: Freq;
  fetchMethod?: Method;
  language?: "en" | "bn" | "both";
  paywalled?: boolean;
}

const SOURCES: SeedSource[] = [
  {
    name: "SREDA",
    url: "https://sreda.gov.bd",
    tier: "tier1-gov",
    checkFrequency: "weekly",
    language: "both",
  },
  {
    name: "SREDA National RE Database",
    url: "https://renewableenergy.gov.bd",
    tier: "tier1-gov",
    checkFrequency: "weekly",
    language: "en",
  },
  {
    name: "BPDB",
    url: "https://bpdb.gov.bd",
    tier: "tier1-gov",
    checkFrequency: "weekly",
    language: "both",
  },
  {
    name: "BERC — tariff orders",
    url: "https://berc.org.bd",
    checkUrl: "https://berc.org.bd/site/page/tariff-order",
    tier: "tier1-gov",
    checkFrequency: "daily",
    language: "both",
  },
  {
    name: "DPDC tariff schedule",
    url: "https://dpdc.org.bd",
    tier: "tier1-gov",
    checkFrequency: "weekly",
    language: "both",
  },
  {
    name: "DESCO tariff schedule",
    url: "https://desco.org.bd",
    tier: "tier1-gov",
    checkFrequency: "weekly",
    language: "both",
  },
  {
    name: "Bangladesh Bank — circulars & Sustainable Finance",
    url: "https://www.bb.org.bd",
    checkUrl: "https://www.bb.org.bd/en/index.php/mediaroom/circular",
    tier: "tier1-gov",
    checkFrequency: "daily",
    language: "both",
  },
  {
    name: "BIDA",
    url: "https://bida.gov.bd",
    tier: "tier1-gov",
    checkFrequency: "weekly",
    language: "both",
  },
  {
    name: "NBR — SROs & solar import duty",
    url: "https://nbr.gov.bd",
    tier: "tier1-gov",
    checkFrequency: "weekly",
    language: "both",
  },
  {
    name: "Power Division / MoPEMR — IEPMP",
    url: "https://powerdivision.gov.bd",
    tier: "tier1-gov",
    checkFrequency: "monthly",
    language: "both",
  },
  {
    name: "IDCOL",
    url: "https://idcol.org",
    tier: "tier1-gov",
    checkFrequency: "monthly",
    language: "en",
  },
  {
    name: "Bangladesh Bureau of Statistics (BBS)",
    url: "https://bbs.gov.bd",
    tier: "tier1-gov",
    checkFrequency: "quarterly",
    language: "both",
  },
  {
    name: "The Daily Star — Business/Energy",
    url: "https://www.thedailystar.net",
    checkUrl: "https://www.thedailystar.net/business/rss.xml",
    tier: "tier3-press",
    checkFrequency: "daily",
    fetchMethod: "rss",
    language: "en",
  },
  {
    name: "Prothom Alo",
    url: "https://www.prothomalo.com",
    tier: "tier3-press",
    checkFrequency: "daily",
    fetchMethod: "rss",
    language: "bn",
  },
  {
    name: "The Business Standard",
    url: "https://www.tbsnews.net",
    tier: "tier3-press",
    checkFrequency: "daily",
    fetchMethod: "rss",
    language: "en",
  },
  {
    name: "The Financial Express",
    url: "https://thefinancialexpress.com.bd",
    tier: "tier3-press",
    checkFrequency: "daily",
    fetchMethod: "rss",
    language: "en",
  },
  {
    name: "World Bank — Bangladesh energy",
    url: "https://www.worldbank.org/en/country/bangladesh",
    tier: "tier1-multilateral",
    checkFrequency: "monthly",
    language: "en",
  },
  {
    name: "ADB — Bangladesh energy",
    url: "https://www.adb.org/where-we-work/bangladesh",
    tier: "tier1-multilateral",
    checkFrequency: "monthly",
    language: "en",
  },
  {
    name: "IFC (incl. EDGE)",
    url: "https://www.ifc.org",
    tier: "tier1-multilateral",
    checkFrequency: "monthly",
    language: "en",
  },
  {
    name: "International Energy Agency (IEA)",
    url: "https://www.iea.org",
    tier: "tier1-multilateral",
    checkFrequency: "monthly",
    language: "en",
  },
  {
    name: "IRENA",
    url: "https://www.irena.org",
    tier: "tier1-multilateral",
    checkFrequency: "monthly",
    language: "en",
  },
  {
    name: "BloombergNEF",
    url: "https://about.bnef.com",
    tier: "tier2-analyst",
    checkFrequency: "monthly",
    language: "en",
    paywalled: true,
  },
  {
    name: "IEEFA — Bangladesh power analysis",
    url: "https://ieefa.org",
    tier: "tier2-analyst",
    checkFrequency: "weekly",
    language: "en",
  },
  {
    name: "PV Magazine",
    url: "https://www.pv-magazine.com",
    tier: "tier3-press",
    checkFrequency: "weekly",
    fetchMethod: "rss",
    language: "en",
  },
  {
    name: "Global Solar Atlas (WB/Solargis)",
    url: "https://globalsolaratlas.info",
    tier: "tier2-analyst",
    checkFrequency: "quarterly",
    language: "en",
  },
  {
    name: "USGBC LEED directory",
    url: "https://www.usgbc.org/projects",
    tier: "tier2-analyst",
    checkFrequency: "monthly",
    language: "en",
  },
];

async function main(): Promise<void> {
  const payload = await getPayload({ config });
  let created = 0;
  let updated = 0;

  for (const s of SOURCES) {
    const existing = await payload.find({
      collection: "sources",
      where: { url: { equals: s.url } },
      limit: 1,
      overrideAccess: true,
    });
    const data = {
      name: s.name,
      url: s.url,
      checkUrl: s.checkUrl,
      tier: s.tier,
      checkFrequency: s.checkFrequency,
      fetchMethod: s.fetchMethod ?? "html",
      fetchPolicy: "auto" as const,
      language: s.language ?? "en",
      paywalled: s.paywalled ?? false,
      active: true,
    };
    if (existing.docs[0]) {
      await payload.update({
        collection: "sources",
        id: existing.docs[0].id,
        data,
        overrideAccess: true,
      });
      updated += 1;
    } else {
      await payload.create({ collection: "sources", data, overrideAccess: true });
      created += 1;
    }
  }

  payload.logger.info(
    `Source registry seeded: ${created} created, ${updated} updated (${SOURCES.length} total).`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
