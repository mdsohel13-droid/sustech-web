import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

/**
 * CMS-driven page hero copy + chat config (audit: remove hardcoded content).
 *
 * Adds three Site Settings array tables:
 *  - page_intros (page + eyebrow/heading/lede) → override index-page hero copy
 *  - chat_suggestions (text)                   → chat starter chips
 *  - quote_scales (text)                       → quote-form scale options
 *
 * All array fields key on _parent_id → site_settings(id); none touch the shared
 * payload_*_rels tables. Every statement is idempotent.
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // page_intros (+ its page enum)
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_site_settings_page_intros_page" AS ENUM('services', 'solutions', 'projects', 'knowledge', 'contact', 'request-quote');
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    CREATE TABLE IF NOT EXISTS "public"."site_settings_page_intros" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar NOT NULL,
      "page" "public"."enum_site_settings_page_intros_page" NOT NULL,
      "eyebrow" varchar,
      "heading" varchar,
      "lede" varchar,
      CONSTRAINT "site_settings_page_intros_pkey" PRIMARY KEY ("id")
    );
    CREATE INDEX IF NOT EXISTS "site_settings_page_intros_order_idx" ON "public"."site_settings_page_intros" ("_order");
    CREATE INDEX IF NOT EXISTS "site_settings_page_intros_parent_id_idx" ON "public"."site_settings_page_intros" ("_parent_id");
    DO $$ BEGIN
      ALTER TABLE "public"."site_settings_page_intros"
        ADD CONSTRAINT "site_settings_page_intros_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
  `);

  // chat_suggestions
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "public"."site_settings_chat_suggestions" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar NOT NULL,
      "text" varchar NOT NULL,
      CONSTRAINT "site_settings_chat_suggestions_pkey" PRIMARY KEY ("id")
    );
    CREATE INDEX IF NOT EXISTS "site_settings_chat_suggestions_order_idx" ON "public"."site_settings_chat_suggestions" ("_order");
    CREATE INDEX IF NOT EXISTS "site_settings_chat_suggestions_parent_id_idx" ON "public"."site_settings_chat_suggestions" ("_parent_id");
    DO $$ BEGIN
      ALTER TABLE "public"."site_settings_chat_suggestions"
        ADD CONSTRAINT "site_settings_chat_suggestions_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
  `);

  // quote_scales
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "public"."site_settings_quote_scales" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar NOT NULL,
      "text" varchar NOT NULL,
      CONSTRAINT "site_settings_quote_scales_pkey" PRIMARY KEY ("id")
    );
    CREATE INDEX IF NOT EXISTS "site_settings_quote_scales_order_idx" ON "public"."site_settings_quote_scales" ("_order");
    CREATE INDEX IF NOT EXISTS "site_settings_quote_scales_parent_id_idx" ON "public"."site_settings_quote_scales" ("_parent_id");
    DO $$ BEGIN
      ALTER TABLE "public"."site_settings_quote_scales"
        ADD CONSTRAINT "site_settings_quote_scales_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
  `);

  payload.logger.info("Added page_intros + chat_suggestions + quote_scales arrays.");
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "public"."site_settings_page_intros";
    DROP TABLE IF EXISTS "public"."site_settings_chat_suggestions";
    DROP TABLE IF EXISTS "public"."site_settings_quote_scales";
    DROP TYPE IF EXISTS "public"."enum_site_settings_page_intros_page";
  `);
  payload.logger.info("Dropped page_intros + chat config arrays.");
}
