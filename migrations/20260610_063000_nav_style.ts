import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

/**
 * Site-wide navigation style switch (classic mega-menu | adaptive pill).
 * Additive + idempotent. Default 'classic' so the header is unchanged until an
 * admin flips it.
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_site_settings_nav_style" AS ENUM('classic', 'pill');
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    ALTER TABLE "public"."site_settings"
      ADD COLUMN IF NOT EXISTS "nav_style"
      "public"."enum_site_settings_nav_style" DEFAULT 'classic';
  `);
  payload.logger.info("Added site_settings.nav_style (classic | pill).");
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "public"."site_settings" DROP COLUMN IF EXISTS "nav_style";
    DROP TYPE IF EXISTS "public"."enum_site_settings_nav_style";
  `);
  payload.logger.info("Removed site_settings.nav_style.");
}
