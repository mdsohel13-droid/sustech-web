import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

/**
 * New "Style & Animation" defaults for every block (Site Settings request):
 *   padding → compact · body font → display · gap below → small ·
 *   animation delay → medium · card border + 3D shadow → on.
 *
 * For each pages_blocks_* table that has the column:
 *  - UPDATE rows that are still on the OLD default to the NEW default (so any
 *    block an editor intentionally customised is left untouched);
 *  - ALTER COLUMN SET DEFAULT so the DB default matches the code field default.
 *
 * Idempotent: after the first run the WHERE clauses match nothing.
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$
    DECLARE r record;
    BEGIN
      FOR r IN SELECT table_name FROM information_schema.columns
               WHERE table_schema = 'public' AND table_name LIKE 'pages_blocks_%'
                 AND column_name = 'style_padding_size' LOOP
        EXECUTE format('UPDATE public.%I SET style_padding_size = ''compact'' WHERE style_padding_size = ''standard''', r.table_name);
        EXECUTE format('ALTER TABLE public.%I ALTER COLUMN style_padding_size SET DEFAULT ''compact''', r.table_name);
      END LOOP;

      FOR r IN SELECT table_name FROM information_schema.columns
               WHERE table_schema = 'public' AND table_name LIKE 'pages_blocks_%'
                 AND column_name = 'style_body_font' LOOP
        EXECUTE format('UPDATE public.%I SET style_body_font = ''display'' WHERE style_body_font = ''sans''', r.table_name);
        EXECUTE format('ALTER TABLE public.%I ALTER COLUMN style_body_font SET DEFAULT ''display''', r.table_name);
      END LOOP;

      FOR r IN SELECT table_name FROM information_schema.columns
               WHERE table_schema = 'public' AND table_name LIKE 'pages_blocks_%'
                 AND column_name = 'style_gap_below' LOOP
        EXECUTE format('UPDATE public.%I SET style_gap_below = ''small'' WHERE style_gap_below = ''default''', r.table_name);
        EXECUTE format('ALTER TABLE public.%I ALTER COLUMN style_gap_below SET DEFAULT ''small''', r.table_name);
      END LOOP;

      FOR r IN SELECT table_name FROM information_schema.columns
               WHERE table_schema = 'public' AND table_name LIKE 'pages_blocks_%'
                 AND column_name = 'style_animation_delay' LOOP
        EXECUTE format('UPDATE public.%I SET style_animation_delay = ''medium'' WHERE style_animation_delay = ''none''', r.table_name);
        EXECUTE format('ALTER TABLE public.%I ALTER COLUMN style_animation_delay SET DEFAULT ''medium''', r.table_name);
      END LOOP;

      FOR r IN SELECT table_name FROM information_schema.columns
               WHERE table_schema = 'public' AND table_name LIKE 'pages_blocks_%'
                 AND column_name = 'style_with_border' LOOP
        EXECUTE format('UPDATE public.%I SET style_with_border = true WHERE style_with_border = false', r.table_name);
        EXECUTE format('ALTER TABLE public.%I ALTER COLUMN style_with_border SET DEFAULT true', r.table_name);
      END LOOP;
    END $$;
  `);
  payload.logger.info("Applied new Style & Animation defaults to existing blocks + column defaults.");
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Reset the column defaults to the previous values. Row data is intentionally
  // left as-is (the up-migration's value changes can't be distinguished from
  // intentional edits, so reverting them would be lossy).
  await db.execute(sql`
    DO $$
    DECLARE r record;
    BEGIN
      FOR r IN SELECT table_name FROM information_schema.columns
               WHERE table_schema='public' AND table_name LIKE 'pages_blocks_%' AND column_name='style_padding_size' LOOP
        EXECUTE format('ALTER TABLE public.%I ALTER COLUMN style_padding_size SET DEFAULT ''standard''', r.table_name);
      END LOOP;
      FOR r IN SELECT table_name FROM information_schema.columns
               WHERE table_schema='public' AND table_name LIKE 'pages_blocks_%' AND column_name='style_body_font' LOOP
        EXECUTE format('ALTER TABLE public.%I ALTER COLUMN style_body_font SET DEFAULT ''sans''', r.table_name);
      END LOOP;
      FOR r IN SELECT table_name FROM information_schema.columns
               WHERE table_schema='public' AND table_name LIKE 'pages_blocks_%' AND column_name='style_gap_below' LOOP
        EXECUTE format('ALTER TABLE public.%I ALTER COLUMN style_gap_below SET DEFAULT ''default''', r.table_name);
      END LOOP;
      FOR r IN SELECT table_name FROM information_schema.columns
               WHERE table_schema='public' AND table_name LIKE 'pages_blocks_%' AND column_name='style_animation_delay' LOOP
        EXECUTE format('ALTER TABLE public.%I ALTER COLUMN style_animation_delay SET DEFAULT ''none''', r.table_name);
      END LOOP;
      FOR r IN SELECT table_name FROM information_schema.columns
               WHERE table_schema='public' AND table_name LIKE 'pages_blocks_%' AND column_name='style_with_border' LOOP
        EXECUTE format('ALTER TABLE public.%I ALTER COLUMN style_with_border SET DEFAULT false', r.table_name);
      END LOOP;
    END $$;
  `);
  payload.logger.info("Reverted Style & Animation column defaults (row data left as-is).");
}
