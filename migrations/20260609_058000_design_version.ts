import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

/**
 * Add the site-wide design version switch (classic | pro) to Site Settings.
 * Additive + idempotent. Default 'classic' so nothing changes until an admin
 * flips it.
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_site_settings_design_version" AS ENUM('classic', 'pro');
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    ALTER TABLE "public"."site_settings"
      ADD COLUMN IF NOT EXISTS "design_version"
      "public"."enum_site_settings_design_version" DEFAULT 'classic';
  `);
  payload.logger.info("Added site_settings.design_version (classic | pro).");
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "public"."site_settings" DROP COLUMN IF EXISTS "design_version";
    DROP TYPE IF EXISTS "public"."enum_site_settings_design_version";
  `);
  payload.logger.info("Removed site_settings.design_version.");
}
