import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

/**
 * Lead Engine Phase 2a - citation data model + source registry.
 * Adds: `sources` registry; `citations[]` + `claims[]` (+ draft-version shadow
 * tables) on articles & news-items; `category` on articles. DDL mirrors exactly
 * what Payload's dev push generated locally (pg_dump), so dev and prod schemas
 * stay byte-identical. Idempotent; `down` reverses it.
 */
export async function up({ db, payload }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN CREATE TYPE "public"."enum__articles_v_version_category" AS ENUM('knowledge-explainer','market-data','tariffs','policy','finance','calculations','industry-news-roundup','glossary','company-update'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__articles_v_version_claims_hedge" AS ENUM('as-of-date','up-to','approx','exact-verified'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__articles_v_version_claims_source_type" AS ENUM('registry-source','company-catalog'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__news_items_v_version_claims_hedge" AS ENUM('as-of-date','up-to','approx','exact-verified'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__news_items_v_version_claims_source_type" AS ENUM('registry-source','company-catalog'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_articles_category" AS ENUM('knowledge-explainer','market-data','tariffs','policy','finance','calculations','industry-news-roundup','glossary','company-update'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_articles_claims_hedge" AS ENUM('as-of-date','up-to','approx','exact-verified'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_articles_claims_source_type" AS ENUM('registry-source','company-catalog'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_news_items_claims_hedge" AS ENUM('as-of-date','up-to','approx','exact-verified'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_news_items_claims_source_type" AS ENUM('registry-source','company-catalog'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_sources_check_frequency" AS ENUM('daily','weekly','monthly','quarterly'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_sources_fetch_method" AS ENUM('rss','html','pdf-link'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_sources_fetch_policy" AS ENUM('auto','manual-only'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_sources_language" AS ENUM('en','bn','both'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_sources_tier" AS ENUM('tier1-gov','tier1-multilateral','tier2-analyst','tier3-press'); EXCEPTION WHEN duplicate_object THEN null; END $$;

    ALTER TABLE "public"."articles" ADD COLUMN IF NOT EXISTS "category" "public"."enum_articles_category" DEFAULT 'knowledge-explainer';
    ALTER TABLE "public"."_articles_v" ADD COLUMN IF NOT EXISTS "version_category" "public"."enum__articles_v_version_category" DEFAULT 'knowledge-explainer';

    CREATE TABLE IF NOT EXISTS public._articles_v_version_citations (
        _order integer NOT NULL,
        _parent_id integer NOT NULL,
        id integer NOT NULL,
        source_id integer,
        quoted_claim character varying,
        url character varying,
        title character varying,
        accessed_date timestamp(3) with time zone,
        source_published_date timestamp(3) with time zone,
        locator character varying,
        last_verified_at timestamp(3) with time zone,
        _uuid character varying
    );
    CREATE SEQUENCE IF NOT EXISTS public._articles_v_version_citations_id_seq
        AS integer
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;
    ALTER SEQUENCE public._articles_v_version_citations_id_seq OWNED BY public._articles_v_version_citations.id;
    CREATE TABLE IF NOT EXISTS public._articles_v_version_claims (
        _order integer NOT NULL,
        _parent_id integer NOT NULL,
        id integer NOT NULL,
        claim_text character varying,
        value character varying,
        unit character varying,
        source_type public.enum__articles_v_version_claims_source_type DEFAULT 'registry-source'::public.enum__articles_v_version_claims_source_type,
        citation_index numeric,
        hedge public.enum__articles_v_version_claims_hedge DEFAULT 'as-of-date'::public.enum__articles_v_version_claims_hedge,
        retrieved_at timestamp(3) with time zone,
        _uuid character varying
    );
    CREATE SEQUENCE IF NOT EXISTS public._articles_v_version_claims_id_seq
        AS integer
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;
    ALTER SEQUENCE public._articles_v_version_claims_id_seq OWNED BY public._articles_v_version_claims.id;
    CREATE TABLE IF NOT EXISTS public._news_items_v_version_citations (
        _order integer NOT NULL,
        _parent_id integer NOT NULL,
        id integer NOT NULL,
        source_id integer,
        quoted_claim character varying,
        url character varying,
        title character varying,
        accessed_date timestamp(3) with time zone,
        source_published_date timestamp(3) with time zone,
        locator character varying,
        last_verified_at timestamp(3) with time zone,
        _uuid character varying
    );
    CREATE SEQUENCE IF NOT EXISTS public._news_items_v_version_citations_id_seq
        AS integer
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;
    ALTER SEQUENCE public._news_items_v_version_citations_id_seq OWNED BY public._news_items_v_version_citations.id;
    CREATE TABLE IF NOT EXISTS public._news_items_v_version_claims (
        _order integer NOT NULL,
        _parent_id integer NOT NULL,
        id integer NOT NULL,
        claim_text character varying,
        value character varying,
        unit character varying,
        source_type public.enum__news_items_v_version_claims_source_type DEFAULT 'registry-source'::public.enum__news_items_v_version_claims_source_type,
        citation_index numeric,
        hedge public.enum__news_items_v_version_claims_hedge DEFAULT 'as-of-date'::public.enum__news_items_v_version_claims_hedge,
        retrieved_at timestamp(3) with time zone,
        _uuid character varying
    );
    CREATE SEQUENCE IF NOT EXISTS public._news_items_v_version_claims_id_seq
        AS integer
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;
    ALTER SEQUENCE public._news_items_v_version_claims_id_seq OWNED BY public._news_items_v_version_claims.id;
    CREATE TABLE IF NOT EXISTS public.articles_citations (
        _order integer NOT NULL,
        _parent_id integer NOT NULL,
        id character varying NOT NULL,
        source_id integer,
        quoted_claim character varying,
        url character varying,
        title character varying,
        accessed_date timestamp(3) with time zone,
        source_published_date timestamp(3) with time zone,
        locator character varying,
        last_verified_at timestamp(3) with time zone
    );
    CREATE TABLE IF NOT EXISTS public.articles_claims (
        _order integer NOT NULL,
        _parent_id integer NOT NULL,
        id character varying NOT NULL,
        claim_text character varying,
        value character varying,
        unit character varying,
        source_type public.enum_articles_claims_source_type DEFAULT 'registry-source'::public.enum_articles_claims_source_type,
        citation_index numeric,
        hedge public.enum_articles_claims_hedge DEFAULT 'as-of-date'::public.enum_articles_claims_hedge,
        retrieved_at timestamp(3) with time zone
    );
    CREATE TABLE IF NOT EXISTS public.news_items_citations (
        _order integer NOT NULL,
        _parent_id integer NOT NULL,
        id character varying NOT NULL,
        source_id integer,
        quoted_claim character varying,
        url character varying,
        title character varying,
        accessed_date timestamp(3) with time zone,
        source_published_date timestamp(3) with time zone,
        locator character varying,
        last_verified_at timestamp(3) with time zone
    );
    CREATE TABLE IF NOT EXISTS public.news_items_claims (
        _order integer NOT NULL,
        _parent_id integer NOT NULL,
        id character varying NOT NULL,
        claim_text character varying,
        value character varying,
        unit character varying,
        source_type public.enum_news_items_claims_source_type DEFAULT 'registry-source'::public.enum_news_items_claims_source_type,
        citation_index numeric,
        hedge public.enum_news_items_claims_hedge DEFAULT 'as-of-date'::public.enum_news_items_claims_hedge,
        retrieved_at timestamp(3) with time zone
    );
    CREATE TABLE IF NOT EXISTS public.sources (
        id integer NOT NULL,
        name character varying NOT NULL,
        url character varying NOT NULL,
        check_url character varying,
        tier public.enum_sources_tier DEFAULT 'tier1-gov'::public.enum_sources_tier NOT NULL,
        fetch_method public.enum_sources_fetch_method DEFAULT 'html'::public.enum_sources_fetch_method,
        fetch_policy public.enum_sources_fetch_policy DEFAULT 'auto'::public.enum_sources_fetch_policy,
        check_frequency public.enum_sources_check_frequency DEFAULT 'weekly'::public.enum_sources_check_frequency,
        content_selector character varying,
        language public.enum_sources_language DEFAULT 'en'::public.enum_sources_language,
        paywalled boolean DEFAULT false,
        active boolean DEFAULT true,
        notes character varying,
        last_content_hash character varying,
        etag character varying,
        last_modified character varying,
        consecutive_failures numeric DEFAULT 0,
        last_checked_at timestamp(3) with time zone,
        last_changed_at timestamp(3) with time zone,
        robots_checked_at timestamp(3) with time zone,
        updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
        created_at timestamp(3) with time zone DEFAULT now() NOT NULL
    );
    CREATE SEQUENCE IF NOT EXISTS public.sources_id_seq
        AS integer
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;
    ALTER SEQUENCE public.sources_id_seq OWNED BY public.sources.id;
    ALTER TABLE ONLY public._articles_v_version_citations ALTER COLUMN id SET DEFAULT nextval('public._articles_v_version_citations_id_seq'::regclass);
    ALTER TABLE ONLY public._articles_v_version_claims ALTER COLUMN id SET DEFAULT nextval('public._articles_v_version_claims_id_seq'::regclass);
    ALTER TABLE ONLY public._news_items_v_version_citations ALTER COLUMN id SET DEFAULT nextval('public._news_items_v_version_citations_id_seq'::regclass);
    ALTER TABLE ONLY public._news_items_v_version_claims ALTER COLUMN id SET DEFAULT nextval('public._news_items_v_version_claims_id_seq'::regclass);
    ALTER TABLE ONLY public.sources ALTER COLUMN id SET DEFAULT nextval('public.sources_id_seq'::regclass);
    DO $$ BEGIN
      ALTER TABLE ONLY public._articles_v_version_citations
        ADD CONSTRAINT _articles_v_version_citations_pkey PRIMARY KEY (id);
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE ONLY public._articles_v_version_claims
        ADD CONSTRAINT _articles_v_version_claims_pkey PRIMARY KEY (id);
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE ONLY public._news_items_v_version_citations
        ADD CONSTRAINT _news_items_v_version_citations_pkey PRIMARY KEY (id);
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE ONLY public._news_items_v_version_claims
        ADD CONSTRAINT _news_items_v_version_claims_pkey PRIMARY KEY (id);
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE ONLY public.articles_citations
        ADD CONSTRAINT articles_citations_pkey PRIMARY KEY (id);
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE ONLY public.articles_claims
        ADD CONSTRAINT articles_claims_pkey PRIMARY KEY (id);
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE ONLY public.news_items_citations
        ADD CONSTRAINT news_items_citations_pkey PRIMARY KEY (id);
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE ONLY public.news_items_claims
        ADD CONSTRAINT news_items_claims_pkey PRIMARY KEY (id);
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE ONLY public.sources
        ADD CONSTRAINT sources_pkey PRIMARY KEY (id);
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;
    CREATE INDEX IF NOT EXISTS _articles_v_version_citations_order_idx ON public._articles_v_version_citations USING btree (_order);
    CREATE INDEX IF NOT EXISTS _articles_v_version_citations_parent_id_idx ON public._articles_v_version_citations USING btree (_parent_id);
    CREATE INDEX IF NOT EXISTS _articles_v_version_citations_source_idx ON public._articles_v_version_citations USING btree (source_id);
    CREATE INDEX IF NOT EXISTS _articles_v_version_claims_order_idx ON public._articles_v_version_claims USING btree (_order);
    CREATE INDEX IF NOT EXISTS _articles_v_version_claims_parent_id_idx ON public._articles_v_version_claims USING btree (_parent_id);
    CREATE INDEX IF NOT EXISTS _news_items_v_version_citations_order_idx ON public._news_items_v_version_citations USING btree (_order);
    CREATE INDEX IF NOT EXISTS _news_items_v_version_citations_parent_id_idx ON public._news_items_v_version_citations USING btree (_parent_id);
    CREATE INDEX IF NOT EXISTS _news_items_v_version_citations_source_idx ON public._news_items_v_version_citations USING btree (source_id);
    CREATE INDEX IF NOT EXISTS _news_items_v_version_claims_order_idx ON public._news_items_v_version_claims USING btree (_order);
    CREATE INDEX IF NOT EXISTS _news_items_v_version_claims_parent_id_idx ON public._news_items_v_version_claims USING btree (_parent_id);
    CREATE INDEX IF NOT EXISTS articles_citations_order_idx ON public.articles_citations USING btree (_order);
    CREATE INDEX IF NOT EXISTS articles_citations_parent_id_idx ON public.articles_citations USING btree (_parent_id);
    CREATE INDEX IF NOT EXISTS articles_citations_source_idx ON public.articles_citations USING btree (source_id);
    CREATE INDEX IF NOT EXISTS articles_claims_order_idx ON public.articles_claims USING btree (_order);
    CREATE INDEX IF NOT EXISTS articles_claims_parent_id_idx ON public.articles_claims USING btree (_parent_id);
    CREATE INDEX IF NOT EXISTS news_items_citations_order_idx ON public.news_items_citations USING btree (_order);
    CREATE INDEX IF NOT EXISTS news_items_citations_parent_id_idx ON public.news_items_citations USING btree (_parent_id);
    CREATE INDEX IF NOT EXISTS news_items_citations_source_idx ON public.news_items_citations USING btree (source_id);
    CREATE INDEX IF NOT EXISTS news_items_claims_order_idx ON public.news_items_claims USING btree (_order);
    CREATE INDEX IF NOT EXISTS news_items_claims_parent_id_idx ON public.news_items_claims USING btree (_parent_id);
    CREATE INDEX IF NOT EXISTS sources_created_at_idx ON public.sources USING btree (created_at);
    CREATE INDEX IF NOT EXISTS sources_updated_at_idx ON public.sources USING btree (updated_at);
    CREATE UNIQUE INDEX IF NOT EXISTS sources_url_idx ON public.sources USING btree (url);
    DO $$ BEGIN
      ALTER TABLE ONLY public._articles_v_version_citations
        ADD CONSTRAINT _articles_v_version_citations_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public._articles_v(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE ONLY public._articles_v_version_citations
        ADD CONSTRAINT _articles_v_version_citations_source_id_sources_id_fk FOREIGN KEY (source_id) REFERENCES public.sources(id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE ONLY public._articles_v_version_claims
        ADD CONSTRAINT _articles_v_version_claims_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public._articles_v(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE ONLY public._news_items_v_version_citations
        ADD CONSTRAINT _news_items_v_version_citations_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public._news_items_v(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE ONLY public._news_items_v_version_citations
        ADD CONSTRAINT _news_items_v_version_citations_source_id_sources_id_fk FOREIGN KEY (source_id) REFERENCES public.sources(id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE ONLY public._news_items_v_version_claims
        ADD CONSTRAINT _news_items_v_version_claims_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public._news_items_v(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE ONLY public.articles_citations
        ADD CONSTRAINT articles_citations_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.articles(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE ONLY public.articles_citations
        ADD CONSTRAINT articles_citations_source_id_sources_id_fk FOREIGN KEY (source_id) REFERENCES public.sources(id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE ONLY public.articles_claims
        ADD CONSTRAINT articles_claims_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.articles(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE ONLY public.news_items_citations
        ADD CONSTRAINT news_items_citations_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.news_items(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE ONLY public.news_items_citations
        ADD CONSTRAINT news_items_citations_source_id_sources_id_fk FOREIGN KEY (source_id) REFERENCES public.sources(id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE ONLY public.news_items_claims
        ADD CONSTRAINT news_items_claims_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.news_items(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;

    -- Admin document-lock join for the new sources collection (after sources exists).
    ALTER TABLE "public"."payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "sources_id" integer;
    DO $$ BEGIN
      ALTER TABLE "public"."payload_locked_documents_rels"
        ADD CONSTRAINT "payload_locked_documents_rels_sources_fk"
        FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_sources_id_idx"
      ON "public"."payload_locked_documents_rels" ("sources_id");
  `);
  payload.logger.info("Created source registry + citations/claims model (Phase 2a).");
}

export async function down({ db, payload }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "public"."payload_locked_documents_rels" DROP COLUMN IF EXISTS "sources_id";
    ALTER TABLE "public"."articles" DROP COLUMN IF EXISTS "category";
    ALTER TABLE "public"."_articles_v" DROP COLUMN IF EXISTS "version_category";
    DROP TABLE IF EXISTS "public"."_articles_v_version_citations" CASCADE;
    DROP TABLE IF EXISTS "public"."_articles_v_version_claims" CASCADE;
    DROP TABLE IF EXISTS "public"."_news_items_v_version_citations" CASCADE;
    DROP TABLE IF EXISTS "public"."_news_items_v_version_claims" CASCADE;
    DROP TABLE IF EXISTS "public"."articles_citations" CASCADE;
    DROP TABLE IF EXISTS "public"."articles_claims" CASCADE;
    DROP TABLE IF EXISTS "public"."news_items_citations" CASCADE;
    DROP TABLE IF EXISTS "public"."news_items_claims" CASCADE;
    DROP TABLE IF EXISTS "public"."sources" CASCADE;
    DROP TYPE IF EXISTS "public"."enum__articles_v_version_category";
    DROP TYPE IF EXISTS "public"."enum__articles_v_version_claims_hedge";
    DROP TYPE IF EXISTS "public"."enum__articles_v_version_claims_source_type";
    DROP TYPE IF EXISTS "public"."enum__news_items_v_version_claims_hedge";
    DROP TYPE IF EXISTS "public"."enum__news_items_v_version_claims_source_type";
    DROP TYPE IF EXISTS "public"."enum_articles_category";
    DROP TYPE IF EXISTS "public"."enum_articles_claims_hedge";
    DROP TYPE IF EXISTS "public"."enum_articles_claims_source_type";
    DROP TYPE IF EXISTS "public"."enum_news_items_claims_hedge";
    DROP TYPE IF EXISTS "public"."enum_news_items_claims_source_type";
    DROP TYPE IF EXISTS "public"."enum_sources_check_frequency";
    DROP TYPE IF EXISTS "public"."enum_sources_fetch_method";
    DROP TYPE IF EXISTS "public"."enum_sources_fetch_policy";
    DROP TYPE IF EXISTS "public"."enum_sources_language";
    DROP TYPE IF EXISTS "public"."enum_sources_tier";
  `);
  payload.logger.info("Reverted Phase 2a citation model.");
}
