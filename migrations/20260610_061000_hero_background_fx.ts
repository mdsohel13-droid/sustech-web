import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

/**
 * Hero block "Background effect" (none | aurora — animated WebGL lines).
 * Adds the enum + column to the live hero block table AND its drafts/versions
 * counterpart. Additive + idempotent.
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_pages_blocks_hero_background_fx" AS ENUM('none', 'aurora');
    EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN
      CREATE TYPE "public"."enum__pages_v_blocks_hero_background_fx" AS ENUM('none', 'aurora');
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    ALTER TABLE "public"."pages_blocks_hero"
      ADD COLUMN IF NOT EXISTS "background_fx"
      "public"."enum_pages_blocks_hero_background_fx" DEFAULT 'none';
    ALTER TABLE "public"."_pages_v_blocks_hero"
      ADD COLUMN IF NOT EXISTS "background_fx"
      "public"."enum__pages_v_blocks_hero_background_fx" DEFAULT 'none';
  `);
  payload.logger.info("Added background_fx to hero block (live + versions).");
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "public"."pages_blocks_hero" DROP COLUMN IF EXISTS "background_fx";
    ALTER TABLE "public"."_pages_v_blocks_hero" DROP COLUMN IF EXISTS "background_fx";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_hero_background_fx";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_hero_background_fx";
  `);
  payload.logger.info("Removed background_fx from hero block.");
}
