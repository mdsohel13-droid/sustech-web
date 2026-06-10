import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

/**
 * Custom icon uploads for Services and Sectors (e.g. 3D PNG icons).
 * Adds an optional media relation column to each — additive + idempotent.
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "public"."services" ADD COLUMN IF NOT EXISTS "custom_icon_id" integer;
    ALTER TABLE "public"."sectors" ADD COLUMN IF NOT EXISTS "custom_icon_id" integer;

    DO $$ BEGIN
      ALTER TABLE "public"."services"
        ADD CONSTRAINT "services_custom_icon_id_media_id_fk"
        FOREIGN KEY ("custom_icon_id") REFERENCES "public"."media"("id") ON DELETE set null;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE "public"."sectors"
        ADD CONSTRAINT "sectors_custom_icon_id_media_id_fk"
        FOREIGN KEY ("custom_icon_id") REFERENCES "public"."media"("id") ON DELETE set null;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    CREATE INDEX IF NOT EXISTS "services_custom_icon_idx" ON "public"."services" ("custom_icon_id");
    CREATE INDEX IF NOT EXISTS "sectors_custom_icon_idx" ON "public"."sectors" ("custom_icon_id");
  `);
  payload.logger.info("Added custom_icon_id to services + sectors.");
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "public"."services" DROP COLUMN IF EXISTS "custom_icon_id";
    ALTER TABLE "public"."sectors" DROP COLUMN IF EXISTS "custom_icon_id";
  `);
  payload.logger.info("Removed custom_icon_id from services + sectors.");
}
