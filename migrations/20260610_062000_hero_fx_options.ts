import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

/**
 * Extend the Hero "Background effect" enum with three more brand-tuned options:
 * particles (rising motes), retro (perspective engineering grid), tracing
 * (pulsing circuit lines). Additive enum values on both the live and versions
 * hero tables. Idempotent (ADD VALUE IF NOT EXISTS); down is a no-op since
 * Postgres can't drop a single enum value.
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TYPE "public"."enum_pages_blocks_hero_background_fx" ADD VALUE IF NOT EXISTS 'particles';
    ALTER TYPE "public"."enum_pages_blocks_hero_background_fx" ADD VALUE IF NOT EXISTS 'retro';
    ALTER TYPE "public"."enum_pages_blocks_hero_background_fx" ADD VALUE IF NOT EXISTS 'tracing';
    ALTER TYPE "public"."enum__pages_v_blocks_hero_background_fx" ADD VALUE IF NOT EXISTS 'particles';
    ALTER TYPE "public"."enum__pages_v_blocks_hero_background_fx" ADD VALUE IF NOT EXISTS 'retro';
    ALTER TYPE "public"."enum__pages_v_blocks_hero_background_fx" ADD VALUE IF NOT EXISTS 'tracing';
  `);
  payload.logger.info("Added particles/retro/tracing to hero background_fx enums.");
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  payload.logger.info("No-op: enum values are not removed on rollback.");
}
