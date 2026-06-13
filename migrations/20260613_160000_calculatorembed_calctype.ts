import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

/**
 * HOTFIX (Phase 3a gap). The calculatorEmbed block gained a `calcType` select
 * field in Phase 3a (inline-calculator mode), but its column was never added to
 * the migration — dev got it via push, production (migrate-only) did not. The
 * missing `pages_blocks_calculator_embed.calc_type` made every `pages` query
 * throw (home page 404, /api/pages 500). This adds the enum + column on the
 * block table and its draft-version shadow. Idempotent.
 */
export async function up({ db, payload }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_calculator_embed_calc_type" AS ENUM('solar-roi','earthing-resistance','cable-sizing','lightning-zone','solar-yield','diesel-vs-bess','atm-ups-sizing','outage-cost'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_calculator_embed_calc_type" AS ENUM('solar-roi','earthing-resistance','cable-sizing','lightning-zone','solar-yield','diesel-vs-bess','atm-ups-sizing','outage-cost'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    ALTER TABLE "public"."pages_blocks_calculator_embed" ADD COLUMN IF NOT EXISTS "calc_type" "public"."enum_pages_blocks_calculator_embed_calc_type";
    ALTER TABLE "public"."_pages_v_blocks_calculator_embed" ADD COLUMN IF NOT EXISTS "calc_type" "public"."enum__pages_v_blocks_calculator_embed_calc_type";
  `);
  payload.logger.info("Hotfix: added pages_blocks_calculator_embed.calc_type (Phase 3a gap).");
}

export async function down({ db, payload }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "public"."pages_blocks_calculator_embed" DROP COLUMN IF EXISTS "calc_type";
    ALTER TABLE "public"."_pages_v_blocks_calculator_embed" DROP COLUMN IF EXISTS "calc_type";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_calculator_embed_calc_type";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_calculator_embed_calc_type";
  `);
  payload.logger.info("Reverted calc_type hotfix.");
}
