import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

/**
 * Add "capabilities" as a content-listing layout surface. Lets an admin set the
 * Capabilities CMS page's Services/Sector listing blocks to vertical or
 * horizontal from Site Settings → Display.
 *
 * Just extends the existing enum (additive, non-destructive). Postgres 12+
 * allows ADD VALUE inside a transaction as long as the value isn't used in the
 * same transaction (it isn't here).
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TYPE "public"."enum_site_settings_content_layouts_surface" ADD VALUE IF NOT EXISTS 'capabilities';
  `);
  payload.logger.info("Added 'capabilities' to the content-layout surfaces enum.");
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Postgres cannot drop a single enum value without recreating the type; this is
  // an additive, harmless value, so the down is intentionally a no-op.
  payload.logger.info("No-op: enum values are not removed on rollback.");
}
