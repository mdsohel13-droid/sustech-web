import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

/**
 * Lead Engine Phase 3b - segment pages, gated assets, suggestion blocks.
 * Adds: pages.segment + knowledge_resources.gate_level; the next_best_actions
 * global; and four new page blocks (gatedAsset, proofStrip, relatedContent,
 * nextBestAction) with their draft-version shadow tables. DDL mirrors Payload's
 * dev-push output (pg_dump). Idempotent; `down` reverses it.
 */
export async function up({ db, payload }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_gated_asset_appearance" AS ENUM('default','muted','dark'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_gated_asset_style_accent_colour" AS ENUM('brand','energy','solar'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_gated_asset_style_animation_delay" AS ENUM('none','short','medium','long'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_gated_asset_style_animation_style" AS ENUM('fade-rise','slide-left','slide-right','scale-up','stagger','none'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_gated_asset_style_body_font" AS ENUM('sans','display','mono'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_gated_asset_style_body_size" AS ENUM('sm','base','lg','xl'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_gated_asset_style_color_scheme" AS ENUM('default','muted','dark','brand','energy','solar'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_gated_asset_style_gap_below" AS ENUM('none','small','default','large'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_gated_asset_style_heading_font" AS ENUM('display','mono'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_gated_asset_style_heading_size" AS ENUM('default','large','xl'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_gated_asset_style_padding_size" AS ENUM('compact','standard','spacious'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_gated_asset_style_text_align" AS ENUM('left','center'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_gated_asset_style_width" AS ENUM('narrow','default','wide','full-bleed'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_next_best_action_appearance" AS ENUM('default','muted','dark'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_next_best_action_segment" AS ENUM('auto','foreign-investor','rmg-factory','real-estate','commercial-building','bank-financial'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_next_best_action_style_accent_colour" AS ENUM('brand','energy','solar'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_next_best_action_style_animation_delay" AS ENUM('none','short','medium','long'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_next_best_action_style_animation_style" AS ENUM('fade-rise','slide-left','slide-right','scale-up','stagger','none'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_next_best_action_style_body_font" AS ENUM('sans','display','mono'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_next_best_action_style_body_size" AS ENUM('sm','base','lg','xl'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_next_best_action_style_color_scheme" AS ENUM('default','muted','dark','brand','energy','solar'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_next_best_action_style_gap_below" AS ENUM('none','small','default','large'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_next_best_action_style_heading_font" AS ENUM('display','mono'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_next_best_action_style_heading_size" AS ENUM('default','large','xl'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_next_best_action_style_padding_size" AS ENUM('compact','standard','spacious'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_next_best_action_style_text_align" AS ENUM('left','center'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_next_best_action_style_width" AS ENUM('narrow','default','wide','full-bleed'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_proof_strip_appearance" AS ENUM('default','muted','dark'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_proof_strip_style_accent_colour" AS ENUM('brand','energy','solar'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_proof_strip_style_animation_delay" AS ENUM('none','short','medium','long'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_proof_strip_style_animation_style" AS ENUM('fade-rise','slide-left','slide-right','scale-up','stagger','none'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_proof_strip_style_body_font" AS ENUM('sans','display','mono'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_proof_strip_style_body_size" AS ENUM('sm','base','lg','xl'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_proof_strip_style_color_scheme" AS ENUM('default','muted','dark','brand','energy','solar'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_proof_strip_style_gap_below" AS ENUM('none','small','default','large'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_proof_strip_style_heading_font" AS ENUM('display','mono'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_proof_strip_style_heading_size" AS ENUM('default','large','xl'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_proof_strip_style_padding_size" AS ENUM('compact','standard','spacious'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_proof_strip_style_text_align" AS ENUM('left','center'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_proof_strip_style_width" AS ENUM('narrow','default','wide','full-bleed'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_related_content_appearance" AS ENUM('default','muted','dark'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_related_content_mode" AS ENUM('auto','manual'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_related_content_style_accent_colour" AS ENUM('brand','energy','solar'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_related_content_style_animation_delay" AS ENUM('none','short','medium','long'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_related_content_style_animation_style" AS ENUM('fade-rise','slide-left','slide-right','scale-up','stagger','none'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_related_content_style_body_font" AS ENUM('sans','display','mono'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_related_content_style_body_size" AS ENUM('sm','base','lg','xl'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_related_content_style_color_scheme" AS ENUM('default','muted','dark','brand','energy','solar'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_related_content_style_gap_below" AS ENUM('none','small','default','large'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_related_content_style_heading_font" AS ENUM('display','mono'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_related_content_style_heading_size" AS ENUM('default','large','xl'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_related_content_style_padding_size" AS ENUM('compact','standard','spacious'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_related_content_style_text_align" AS ENUM('left','center'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_related_content_style_width" AS ENUM('narrow','default','wide','full-bleed'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_version_segment" AS ENUM('none','foreign-investor','rmg-factory','real-estate','commercial-building','bank-financial'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_knowledge_resources_gate_level" AS ENUM('open','email','email-company'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_next_best_actions_rules_segment" AS ENUM('foreign-investor','rmg-factory','real-estate','commercial-building','bank-financial'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_gated_asset_appearance" AS ENUM('default','muted','dark'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_gated_asset_style_accent_colour" AS ENUM('brand','energy','solar'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_gated_asset_style_animation_delay" AS ENUM('none','short','medium','long'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_gated_asset_style_animation_style" AS ENUM('fade-rise','slide-left','slide-right','scale-up','stagger','none'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_gated_asset_style_body_font" AS ENUM('sans','display','mono'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_gated_asset_style_body_size" AS ENUM('sm','base','lg','xl'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_gated_asset_style_color_scheme" AS ENUM('default','muted','dark','brand','energy','solar'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_gated_asset_style_gap_below" AS ENUM('none','small','default','large'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_gated_asset_style_heading_font" AS ENUM('display','mono'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_gated_asset_style_heading_size" AS ENUM('default','large','xl'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_gated_asset_style_padding_size" AS ENUM('compact','standard','spacious'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_gated_asset_style_text_align" AS ENUM('left','center'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_gated_asset_style_width" AS ENUM('narrow','default','wide','full-bleed'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_next_best_action_appearance" AS ENUM('default','muted','dark'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_next_best_action_segment" AS ENUM('auto','foreign-investor','rmg-factory','real-estate','commercial-building','bank-financial'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_next_best_action_style_accent_colour" AS ENUM('brand','energy','solar'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_next_best_action_style_animation_delay" AS ENUM('none','short','medium','long'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_next_best_action_style_animation_style" AS ENUM('fade-rise','slide-left','slide-right','scale-up','stagger','none'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_next_best_action_style_body_font" AS ENUM('sans','display','mono'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_next_best_action_style_body_size" AS ENUM('sm','base','lg','xl'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_next_best_action_style_color_scheme" AS ENUM('default','muted','dark','brand','energy','solar'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_next_best_action_style_gap_below" AS ENUM('none','small','default','large'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_next_best_action_style_heading_font" AS ENUM('display','mono'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_next_best_action_style_heading_size" AS ENUM('default','large','xl'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_next_best_action_style_padding_size" AS ENUM('compact','standard','spacious'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_next_best_action_style_text_align" AS ENUM('left','center'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_next_best_action_style_width" AS ENUM('narrow','default','wide','full-bleed'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_proof_strip_appearance" AS ENUM('default','muted','dark'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_proof_strip_style_accent_colour" AS ENUM('brand','energy','solar'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_proof_strip_style_animation_delay" AS ENUM('none','short','medium','long'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_proof_strip_style_animation_style" AS ENUM('fade-rise','slide-left','slide-right','scale-up','stagger','none'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_proof_strip_style_body_font" AS ENUM('sans','display','mono'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_proof_strip_style_body_size" AS ENUM('sm','base','lg','xl'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_proof_strip_style_color_scheme" AS ENUM('default','muted','dark','brand','energy','solar'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_proof_strip_style_gap_below" AS ENUM('none','small','default','large'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_proof_strip_style_heading_font" AS ENUM('display','mono'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_proof_strip_style_heading_size" AS ENUM('default','large','xl'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_proof_strip_style_padding_size" AS ENUM('compact','standard','spacious'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_proof_strip_style_text_align" AS ENUM('left','center'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_proof_strip_style_width" AS ENUM('narrow','default','wide','full-bleed'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_related_content_appearance" AS ENUM('default','muted','dark'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_related_content_mode" AS ENUM('auto','manual'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_related_content_style_accent_colour" AS ENUM('brand','energy','solar'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_related_content_style_animation_delay" AS ENUM('none','short','medium','long'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_related_content_style_animation_style" AS ENUM('fade-rise','slide-left','slide-right','scale-up','stagger','none'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_related_content_style_body_font" AS ENUM('sans','display','mono'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_related_content_style_body_size" AS ENUM('sm','base','lg','xl'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_related_content_style_color_scheme" AS ENUM('default','muted','dark','brand','energy','solar'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_related_content_style_gap_below" AS ENUM('none','small','default','large'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_related_content_style_heading_font" AS ENUM('display','mono'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_related_content_style_heading_size" AS ENUM('default','large','xl'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_related_content_style_padding_size" AS ENUM('compact','standard','spacious'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_related_content_style_text_align" AS ENUM('left','center'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_related_content_style_width" AS ENUM('narrow','default','wide','full-bleed'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_pages_segment" AS ENUM('none','foreign-investor','rmg-factory','real-estate','commercial-building','bank-financial'); EXCEPTION WHEN duplicate_object THEN null; END $$;

    ALTER TABLE "public"."pages" ADD COLUMN IF NOT EXISTS "segment" "public"."enum_pages_segment" DEFAULT 'none';
    ALTER TABLE "public"."_pages_v" ADD COLUMN IF NOT EXISTS "version_segment" "public"."enum__pages_v_version_segment" DEFAULT 'none';
    ALTER TABLE "public"."knowledge_resources" ADD COLUMN IF NOT EXISTS "gate_level" "public"."enum_knowledge_resources_gate_level" DEFAULT 'open';

    CREATE TABLE IF NOT EXISTS public._pages_v_blocks_gated_asset (
        _order integer NOT NULL,
        _parent_id integer NOT NULL,
        _path text NOT NULL,
        id integer NOT NULL,
        heading character varying,
        appearance public.enum__pages_v_blocks_gated_asset_appearance DEFAULT 'default'::public.enum__pages_v_blocks_gated_asset_appearance,
        summary character varying,
        resource_id integer,
        style_color_scheme public.enum__pages_v_blocks_gated_asset_style_color_scheme DEFAULT 'default'::public.enum__pages_v_blocks_gated_asset_style_color_scheme,
        style_accent_colour public.enum__pages_v_blocks_gated_asset_style_accent_colour DEFAULT 'brand'::public.enum__pages_v_blocks_gated_asset_style_accent_colour,
        style_width public.enum__pages_v_blocks_gated_asset_style_width DEFAULT 'default'::public.enum__pages_v_blocks_gated_asset_style_width,
        style_padding_size public.enum__pages_v_blocks_gated_asset_style_padding_size DEFAULT 'compact'::public.enum__pages_v_blocks_gated_asset_style_padding_size,
        style_text_align public.enum__pages_v_blocks_gated_asset_style_text_align DEFAULT 'left'::public.enum__pages_v_blocks_gated_asset_style_text_align,
        style_heading_size public.enum__pages_v_blocks_gated_asset_style_heading_size DEFAULT 'default'::public.enum__pages_v_blocks_gated_asset_style_heading_size,
        style_heading_font public.enum__pages_v_blocks_gated_asset_style_heading_font DEFAULT 'display'::public.enum__pages_v_blocks_gated_asset_style_heading_font,
        style_body_font public.enum__pages_v_blocks_gated_asset_style_body_font DEFAULT 'display'::public.enum__pages_v_blocks_gated_asset_style_body_font,
        style_body_size public.enum__pages_v_blocks_gated_asset_style_body_size DEFAULT 'base'::public.enum__pages_v_blocks_gated_asset_style_body_size,
        style_animation_style public.enum__pages_v_blocks_gated_asset_style_animation_style DEFAULT 'fade-rise'::public.enum__pages_v_blocks_gated_asset_style_animation_style,
        style_animation_delay public.enum__pages_v_blocks_gated_asset_style_animation_delay DEFAULT 'medium'::public.enum__pages_v_blocks_gated_asset_style_animation_delay,
        style_with_border boolean DEFAULT true,
        style_gap_below public.enum__pages_v_blocks_gated_asset_style_gap_below DEFAULT 'small'::public.enum__pages_v_blocks_gated_asset_style_gap_below,
        _uuid character varying,
        block_name character varying
    );
    CREATE SEQUENCE IF NOT EXISTS public._pages_v_blocks_gated_asset_id_seq
        AS integer
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;
    ALTER SEQUENCE public._pages_v_blocks_gated_asset_id_seq OWNED BY public._pages_v_blocks_gated_asset.id;
    CREATE TABLE IF NOT EXISTS public._pages_v_blocks_next_best_action (
        _order integer NOT NULL,
        _parent_id integer NOT NULL,
        _path text NOT NULL,
        id integer NOT NULL,
        segment public.enum__pages_v_blocks_next_best_action_segment DEFAULT 'auto'::public.enum__pages_v_blocks_next_best_action_segment,
        appearance public.enum__pages_v_blocks_next_best_action_appearance DEFAULT 'default'::public.enum__pages_v_blocks_next_best_action_appearance,
        style_color_scheme public.enum__pages_v_blocks_next_best_action_style_color_scheme DEFAULT 'default'::public.enum__pages_v_blocks_next_best_action_style_color_scheme,
        style_accent_colour public.enum__pages_v_blocks_next_best_action_style_accent_colour DEFAULT 'brand'::public.enum__pages_v_blocks_next_best_action_style_accent_colour,
        style_width public.enum__pages_v_blocks_next_best_action_style_width DEFAULT 'default'::public.enum__pages_v_blocks_next_best_action_style_width,
        style_padding_size public.enum__pages_v_blocks_next_best_action_style_padding_size DEFAULT 'compact'::public.enum__pages_v_blocks_next_best_action_style_padding_size,
        style_text_align public.enum__pages_v_blocks_next_best_action_style_text_align DEFAULT 'left'::public.enum__pages_v_blocks_next_best_action_style_text_align,
        style_heading_size public.enum__pages_v_blocks_next_best_action_style_heading_size DEFAULT 'default'::public.enum__pages_v_blocks_next_best_action_style_heading_size,
        style_heading_font public.enum__pages_v_blocks_next_best_action_style_heading_font DEFAULT 'display'::public.enum__pages_v_blocks_next_best_action_style_heading_font,
        style_body_font public.enum__pages_v_blocks_next_best_action_style_body_font DEFAULT 'display'::public.enum__pages_v_blocks_next_best_action_style_body_font,
        style_body_size public.enum__pages_v_blocks_next_best_action_style_body_size DEFAULT 'base'::public.enum__pages_v_blocks_next_best_action_style_body_size,
        style_animation_style public.enum__pages_v_blocks_next_best_action_style_animation_style DEFAULT 'fade-rise'::public.enum__pages_v_blocks_next_best_action_style_animation_style,
        style_animation_delay public.enum__pages_v_blocks_next_best_action_style_animation_delay DEFAULT 'medium'::public.enum__pages_v_blocks_next_best_action_style_animation_delay,
        style_with_border boolean DEFAULT true,
        style_gap_below public.enum__pages_v_blocks_next_best_action_style_gap_below DEFAULT 'small'::public.enum__pages_v_blocks_next_best_action_style_gap_below,
        _uuid character varying,
        block_name character varying
    );
    CREATE SEQUENCE IF NOT EXISTS public._pages_v_blocks_next_best_action_id_seq
        AS integer
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;
    ALTER SEQUENCE public._pages_v_blocks_next_best_action_id_seq OWNED BY public._pages_v_blocks_next_best_action.id;
    CREATE TABLE IF NOT EXISTS public._pages_v_blocks_proof_strip (
        _order integer NOT NULL,
        _parent_id integer NOT NULL,
        _path text NOT NULL,
        id integer NOT NULL,
        heading character varying,
        appearance public.enum__pages_v_blocks_proof_strip_appearance DEFAULT 'default'::public.enum__pages_v_blocks_proof_strip_appearance,
        sector_id integer,
        show_stats boolean DEFAULT true,
        show_clients boolean DEFAULT true,
        testimonial_id integer,
        style_color_scheme public.enum__pages_v_blocks_proof_strip_style_color_scheme DEFAULT 'default'::public.enum__pages_v_blocks_proof_strip_style_color_scheme,
        style_accent_colour public.enum__pages_v_blocks_proof_strip_style_accent_colour DEFAULT 'brand'::public.enum__pages_v_blocks_proof_strip_style_accent_colour,
        style_width public.enum__pages_v_blocks_proof_strip_style_width DEFAULT 'default'::public.enum__pages_v_blocks_proof_strip_style_width,
        style_padding_size public.enum__pages_v_blocks_proof_strip_style_padding_size DEFAULT 'compact'::public.enum__pages_v_blocks_proof_strip_style_padding_size,
        style_text_align public.enum__pages_v_blocks_proof_strip_style_text_align DEFAULT 'left'::public.enum__pages_v_blocks_proof_strip_style_text_align,
        style_heading_size public.enum__pages_v_blocks_proof_strip_style_heading_size DEFAULT 'default'::public.enum__pages_v_blocks_proof_strip_style_heading_size,
        style_heading_font public.enum__pages_v_blocks_proof_strip_style_heading_font DEFAULT 'display'::public.enum__pages_v_blocks_proof_strip_style_heading_font,
        style_body_font public.enum__pages_v_blocks_proof_strip_style_body_font DEFAULT 'display'::public.enum__pages_v_blocks_proof_strip_style_body_font,
        style_body_size public.enum__pages_v_blocks_proof_strip_style_body_size DEFAULT 'base'::public.enum__pages_v_blocks_proof_strip_style_body_size,
        style_animation_style public.enum__pages_v_blocks_proof_strip_style_animation_style DEFAULT 'fade-rise'::public.enum__pages_v_blocks_proof_strip_style_animation_style,
        style_animation_delay public.enum__pages_v_blocks_proof_strip_style_animation_delay DEFAULT 'medium'::public.enum__pages_v_blocks_proof_strip_style_animation_delay,
        style_with_border boolean DEFAULT true,
        style_gap_below public.enum__pages_v_blocks_proof_strip_style_gap_below DEFAULT 'small'::public.enum__pages_v_blocks_proof_strip_style_gap_below,
        _uuid character varying,
        block_name character varying
    );
    CREATE SEQUENCE IF NOT EXISTS public._pages_v_blocks_proof_strip_id_seq
        AS integer
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;
    ALTER SEQUENCE public._pages_v_blocks_proof_strip_id_seq OWNED BY public._pages_v_blocks_proof_strip.id;
    CREATE TABLE IF NOT EXISTS public._pages_v_blocks_related_content (
        _order integer NOT NULL,
        _parent_id integer NOT NULL,
        _path text NOT NULL,
        id integer NOT NULL,
        heading character varying,
        appearance public.enum__pages_v_blocks_related_content_appearance DEFAULT 'default'::public.enum__pages_v_blocks_related_content_appearance,
        mode public.enum__pages_v_blocks_related_content_mode DEFAULT 'auto'::public.enum__pages_v_blocks_related_content_mode,
        "limit" numeric DEFAULT 3,
        style_color_scheme public.enum__pages_v_blocks_related_content_style_color_scheme DEFAULT 'default'::public.enum__pages_v_blocks_related_content_style_color_scheme,
        style_accent_colour public.enum__pages_v_blocks_related_content_style_accent_colour DEFAULT 'brand'::public.enum__pages_v_blocks_related_content_style_accent_colour,
        style_width public.enum__pages_v_blocks_related_content_style_width DEFAULT 'default'::public.enum__pages_v_blocks_related_content_style_width,
        style_padding_size public.enum__pages_v_blocks_related_content_style_padding_size DEFAULT 'compact'::public.enum__pages_v_blocks_related_content_style_padding_size,
        style_text_align public.enum__pages_v_blocks_related_content_style_text_align DEFAULT 'left'::public.enum__pages_v_blocks_related_content_style_text_align,
        style_heading_size public.enum__pages_v_blocks_related_content_style_heading_size DEFAULT 'default'::public.enum__pages_v_blocks_related_content_style_heading_size,
        style_heading_font public.enum__pages_v_blocks_related_content_style_heading_font DEFAULT 'display'::public.enum__pages_v_blocks_related_content_style_heading_font,
        style_body_font public.enum__pages_v_blocks_related_content_style_body_font DEFAULT 'display'::public.enum__pages_v_blocks_related_content_style_body_font,
        style_body_size public.enum__pages_v_blocks_related_content_style_body_size DEFAULT 'base'::public.enum__pages_v_blocks_related_content_style_body_size,
        style_animation_style public.enum__pages_v_blocks_related_content_style_animation_style DEFAULT 'fade-rise'::public.enum__pages_v_blocks_related_content_style_animation_style,
        style_animation_delay public.enum__pages_v_blocks_related_content_style_animation_delay DEFAULT 'medium'::public.enum__pages_v_blocks_related_content_style_animation_delay,
        style_with_border boolean DEFAULT true,
        style_gap_below public.enum__pages_v_blocks_related_content_style_gap_below DEFAULT 'small'::public.enum__pages_v_blocks_related_content_style_gap_below,
        _uuid character varying,
        block_name character varying
    );
    CREATE SEQUENCE IF NOT EXISTS public._pages_v_blocks_related_content_id_seq
        AS integer
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;
    ALTER SEQUENCE public._pages_v_blocks_related_content_id_seq OWNED BY public._pages_v_blocks_related_content.id;
    CREATE TABLE IF NOT EXISTS public.next_best_actions (
        id integer NOT NULL,
        fallback_label character varying DEFAULT 'Request a free assessment'::character varying,
        fallback_href character varying DEFAULT '/request-quote'::character varying,
        fallback_note character varying DEFAULT 'Not sure where to start?'::character varying,
        updated_at timestamp(3) with time zone,
        created_at timestamp(3) with time zone
    );
    CREATE SEQUENCE IF NOT EXISTS public.next_best_actions_id_seq
        AS integer
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;
    ALTER SEQUENCE public.next_best_actions_id_seq OWNED BY public.next_best_actions.id;
    CREATE TABLE IF NOT EXISTS public.next_best_actions_rules (
        _order integer NOT NULL,
        _parent_id integer NOT NULL,
        id character varying NOT NULL,
        segment public.enum_next_best_actions_rules_segment NOT NULL,
        note character varying,
        cta_label character varying NOT NULL,
        cta_href character varying NOT NULL
    );
    CREATE TABLE IF NOT EXISTS public.pages_blocks_gated_asset (
        _order integer NOT NULL,
        _parent_id integer NOT NULL,
        _path text NOT NULL,
        id character varying NOT NULL,
        heading character varying,
        appearance public.enum_pages_blocks_gated_asset_appearance DEFAULT 'default'::public.enum_pages_blocks_gated_asset_appearance,
        summary character varying,
        resource_id integer,
        style_color_scheme public.enum_pages_blocks_gated_asset_style_color_scheme DEFAULT 'default'::public.enum_pages_blocks_gated_asset_style_color_scheme,
        style_accent_colour public.enum_pages_blocks_gated_asset_style_accent_colour DEFAULT 'brand'::public.enum_pages_blocks_gated_asset_style_accent_colour,
        style_width public.enum_pages_blocks_gated_asset_style_width DEFAULT 'default'::public.enum_pages_blocks_gated_asset_style_width,
        style_padding_size public.enum_pages_blocks_gated_asset_style_padding_size DEFAULT 'compact'::public.enum_pages_blocks_gated_asset_style_padding_size,
        style_text_align public.enum_pages_blocks_gated_asset_style_text_align DEFAULT 'left'::public.enum_pages_blocks_gated_asset_style_text_align,
        style_heading_size public.enum_pages_blocks_gated_asset_style_heading_size DEFAULT 'default'::public.enum_pages_blocks_gated_asset_style_heading_size,
        style_heading_font public.enum_pages_blocks_gated_asset_style_heading_font DEFAULT 'display'::public.enum_pages_blocks_gated_asset_style_heading_font,
        style_body_font public.enum_pages_blocks_gated_asset_style_body_font DEFAULT 'display'::public.enum_pages_blocks_gated_asset_style_body_font,
        style_body_size public.enum_pages_blocks_gated_asset_style_body_size DEFAULT 'base'::public.enum_pages_blocks_gated_asset_style_body_size,
        style_animation_style public.enum_pages_blocks_gated_asset_style_animation_style DEFAULT 'fade-rise'::public.enum_pages_blocks_gated_asset_style_animation_style,
        style_animation_delay public.enum_pages_blocks_gated_asset_style_animation_delay DEFAULT 'medium'::public.enum_pages_blocks_gated_asset_style_animation_delay,
        style_with_border boolean DEFAULT true,
        style_gap_below public.enum_pages_blocks_gated_asset_style_gap_below DEFAULT 'small'::public.enum_pages_blocks_gated_asset_style_gap_below,
        block_name character varying
    );
    CREATE TABLE IF NOT EXISTS public.pages_blocks_next_best_action (
        _order integer NOT NULL,
        _parent_id integer NOT NULL,
        _path text NOT NULL,
        id character varying NOT NULL,
        segment public.enum_pages_blocks_next_best_action_segment DEFAULT 'auto'::public.enum_pages_blocks_next_best_action_segment,
        appearance public.enum_pages_blocks_next_best_action_appearance DEFAULT 'default'::public.enum_pages_blocks_next_best_action_appearance,
        style_color_scheme public.enum_pages_blocks_next_best_action_style_color_scheme DEFAULT 'default'::public.enum_pages_blocks_next_best_action_style_color_scheme,
        style_accent_colour public.enum_pages_blocks_next_best_action_style_accent_colour DEFAULT 'brand'::public.enum_pages_blocks_next_best_action_style_accent_colour,
        style_width public.enum_pages_blocks_next_best_action_style_width DEFAULT 'default'::public.enum_pages_blocks_next_best_action_style_width,
        style_padding_size public.enum_pages_blocks_next_best_action_style_padding_size DEFAULT 'compact'::public.enum_pages_blocks_next_best_action_style_padding_size,
        style_text_align public.enum_pages_blocks_next_best_action_style_text_align DEFAULT 'left'::public.enum_pages_blocks_next_best_action_style_text_align,
        style_heading_size public.enum_pages_blocks_next_best_action_style_heading_size DEFAULT 'default'::public.enum_pages_blocks_next_best_action_style_heading_size,
        style_heading_font public.enum_pages_blocks_next_best_action_style_heading_font DEFAULT 'display'::public.enum_pages_blocks_next_best_action_style_heading_font,
        style_body_font public.enum_pages_blocks_next_best_action_style_body_font DEFAULT 'display'::public.enum_pages_blocks_next_best_action_style_body_font,
        style_body_size public.enum_pages_blocks_next_best_action_style_body_size DEFAULT 'base'::public.enum_pages_blocks_next_best_action_style_body_size,
        style_animation_style public.enum_pages_blocks_next_best_action_style_animation_style DEFAULT 'fade-rise'::public.enum_pages_blocks_next_best_action_style_animation_style,
        style_animation_delay public.enum_pages_blocks_next_best_action_style_animation_delay DEFAULT 'medium'::public.enum_pages_blocks_next_best_action_style_animation_delay,
        style_with_border boolean DEFAULT true,
        style_gap_below public.enum_pages_blocks_next_best_action_style_gap_below DEFAULT 'small'::public.enum_pages_blocks_next_best_action_style_gap_below,
        block_name character varying
    );
    CREATE TABLE IF NOT EXISTS public.pages_blocks_proof_strip (
        _order integer NOT NULL,
        _parent_id integer NOT NULL,
        _path text NOT NULL,
        id character varying NOT NULL,
        heading character varying,
        appearance public.enum_pages_blocks_proof_strip_appearance DEFAULT 'default'::public.enum_pages_blocks_proof_strip_appearance,
        sector_id integer,
        show_stats boolean DEFAULT true,
        show_clients boolean DEFAULT true,
        testimonial_id integer,
        style_color_scheme public.enum_pages_blocks_proof_strip_style_color_scheme DEFAULT 'default'::public.enum_pages_blocks_proof_strip_style_color_scheme,
        style_accent_colour public.enum_pages_blocks_proof_strip_style_accent_colour DEFAULT 'brand'::public.enum_pages_blocks_proof_strip_style_accent_colour,
        style_width public.enum_pages_blocks_proof_strip_style_width DEFAULT 'default'::public.enum_pages_blocks_proof_strip_style_width,
        style_padding_size public.enum_pages_blocks_proof_strip_style_padding_size DEFAULT 'compact'::public.enum_pages_blocks_proof_strip_style_padding_size,
        style_text_align public.enum_pages_blocks_proof_strip_style_text_align DEFAULT 'left'::public.enum_pages_blocks_proof_strip_style_text_align,
        style_heading_size public.enum_pages_blocks_proof_strip_style_heading_size DEFAULT 'default'::public.enum_pages_blocks_proof_strip_style_heading_size,
        style_heading_font public.enum_pages_blocks_proof_strip_style_heading_font DEFAULT 'display'::public.enum_pages_blocks_proof_strip_style_heading_font,
        style_body_font public.enum_pages_blocks_proof_strip_style_body_font DEFAULT 'display'::public.enum_pages_blocks_proof_strip_style_body_font,
        style_body_size public.enum_pages_blocks_proof_strip_style_body_size DEFAULT 'base'::public.enum_pages_blocks_proof_strip_style_body_size,
        style_animation_style public.enum_pages_blocks_proof_strip_style_animation_style DEFAULT 'fade-rise'::public.enum_pages_blocks_proof_strip_style_animation_style,
        style_animation_delay public.enum_pages_blocks_proof_strip_style_animation_delay DEFAULT 'medium'::public.enum_pages_blocks_proof_strip_style_animation_delay,
        style_with_border boolean DEFAULT true,
        style_gap_below public.enum_pages_blocks_proof_strip_style_gap_below DEFAULT 'small'::public.enum_pages_blocks_proof_strip_style_gap_below,
        block_name character varying
    );
    CREATE TABLE IF NOT EXISTS public.pages_blocks_related_content (
        _order integer NOT NULL,
        _parent_id integer NOT NULL,
        _path text NOT NULL,
        id character varying NOT NULL,
        heading character varying,
        appearance public.enum_pages_blocks_related_content_appearance DEFAULT 'default'::public.enum_pages_blocks_related_content_appearance,
        mode public.enum_pages_blocks_related_content_mode DEFAULT 'auto'::public.enum_pages_blocks_related_content_mode,
        "limit" numeric DEFAULT 3,
        style_color_scheme public.enum_pages_blocks_related_content_style_color_scheme DEFAULT 'default'::public.enum_pages_blocks_related_content_style_color_scheme,
        style_accent_colour public.enum_pages_blocks_related_content_style_accent_colour DEFAULT 'brand'::public.enum_pages_blocks_related_content_style_accent_colour,
        style_width public.enum_pages_blocks_related_content_style_width DEFAULT 'default'::public.enum_pages_blocks_related_content_style_width,
        style_padding_size public.enum_pages_blocks_related_content_style_padding_size DEFAULT 'compact'::public.enum_pages_blocks_related_content_style_padding_size,
        style_text_align public.enum_pages_blocks_related_content_style_text_align DEFAULT 'left'::public.enum_pages_blocks_related_content_style_text_align,
        style_heading_size public.enum_pages_blocks_related_content_style_heading_size DEFAULT 'default'::public.enum_pages_blocks_related_content_style_heading_size,
        style_heading_font public.enum_pages_blocks_related_content_style_heading_font DEFAULT 'display'::public.enum_pages_blocks_related_content_style_heading_font,
        style_body_font public.enum_pages_blocks_related_content_style_body_font DEFAULT 'display'::public.enum_pages_blocks_related_content_style_body_font,
        style_body_size public.enum_pages_blocks_related_content_style_body_size DEFAULT 'base'::public.enum_pages_blocks_related_content_style_body_size,
        style_animation_style public.enum_pages_blocks_related_content_style_animation_style DEFAULT 'fade-rise'::public.enum_pages_blocks_related_content_style_animation_style,
        style_animation_delay public.enum_pages_blocks_related_content_style_animation_delay DEFAULT 'medium'::public.enum_pages_blocks_related_content_style_animation_delay,
        style_with_border boolean DEFAULT true,
        style_gap_below public.enum_pages_blocks_related_content_style_gap_below DEFAULT 'small'::public.enum_pages_blocks_related_content_style_gap_below,
        block_name character varying
    );
    ALTER TABLE ONLY public._pages_v_blocks_gated_asset ALTER COLUMN id SET DEFAULT nextval('public._pages_v_blocks_gated_asset_id_seq'::regclass);
    ALTER TABLE ONLY public._pages_v_blocks_next_best_action ALTER COLUMN id SET DEFAULT nextval('public._pages_v_blocks_next_best_action_id_seq'::regclass);
    ALTER TABLE ONLY public._pages_v_blocks_proof_strip ALTER COLUMN id SET DEFAULT nextval('public._pages_v_blocks_proof_strip_id_seq'::regclass);
    ALTER TABLE ONLY public._pages_v_blocks_related_content ALTER COLUMN id SET DEFAULT nextval('public._pages_v_blocks_related_content_id_seq'::regclass);
    ALTER TABLE ONLY public.next_best_actions ALTER COLUMN id SET DEFAULT nextval('public.next_best_actions_id_seq'::regclass);
    DO $$ BEGIN
      ALTER TABLE ONLY public._pages_v_blocks_gated_asset
        ADD CONSTRAINT _pages_v_blocks_gated_asset_pkey PRIMARY KEY (id);
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE ONLY public._pages_v_blocks_next_best_action
        ADD CONSTRAINT _pages_v_blocks_next_best_action_pkey PRIMARY KEY (id);
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE ONLY public._pages_v_blocks_proof_strip
        ADD CONSTRAINT _pages_v_blocks_proof_strip_pkey PRIMARY KEY (id);
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE ONLY public._pages_v_blocks_related_content
        ADD CONSTRAINT _pages_v_blocks_related_content_pkey PRIMARY KEY (id);
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE ONLY public.next_best_actions
        ADD CONSTRAINT next_best_actions_pkey PRIMARY KEY (id);
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE ONLY public.next_best_actions_rules
        ADD CONSTRAINT next_best_actions_rules_pkey PRIMARY KEY (id);
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE ONLY public.pages_blocks_gated_asset
        ADD CONSTRAINT pages_blocks_gated_asset_pkey PRIMARY KEY (id);
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE ONLY public.pages_blocks_next_best_action
        ADD CONSTRAINT pages_blocks_next_best_action_pkey PRIMARY KEY (id);
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE ONLY public.pages_blocks_proof_strip
        ADD CONSTRAINT pages_blocks_proof_strip_pkey PRIMARY KEY (id);
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE ONLY public.pages_blocks_related_content
        ADD CONSTRAINT pages_blocks_related_content_pkey PRIMARY KEY (id);
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;
    CREATE INDEX IF NOT EXISTS _pages_v_blocks_gated_asset_order_idx ON public._pages_v_blocks_gated_asset USING btree (_order);
    CREATE INDEX IF NOT EXISTS _pages_v_blocks_gated_asset_parent_id_idx ON public._pages_v_blocks_gated_asset USING btree (_parent_id);
    CREATE INDEX IF NOT EXISTS _pages_v_blocks_gated_asset_path_idx ON public._pages_v_blocks_gated_asset USING btree (_path);
    CREATE INDEX IF NOT EXISTS _pages_v_blocks_gated_asset_resource_idx ON public._pages_v_blocks_gated_asset USING btree (resource_id);
    CREATE INDEX IF NOT EXISTS _pages_v_blocks_next_best_action_order_idx ON public._pages_v_blocks_next_best_action USING btree (_order);
    CREATE INDEX IF NOT EXISTS _pages_v_blocks_next_best_action_parent_id_idx ON public._pages_v_blocks_next_best_action USING btree (_parent_id);
    CREATE INDEX IF NOT EXISTS _pages_v_blocks_next_best_action_path_idx ON public._pages_v_blocks_next_best_action USING btree (_path);
    CREATE INDEX IF NOT EXISTS _pages_v_blocks_proof_strip_order_idx ON public._pages_v_blocks_proof_strip USING btree (_order);
    CREATE INDEX IF NOT EXISTS _pages_v_blocks_proof_strip_parent_id_idx ON public._pages_v_blocks_proof_strip USING btree (_parent_id);
    CREATE INDEX IF NOT EXISTS _pages_v_blocks_proof_strip_path_idx ON public._pages_v_blocks_proof_strip USING btree (_path);
    CREATE INDEX IF NOT EXISTS _pages_v_blocks_proof_strip_sector_idx ON public._pages_v_blocks_proof_strip USING btree (sector_id);
    CREATE INDEX IF NOT EXISTS _pages_v_blocks_proof_strip_testimonial_idx ON public._pages_v_blocks_proof_strip USING btree (testimonial_id);
    CREATE INDEX IF NOT EXISTS _pages_v_blocks_related_content_order_idx ON public._pages_v_blocks_related_content USING btree (_order);
    CREATE INDEX IF NOT EXISTS _pages_v_blocks_related_content_parent_id_idx ON public._pages_v_blocks_related_content USING btree (_parent_id);
    CREATE INDEX IF NOT EXISTS _pages_v_blocks_related_content_path_idx ON public._pages_v_blocks_related_content USING btree (_path);
    CREATE INDEX IF NOT EXISTS next_best_actions_rules_order_idx ON public.next_best_actions_rules USING btree (_order);
    CREATE INDEX IF NOT EXISTS next_best_actions_rules_parent_id_idx ON public.next_best_actions_rules USING btree (_parent_id);
    CREATE INDEX IF NOT EXISTS pages_blocks_gated_asset_order_idx ON public.pages_blocks_gated_asset USING btree (_order);
    CREATE INDEX IF NOT EXISTS pages_blocks_gated_asset_parent_id_idx ON public.pages_blocks_gated_asset USING btree (_parent_id);
    CREATE INDEX IF NOT EXISTS pages_blocks_gated_asset_path_idx ON public.pages_blocks_gated_asset USING btree (_path);
    CREATE INDEX IF NOT EXISTS pages_blocks_gated_asset_resource_idx ON public.pages_blocks_gated_asset USING btree (resource_id);
    CREATE INDEX IF NOT EXISTS pages_blocks_next_best_action_order_idx ON public.pages_blocks_next_best_action USING btree (_order);
    CREATE INDEX IF NOT EXISTS pages_blocks_next_best_action_parent_id_idx ON public.pages_blocks_next_best_action USING btree (_parent_id);
    CREATE INDEX IF NOT EXISTS pages_blocks_next_best_action_path_idx ON public.pages_blocks_next_best_action USING btree (_path);
    CREATE INDEX IF NOT EXISTS pages_blocks_proof_strip_order_idx ON public.pages_blocks_proof_strip USING btree (_order);
    CREATE INDEX IF NOT EXISTS pages_blocks_proof_strip_parent_id_idx ON public.pages_blocks_proof_strip USING btree (_parent_id);
    CREATE INDEX IF NOT EXISTS pages_blocks_proof_strip_path_idx ON public.pages_blocks_proof_strip USING btree (_path);
    CREATE INDEX IF NOT EXISTS pages_blocks_proof_strip_sector_idx ON public.pages_blocks_proof_strip USING btree (sector_id);
    CREATE INDEX IF NOT EXISTS pages_blocks_proof_strip_testimonial_idx ON public.pages_blocks_proof_strip USING btree (testimonial_id);
    CREATE INDEX IF NOT EXISTS pages_blocks_related_content_order_idx ON public.pages_blocks_related_content USING btree (_order);
    CREATE INDEX IF NOT EXISTS pages_blocks_related_content_parent_id_idx ON public.pages_blocks_related_content USING btree (_parent_id);
    CREATE INDEX IF NOT EXISTS pages_blocks_related_content_path_idx ON public.pages_blocks_related_content USING btree (_path);
    DO $$ BEGIN
      ALTER TABLE ONLY public._pages_v_blocks_gated_asset
        ADD CONSTRAINT _pages_v_blocks_gated_asset_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public._pages_v(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE ONLY public._pages_v_blocks_gated_asset
        ADD CONSTRAINT _pages_v_blocks_gated_asset_resource_id_knowledge_resources_id_ FOREIGN KEY (resource_id) REFERENCES public.knowledge_resources(id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE ONLY public._pages_v_blocks_next_best_action
        ADD CONSTRAINT _pages_v_blocks_next_best_action_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public._pages_v(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE ONLY public._pages_v_blocks_proof_strip
        ADD CONSTRAINT _pages_v_blocks_proof_strip_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public._pages_v(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE ONLY public._pages_v_blocks_proof_strip
        ADD CONSTRAINT _pages_v_blocks_proof_strip_sector_id_sectors_id_fk FOREIGN KEY (sector_id) REFERENCES public.sectors(id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE ONLY public._pages_v_blocks_proof_strip
        ADD CONSTRAINT _pages_v_blocks_proof_strip_testimonial_id_testimonials_id_fk FOREIGN KEY (testimonial_id) REFERENCES public.testimonials(id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE ONLY public._pages_v_blocks_related_content
        ADD CONSTRAINT _pages_v_blocks_related_content_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public._pages_v(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE ONLY public.next_best_actions_rules
        ADD CONSTRAINT next_best_actions_rules_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.next_best_actions(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE ONLY public.pages_blocks_gated_asset
        ADD CONSTRAINT pages_blocks_gated_asset_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.pages(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE ONLY public.pages_blocks_gated_asset
        ADD CONSTRAINT pages_blocks_gated_asset_resource_id_knowledge_resources_id_fk FOREIGN KEY (resource_id) REFERENCES public.knowledge_resources(id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE ONLY public.pages_blocks_next_best_action
        ADD CONSTRAINT pages_blocks_next_best_action_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.pages(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE ONLY public.pages_blocks_proof_strip
        ADD CONSTRAINT pages_blocks_proof_strip_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.pages(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE ONLY public.pages_blocks_proof_strip
        ADD CONSTRAINT pages_blocks_proof_strip_sector_id_sectors_id_fk FOREIGN KEY (sector_id) REFERENCES public.sectors(id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE ONLY public.pages_blocks_proof_strip
        ADD CONSTRAINT pages_blocks_proof_strip_testimonial_id_testimonials_id_fk FOREIGN KEY (testimonial_id) REFERENCES public.testimonials(id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE ONLY public.pages_blocks_related_content
        ADD CONSTRAINT pages_blocks_related_content_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.pages(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; WHEN invalid_table_definition THEN null; END $$;
  `);
  payload.logger.info("Created segment/gated/suggestion schema (Phase 3b).");
}

export async function down({ db, payload }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "public"."pages" DROP COLUMN IF EXISTS "segment";
    ALTER TABLE "public"."_pages_v" DROP COLUMN IF EXISTS "version_segment";
    ALTER TABLE "public"."knowledge_resources" DROP COLUMN IF EXISTS "gate_level";
    DROP TABLE IF EXISTS "public"."_pages_v_blocks_gated_asset" CASCADE;
    DROP TABLE IF EXISTS "public"."_pages_v_blocks_proof_strip" CASCADE;
    DROP TABLE IF EXISTS "public"."_pages_v_blocks_related_content" CASCADE;
    DROP TABLE IF EXISTS "public"."_pages_v_blocks_next_best_action" CASCADE;
    DROP TABLE IF EXISTS "public"."pages_blocks_gated_asset" CASCADE;
    DROP TABLE IF EXISTS "public"."pages_blocks_proof_strip" CASCADE;
    DROP TABLE IF EXISTS "public"."pages_blocks_related_content" CASCADE;
    DROP TABLE IF EXISTS "public"."pages_blocks_next_best_action" CASCADE;
    DROP TABLE IF EXISTS "public"."next_best_actions_rules" CASCADE;
    DROP TABLE IF EXISTS "public"."next_best_actions" CASCADE;
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_gated_asset_appearance";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_gated_asset_style_accent_colour";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_gated_asset_style_animation_delay";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_gated_asset_style_animation_style";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_gated_asset_style_body_font";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_gated_asset_style_body_size";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_gated_asset_style_color_scheme";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_gated_asset_style_gap_below";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_gated_asset_style_heading_font";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_gated_asset_style_heading_size";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_gated_asset_style_padding_size";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_gated_asset_style_text_align";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_gated_asset_style_width";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_next_best_action_appearance";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_next_best_action_segment";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_next_best_action_style_accent_colour";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_next_best_action_style_animation_delay";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_next_best_action_style_animation_style";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_next_best_action_style_body_font";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_next_best_action_style_body_size";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_next_best_action_style_color_scheme";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_next_best_action_style_gap_below";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_next_best_action_style_heading_font";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_next_best_action_style_heading_size";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_next_best_action_style_padding_size";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_next_best_action_style_text_align";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_next_best_action_style_width";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_proof_strip_appearance";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_proof_strip_style_accent_colour";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_proof_strip_style_animation_delay";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_proof_strip_style_animation_style";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_proof_strip_style_body_font";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_proof_strip_style_body_size";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_proof_strip_style_color_scheme";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_proof_strip_style_gap_below";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_proof_strip_style_heading_font";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_proof_strip_style_heading_size";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_proof_strip_style_padding_size";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_proof_strip_style_text_align";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_proof_strip_style_width";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_related_content_appearance";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_related_content_mode";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_related_content_style_accent_colour";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_related_content_style_animation_delay";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_related_content_style_animation_style";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_related_content_style_body_font";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_related_content_style_body_size";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_related_content_style_color_scheme";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_related_content_style_gap_below";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_related_content_style_heading_font";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_related_content_style_heading_size";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_related_content_style_padding_size";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_related_content_style_text_align";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_related_content_style_width";
    DROP TYPE IF EXISTS "public"."enum__pages_v_version_segment";
    DROP TYPE IF EXISTS "public"."enum_knowledge_resources_gate_level";
    DROP TYPE IF EXISTS "public"."enum_next_best_actions_rules_segment";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_gated_asset_appearance";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_gated_asset_style_accent_colour";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_gated_asset_style_animation_delay";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_gated_asset_style_animation_style";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_gated_asset_style_body_font";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_gated_asset_style_body_size";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_gated_asset_style_color_scheme";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_gated_asset_style_gap_below";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_gated_asset_style_heading_font";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_gated_asset_style_heading_size";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_gated_asset_style_padding_size";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_gated_asset_style_text_align";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_gated_asset_style_width";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_next_best_action_appearance";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_next_best_action_segment";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_next_best_action_style_accent_colour";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_next_best_action_style_animation_delay";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_next_best_action_style_animation_style";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_next_best_action_style_body_font";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_next_best_action_style_body_size";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_next_best_action_style_color_scheme";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_next_best_action_style_gap_below";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_next_best_action_style_heading_font";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_next_best_action_style_heading_size";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_next_best_action_style_padding_size";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_next_best_action_style_text_align";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_next_best_action_style_width";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_proof_strip_appearance";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_proof_strip_style_accent_colour";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_proof_strip_style_animation_delay";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_proof_strip_style_animation_style";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_proof_strip_style_body_font";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_proof_strip_style_body_size";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_proof_strip_style_color_scheme";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_proof_strip_style_gap_below";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_proof_strip_style_heading_font";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_proof_strip_style_heading_size";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_proof_strip_style_padding_size";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_proof_strip_style_text_align";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_proof_strip_style_width";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_related_content_appearance";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_related_content_mode";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_related_content_style_accent_colour";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_related_content_style_animation_delay";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_related_content_style_animation_style";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_related_content_style_body_font";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_related_content_style_body_size";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_related_content_style_color_scheme";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_related_content_style_gap_below";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_related_content_style_heading_font";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_related_content_style_heading_size";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_related_content_style_padding_size";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_related_content_style_text_align";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_related_content_style_width";
    DROP TYPE IF EXISTS "public"."enum_pages_segment";
  `);
  payload.logger.info("Reverted Phase 3b.");
}
