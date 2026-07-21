import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

/**
 * Plan 3·1 — world-class per-sector funnel.
 * Adds to the `sectors` collection: proofStats + faqs (arrays), a leadMagnet
 * relationship (→ knowledge_resources, one), a testimonials relationship (→ many)
 * and cta heading/lede overrides. DDL mirrors Payload's dev-push output (pg_dump).
 * Additive + idempotent — no drops.
 */
export async function up({ db, payload }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- sectors.proofStats -----------------------------------------------------
    CREATE TABLE IF NOT EXISTS public.sectors_proof_stats (
        _order integer NOT NULL,
        _parent_id integer NOT NULL,
        id character varying NOT NULL,
        value numeric NOT NULL,
        suffix character varying,
        label character varying NOT NULL
    );
    DO $$ BEGIN
      ALTER TABLE ONLY public.sectors_proof_stats
        ADD CONSTRAINT sectors_proof_stats_pkey PRIMARY KEY (id);
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;
    CREATE INDEX IF NOT EXISTS sectors_proof_stats_order_idx ON public.sectors_proof_stats USING btree (_order);
    CREATE INDEX IF NOT EXISTS sectors_proof_stats_parent_id_idx ON public.sectors_proof_stats USING btree (_parent_id);
    DO $$ BEGIN
      ALTER TABLE ONLY public.sectors_proof_stats
        ADD CONSTRAINT sectors_proof_stats_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.sectors(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    -- sectors.faqs -----------------------------------------------------------
    CREATE TABLE IF NOT EXISTS public.sectors_faqs (
        _order integer NOT NULL,
        _parent_id integer NOT NULL,
        id character varying NOT NULL,
        question character varying NOT NULL,
        answer character varying NOT NULL
    );
    DO $$ BEGIN
      ALTER TABLE ONLY public.sectors_faqs
        ADD CONSTRAINT sectors_faqs_pkey PRIMARY KEY (id);
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;
    CREATE INDEX IF NOT EXISTS sectors_faqs_order_idx ON public.sectors_faqs USING btree (_order);
    CREATE INDEX IF NOT EXISTS sectors_faqs_parent_id_idx ON public.sectors_faqs USING btree (_parent_id);
    DO $$ BEGIN
      ALTER TABLE ONLY public.sectors_faqs
        ADD CONSTRAINT sectors_faqs_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.sectors(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    -- sectors: cta overrides + leadMagnet (one) ------------------------------
    ALTER TABLE "public"."sectors" ADD COLUMN IF NOT EXISTS "cta_heading" character varying;
    ALTER TABLE "public"."sectors" ADD COLUMN IF NOT EXISTS "cta_lede" character varying;
    ALTER TABLE "public"."sectors" ADD COLUMN IF NOT EXISTS "lead_magnet_id" integer;
    DO $$ BEGIN
      ALTER TABLE ONLY public.sectors
        ADD CONSTRAINT sectors_lead_magnet_id_knowledge_resources_id_fk FOREIGN KEY ("lead_magnet_id") REFERENCES public.knowledge_resources(id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
    CREATE INDEX IF NOT EXISTS sectors_lead_magnet_idx ON public.sectors USING btree (lead_magnet_id);

    -- sectors_rels: testimonials (many) --------------------------------------
    ALTER TABLE "public"."sectors_rels" ADD COLUMN IF NOT EXISTS "testimonials_id" integer;
    DO $$ BEGIN
      ALTER TABLE ONLY public.sectors_rels
        ADD CONSTRAINT sectors_rels_testimonials_fk FOREIGN KEY ("testimonials_id") REFERENCES public.testimonials(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
    CREATE INDEX IF NOT EXISTS sectors_rels_testimonials_id_idx ON public.sectors_rels USING btree (testimonials_id);
  `);
  payload.logger.info("Added sector-funnel fields (plan 3·1).");
}

export async function down({ db, payload }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "public"."sectors_rels" DROP COLUMN IF EXISTS "testimonials_id";
    ALTER TABLE "public"."sectors" DROP COLUMN IF EXISTS "lead_magnet_id";
    ALTER TABLE "public"."sectors" DROP COLUMN IF EXISTS "cta_lede";
    ALTER TABLE "public"."sectors" DROP COLUMN IF EXISTS "cta_heading";
    DROP TABLE IF EXISTS "public"."sectors_faqs" CASCADE;
    DROP TABLE IF EXISTS "public"."sectors_proof_stats" CASCADE;
  `);
  payload.logger.info("Reverted sector-funnel fields (plan 3·1).");
}
