/**
 * Seed the VISIBLE Lead-Engine surface (idempotent). The engine code ships the
 * capabilities; this makes the high-value pieces show up for visitors without an
 * admin having to assemble them by hand:
 *   1. The three lead-magnet calculators as knowledge-resources → they appear in
 *      the /knowledge "Calculators" tab (the hub lists from the CMS, not the
 *      code registry).
 *   2. tariff-rates global → so every calculator shows a real "Rates source" line.
 *   3. next-best-actions global → per-segment CTA rules for the nextBestAction block.
 *
 * Run: pnpm seed:leadengine
 *
 * NOTE: segment landing pages + proofStrip/gatedAsset/relatedContent blocks are
 * intentionally NOT seeded — those are assembled per the brand in /admin (the
 * CMS-driven model). See the response notes / cutover checklist.
 */
import { getPayload } from "payload";
import config from "../../payload.config";

const CALCULATORS = [
  {
    calcType: "diesel-vs-bess",
    title: "Diesel vs Lithium (LFP) Battery — running cost",
    description:
      "Compare the monthly running cost of a diesel generator versus a grid/solar-charged LFP " +
      "battery for backup, using cited Bangladesh tariffs. Get a sourced report by email.",
    order: 1,
  },
  {
    calcType: "atm-ups-sizing",
    title: "ATM / branch UPS & battery sizing",
    description:
      "Size an online UPS and battery bank to keep ATMs or a bank branch running through an " +
      "outage. For banks & financial institutions.",
    order: 2,
  },
  {
    calcType: "outage-cost",
    title: "Cost of power outages",
    description:
      "Estimate what unplanned load-shedding costs your operation each month — lost revenue " +
      "plus idle staff — and the diesel cost of covering it.",
    order: 3,
  },
] as const;

const NBA_RULES = [
  {
    segment: "rmg-factory",
    note: "Cutting your factory's energy bill?",
    ctaLabel: "Run the Diesel-vs-BESS calculator",
    ctaHref: "/knowledge/calculators/diesel-vs-bess",
  },
  {
    segment: "bank-financial",
    note: "Keeping ATMs online through outages?",
    ctaLabel: "Size your branch UPS",
    ctaHref: "/knowledge/calculators/atm-ups-sizing",
  },
  {
    segment: "commercial-building",
    note: "Counting the cost of load-shedding?",
    ctaLabel: "Estimate your outage cost",
    ctaHref: "/knowledge/calculators/outage-cost",
  },
  {
    segment: "real-estate",
    note: "Planning power for a new development?",
    ctaLabel: "Request a free assessment",
    ctaHref: "/request-quote",
  },
  {
    segment: "foreign-investor",
    note: "Exploring BD energy investment?",
    ctaLabel: "Talk to our engineers",
    ctaHref: "/request-quote",
  },
];

async function main(): Promise<void> {
  const payload = await getPayload({ config });
  let created = 0;
  let updated = 0;

  // 1) Calculators as knowledge-resources (upsert by calcType)
  for (const c of CALCULATORS) {
    const existing = await payload.find({
      collection: "knowledge-resources",
      where: { calcType: { equals: c.calcType } },
      limit: 1,
      overrideAccess: true,
    });
    const data = {
      title: c.title,
      type: "calculator" as const,
      calcType: c.calcType,
      description: c.description,
      order: c.order,
      enabled: true,
    };
    if (existing.docs[0]) {
      await payload.update({
        collection: "knowledge-resources",
        id: existing.docs[0].id,
        data: data as never,
        overrideAccess: true,
      });
      updated += 1;
    } else {
      await payload.create({
        collection: "knowledge-resources",
        data: data as never,
        overrideAccess: true,
      });
      created += 1;
    }
  }

  // 2) Tariff rates — catalog reference values (human-verify + add source URLs later)
  await payload.updateGlobal({
    slug: "tariff-rates",
    overrideAccess: true,
    data: {
      industrialFlatBdtPerKwh: 11.5,
      commercialFlatBdtPerKwh: 13.0,
      electricitySourceLabel: "BERC retail tariff notification",
      dieselPriceBdtPerLitre: 105,
      dieselGenEfficiencyKwhPerLitre: 3.2,
      dieselMaintenanceBdtPerKwh: 1.5,
      dieselSourceLabel: "BPC retail diesel price",
      bessRoundTripEfficiency: 0.92,
      solarYieldKwhPerKwpDay: 4.2,
    } as never,
  });

  // 3) Next-best-action rules
  await payload.updateGlobal({
    slug: "next-best-actions",
    overrideAccess: true,
    data: {
      rules: NBA_RULES,
      fallbackLabel: "Request a free assessment",
      fallbackHref: "/request-quote",
      fallbackNote: "Not sure where to start?",
    } as never,
  });

  payload.logger.info(
    `Lead-engine surface seeded: ${created} calculators created, ${updated} updated; tariff-rates + next-best-actions globals set.`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
