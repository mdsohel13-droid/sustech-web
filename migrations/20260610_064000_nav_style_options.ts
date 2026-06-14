import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

/**
 * Extend the navigation style switch with two more options: tabs (segmented
 * bar) and dock (floating bottom bar). Additive enum values; idempotent.
 * Down is a no-op (Postgres can't drop a single enum value).
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TYPE "public"."enum_site_settings_nav_style" ADD VALUE IF NOT EXISTS 'tabs';
    ALTER TYPE "public"."enum_site_settings_nav_style" ADD VALUE IF NOT EXISTS 'dock';
  `);
  payload.logger.info("Added tabs/dock to nav_style enum.");
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  payload.logger.info("No-op: enum values are not removed on rollback.");
}
