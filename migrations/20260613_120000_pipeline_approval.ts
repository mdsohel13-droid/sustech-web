import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

/**
 * Lead Engine Phase 4 - nightly pipeline, approval & guarded auto-publish.
 * Adds: pipeline_runs + publish_audit collections, automation_settings global,
 * and the revisionMeta group (+ risk-flag tables, version variants, source FK)
 * on articles & news-items. DDL mirrors Payload's dev-push output (pg_dump).
 * Idempotent; `down` reverses it.
 */
export async function up({ db, payload }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN CREATE TYPE "public"."enum__articles_v_version_revision_meta_approval_state" AS ENUM('none','pending','approved','rejected','auto-published'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__articles_v_version_revision_meta_risk_flags" AS ENUM('pricing','legal','stat-claim','tariff','third-party-name'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__news_items_v_version_revision_meta_approval_state" AS ENUM('none','pending','approved','rejected','auto-published'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__news_items_v_version_revision_meta_risk_flags" AS ENUM('pricing','legal','stat-claim','tariff','third-party-name'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_articles_revision_meta_approval_state" AS ENUM('none','pending','approved','rejected','auto-published'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_articles_revision_meta_risk_flags" AS ENUM('pricing','legal','stat-claim','tariff','third-party-name'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_news_items_revision_meta_approval_state" AS ENUM('none','pending','approved','rejected','auto-published'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_news_items_revision_meta_risk_flags" AS ENUM('pricing','legal','stat-claim','tariff','third-party-name'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_pipeline_runs_trigger" AS ENUM('n8n','fallback','heartbeat'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_publish_audit_action" AS ENUM('drafted','approval-email-sent','approval-email-delivered','approved-by-owner','rejected','auto-published-24h','killed','rolled-back'); EXCEPTION WHEN duplicate_object THEN null; END $$;

    ALTER TABLE "public"."_articles_v" ADD COLUMN IF NOT EXISTS "version_revision_meta_approval_state" "public"."enum__articles_v_version_revision_meta_approval_state";
    ALTER TABLE "public"."_articles_v" ADD COLUMN IF NOT EXISTS "version_revision_meta_triggered_by_source_id" integer;
    ALTER TABLE "public"."_articles_v" ADD COLUMN IF NOT EXISTS "version_revision_meta_change_summary" character varying;
    ALTER TABLE "public"."_articles_v" ADD COLUMN IF NOT EXISTS "version_revision_meta_pending_since" timestamp(3) with time zone;
    ALTER TABLE "public"."_articles_v" ADD COLUMN IF NOT EXISTS "version_revision_meta_stale_source" boolean;
    ALTER TABLE "public"."_articles_v" ADD COLUMN IF NOT EXISTS "version_revision_meta_token_jti" character varying;
    ALTER TABLE "public"."_articles_v" ADD COLUMN IF NOT EXISTS "version_revision_meta_decided_by" character varying;
    ALTER TABLE "public"."_articles_v" ADD COLUMN IF NOT EXISTS "version_revision_meta_decided_at" timestamp(3) with time zone;
    ALTER TABLE "public"."_news_items_v" ADD COLUMN IF NOT EXISTS "version_revision_meta_approval_state" "public"."enum__news_items_v_version_revision_meta_approval_state";
    ALTER TABLE "public"."_news_items_v" ADD COLUMN IF NOT EXISTS "version_revision_meta_triggered_by_source_id" integer;
    ALTER TABLE "public"."_news_items_v" ADD COLUMN IF NOT EXISTS "version_revision_meta_change_summary" character varying;
    ALTER TABLE "public"."_news_items_v" ADD COLUMN IF NOT EXISTS "version_revision_meta_pending_since" timestamp(3) with time zone;
    ALTER TABLE "public"."_news_items_v" ADD COLUMN IF NOT EXISTS "version_revision_meta_stale_source" boolean;
    ALTER TABLE "public"."_news_items_v" ADD COLUMN IF NOT EXISTS "version_revision_meta_token_jti" character varying;
    ALTER TABLE "public"."_news_items_v" ADD COLUMN IF NOT EXISTS "version_revision_meta_decided_by" character varying;
    ALTER TABLE "public"."_news_items_v" ADD COLUMN IF NOT EXISTS "version_revision_meta_decided_at" timestamp(3) with time zone;
    ALTER TABLE "public"."articles" ADD COLUMN IF NOT EXISTS "revision_meta_approval_state" "public"."enum_articles_revision_meta_approval_state";
    ALTER TABLE "public"."articles" ADD COLUMN IF NOT EXISTS "revision_meta_triggered_by_source_id" integer;
    ALTER TABLE "public"."articles" ADD COLUMN IF NOT EXISTS "revision_meta_change_summary" character varying;
    ALTER TABLE "public"."articles" ADD COLUMN IF NOT EXISTS "revision_meta_pending_since" timestamp(3) with time zone;
    ALTER TABLE "public"."articles" ADD COLUMN IF NOT EXISTS "revision_meta_stale_source" boolean;
    ALTER TABLE "public"."articles" ADD COLUMN IF NOT EXISTS "revision_meta_token_jti" character varying;
    ALTER TABLE "public"."articles" ADD COLUMN IF NOT EXISTS "revision_meta_decided_by" character varying;
    ALTER TABLE "public"."articles" ADD COLUMN IF NOT EXISTS "revision_meta_decided_at" timestamp(3) with time zone;
    ALTER TABLE "public"."news_items" ADD COLUMN IF NOT EXISTS "revision_meta_approval_state" "public"."enum_news_items_revision_meta_approval_state";
    ALTER TABLE "public"."news_items" ADD COLUMN IF NOT EXISTS "revision_meta_triggered_by_source_id" integer;
    ALTER TABLE "public"."news_items" ADD COLUMN IF NOT EXISTS "revision_meta_change_summary" character varying;
    ALTER TABLE "public"."news_items" ADD COLUMN IF NOT EXISTS "revision_meta_pending_since" timestamp(3) with time zone;
    ALTER TABLE "public"."news_items" ADD COLUMN IF NOT EXISTS "revision_meta_stale_source" boolean;
    ALTER TABLE "public"."news_items" ADD COLUMN IF NOT EXISTS "revision_meta_token_jti" character varying;
    ALTER TABLE "public"."news_items" ADD COLUMN IF NOT EXISTS "revision_meta_decided_by" character varying;
    ALTER TABLE "public"."news_items" ADD COLUMN IF NOT EXISTS "revision_meta_decided_at" timestamp(3) with time zone;

    DO $$ BEGIN ALTER TABLE "public"."articles" ADD CONSTRAINT "articles_revision_meta_triggered_by_source_id_fk" FOREIGN KEY ("revision_meta_triggered_by_source_id") REFERENCES "public"."sources"("id") ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN ALTER TABLE "public"."_articles_v" ADD CONSTRAINT "_articles_v_version_revision_meta_triggered_by_source_id_fk" FOREIGN KEY ("version_revision_meta_triggered_by_source_id") REFERENCES "public"."sources"("id") ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN ALTER TABLE "public"."news_items" ADD CONSTRAINT "news_items_revision_meta_triggered_by_source_id_fk" FOREIGN KEY ("revision_meta_triggered_by_source_id") REFERENCES "public"."sources"("id") ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN ALTER TABLE "public"."_news_items_v" ADD CONSTRAINT "_news_items_v_version_revision_meta_triggered_by_source_id_fk" FOREIGN KEY ("version_revision_meta_triggered_by_source_id") REFERENCES "public"."sources"("id") ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN null; END $$;


    CREATE TABLE IF NOT EXISTS public._articles_v_version_revision_meta_risk_flags (
        "order" integer NOT NULL,
        parent_id integer NOT NULL,
        value public.enum__articles_v_version_revision_meta_risk_flags,
        id integer NOT NULL
    );
    CREATE SEQUENCE IF NOT EXISTS public._articles_v_version_revision_meta_risk_flags_id_seq
        AS integer
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;
    ALTER SEQUENCE public._articles_v_version_revision_meta_risk_flags_id_seq OWNED BY public._articles_v_version_revision_meta_risk_flags.id;
    CREATE TABLE IF NOT EXISTS public._news_items_v_version_revision_meta_risk_flags (
        "order" integer NOT NULL,
        parent_id integer NOT NULL,
        value public.enum__news_items_v_version_revision_meta_risk_flags,
        id integer NOT NULL
    );
    CREATE SEQUENCE IF NOT EXISTS public._news_items_v_version_revision_meta_risk_flags_id_seq
        AS integer
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;
    ALTER SEQUENCE public._news_items_v_version_revision_meta_risk_flags_id_seq OWNED BY public._news_items_v_version_revision_meta_risk_flags.id;
    CREATE TABLE IF NOT EXISTS public.articles_revision_meta_risk_flags (
        "order" integer NOT NULL,
        parent_id integer NOT NULL,
        value public.enum_articles_revision_meta_risk_flags,
        id integer NOT NULL
    );
    CREATE SEQUENCE IF NOT EXISTS public.articles_revision_meta_risk_flags_id_seq
        AS integer
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;
    ALTER SEQUENCE public.articles_revision_meta_risk_flags_id_seq OWNED BY public.articles_revision_meta_risk_flags.id;
    CREATE TABLE IF NOT EXISTS public.automation_settings (
        id integer NOT NULL,
        auto_publish_enabled boolean DEFAULT false,
        pipeline_note character varying,
        updated_at timestamp(3) with time zone,
        created_at timestamp(3) with time zone
    );
    CREATE SEQUENCE IF NOT EXISTS public.automation_settings_id_seq
        AS integer
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;
    ALTER SEQUENCE public.automation_settings_id_seq OWNED BY public.automation_settings.id;
    CREATE TABLE IF NOT EXISTS public.news_items_revision_meta_risk_flags (
        "order" integer NOT NULL,
        parent_id integer NOT NULL,
        value public.enum_news_items_revision_meta_risk_flags,
        id integer NOT NULL
    );
    CREATE SEQUENCE IF NOT EXISTS public.news_items_revision_meta_risk_flags_id_seq
        AS integer
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;
    ALTER SEQUENCE public.news_items_revision_meta_risk_flags_id_seq OWNED BY public.news_items_revision_meta_risk_flags.id;
    CREATE TABLE IF NOT EXISTS public.pipeline_runs (
        id integer NOT NULL,
        run_date timestamp(3) with time zone NOT NULL,
        trigger public.enum_pipeline_runs_trigger NOT NULL,
        sources_checked numeric DEFAULT 0,
        sources_changed numeric DEFAULT 0,
        drafts_created numeric DEFAULT 0,
        started_at timestamp(3) with time zone,
        finished_at timestamp(3) with time zone,
        errors jsonb,
        updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
        created_at timestamp(3) with time zone DEFAULT now() NOT NULL
    );
    CREATE SEQUENCE IF NOT EXISTS public.pipeline_runs_id_seq
        AS integer
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;
    ALTER SEQUENCE public.pipeline_runs_id_seq OWNED BY public.pipeline_runs.id;
    CREATE TABLE IF NOT EXISTS public.publish_audit (
        id integer NOT NULL,
        at timestamp(3) with time zone NOT NULL,
        action public.enum_publish_audit_action NOT NULL,
        doc_collection character varying,
        doc_id character varying,
        version_id_from character varying,
        version_id_to character varying,
        actor character varying NOT NULL,
        token_jti character varying,
        claim_diff_snapshot jsonb,
        updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
        created_at timestamp(3) with time zone DEFAULT now() NOT NULL
    );
    CREATE SEQUENCE IF NOT EXISTS public.publish_audit_id_seq
        AS integer
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;
    ALTER SEQUENCE public.publish_audit_id_seq OWNED BY public.publish_audit.id;
    ALTER TABLE ONLY public._articles_v_version_revision_meta_risk_flags ALTER COLUMN id SET DEFAULT nextval('public._articles_v_version_revision_meta_risk_flags_id_seq'::regclass);
    ALTER TABLE ONLY public._news_items_v_version_revision_meta_risk_flags ALTER COLUMN id SET DEFAULT nextval('public._news_items_v_version_revision_meta_risk_flags_id_seq'::regclass);
    ALTER TABLE ONLY public.articles_revision_meta_risk_flags ALTER COLUMN id SET DEFAULT nextval('public.articles_revision_meta_risk_flags_id_seq'::regclass);
    ALTER TABLE ONLY public.automation_settings ALTER COLUMN id SET DEFAULT nextval('public.automation_settings_id_seq'::regclass);
    ALTER TABLE ONLY public.news_items_revision_meta_risk_flags ALTER COLUMN id SET DEFAULT nextval('public.news_items_revision_meta_risk_flags_id_seq'::regclass);
    ALTER TABLE ONLY public.pipeline_runs ALTER COLUMN id SET DEFAULT nextval('public.pipeline_runs_id_seq'::regclass);
    ALTER TABLE ONLY public.publish_audit ALTER COLUMN id SET DEFAULT nextval('public.publish_audit_id_seq'::regclass);
    DO $$ BEGIN
      ALTER TABLE ONLY public._articles_v_version_revision_meta_risk_flags
        ADD CONSTRAINT _articles_v_version_revision_meta_risk_flags_pkey PRIMARY KEY (id);
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE ONLY public._news_items_v_version_revision_meta_risk_flags
        ADD CONSTRAINT _news_items_v_version_revision_meta_risk_flags_pkey PRIMARY KEY (id);
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE ONLY public.articles_revision_meta_risk_flags
        ADD CONSTRAINT articles_revision_meta_risk_flags_pkey PRIMARY KEY (id);
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE ONLY public.automation_settings
        ADD CONSTRAINT automation_settings_pkey PRIMARY KEY (id);
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE ONLY public.news_items_revision_meta_risk_flags
        ADD CONSTRAINT news_items_revision_meta_risk_flags_pkey PRIMARY KEY (id);
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE ONLY public.pipeline_runs
        ADD CONSTRAINT pipeline_runs_pkey PRIMARY KEY (id);
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE ONLY public.publish_audit
        ADD CONSTRAINT publish_audit_pkey PRIMARY KEY (id);
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;
    CREATE INDEX IF NOT EXISTS _articles_v_version_revision_meta_risk_flags_order_idx ON public._articles_v_version_revision_meta_risk_flags USING btree ("order");
    CREATE INDEX IF NOT EXISTS _articles_v_version_revision_meta_risk_flags_parent_idx ON public._articles_v_version_revision_meta_risk_flags USING btree (parent_id);
    CREATE INDEX IF NOT EXISTS _news_items_v_version_revision_meta_risk_flags_order_idx ON public._news_items_v_version_revision_meta_risk_flags USING btree ("order");
    CREATE INDEX IF NOT EXISTS _news_items_v_version_revision_meta_risk_flags_parent_idx ON public._news_items_v_version_revision_meta_risk_flags USING btree (parent_id);
    CREATE INDEX IF NOT EXISTS articles_revision_meta_risk_flags_order_idx ON public.articles_revision_meta_risk_flags USING btree ("order");
    CREATE INDEX IF NOT EXISTS articles_revision_meta_risk_flags_parent_idx ON public.articles_revision_meta_risk_flags USING btree (parent_id);
    CREATE INDEX IF NOT EXISTS news_items_revision_meta_risk_flags_order_idx ON public.news_items_revision_meta_risk_flags USING btree ("order");
    CREATE INDEX IF NOT EXISTS news_items_revision_meta_risk_flags_parent_idx ON public.news_items_revision_meta_risk_flags USING btree (parent_id);
    CREATE INDEX IF NOT EXISTS pipeline_runs_created_at_idx ON public.pipeline_runs USING btree (created_at);
    CREATE INDEX IF NOT EXISTS pipeline_runs_updated_at_idx ON public.pipeline_runs USING btree (updated_at);
    CREATE INDEX IF NOT EXISTS publish_audit_created_at_idx ON public.publish_audit USING btree (created_at);
    CREATE INDEX IF NOT EXISTS publish_audit_updated_at_idx ON public.publish_audit USING btree (updated_at);
    DO $$ BEGIN
      ALTER TABLE ONLY public._articles_v_version_revision_meta_risk_flags
        ADD CONSTRAINT _articles_v_version_revision_meta_risk_flags_parent_fk FOREIGN KEY (parent_id) REFERENCES public._articles_v(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE ONLY public._news_items_v_version_revision_meta_risk_flags
        ADD CONSTRAINT _news_items_v_version_revision_meta_risk_flags_parent_fk FOREIGN KEY (parent_id) REFERENCES public._news_items_v(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE ONLY public.articles_revision_meta_risk_flags
        ADD CONSTRAINT articles_revision_meta_risk_flags_parent_fk FOREIGN KEY (parent_id) REFERENCES public.articles(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE ONLY public.news_items_revision_meta_risk_flags
        ADD CONSTRAINT news_items_revision_meta_risk_flags_parent_fk FOREIGN KEY (parent_id) REFERENCES public.news_items(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;

    -- Admin doc-lock joins (after the referenced tables exist):
    ALTER TABLE "public"."payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "pipeline_runs_id" integer;
    ALTER TABLE "public"."payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "publish_audit_id" integer;
    DO $$ BEGIN ALTER TABLE "public"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pipeline_runs_fk" FOREIGN KEY ("pipeline_runs_id") REFERENCES "public"."pipeline_runs"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_pipeline_runs_id_idx" ON "public"."payload_locked_documents_rels" ("pipeline_runs_id");
    DO $$ BEGIN ALTER TABLE "public"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_publish_audit_fk" FOREIGN KEY ("publish_audit_id") REFERENCES "public"."publish_audit"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_publish_audit_id_idx" ON "public"."payload_locked_documents_rels" ("publish_audit_id");
  `);
  payload.logger.info("Created pipeline/approval schema (Phase 4).");
}

export async function down({ db, payload }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "public"."payload_locked_documents_rels" DROP COLUMN IF EXISTS "pipeline_runs_id";
    ALTER TABLE "public"."payload_locked_documents_rels" DROP COLUMN IF EXISTS "publish_audit_id";
    ALTER TABLE "public"."_articles_v" DROP COLUMN IF EXISTS "version_revision_meta_approval_state";
    ALTER TABLE "public"."_articles_v" DROP COLUMN IF EXISTS "version_revision_meta_triggered_by_source_id";
    ALTER TABLE "public"."_articles_v" DROP COLUMN IF EXISTS "version_revision_meta_change_summary";
    ALTER TABLE "public"."_articles_v" DROP COLUMN IF EXISTS "version_revision_meta_pending_since";
    ALTER TABLE "public"."_articles_v" DROP COLUMN IF EXISTS "version_revision_meta_stale_source";
    ALTER TABLE "public"."_articles_v" DROP COLUMN IF EXISTS "version_revision_meta_token_jti";
    ALTER TABLE "public"."_articles_v" DROP COLUMN IF EXISTS "version_revision_meta_decided_by";
    ALTER TABLE "public"."_articles_v" DROP COLUMN IF EXISTS "version_revision_meta_decided_at";
    ALTER TABLE "public"."_news_items_v" DROP COLUMN IF EXISTS "version_revision_meta_approval_state";
    ALTER TABLE "public"."_news_items_v" DROP COLUMN IF EXISTS "version_revision_meta_triggered_by_source_id";
    ALTER TABLE "public"."_news_items_v" DROP COLUMN IF EXISTS "version_revision_meta_change_summary";
    ALTER TABLE "public"."_news_items_v" DROP COLUMN IF EXISTS "version_revision_meta_pending_since";
    ALTER TABLE "public"."_news_items_v" DROP COLUMN IF EXISTS "version_revision_meta_stale_source";
    ALTER TABLE "public"."_news_items_v" DROP COLUMN IF EXISTS "version_revision_meta_token_jti";
    ALTER TABLE "public"."_news_items_v" DROP COLUMN IF EXISTS "version_revision_meta_decided_by";
    ALTER TABLE "public"."_news_items_v" DROP COLUMN IF EXISTS "version_revision_meta_decided_at";
    ALTER TABLE "public"."articles" DROP COLUMN IF EXISTS "revision_meta_approval_state";
    ALTER TABLE "public"."articles" DROP COLUMN IF EXISTS "revision_meta_triggered_by_source_id";
    ALTER TABLE "public"."articles" DROP COLUMN IF EXISTS "revision_meta_change_summary";
    ALTER TABLE "public"."articles" DROP COLUMN IF EXISTS "revision_meta_pending_since";
    ALTER TABLE "public"."articles" DROP COLUMN IF EXISTS "revision_meta_stale_source";
    ALTER TABLE "public"."articles" DROP COLUMN IF EXISTS "revision_meta_token_jti";
    ALTER TABLE "public"."articles" DROP COLUMN IF EXISTS "revision_meta_decided_by";
    ALTER TABLE "public"."articles" DROP COLUMN IF EXISTS "revision_meta_decided_at";
    ALTER TABLE "public"."news_items" DROP COLUMN IF EXISTS "revision_meta_approval_state";
    ALTER TABLE "public"."news_items" DROP COLUMN IF EXISTS "revision_meta_triggered_by_source_id";
    ALTER TABLE "public"."news_items" DROP COLUMN IF EXISTS "revision_meta_change_summary";
    ALTER TABLE "public"."news_items" DROP COLUMN IF EXISTS "revision_meta_pending_since";
    ALTER TABLE "public"."news_items" DROP COLUMN IF EXISTS "revision_meta_stale_source";
    ALTER TABLE "public"."news_items" DROP COLUMN IF EXISTS "revision_meta_token_jti";
    ALTER TABLE "public"."news_items" DROP COLUMN IF EXISTS "revision_meta_decided_by";
    ALTER TABLE "public"."news_items" DROP COLUMN IF EXISTS "revision_meta_decided_at";
    DROP TABLE IF EXISTS "public"."articles_revision_meta_risk_flags" CASCADE;
    DROP TABLE IF EXISTS "public"."_articles_v_version_revision_meta_risk_flags" CASCADE;
    DROP TABLE IF EXISTS "public"."news_items_revision_meta_risk_flags" CASCADE;
    DROP TABLE IF EXISTS "public"."_news_items_v_version_revision_meta_risk_flags" CASCADE;
    DROP TABLE IF EXISTS "public"."pipeline_runs" CASCADE;
    DROP TABLE IF EXISTS "public"."publish_audit" CASCADE;
    DROP TABLE IF EXISTS "public"."automation_settings" CASCADE;
    DROP TYPE IF EXISTS "public"."enum__articles_v_version_revision_meta_approval_state";
    DROP TYPE IF EXISTS "public"."enum__articles_v_version_revision_meta_risk_flags";
    DROP TYPE IF EXISTS "public"."enum__news_items_v_version_revision_meta_approval_state";
    DROP TYPE IF EXISTS "public"."enum__news_items_v_version_revision_meta_risk_flags";
    DROP TYPE IF EXISTS "public"."enum_articles_revision_meta_approval_state";
    DROP TYPE IF EXISTS "public"."enum_articles_revision_meta_risk_flags";
    DROP TYPE IF EXISTS "public"."enum_news_items_revision_meta_approval_state";
    DROP TYPE IF EXISTS "public"."enum_news_items_revision_meta_risk_flags";
    DROP TYPE IF EXISTS "public"."enum_pipeline_runs_trigger";
    DROP TYPE IF EXISTS "public"."enum_publish_audit_action";
  `);
  payload.logger.info("Reverted Phase 4.");
}
