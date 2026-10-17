import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

/**
 * Add 'fan' to the services icon enum so "Energy-Saving Fans" can be its own
 * service line (one of the six pillars) with a dedicated built-in icon, instead
 * of being bundled into "Lighting & Product Supply".
 *
 * Additive enum value; idempotent. Down is a no-op (Postgres can't drop a single
 * enum value). Companion to the seed change that adds the energy-saving-fans and
 * industrial-lighting services; production runs with push:false, so the native
 * enum enum_services_icon must be extended by a migration before the CMS can
 * persist icon = "fan".
 */
export async function up({ db, payload }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TYPE "public"."enum_services_icon" ADD VALUE IF NOT EXISTS 'fan';
  `);
  payload.logger.info("Added 'fan' to enum_services_icon.");
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  payload.logger.info("No-op: enum values are not removed on rollback.");
}
