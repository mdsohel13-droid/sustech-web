/**
 * apply-about.ts — update ONLY the /about page from ./about-content.
 *
 * Unlike `pnpm seed` (which upserts every collection and global and would revert
 * admin edits made in /admin), this touches a single Pages document and nothing
 * else. Safe to run against a live database.
 *
 * Usage (run where DATABASE_URI points at the target DB — e.g. on the VPS):
 *   pnpm apply:about
 *
 * The /about page is statically generated, so after this writes the DB you must
 * rebuild + restart the app (deploy.sh does the build/restart) for the new
 * content to appear on the live site.
 */
import "./load-env";
import { getPayload } from "payload";
import config from "../../payload.config";
import { aboutData } from "./about-content";

async function main(): Promise<void> {
  const payload = await getPayload({ config });
  const existing = await payload.find({
    collection: "pages",
    where: { slug: { equals: "about" } },
    limit: 1,
    draft: true,
  });
  const current = existing.docs[0];
  if (current) {
    await payload.update({ collection: "pages", id: current.id, data: aboutData });
    payload.logger.info("apply-about: updated the existing About page.");
  } else {
    await payload.create({ collection: "pages", data: aboutData });
    payload.logger.info("apply-about: created the About page.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
