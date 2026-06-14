import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

/**
 * Make the contact email add-able (like phones): single `email` column → an
 * `emails` array (address + optional label).
 *
 * Data-preserving: the existing email is copied into emails[0] BEFORE the old
 * column is dropped, so no contact detail is lost. Idempotent and guarded — the
 * backfill+drop only runs while the legacy column still exists.
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "public"."site_settings_emails" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar NOT NULL,
      "address" varchar NOT NULL,
      "label" varchar,
      CONSTRAINT "site_settings_emails_pkey" PRIMARY KEY ("id")
    );
    CREATE INDEX IF NOT EXISTS "site_settings_emails_order_idx" ON "public"."site_settings_emails" ("_order");
    CREATE INDEX IF NOT EXISTS "site_settings_emails_parent_id_idx" ON "public"."site_settings_emails" ("_parent_id");
    DO $$ BEGIN
      ALTER TABLE "public"."site_settings_emails"
        ADD CONSTRAINT "site_settings_emails_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
  `);

  // Backfill from the legacy single-value column, then drop it — only while it
  // still exists (so re-running after the column is gone is a safe no-op).
  await db.execute(sql`
    DO $$ BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='site_settings' AND column_name='email'
      ) THEN
        INSERT INTO "public"."site_settings_emails" ("_order", "_parent_id", "id", "address")
        SELECT 1, s."id", md5(random()::text || s."id"::text || clock_timestamp()::text), s."email"
        FROM "public"."site_settings" s
        WHERE s."email" IS NOT NULL AND s."email" <> ''
          AND NOT EXISTS (
            SELECT 1 FROM "public"."site_settings_emails" e WHERE e."_parent_id" = s."id"
          );
        ALTER TABLE "public"."site_settings" DROP COLUMN "email";
      END IF;
    END $$;
  `);

  payload.logger.info("Migrated single email → emails array (data preserved).");
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "public"."site_settings" ADD COLUMN IF NOT EXISTS "email" varchar;
    UPDATE "public"."site_settings" s
      SET "email" = (
        SELECT e."address" FROM "public"."site_settings_emails" e
        WHERE e."_parent_id" = s."id" ORDER BY e."_order" ASC LIMIT 1
      )
      WHERE s."email" IS NULL;
    DROP TABLE IF EXISTS "public"."site_settings_emails";
  `);
  payload.logger.info("Reverted emails array → single email column.");
}
