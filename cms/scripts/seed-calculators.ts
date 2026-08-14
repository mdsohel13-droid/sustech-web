/**
 * Seed EVERY built-in calculator as a knowledge-resource (idempotent), so the
 * full set shows in the /knowledge "Calculators" tab + sitemap. The hub lists
 * from the CMS (knowledge-resources), not the code registry — so a calculator
 * with a working page at /knowledge/calculators/<type> is still invisible on the
 * hub until a knowledge-resource row exists. This seed keeps them in sync:
 * it upserts one row per entry in CALCULATOR_META (the source of truth).
 *
 * Run after adding a calculator, or to backfill missing ones:  pnpm seed:calculators
 *
 * Idempotent: matches existing rows by calcType (updates title/description/order,
 * never disables a row an admin turned off — `enabled` is only set on create).
 */
import { getPayload } from "payload";
import config from "../../payload.config";
import { CALCULATOR_META, CALC_ORDER } from "../../components/calculators/calculator-meta";
import type { CalcType } from "../collections/knowledge-resources";

async function main(): Promise<void> {
  const payload = await getPayload({ config });
  let created = 0;
  let updated = 0;

  for (const [calcType, meta] of Object.entries(CALCULATOR_META) as [
    CalcType,
    (typeof CALCULATOR_META)[CalcType],
  ][]) {
    const orderIdx = CALC_ORDER.indexOf(calcType);
    const order = orderIdx >= 0 ? (orderIdx + 1) * 10 : 100;

    const existing = await payload.find({
      collection: "knowledge-resources",
      where: { calcType: { equals: calcType } },
      limit: 1,
      overrideAccess: true,
    });

    if (existing.docs[0]) {
      // Refresh title/description/order; preserve the admin's enabled toggle.
      await payload.update({
        collection: "knowledge-resources",
        id: existing.docs[0].id,
        data: {
          title: meta.title,
          type: "calculator",
          calcType,
          description: meta.description,
          order,
        } as never,
        overrideAccess: true,
      });
      updated += 1;
    } else {
      await payload.create({
        collection: "knowledge-resources",
        data: {
          title: meta.title,
          type: "calculator",
          calcType,
          description: meta.description,
          order,
          enabled: true,
        } as never,
        overrideAccess: true,
      });
      created += 1;
    }
  }

  payload.logger.info(
    `Calculators synced to Knowledge Hub: ${created} created, ${updated} updated (${created + updated}/10).`,
  );
  process.exit(0);
}

void main();
