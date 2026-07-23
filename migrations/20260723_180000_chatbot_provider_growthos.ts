import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

/**
 * Add 'growthos' to the chatbot provider enum so Site Settings can select the
 * GrowthOS AI support widget (bilingual Beng+Eng) as its chatbot provider.
 * Additive enum value; idempotent. Down is a no-op (Postgres can't drop a
 * single enum value).
 *
 * Companion to PR #72 (feat: add GrowthOS support widget as first-class chatbot
 * provider). The PR added the `growthos` option to cms/globals/site-settings.ts
 * and regenerated payload-types.ts, but production runs with `push: false`, so
 * the native enum enum_site_settings_chatbot_provider must be extended by a
 * migration before the CMS can persist provider = "growthos".
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TYPE "public"."enum_site_settings_chatbot_provider" ADD VALUE IF NOT EXISTS 'growthos';
  `);
  payload.logger.info("Added 'growthos' to enum_site_settings_chatbot_provider.");
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  payload.logger.info("No-op: enum values are not removed on rollback.");
}
