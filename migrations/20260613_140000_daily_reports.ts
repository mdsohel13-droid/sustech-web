import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

/**
 * Lead Engine Phase 5 - daily report archive.
 * Adds the daily_reports collection + its admin doc-lock join. DDL mirrors
 * Payload's dev-push output (pg_dump). Idempotent.
 */
export async function up({ db, payload }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS public.daily_reports (
        id integer NOT NULL,
        date character varying NOT NULL,
        generated_at timestamp(3) with time zone,
        html character varying,
        metrics jsonb,
        updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
        created_at timestamp(3) with time zone DEFAULT now() NOT NULL
    );
    CREATE SEQUENCE IF NOT EXISTS public.daily_reports_id_seq
        AS integer
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;
    ALTER SEQUENCE public.daily_reports_id_seq OWNED BY public.daily_reports.id;
    ALTER TABLE ONLY public.daily_reports ALTER COLUMN id SET DEFAULT nextval('public.daily_reports_id_seq'::regclass);
    DO $$ BEGIN
      ALTER TABLE ONLY public.daily_reports
        ADD CONSTRAINT daily_reports_pkey PRIMARY KEY (id);
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;
    CREATE INDEX IF NOT EXISTS daily_reports_created_at_idx ON public.daily_reports USING btree (created_at);
    CREATE UNIQUE INDEX IF NOT EXISTS daily_reports_date_idx ON public.daily_reports USING btree (date);
    CREATE INDEX IF NOT EXISTS daily_reports_updated_at_idx ON public.daily_reports USING btree (updated_at);

    ALTER TABLE "public"."payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "daily_reports_id" integer;
    DO $$ BEGIN ALTER TABLE "public"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_daily_reports_fk" FOREIGN KEY ("daily_reports_id") REFERENCES "public"."daily_reports"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_daily_reports_id_idx" ON "public"."payload_locked_documents_rels" ("daily_reports_id");
  `);
  payload.logger.info("Created daily_reports (Phase 5).");
}

export async function down({ db, payload }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "public"."payload_locked_documents_rels" DROP COLUMN IF EXISTS "daily_reports_id";
    DROP TABLE IF EXISTS "public"."daily_reports" CASCADE;
  `);
  payload.logger.info("Reverted Phase 5.");
}
