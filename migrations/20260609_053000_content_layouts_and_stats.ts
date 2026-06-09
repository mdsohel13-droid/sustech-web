import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

/**
 * Display settings made dynamic + CMS-driven Projects stats.
 *
 * - Replaces the two fixed Site Settings columns (knowledge_layout,
 *   projects_layout) with an editable `content_layouts` array (surface + style),
 *   so an admin can add a layout rule for any listing.
 * - Adds a `stats` array (value/suffix/label) for the Projects headline band.
 *
 * Array fields create a child table keyed by `_parent_id` → site_settings(id);
 * they do NOT touch the shared payload_*_rels tables. All statements are
 * idempotent so the migration is safe to (re-)apply on any database state.
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // ── New enums for the content_layouts array ────────────────────────────────
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_site_settings_content_layouts_surface" AS ENUM('knowledge', 'projects', 'services', 'sectors');
    EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN
      CREATE TYPE "public"."enum_site_settings_content_layouts_style" AS ENUM('vertical', 'horizontal');
    EXCEPTION WHEN duplicate_object THEN null; END $$;
  `);

  // ── content_layouts array table ────────────────────────────────────────────
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "public"."site_settings_content_layouts" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar NOT NULL,
      "surface" "public"."enum_site_settings_content_layouts_surface" NOT NULL,
      "style" "public"."enum_site_settings_content_layouts_style" DEFAULT 'horizontal' NOT NULL,
      CONSTRAINT "site_settings_content_layouts_pkey" PRIMARY KEY ("id")
    );
    CREATE INDEX IF NOT EXISTS "site_settings_content_layouts_order_idx" ON "public"."site_settings_content_layouts" ("_order");
    CREATE INDEX IF NOT EXISTS "site_settings_content_layouts_parent_id_idx" ON "public"."site_settings_content_layouts" ("_parent_id");
    DO $$ BEGIN
      ALTER TABLE "public"."site_settings_content_layouts"
        ADD CONSTRAINT "site_settings_content_layouts_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
  `);

  // ── stats array table ──────────────────────────────────────────────────────
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "public"."site_settings_stats" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar NOT NULL,
      "value" numeric NOT NULL,
      "suffix" varchar,
      "label" varchar NOT NULL,
      CONSTRAINT "site_settings_stats_pkey" PRIMARY KEY ("id")
    );
    CREATE INDEX IF NOT EXISTS "site_settings_stats_order_idx" ON "public"."site_settings_stats" ("_order");
    CREATE INDEX IF NOT EXISTS "site_settings_stats_parent_id_idx" ON "public"."site_settings_stats" ("_parent_id");
    DO $$ BEGIN
      ALTER TABLE "public"."site_settings_stats"
        ADD CONSTRAINT "site_settings_stats_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
  `);

  // ── Remove the superseded single-value layout columns + their enums ─────────
  await db.execute(sql`
    ALTER TABLE "public"."site_settings" DROP COLUMN IF EXISTS "knowledge_layout";
    ALTER TABLE "public"."site_settings" DROP COLUMN IF EXISTS "projects_layout";
    DROP TYPE IF EXISTS "public"."enum_site_settings_knowledge_layout";
    DROP TYPE IF EXISTS "public"."enum_site_settings_projects_layout";
  `);

  payload.logger.info("Applied content_layouts + stats arrays; removed legacy layout columns.");
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "public"."site_settings_content_layouts";
    DROP TABLE IF EXISTS "public"."site_settings_stats";
    DROP TYPE IF EXISTS "public"."enum_site_settings_content_layouts_surface";
    DROP TYPE IF EXISTS "public"."enum_site_settings_content_layouts_style";
    DO $$ BEGIN
      CREATE TYPE "public"."enum_site_settings_knowledge_layout" AS ENUM('vertical', 'horizontal');
    EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN
      CREATE TYPE "public"."enum_site_settings_projects_layout" AS ENUM('vertical', 'horizontal');
    EXCEPTION WHEN duplicate_object THEN null; END $$;
    ALTER TABLE "public"."site_settings" ADD COLUMN IF NOT EXISTS "knowledge_layout" "public"."enum_site_settings_knowledge_layout" DEFAULT 'vertical';
    ALTER TABLE "public"."site_settings" ADD COLUMN IF NOT EXISTS "projects_layout" "public"."enum_site_settings_projects_layout" DEFAULT 'vertical';
  `);
  payload.logger.info("Reverted content_layouts + stats; restored legacy layout columns.");
}
