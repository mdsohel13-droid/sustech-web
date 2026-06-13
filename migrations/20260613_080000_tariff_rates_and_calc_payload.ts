import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

/**
 * Lead Engine Phase 3a - calculators-as-lead-magnets.
 * Adds: `tariff_rates` global (cited electricity/diesel prices for calculators)
 * and `leads.calc_payload` (jsonb) to carry a calculator run with the lead.
 * DDL mirrors Payload's dev-push output (pg_dump). Idempotent.
 */
export async function up({ db, payload }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "public"."leads" ADD COLUMN IF NOT EXISTS "calc_payload" jsonb;

    CREATE TABLE IF NOT EXISTS public.tariff_rates (
        id integer NOT NULL,
        industrial_flat_bdt_per_kwh numeric DEFAULT 11.5 NOT NULL,
        commercial_flat_bdt_per_kwh numeric DEFAULT 13 NOT NULL,
        electricity_source_label character varying DEFAULT 'BERC retail tariff notification'::character varying,
        electricity_source_url character varying,
        electricity_verified_at timestamp(3) with time zone,
        diesel_price_bdt_per_litre numeric DEFAULT 105 NOT NULL,
        diesel_gen_efficiency_kwh_per_litre numeric DEFAULT 3.2 NOT NULL,
        diesel_maintenance_bdt_per_kwh numeric DEFAULT 1.5 NOT NULL,
        diesel_source_label character varying DEFAULT 'BPC retail diesel price'::character varying,
        diesel_source_url character varying,
        diesel_verified_at timestamp(3) with time zone,
        bess_round_trip_efficiency numeric DEFAULT 0.92 NOT NULL,
        solar_yield_kwh_per_kwp_day numeric DEFAULT 4.2 NOT NULL,
        updated_at timestamp(3) with time zone,
        created_at timestamp(3) with time zone
    );
    CREATE SEQUENCE IF NOT EXISTS public.tariff_rates_id_seq
        AS integer
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;
    ALTER SEQUENCE public.tariff_rates_id_seq OWNED BY public.tariff_rates.id;
    ALTER TABLE ONLY public.tariff_rates ALTER COLUMN id SET DEFAULT nextval('public.tariff_rates_id_seq'::regclass);
    DO $$ BEGIN
      ALTER TABLE ONLY public.tariff_rates
        ADD CONSTRAINT tariff_rates_pkey PRIMARY KEY (id);
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;
  `);
  payload.logger.info("Created tariff_rates global + leads.calc_payload (Phase 3a).");
}

export async function down({ db, payload }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "public"."tariff_rates" CASCADE;
    ALTER TABLE "public"."leads" DROP COLUMN IF EXISTS "calc_payload";
  `);
  payload.logger.info("Reverted Phase 3a.");
}
