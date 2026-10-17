/**
 * apply-sector-faqs.ts — patch ONLY the `faqs` field of each sector from
 * ./sector-faqs, nothing else.
 *
 * Unlike `pnpm seed` (which upserts every collection and would revert admin
 * edits), this updates one field on existing sector documents. Safe on a live DB.
 *
 * Usage (where DATABASE_URI points at the target DB — e.g. on the VPS):
 *   pnpm apply:sector-faqs
 *
 * Sector pages are statically generated, so rebuild + restart afterwards for the
 * new FAQs (and their FAQPage JSON-LD) to appear on the live site.
 */
import "./load-env";
import { getPayload } from "payload";
import config from "../../payload.config";
import { SECTOR_FAQS } from "./sector-faqs";

async function main(): Promise<void> {
  const payload = await getPayload({ config });
  let updated = 0;
  for (const [slug, faqs] of Object.entries(SECTOR_FAQS)) {
    const found = await payload.find({
      collection: "sectors",
      where: { slug: { equals: slug } },
      limit: 1,
    });
    const doc = found.docs[0];
    if (!doc) {
      payload.logger.warn(`apply-sector-faqs: no sector found for slug "${slug}" — skipped.`);
      continue;
    }
    await payload.update({ collection: "sectors", id: doc.id, data: { faqs } });
    updated += 1;
  }
  payload.logger.info(`apply-sector-faqs: updated FAQs on ${updated} sector(s).`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
