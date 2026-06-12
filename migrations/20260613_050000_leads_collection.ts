import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

/**
 * Lead Engine Phase 1 — the `leads` collection (consented hand-raisers).
 * DDL mirrors exactly what Payload's dev push generated locally (introspected
 * via pg_dump), so dev and prod schemas stay byte-identical.
 * Additive + idempotent; `down` removes everything it added.
 */
export async function up({ db, payload }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_leads_segment" AS ENUM('investor','rmg','real-estate','commercial','bank','gov-ngo','home','other');
    EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN
      CREATE TYPE "public"."enum_leads_source" AS ENUM('rfq','chat','calculator','gated-asset','outbound','manual');
    EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN
      CREATE TYPE "public"."enum_leads_status" AS ENUM('new','contacted','qualified','won','lost');
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    CREATE TABLE IF NOT EXISTS "public"."leads" (
      "id" serial PRIMARY KEY,
      "display_name" varchar,
      "name" varchar,
      "company" varchar,
      "email" varchar,
      "phone" varchar,
      "segment" "public"."enum_leads_segment" DEFAULT 'other',
      "source" "public"."enum_leads_source" DEFAULT 'manual' NOT NULL,
      "score" numeric DEFAULT 0,
      "status" "public"."enum_leads_status" DEFAULT 'new',
      "marketing_opt_in" boolean DEFAULT false,
      "opt_in_confirmed_at" timestamp(3) with time zone,
      "do_not_contact" boolean DEFAULT false,
      "utm_source" varchar,
      "utm_medium" varchar,
      "utm_campaign" varchar,
      "source_path" varchar,
      "notes" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "public"."leads_touches" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY,
      "at" timestamp(3) with time zone NOT NULL,
      "channel" varchar NOT NULL,
      "note" varchar
    );

    DO $$ BEGIN
      ALTER TABLE "public"."leads_touches"
        ADD CONSTRAINT "leads_touches_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."leads"("id") ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    CREATE UNIQUE INDEX IF NOT EXISTS "leads_email_idx" ON "public"."leads" ("email");
    CREATE INDEX IF NOT EXISTS "leads_phone_idx" ON "public"."leads" ("phone");
    CREATE INDEX IF NOT EXISTS "leads_score_idx" ON "public"."leads" ("score");
    CREATE INDEX IF NOT EXISTS "leads_status_idx" ON "public"."leads" ("status");
    CREATE INDEX IF NOT EXISTS "leads_do_not_contact_idx" ON "public"."leads" ("do_not_contact");
    CREATE INDEX IF NOT EXISTS "leads_updated_at_idx" ON "public"."leads" ("updated_at");
    CREATE INDEX IF NOT EXISTS "leads_created_at_idx" ON "public"."leads" ("created_at");
    CREATE INDEX IF NOT EXISTS "leads_touches_order_idx" ON "public"."leads_touches" ("_order");
    CREATE INDEX IF NOT EXISTS "leads_touches_parent_id_idx" ON "public"."leads_touches" ("_parent_id");
  `);
  payload.logger.info("Created leads + leads_touches (Lead Engine Phase 1).");
}

export async function down({ db, payload }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "public"."leads_touches";
    DROP TABLE IF EXISTS "public"."leads";
    DROP TYPE IF EXISTS "public"."enum_leads_segment";
    DROP TYPE IF EXISTS "public"."enum_leads_source";
    DROP TYPE IF EXISTS "public"."enum_leads_status";
  `);
  payload.logger.info("Dropped leads + leads_touches.");
}
