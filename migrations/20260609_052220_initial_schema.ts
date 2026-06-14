import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // ── Baseline guard ─────────────────────────────────────────────────────────
  // On a database that already has the schema (e.g. beta/local, provisioned by
  // `push` before migrations existed), this baseline must be a NO-OP so Payload
  // can RECORD it without trying to re-create existing objects. On a fresh
  // database `pages` is absent, so the full schema below is created normally.
  // Robust against driver result shapes: node-postgres returns { rows: [...] },
  // postgres-js returns the array directly. Treat either as "row list".
  const probe = (await db.execute(sql`SELECT to_regclass('public.pages') AS t`)) as unknown;
  const rows = (
    Array.isArray(probe) ? probe : ((probe as { rows?: unknown[] }).rows ?? [])
  ) as Array<{ t: string | null }>;
  if (rows.length > 0 && rows[0]?.t != null) {
    payload.logger.info(
      "Schema already provisioned — recording the baseline migration as a no-op.",
    );
    return;
  }

  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_hero_ctas_type" AS ENUM('page', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_hero_ctas_style" AS ENUM('primary', 'secondary');
  CREATE TYPE "public"."enum_pages_blocks_hero_height" AS ENUM('compact', 'standard', 'tall', 'screen');
  CREATE TYPE "public"."enum_pages_blocks_hero_tone" AS ENUM('dark', 'light');
  CREATE TYPE "public"."enum_pages_blocks_hero_hero_mode" AS ENUM('single', 'carousel');
  CREATE TYPE "public"."enum_pages_blocks_hero_side_media_source" AS ENUM('projects', 'library', 'manual');
  CREATE TYPE "public"."enum_pages_blocks_hero_style_color_scheme" AS ENUM('default', 'muted', 'dark', 'brand', 'energy', 'solar');
  CREATE TYPE "public"."enum_pages_blocks_hero_style_accent_colour" AS ENUM('brand', 'energy', 'solar');
  CREATE TYPE "public"."enum_pages_blocks_hero_style_width" AS ENUM('narrow', 'default', 'wide', 'full-bleed');
  CREATE TYPE "public"."enum_pages_blocks_hero_style_padding_size" AS ENUM('compact', 'standard', 'spacious');
  CREATE TYPE "public"."enum_pages_blocks_hero_style_text_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_pages_blocks_hero_style_heading_size" AS ENUM('default', 'large', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_hero_style_heading_font" AS ENUM('display', 'mono');
  CREATE TYPE "public"."enum_pages_blocks_hero_style_body_font" AS ENUM('sans', 'display', 'mono');
  CREATE TYPE "public"."enum_pages_blocks_hero_style_body_size" AS ENUM('sm', 'base', 'lg', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_hero_style_animation_style" AS ENUM('fade-rise', 'slide-left', 'slide-right', 'scale-up', 'stagger', 'none');
  CREATE TYPE "public"."enum_pages_blocks_hero_style_animation_delay" AS ENUM('none', 'short', 'medium', 'long');
  CREATE TYPE "public"."enum_pages_blocks_hero_style_gap_below" AS ENUM('none', 'small', 'default', 'large');
  CREATE TYPE "public"."enum_pages_blocks_rich_text_appearance" AS ENUM('default', 'muted', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_rich_text_style_color_scheme" AS ENUM('default', 'muted', 'dark', 'brand', 'energy', 'solar');
  CREATE TYPE "public"."enum_pages_blocks_rich_text_style_accent_colour" AS ENUM('brand', 'energy', 'solar');
  CREATE TYPE "public"."enum_pages_blocks_rich_text_style_width" AS ENUM('narrow', 'default', 'wide', 'full-bleed');
  CREATE TYPE "public"."enum_pages_blocks_rich_text_style_padding_size" AS ENUM('compact', 'standard', 'spacious');
  CREATE TYPE "public"."enum_pages_blocks_rich_text_style_text_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_pages_blocks_rich_text_style_heading_size" AS ENUM('default', 'large', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_rich_text_style_heading_font" AS ENUM('display', 'mono');
  CREATE TYPE "public"."enum_pages_blocks_rich_text_style_body_font" AS ENUM('sans', 'display', 'mono');
  CREATE TYPE "public"."enum_pages_blocks_rich_text_style_body_size" AS ENUM('sm', 'base', 'lg', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_rich_text_style_animation_style" AS ENUM('fade-rise', 'slide-left', 'slide-right', 'scale-up', 'stagger', 'none');
  CREATE TYPE "public"."enum_pages_blocks_rich_text_style_animation_delay" AS ENUM('none', 'short', 'medium', 'long');
  CREATE TYPE "public"."enum_pages_blocks_rich_text_style_gap_below" AS ENUM('none', 'small', 'default', 'large');
  CREATE TYPE "public"."enum_pages_blocks_stats_counters_appearance" AS ENUM('default', 'muted', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_stats_counters_style_color_scheme" AS ENUM('default', 'muted', 'dark', 'brand', 'energy', 'solar');
  CREATE TYPE "public"."enum_pages_blocks_stats_counters_style_accent_colour" AS ENUM('brand', 'energy', 'solar');
  CREATE TYPE "public"."enum_pages_blocks_stats_counters_style_width" AS ENUM('narrow', 'default', 'wide', 'full-bleed');
  CREATE TYPE "public"."enum_pages_blocks_stats_counters_style_padding_size" AS ENUM('compact', 'standard', 'spacious');
  CREATE TYPE "public"."enum_pages_blocks_stats_counters_style_text_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_pages_blocks_stats_counters_style_heading_size" AS ENUM('default', 'large', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_stats_counters_style_heading_font" AS ENUM('display', 'mono');
  CREATE TYPE "public"."enum_pages_blocks_stats_counters_style_body_font" AS ENUM('sans', 'display', 'mono');
  CREATE TYPE "public"."enum_pages_blocks_stats_counters_style_body_size" AS ENUM('sm', 'base', 'lg', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_stats_counters_style_animation_style" AS ENUM('fade-rise', 'slide-left', 'slide-right', 'scale-up', 'stagger', 'none');
  CREATE TYPE "public"."enum_pages_blocks_stats_counters_style_animation_delay" AS ENUM('none', 'short', 'medium', 'long');
  CREATE TYPE "public"."enum_pages_blocks_stats_counters_style_gap_below" AS ENUM('none', 'small', 'default', 'large');
  CREATE TYPE "public"."enum_pages_blocks_services_grid_source" AS ENUM('auto', 'selected');
  CREATE TYPE "public"."enum_pages_blocks_services_grid_appearance" AS ENUM('default', 'muted', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_services_grid_style_color_scheme" AS ENUM('default', 'muted', 'dark', 'brand', 'energy', 'solar');
  CREATE TYPE "public"."enum_pages_blocks_services_grid_style_accent_colour" AS ENUM('brand', 'energy', 'solar');
  CREATE TYPE "public"."enum_pages_blocks_services_grid_style_width" AS ENUM('narrow', 'default', 'wide', 'full-bleed');
  CREATE TYPE "public"."enum_pages_blocks_services_grid_style_padding_size" AS ENUM('compact', 'standard', 'spacious');
  CREATE TYPE "public"."enum_pages_blocks_services_grid_style_text_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_pages_blocks_services_grid_style_heading_size" AS ENUM('default', 'large', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_services_grid_style_heading_font" AS ENUM('display', 'mono');
  CREATE TYPE "public"."enum_pages_blocks_services_grid_style_body_font" AS ENUM('sans', 'display', 'mono');
  CREATE TYPE "public"."enum_pages_blocks_services_grid_style_body_size" AS ENUM('sm', 'base', 'lg', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_services_grid_style_animation_style" AS ENUM('fade-rise', 'slide-left', 'slide-right', 'scale-up', 'stagger', 'none');
  CREATE TYPE "public"."enum_pages_blocks_services_grid_style_animation_delay" AS ENUM('none', 'short', 'medium', 'long');
  CREATE TYPE "public"."enum_pages_blocks_services_grid_style_gap_below" AS ENUM('none', 'small', 'default', 'large');
  CREATE TYPE "public"."enum_pages_blocks_sector_tiles_source" AS ENUM('auto', 'selected');
  CREATE TYPE "public"."enum_pages_blocks_sector_tiles_appearance" AS ENUM('default', 'muted', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_sector_tiles_style_color_scheme" AS ENUM('default', 'muted', 'dark', 'brand', 'energy', 'solar');
  CREATE TYPE "public"."enum_pages_blocks_sector_tiles_style_accent_colour" AS ENUM('brand', 'energy', 'solar');
  CREATE TYPE "public"."enum_pages_blocks_sector_tiles_style_width" AS ENUM('narrow', 'default', 'wide', 'full-bleed');
  CREATE TYPE "public"."enum_pages_blocks_sector_tiles_style_padding_size" AS ENUM('compact', 'standard', 'spacious');
  CREATE TYPE "public"."enum_pages_blocks_sector_tiles_style_text_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_pages_blocks_sector_tiles_style_heading_size" AS ENUM('default', 'large', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_sector_tiles_style_heading_font" AS ENUM('display', 'mono');
  CREATE TYPE "public"."enum_pages_blocks_sector_tiles_style_body_font" AS ENUM('sans', 'display', 'mono');
  CREATE TYPE "public"."enum_pages_blocks_sector_tiles_style_body_size" AS ENUM('sm', 'base', 'lg', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_sector_tiles_style_animation_style" AS ENUM('fade-rise', 'slide-left', 'slide-right', 'scale-up', 'stagger', 'none');
  CREATE TYPE "public"."enum_pages_blocks_sector_tiles_style_animation_delay" AS ENUM('none', 'short', 'medium', 'long');
  CREATE TYPE "public"."enum_pages_blocks_sector_tiles_style_gap_below" AS ENUM('none', 'small', 'default', 'large');
  CREATE TYPE "public"."enum_pages_blocks_projects_list_source" AS ENUM('featured', 'selected');
  CREATE TYPE "public"."enum_pages_blocks_projects_list_appearance" AS ENUM('default', 'muted', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_projects_list_style_color_scheme" AS ENUM('default', 'muted', 'dark', 'brand', 'energy', 'solar');
  CREATE TYPE "public"."enum_pages_blocks_projects_list_style_accent_colour" AS ENUM('brand', 'energy', 'solar');
  CREATE TYPE "public"."enum_pages_blocks_projects_list_style_width" AS ENUM('narrow', 'default', 'wide', 'full-bleed');
  CREATE TYPE "public"."enum_pages_blocks_projects_list_style_padding_size" AS ENUM('compact', 'standard', 'spacious');
  CREATE TYPE "public"."enum_pages_blocks_projects_list_style_text_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_pages_blocks_projects_list_style_heading_size" AS ENUM('default', 'large', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_projects_list_style_heading_font" AS ENUM('display', 'mono');
  CREATE TYPE "public"."enum_pages_blocks_projects_list_style_body_font" AS ENUM('sans', 'display', 'mono');
  CREATE TYPE "public"."enum_pages_blocks_projects_list_style_body_size" AS ENUM('sm', 'base', 'lg', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_projects_list_style_animation_style" AS ENUM('fade-rise', 'slide-left', 'slide-right', 'scale-up', 'stagger', 'none');
  CREATE TYPE "public"."enum_pages_blocks_projects_list_style_animation_delay" AS ENUM('none', 'short', 'medium', 'long');
  CREATE TYPE "public"."enum_pages_blocks_projects_list_style_gap_below" AS ENUM('none', 'small', 'default', 'large');
  CREATE TYPE "public"."enum_pages_blocks_image_gallery_appearance" AS ENUM('default', 'muted', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_image_gallery_style_color_scheme" AS ENUM('default', 'muted', 'dark', 'brand', 'energy', 'solar');
  CREATE TYPE "public"."enum_pages_blocks_image_gallery_style_accent_colour" AS ENUM('brand', 'energy', 'solar');
  CREATE TYPE "public"."enum_pages_blocks_image_gallery_style_width" AS ENUM('narrow', 'default', 'wide', 'full-bleed');
  CREATE TYPE "public"."enum_pages_blocks_image_gallery_style_padding_size" AS ENUM('compact', 'standard', 'spacious');
  CREATE TYPE "public"."enum_pages_blocks_image_gallery_style_text_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_pages_blocks_image_gallery_style_heading_size" AS ENUM('default', 'large', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_image_gallery_style_heading_font" AS ENUM('display', 'mono');
  CREATE TYPE "public"."enum_pages_blocks_image_gallery_style_body_font" AS ENUM('sans', 'display', 'mono');
  CREATE TYPE "public"."enum_pages_blocks_image_gallery_style_body_size" AS ENUM('sm', 'base', 'lg', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_image_gallery_style_animation_style" AS ENUM('fade-rise', 'slide-left', 'slide-right', 'scale-up', 'stagger', 'none');
  CREATE TYPE "public"."enum_pages_blocks_image_gallery_style_animation_delay" AS ENUM('none', 'short', 'medium', 'long');
  CREATE TYPE "public"."enum_pages_blocks_image_gallery_style_gap_below" AS ENUM('none', 'small', 'default', 'large');
  CREATE TYPE "public"."enum_pages_blocks_photo_strip_appearance" AS ENUM('default', 'muted', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_photo_strip_display_mode" AS ENUM('marquee', 'carousel');
  CREATE TYPE "public"."enum_pages_blocks_photo_strip_speed" AS ENUM('slow', 'normal', 'fast');
  CREATE TYPE "public"."enum_pages_blocks_photo_strip_style_color_scheme" AS ENUM('default', 'muted', 'dark', 'brand', 'energy', 'solar');
  CREATE TYPE "public"."enum_pages_blocks_photo_strip_style_accent_colour" AS ENUM('brand', 'energy', 'solar');
  CREATE TYPE "public"."enum_pages_blocks_photo_strip_style_width" AS ENUM('narrow', 'default', 'wide', 'full-bleed');
  CREATE TYPE "public"."enum_pages_blocks_photo_strip_style_padding_size" AS ENUM('compact', 'standard', 'spacious');
  CREATE TYPE "public"."enum_pages_blocks_photo_strip_style_text_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_pages_blocks_photo_strip_style_heading_size" AS ENUM('default', 'large', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_photo_strip_style_heading_font" AS ENUM('display', 'mono');
  CREATE TYPE "public"."enum_pages_blocks_photo_strip_style_body_font" AS ENUM('sans', 'display', 'mono');
  CREATE TYPE "public"."enum_pages_blocks_photo_strip_style_body_size" AS ENUM('sm', 'base', 'lg', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_photo_strip_style_animation_style" AS ENUM('fade-rise', 'slide-left', 'slide-right', 'scale-up', 'stagger', 'none');
  CREATE TYPE "public"."enum_pages_blocks_photo_strip_style_animation_delay" AS ENUM('none', 'short', 'medium', 'long');
  CREATE TYPE "public"."enum_pages_blocks_photo_strip_style_gap_below" AS ENUM('none', 'small', 'default', 'large');
  CREATE TYPE "public"."enum_pages_blocks_video_showcase_videos_source" AS ENUM('upload', 'url');
  CREATE TYPE "public"."enum_pages_blocks_video_showcase_layout" AS ENUM('spotlight', 'grid');
  CREATE TYPE "public"."enum_pages_blocks_video_showcase_tone" AS ENUM('dark', 'light', 'muted', 'brand');
  CREATE TYPE "public"."enum_pages_blocks_video_showcase_style_color_scheme" AS ENUM('default', 'muted', 'dark', 'brand', 'energy', 'solar');
  CREATE TYPE "public"."enum_pages_blocks_video_showcase_style_accent_colour" AS ENUM('brand', 'energy', 'solar');
  CREATE TYPE "public"."enum_pages_blocks_video_showcase_style_width" AS ENUM('narrow', 'default', 'wide', 'full-bleed');
  CREATE TYPE "public"."enum_pages_blocks_video_showcase_style_padding_size" AS ENUM('compact', 'standard', 'spacious');
  CREATE TYPE "public"."enum_pages_blocks_video_showcase_style_text_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_pages_blocks_video_showcase_style_heading_size" AS ENUM('default', 'large', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_video_showcase_style_heading_font" AS ENUM('display', 'mono');
  CREATE TYPE "public"."enum_pages_blocks_video_showcase_style_body_font" AS ENUM('sans', 'display', 'mono');
  CREATE TYPE "public"."enum_pages_blocks_video_showcase_style_body_size" AS ENUM('sm', 'base', 'lg', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_video_showcase_style_animation_style" AS ENUM('fade-rise', 'slide-left', 'slide-right', 'scale-up', 'stagger', 'none');
  CREATE TYPE "public"."enum_pages_blocks_video_showcase_style_animation_delay" AS ENUM('none', 'short', 'medium', 'long');
  CREATE TYPE "public"."enum_pages_blocks_video_showcase_style_gap_below" AS ENUM('none', 'small', 'default', 'large');
  CREATE TYPE "public"."enum_pages_blocks_logo_wall_source" AS ENUM('auto', 'selected');
  CREATE TYPE "public"."enum_pages_blocks_logo_wall_appearance" AS ENUM('default', 'muted', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_logo_wall_style_color_scheme" AS ENUM('default', 'muted', 'dark', 'brand', 'energy', 'solar');
  CREATE TYPE "public"."enum_pages_blocks_logo_wall_style_accent_colour" AS ENUM('brand', 'energy', 'solar');
  CREATE TYPE "public"."enum_pages_blocks_logo_wall_style_width" AS ENUM('narrow', 'default', 'wide', 'full-bleed');
  CREATE TYPE "public"."enum_pages_blocks_logo_wall_style_padding_size" AS ENUM('compact', 'standard', 'spacious');
  CREATE TYPE "public"."enum_pages_blocks_logo_wall_style_text_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_pages_blocks_logo_wall_style_heading_size" AS ENUM('default', 'large', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_logo_wall_style_heading_font" AS ENUM('display', 'mono');
  CREATE TYPE "public"."enum_pages_blocks_logo_wall_style_body_font" AS ENUM('sans', 'display', 'mono');
  CREATE TYPE "public"."enum_pages_blocks_logo_wall_style_body_size" AS ENUM('sm', 'base', 'lg', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_logo_wall_style_animation_style" AS ENUM('fade-rise', 'slide-left', 'slide-right', 'scale-up', 'stagger', 'none');
  CREATE TYPE "public"."enum_pages_blocks_logo_wall_style_animation_delay" AS ENUM('none', 'short', 'medium', 'long');
  CREATE TYPE "public"."enum_pages_blocks_logo_wall_style_gap_below" AS ENUM('none', 'small', 'default', 'large');
  CREATE TYPE "public"."enum_pages_blocks_partner_bar_appearance" AS ENUM('default', 'muted', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_partner_bar_style_color_scheme" AS ENUM('default', 'muted', 'dark', 'brand', 'energy', 'solar');
  CREATE TYPE "public"."enum_pages_blocks_partner_bar_style_accent_colour" AS ENUM('brand', 'energy', 'solar');
  CREATE TYPE "public"."enum_pages_blocks_partner_bar_style_width" AS ENUM('narrow', 'default', 'wide', 'full-bleed');
  CREATE TYPE "public"."enum_pages_blocks_partner_bar_style_padding_size" AS ENUM('compact', 'standard', 'spacious');
  CREATE TYPE "public"."enum_pages_blocks_partner_bar_style_text_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_pages_blocks_partner_bar_style_heading_size" AS ENUM('default', 'large', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_partner_bar_style_heading_font" AS ENUM('display', 'mono');
  CREATE TYPE "public"."enum_pages_blocks_partner_bar_style_body_font" AS ENUM('sans', 'display', 'mono');
  CREATE TYPE "public"."enum_pages_blocks_partner_bar_style_body_size" AS ENUM('sm', 'base', 'lg', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_partner_bar_style_animation_style" AS ENUM('fade-rise', 'slide-left', 'slide-right', 'scale-up', 'stagger', 'none');
  CREATE TYPE "public"."enum_pages_blocks_partner_bar_style_animation_delay" AS ENUM('none', 'short', 'medium', 'long');
  CREATE TYPE "public"."enum_pages_blocks_partner_bar_style_gap_below" AS ENUM('none', 'small', 'default', 'large');
  CREATE TYPE "public"."enum_pages_blocks_product_showcase_source" AS ENUM('featured', 'selected');
  CREATE TYPE "public"."enum_pages_blocks_product_showcase_appearance" AS ENUM('default', 'muted', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_product_showcase_style_color_scheme" AS ENUM('default', 'muted', 'dark', 'brand', 'energy', 'solar');
  CREATE TYPE "public"."enum_pages_blocks_product_showcase_style_accent_colour" AS ENUM('brand', 'energy', 'solar');
  CREATE TYPE "public"."enum_pages_blocks_product_showcase_style_width" AS ENUM('narrow', 'default', 'wide', 'full-bleed');
  CREATE TYPE "public"."enum_pages_blocks_product_showcase_style_padding_size" AS ENUM('compact', 'standard', 'spacious');
  CREATE TYPE "public"."enum_pages_blocks_product_showcase_style_text_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_pages_blocks_product_showcase_style_heading_size" AS ENUM('default', 'large', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_product_showcase_style_heading_font" AS ENUM('display', 'mono');
  CREATE TYPE "public"."enum_pages_blocks_product_showcase_style_body_font" AS ENUM('sans', 'display', 'mono');
  CREATE TYPE "public"."enum_pages_blocks_product_showcase_style_body_size" AS ENUM('sm', 'base', 'lg', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_product_showcase_style_animation_style" AS ENUM('fade-rise', 'slide-left', 'slide-right', 'scale-up', 'stagger', 'none');
  CREATE TYPE "public"."enum_pages_blocks_product_showcase_style_animation_delay" AS ENUM('none', 'short', 'medium', 'long');
  CREATE TYPE "public"."enum_pages_blocks_product_showcase_style_gap_below" AS ENUM('none', 'small', 'default', 'large');
  CREATE TYPE "public"."enum_pages_blocks_articles_list_appearance" AS ENUM('default', 'muted', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_articles_list_style_color_scheme" AS ENUM('default', 'muted', 'dark', 'brand', 'energy', 'solar');
  CREATE TYPE "public"."enum_pages_blocks_articles_list_style_accent_colour" AS ENUM('brand', 'energy', 'solar');
  CREATE TYPE "public"."enum_pages_blocks_articles_list_style_width" AS ENUM('narrow', 'default', 'wide', 'full-bleed');
  CREATE TYPE "public"."enum_pages_blocks_articles_list_style_padding_size" AS ENUM('compact', 'standard', 'spacious');
  CREATE TYPE "public"."enum_pages_blocks_articles_list_style_text_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_pages_blocks_articles_list_style_heading_size" AS ENUM('default', 'large', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_articles_list_style_heading_font" AS ENUM('display', 'mono');
  CREATE TYPE "public"."enum_pages_blocks_articles_list_style_body_font" AS ENUM('sans', 'display', 'mono');
  CREATE TYPE "public"."enum_pages_blocks_articles_list_style_body_size" AS ENUM('sm', 'base', 'lg', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_articles_list_style_animation_style" AS ENUM('fade-rise', 'slide-left', 'slide-right', 'scale-up', 'stagger', 'none');
  CREATE TYPE "public"."enum_pages_blocks_articles_list_style_animation_delay" AS ENUM('none', 'short', 'medium', 'long');
  CREATE TYPE "public"."enum_pages_blocks_articles_list_style_gap_below" AS ENUM('none', 'small', 'default', 'large');
  CREATE TYPE "public"."enum_pages_blocks_testimonials_source" AS ENUM('auto', 'selected');
  CREATE TYPE "public"."enum_pages_blocks_testimonials_appearance" AS ENUM('default', 'muted', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_testimonials_style_color_scheme" AS ENUM('default', 'muted', 'dark', 'brand', 'energy', 'solar');
  CREATE TYPE "public"."enum_pages_blocks_testimonials_style_accent_colour" AS ENUM('brand', 'energy', 'solar');
  CREATE TYPE "public"."enum_pages_blocks_testimonials_style_width" AS ENUM('narrow', 'default', 'wide', 'full-bleed');
  CREATE TYPE "public"."enum_pages_blocks_testimonials_style_padding_size" AS ENUM('compact', 'standard', 'spacious');
  CREATE TYPE "public"."enum_pages_blocks_testimonials_style_text_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_pages_blocks_testimonials_style_heading_size" AS ENUM('default', 'large', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_testimonials_style_heading_font" AS ENUM('display', 'mono');
  CREATE TYPE "public"."enum_pages_blocks_testimonials_style_body_font" AS ENUM('sans', 'display', 'mono');
  CREATE TYPE "public"."enum_pages_blocks_testimonials_style_body_size" AS ENUM('sm', 'base', 'lg', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_testimonials_style_animation_style" AS ENUM('fade-rise', 'slide-left', 'slide-right', 'scale-up', 'stagger', 'none');
  CREATE TYPE "public"."enum_pages_blocks_testimonials_style_animation_delay" AS ENUM('none', 'short', 'medium', 'long');
  CREATE TYPE "public"."enum_pages_blocks_testimonials_style_gap_below" AS ENUM('none', 'small', 'default', 'large');
  CREATE TYPE "public"."enum_pages_blocks_team_grid_source" AS ENUM('auto', 'selected');
  CREATE TYPE "public"."enum_pages_blocks_team_grid_appearance" AS ENUM('default', 'muted', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_team_grid_group" AS ENUM('all', 'leadership', 'management', 'engineering', 'consultant', 'advisor', 'other');
  CREATE TYPE "public"."enum_pages_blocks_team_grid_style_color_scheme" AS ENUM('default', 'muted', 'dark', 'brand', 'energy', 'solar');
  CREATE TYPE "public"."enum_pages_blocks_team_grid_style_accent_colour" AS ENUM('brand', 'energy', 'solar');
  CREATE TYPE "public"."enum_pages_blocks_team_grid_style_width" AS ENUM('narrow', 'default', 'wide', 'full-bleed');
  CREATE TYPE "public"."enum_pages_blocks_team_grid_style_padding_size" AS ENUM('compact', 'standard', 'spacious');
  CREATE TYPE "public"."enum_pages_blocks_team_grid_style_text_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_pages_blocks_team_grid_style_heading_size" AS ENUM('default', 'large', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_team_grid_style_heading_font" AS ENUM('display', 'mono');
  CREATE TYPE "public"."enum_pages_blocks_team_grid_style_body_font" AS ENUM('sans', 'display', 'mono');
  CREATE TYPE "public"."enum_pages_blocks_team_grid_style_body_size" AS ENUM('sm', 'base', 'lg', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_team_grid_style_animation_style" AS ENUM('fade-rise', 'slide-left', 'slide-right', 'scale-up', 'stagger', 'none');
  CREATE TYPE "public"."enum_pages_blocks_team_grid_style_animation_delay" AS ENUM('none', 'short', 'medium', 'long');
  CREATE TYPE "public"."enum_pages_blocks_team_grid_style_gap_below" AS ENUM('none', 'small', 'default', 'large');
  CREATE TYPE "public"."enum_pages_blocks_steps_appearance" AS ENUM('default', 'muted', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_steps_style_color_scheme" AS ENUM('default', 'muted', 'dark', 'brand', 'energy', 'solar');
  CREATE TYPE "public"."enum_pages_blocks_steps_style_accent_colour" AS ENUM('brand', 'energy', 'solar');
  CREATE TYPE "public"."enum_pages_blocks_steps_style_width" AS ENUM('narrow', 'default', 'wide', 'full-bleed');
  CREATE TYPE "public"."enum_pages_blocks_steps_style_padding_size" AS ENUM('compact', 'standard', 'spacious');
  CREATE TYPE "public"."enum_pages_blocks_steps_style_text_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_pages_blocks_steps_style_heading_size" AS ENUM('default', 'large', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_steps_style_heading_font" AS ENUM('display', 'mono');
  CREATE TYPE "public"."enum_pages_blocks_steps_style_body_font" AS ENUM('sans', 'display', 'mono');
  CREATE TYPE "public"."enum_pages_blocks_steps_style_body_size" AS ENUM('sm', 'base', 'lg', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_steps_style_animation_style" AS ENUM('fade-rise', 'slide-left', 'slide-right', 'scale-up', 'stagger', 'none');
  CREATE TYPE "public"."enum_pages_blocks_steps_style_animation_delay" AS ENUM('none', 'short', 'medium', 'long');
  CREATE TYPE "public"."enum_pages_blocks_steps_style_gap_below" AS ENUM('none', 'small', 'default', 'large');
  CREATE TYPE "public"."enum_pages_blocks_cta_band_ctas_type" AS ENUM('page', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_cta_band_ctas_style" AS ENUM('primary', 'secondary');
  CREATE TYPE "public"."enum_pages_blocks_cta_band_style_color_scheme" AS ENUM('default', 'muted', 'dark', 'brand', 'energy', 'solar');
  CREATE TYPE "public"."enum_pages_blocks_cta_band_style_accent_colour" AS ENUM('brand', 'energy', 'solar');
  CREATE TYPE "public"."enum_pages_blocks_cta_band_style_width" AS ENUM('narrow', 'default', 'wide', 'full-bleed');
  CREATE TYPE "public"."enum_pages_blocks_cta_band_style_padding_size" AS ENUM('compact', 'standard', 'spacious');
  CREATE TYPE "public"."enum_pages_blocks_cta_band_style_text_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_pages_blocks_cta_band_style_heading_size" AS ENUM('default', 'large', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_cta_band_style_heading_font" AS ENUM('display', 'mono');
  CREATE TYPE "public"."enum_pages_blocks_cta_band_style_body_font" AS ENUM('sans', 'display', 'mono');
  CREATE TYPE "public"."enum_pages_blocks_cta_band_style_body_size" AS ENUM('sm', 'base', 'lg', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_cta_band_style_animation_style" AS ENUM('fade-rise', 'slide-left', 'slide-right', 'scale-up', 'stagger', 'none');
  CREATE TYPE "public"."enum_pages_blocks_cta_band_style_animation_delay" AS ENUM('none', 'short', 'medium', 'long');
  CREATE TYPE "public"."enum_pages_blocks_cta_band_style_gap_below" AS ENUM('none', 'small', 'default', 'large');
  CREATE TYPE "public"."enum_pages_blocks_faq_appearance" AS ENUM('default', 'muted', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_faq_style_color_scheme" AS ENUM('default', 'muted', 'dark', 'brand', 'energy', 'solar');
  CREATE TYPE "public"."enum_pages_blocks_faq_style_accent_colour" AS ENUM('brand', 'energy', 'solar');
  CREATE TYPE "public"."enum_pages_blocks_faq_style_width" AS ENUM('narrow', 'default', 'wide', 'full-bleed');
  CREATE TYPE "public"."enum_pages_blocks_faq_style_padding_size" AS ENUM('compact', 'standard', 'spacious');
  CREATE TYPE "public"."enum_pages_blocks_faq_style_text_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_pages_blocks_faq_style_heading_size" AS ENUM('default', 'large', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_faq_style_heading_font" AS ENUM('display', 'mono');
  CREATE TYPE "public"."enum_pages_blocks_faq_style_body_font" AS ENUM('sans', 'display', 'mono');
  CREATE TYPE "public"."enum_pages_blocks_faq_style_body_size" AS ENUM('sm', 'base', 'lg', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_faq_style_animation_style" AS ENUM('fade-rise', 'slide-left', 'slide-right', 'scale-up', 'stagger', 'none');
  CREATE TYPE "public"."enum_pages_blocks_faq_style_animation_delay" AS ENUM('none', 'short', 'medium', 'long');
  CREATE TYPE "public"."enum_pages_blocks_faq_style_gap_below" AS ENUM('none', 'small', 'default', 'large');
  CREATE TYPE "public"."enum_pages_blocks_calculator_embed_appearance" AS ENUM('default', 'muted', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_calculator_embed_tool" AS ENUM('solarcalc', 'roi');
  CREATE TYPE "public"."enum_pages_blocks_calculator_embed_style_color_scheme" AS ENUM('default', 'muted', 'dark', 'brand', 'energy', 'solar');
  CREATE TYPE "public"."enum_pages_blocks_calculator_embed_style_accent_colour" AS ENUM('brand', 'energy', 'solar');
  CREATE TYPE "public"."enum_pages_blocks_calculator_embed_style_width" AS ENUM('narrow', 'default', 'wide', 'full-bleed');
  CREATE TYPE "public"."enum_pages_blocks_calculator_embed_style_padding_size" AS ENUM('compact', 'standard', 'spacious');
  CREATE TYPE "public"."enum_pages_blocks_calculator_embed_style_text_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_pages_blocks_calculator_embed_style_heading_size" AS ENUM('default', 'large', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_calculator_embed_style_heading_font" AS ENUM('display', 'mono');
  CREATE TYPE "public"."enum_pages_blocks_calculator_embed_style_body_font" AS ENUM('sans', 'display', 'mono');
  CREATE TYPE "public"."enum_pages_blocks_calculator_embed_style_body_size" AS ENUM('sm', 'base', 'lg', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_calculator_embed_style_animation_style" AS ENUM('fade-rise', 'slide-left', 'slide-right', 'scale-up', 'stagger', 'none');
  CREATE TYPE "public"."enum_pages_blocks_calculator_embed_style_animation_delay" AS ENUM('none', 'short', 'medium', 'long');
  CREATE TYPE "public"."enum_pages_blocks_calculator_embed_style_gap_below" AS ENUM('none', 'small', 'default', 'large');
  CREATE TYPE "public"."enum_pages_blocks_contact_r_f_q_appearance" AS ENUM('default', 'muted', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_contact_r_f_q_style_color_scheme" AS ENUM('default', 'muted', 'dark', 'brand', 'energy', 'solar');
  CREATE TYPE "public"."enum_pages_blocks_contact_r_f_q_style_accent_colour" AS ENUM('brand', 'energy', 'solar');
  CREATE TYPE "public"."enum_pages_blocks_contact_r_f_q_style_width" AS ENUM('narrow', 'default', 'wide', 'full-bleed');
  CREATE TYPE "public"."enum_pages_blocks_contact_r_f_q_style_padding_size" AS ENUM('compact', 'standard', 'spacious');
  CREATE TYPE "public"."enum_pages_blocks_contact_r_f_q_style_text_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_pages_blocks_contact_r_f_q_style_heading_size" AS ENUM('default', 'large', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_contact_r_f_q_style_heading_font" AS ENUM('display', 'mono');
  CREATE TYPE "public"."enum_pages_blocks_contact_r_f_q_style_body_font" AS ENUM('sans', 'display', 'mono');
  CREATE TYPE "public"."enum_pages_blocks_contact_r_f_q_style_body_size" AS ENUM('sm', 'base', 'lg', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_contact_r_f_q_style_animation_style" AS ENUM('fade-rise', 'slide-left', 'slide-right', 'scale-up', 'stagger', 'none');
  CREATE TYPE "public"."enum_pages_blocks_contact_r_f_q_style_animation_delay" AS ENUM('none', 'short', 'medium', 'long');
  CREATE TYPE "public"."enum_pages_blocks_contact_r_f_q_style_gap_below" AS ENUM('none', 'small', 'default', 'large');
  CREATE TYPE "public"."enum_pages_blocks_spacer_size" AS ENUM('sm', 'md', 'lg');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_ctas_type" AS ENUM('page', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_ctas_style" AS ENUM('primary', 'secondary');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_height" AS ENUM('compact', 'standard', 'tall', 'screen');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_tone" AS ENUM('dark', 'light');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_hero_mode" AS ENUM('single', 'carousel');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_side_media_source" AS ENUM('projects', 'library', 'manual');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_style_color_scheme" AS ENUM('default', 'muted', 'dark', 'brand', 'energy', 'solar');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_style_accent_colour" AS ENUM('brand', 'energy', 'solar');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_style_width" AS ENUM('narrow', 'default', 'wide', 'full-bleed');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_style_padding_size" AS ENUM('compact', 'standard', 'spacious');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_style_text_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_style_heading_size" AS ENUM('default', 'large', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_style_heading_font" AS ENUM('display', 'mono');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_style_body_font" AS ENUM('sans', 'display', 'mono');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_style_body_size" AS ENUM('sm', 'base', 'lg', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_style_animation_style" AS ENUM('fade-rise', 'slide-left', 'slide-right', 'scale-up', 'stagger', 'none');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_style_animation_delay" AS ENUM('none', 'short', 'medium', 'long');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_style_gap_below" AS ENUM('none', 'small', 'default', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_rich_text_appearance" AS ENUM('default', 'muted', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_rich_text_style_color_scheme" AS ENUM('default', 'muted', 'dark', 'brand', 'energy', 'solar');
  CREATE TYPE "public"."enum__pages_v_blocks_rich_text_style_accent_colour" AS ENUM('brand', 'energy', 'solar');
  CREATE TYPE "public"."enum__pages_v_blocks_rich_text_style_width" AS ENUM('narrow', 'default', 'wide', 'full-bleed');
  CREATE TYPE "public"."enum__pages_v_blocks_rich_text_style_padding_size" AS ENUM('compact', 'standard', 'spacious');
  CREATE TYPE "public"."enum__pages_v_blocks_rich_text_style_text_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__pages_v_blocks_rich_text_style_heading_size" AS ENUM('default', 'large', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_rich_text_style_heading_font" AS ENUM('display', 'mono');
  CREATE TYPE "public"."enum__pages_v_blocks_rich_text_style_body_font" AS ENUM('sans', 'display', 'mono');
  CREATE TYPE "public"."enum__pages_v_blocks_rich_text_style_body_size" AS ENUM('sm', 'base', 'lg', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_rich_text_style_animation_style" AS ENUM('fade-rise', 'slide-left', 'slide-right', 'scale-up', 'stagger', 'none');
  CREATE TYPE "public"."enum__pages_v_blocks_rich_text_style_animation_delay" AS ENUM('none', 'short', 'medium', 'long');
  CREATE TYPE "public"."enum__pages_v_blocks_rich_text_style_gap_below" AS ENUM('none', 'small', 'default', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_stats_counters_appearance" AS ENUM('default', 'muted', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_stats_counters_style_color_scheme" AS ENUM('default', 'muted', 'dark', 'brand', 'energy', 'solar');
  CREATE TYPE "public"."enum__pages_v_blocks_stats_counters_style_accent_colour" AS ENUM('brand', 'energy', 'solar');
  CREATE TYPE "public"."enum__pages_v_blocks_stats_counters_style_width" AS ENUM('narrow', 'default', 'wide', 'full-bleed');
  CREATE TYPE "public"."enum__pages_v_blocks_stats_counters_style_padding_size" AS ENUM('compact', 'standard', 'spacious');
  CREATE TYPE "public"."enum__pages_v_blocks_stats_counters_style_text_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__pages_v_blocks_stats_counters_style_heading_size" AS ENUM('default', 'large', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_stats_counters_style_heading_font" AS ENUM('display', 'mono');
  CREATE TYPE "public"."enum__pages_v_blocks_stats_counters_style_body_font" AS ENUM('sans', 'display', 'mono');
  CREATE TYPE "public"."enum__pages_v_blocks_stats_counters_style_body_size" AS ENUM('sm', 'base', 'lg', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_stats_counters_style_animation_style" AS ENUM('fade-rise', 'slide-left', 'slide-right', 'scale-up', 'stagger', 'none');
  CREATE TYPE "public"."enum__pages_v_blocks_stats_counters_style_animation_delay" AS ENUM('none', 'short', 'medium', 'long');
  CREATE TYPE "public"."enum__pages_v_blocks_stats_counters_style_gap_below" AS ENUM('none', 'small', 'default', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_services_grid_source" AS ENUM('auto', 'selected');
  CREATE TYPE "public"."enum__pages_v_blocks_services_grid_appearance" AS ENUM('default', 'muted', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_services_grid_style_color_scheme" AS ENUM('default', 'muted', 'dark', 'brand', 'energy', 'solar');
  CREATE TYPE "public"."enum__pages_v_blocks_services_grid_style_accent_colour" AS ENUM('brand', 'energy', 'solar');
  CREATE TYPE "public"."enum__pages_v_blocks_services_grid_style_width" AS ENUM('narrow', 'default', 'wide', 'full-bleed');
  CREATE TYPE "public"."enum__pages_v_blocks_services_grid_style_padding_size" AS ENUM('compact', 'standard', 'spacious');
  CREATE TYPE "public"."enum__pages_v_blocks_services_grid_style_text_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__pages_v_blocks_services_grid_style_heading_size" AS ENUM('default', 'large', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_services_grid_style_heading_font" AS ENUM('display', 'mono');
  CREATE TYPE "public"."enum__pages_v_blocks_services_grid_style_body_font" AS ENUM('sans', 'display', 'mono');
  CREATE TYPE "public"."enum__pages_v_blocks_services_grid_style_body_size" AS ENUM('sm', 'base', 'lg', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_services_grid_style_animation_style" AS ENUM('fade-rise', 'slide-left', 'slide-right', 'scale-up', 'stagger', 'none');
  CREATE TYPE "public"."enum__pages_v_blocks_services_grid_style_animation_delay" AS ENUM('none', 'short', 'medium', 'long');
  CREATE TYPE "public"."enum__pages_v_blocks_services_grid_style_gap_below" AS ENUM('none', 'small', 'default', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_sector_tiles_source" AS ENUM('auto', 'selected');
  CREATE TYPE "public"."enum__pages_v_blocks_sector_tiles_appearance" AS ENUM('default', 'muted', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_sector_tiles_style_color_scheme" AS ENUM('default', 'muted', 'dark', 'brand', 'energy', 'solar');
  CREATE TYPE "public"."enum__pages_v_blocks_sector_tiles_style_accent_colour" AS ENUM('brand', 'energy', 'solar');
  CREATE TYPE "public"."enum__pages_v_blocks_sector_tiles_style_width" AS ENUM('narrow', 'default', 'wide', 'full-bleed');
  CREATE TYPE "public"."enum__pages_v_blocks_sector_tiles_style_padding_size" AS ENUM('compact', 'standard', 'spacious');
  CREATE TYPE "public"."enum__pages_v_blocks_sector_tiles_style_text_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__pages_v_blocks_sector_tiles_style_heading_size" AS ENUM('default', 'large', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_sector_tiles_style_heading_font" AS ENUM('display', 'mono');
  CREATE TYPE "public"."enum__pages_v_blocks_sector_tiles_style_body_font" AS ENUM('sans', 'display', 'mono');
  CREATE TYPE "public"."enum__pages_v_blocks_sector_tiles_style_body_size" AS ENUM('sm', 'base', 'lg', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_sector_tiles_style_animation_style" AS ENUM('fade-rise', 'slide-left', 'slide-right', 'scale-up', 'stagger', 'none');
  CREATE TYPE "public"."enum__pages_v_blocks_sector_tiles_style_animation_delay" AS ENUM('none', 'short', 'medium', 'long');
  CREATE TYPE "public"."enum__pages_v_blocks_sector_tiles_style_gap_below" AS ENUM('none', 'small', 'default', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_projects_list_source" AS ENUM('featured', 'selected');
  CREATE TYPE "public"."enum__pages_v_blocks_projects_list_appearance" AS ENUM('default', 'muted', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_projects_list_style_color_scheme" AS ENUM('default', 'muted', 'dark', 'brand', 'energy', 'solar');
  CREATE TYPE "public"."enum__pages_v_blocks_projects_list_style_accent_colour" AS ENUM('brand', 'energy', 'solar');
  CREATE TYPE "public"."enum__pages_v_blocks_projects_list_style_width" AS ENUM('narrow', 'default', 'wide', 'full-bleed');
  CREATE TYPE "public"."enum__pages_v_blocks_projects_list_style_padding_size" AS ENUM('compact', 'standard', 'spacious');
  CREATE TYPE "public"."enum__pages_v_blocks_projects_list_style_text_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__pages_v_blocks_projects_list_style_heading_size" AS ENUM('default', 'large', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_projects_list_style_heading_font" AS ENUM('display', 'mono');
  CREATE TYPE "public"."enum__pages_v_blocks_projects_list_style_body_font" AS ENUM('sans', 'display', 'mono');
  CREATE TYPE "public"."enum__pages_v_blocks_projects_list_style_body_size" AS ENUM('sm', 'base', 'lg', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_projects_list_style_animation_style" AS ENUM('fade-rise', 'slide-left', 'slide-right', 'scale-up', 'stagger', 'none');
  CREATE TYPE "public"."enum__pages_v_blocks_projects_list_style_animation_delay" AS ENUM('none', 'short', 'medium', 'long');
  CREATE TYPE "public"."enum__pages_v_blocks_projects_list_style_gap_below" AS ENUM('none', 'small', 'default', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_image_gallery_appearance" AS ENUM('default', 'muted', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_image_gallery_style_color_scheme" AS ENUM('default', 'muted', 'dark', 'brand', 'energy', 'solar');
  CREATE TYPE "public"."enum__pages_v_blocks_image_gallery_style_accent_colour" AS ENUM('brand', 'energy', 'solar');
  CREATE TYPE "public"."enum__pages_v_blocks_image_gallery_style_width" AS ENUM('narrow', 'default', 'wide', 'full-bleed');
  CREATE TYPE "public"."enum__pages_v_blocks_image_gallery_style_padding_size" AS ENUM('compact', 'standard', 'spacious');
  CREATE TYPE "public"."enum__pages_v_blocks_image_gallery_style_text_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__pages_v_blocks_image_gallery_style_heading_size" AS ENUM('default', 'large', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_image_gallery_style_heading_font" AS ENUM('display', 'mono');
  CREATE TYPE "public"."enum__pages_v_blocks_image_gallery_style_body_font" AS ENUM('sans', 'display', 'mono');
  CREATE TYPE "public"."enum__pages_v_blocks_image_gallery_style_body_size" AS ENUM('sm', 'base', 'lg', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_image_gallery_style_animation_style" AS ENUM('fade-rise', 'slide-left', 'slide-right', 'scale-up', 'stagger', 'none');
  CREATE TYPE "public"."enum__pages_v_blocks_image_gallery_style_animation_delay" AS ENUM('none', 'short', 'medium', 'long');
  CREATE TYPE "public"."enum__pages_v_blocks_image_gallery_style_gap_below" AS ENUM('none', 'small', 'default', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_photo_strip_appearance" AS ENUM('default', 'muted', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_photo_strip_display_mode" AS ENUM('marquee', 'carousel');
  CREATE TYPE "public"."enum__pages_v_blocks_photo_strip_speed" AS ENUM('slow', 'normal', 'fast');
  CREATE TYPE "public"."enum__pages_v_blocks_photo_strip_style_color_scheme" AS ENUM('default', 'muted', 'dark', 'brand', 'energy', 'solar');
  CREATE TYPE "public"."enum__pages_v_blocks_photo_strip_style_accent_colour" AS ENUM('brand', 'energy', 'solar');
  CREATE TYPE "public"."enum__pages_v_blocks_photo_strip_style_width" AS ENUM('narrow', 'default', 'wide', 'full-bleed');
  CREATE TYPE "public"."enum__pages_v_blocks_photo_strip_style_padding_size" AS ENUM('compact', 'standard', 'spacious');
  CREATE TYPE "public"."enum__pages_v_blocks_photo_strip_style_text_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__pages_v_blocks_photo_strip_style_heading_size" AS ENUM('default', 'large', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_photo_strip_style_heading_font" AS ENUM('display', 'mono');
  CREATE TYPE "public"."enum__pages_v_blocks_photo_strip_style_body_font" AS ENUM('sans', 'display', 'mono');
  CREATE TYPE "public"."enum__pages_v_blocks_photo_strip_style_body_size" AS ENUM('sm', 'base', 'lg', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_photo_strip_style_animation_style" AS ENUM('fade-rise', 'slide-left', 'slide-right', 'scale-up', 'stagger', 'none');
  CREATE TYPE "public"."enum__pages_v_blocks_photo_strip_style_animation_delay" AS ENUM('none', 'short', 'medium', 'long');
  CREATE TYPE "public"."enum__pages_v_blocks_photo_strip_style_gap_below" AS ENUM('none', 'small', 'default', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_video_showcase_videos_source" AS ENUM('upload', 'url');
  CREATE TYPE "public"."enum__pages_v_blocks_video_showcase_layout" AS ENUM('spotlight', 'grid');
  CREATE TYPE "public"."enum__pages_v_blocks_video_showcase_tone" AS ENUM('dark', 'light', 'muted', 'brand');
  CREATE TYPE "public"."enum__pages_v_blocks_video_showcase_style_color_scheme" AS ENUM('default', 'muted', 'dark', 'brand', 'energy', 'solar');
  CREATE TYPE "public"."enum__pages_v_blocks_video_showcase_style_accent_colour" AS ENUM('brand', 'energy', 'solar');
  CREATE TYPE "public"."enum__pages_v_blocks_video_showcase_style_width" AS ENUM('narrow', 'default', 'wide', 'full-bleed');
  CREATE TYPE "public"."enum__pages_v_blocks_video_showcase_style_padding_size" AS ENUM('compact', 'standard', 'spacious');
  CREATE TYPE "public"."enum__pages_v_blocks_video_showcase_style_text_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__pages_v_blocks_video_showcase_style_heading_size" AS ENUM('default', 'large', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_video_showcase_style_heading_font" AS ENUM('display', 'mono');
  CREATE TYPE "public"."enum__pages_v_blocks_video_showcase_style_body_font" AS ENUM('sans', 'display', 'mono');
  CREATE TYPE "public"."enum__pages_v_blocks_video_showcase_style_body_size" AS ENUM('sm', 'base', 'lg', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_video_showcase_style_animation_style" AS ENUM('fade-rise', 'slide-left', 'slide-right', 'scale-up', 'stagger', 'none');
  CREATE TYPE "public"."enum__pages_v_blocks_video_showcase_style_animation_delay" AS ENUM('none', 'short', 'medium', 'long');
  CREATE TYPE "public"."enum__pages_v_blocks_video_showcase_style_gap_below" AS ENUM('none', 'small', 'default', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_logo_wall_source" AS ENUM('auto', 'selected');
  CREATE TYPE "public"."enum__pages_v_blocks_logo_wall_appearance" AS ENUM('default', 'muted', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_logo_wall_style_color_scheme" AS ENUM('default', 'muted', 'dark', 'brand', 'energy', 'solar');
  CREATE TYPE "public"."enum__pages_v_blocks_logo_wall_style_accent_colour" AS ENUM('brand', 'energy', 'solar');
  CREATE TYPE "public"."enum__pages_v_blocks_logo_wall_style_width" AS ENUM('narrow', 'default', 'wide', 'full-bleed');
  CREATE TYPE "public"."enum__pages_v_blocks_logo_wall_style_padding_size" AS ENUM('compact', 'standard', 'spacious');
  CREATE TYPE "public"."enum__pages_v_blocks_logo_wall_style_text_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__pages_v_blocks_logo_wall_style_heading_size" AS ENUM('default', 'large', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_logo_wall_style_heading_font" AS ENUM('display', 'mono');
  CREATE TYPE "public"."enum__pages_v_blocks_logo_wall_style_body_font" AS ENUM('sans', 'display', 'mono');
  CREATE TYPE "public"."enum__pages_v_blocks_logo_wall_style_body_size" AS ENUM('sm', 'base', 'lg', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_logo_wall_style_animation_style" AS ENUM('fade-rise', 'slide-left', 'slide-right', 'scale-up', 'stagger', 'none');
  CREATE TYPE "public"."enum__pages_v_blocks_logo_wall_style_animation_delay" AS ENUM('none', 'short', 'medium', 'long');
  CREATE TYPE "public"."enum__pages_v_blocks_logo_wall_style_gap_below" AS ENUM('none', 'small', 'default', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_partner_bar_appearance" AS ENUM('default', 'muted', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_partner_bar_style_color_scheme" AS ENUM('default', 'muted', 'dark', 'brand', 'energy', 'solar');
  CREATE TYPE "public"."enum__pages_v_blocks_partner_bar_style_accent_colour" AS ENUM('brand', 'energy', 'solar');
  CREATE TYPE "public"."enum__pages_v_blocks_partner_bar_style_width" AS ENUM('narrow', 'default', 'wide', 'full-bleed');
  CREATE TYPE "public"."enum__pages_v_blocks_partner_bar_style_padding_size" AS ENUM('compact', 'standard', 'spacious');
  CREATE TYPE "public"."enum__pages_v_blocks_partner_bar_style_text_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__pages_v_blocks_partner_bar_style_heading_size" AS ENUM('default', 'large', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_partner_bar_style_heading_font" AS ENUM('display', 'mono');
  CREATE TYPE "public"."enum__pages_v_blocks_partner_bar_style_body_font" AS ENUM('sans', 'display', 'mono');
  CREATE TYPE "public"."enum__pages_v_blocks_partner_bar_style_body_size" AS ENUM('sm', 'base', 'lg', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_partner_bar_style_animation_style" AS ENUM('fade-rise', 'slide-left', 'slide-right', 'scale-up', 'stagger', 'none');
  CREATE TYPE "public"."enum__pages_v_blocks_partner_bar_style_animation_delay" AS ENUM('none', 'short', 'medium', 'long');
  CREATE TYPE "public"."enum__pages_v_blocks_partner_bar_style_gap_below" AS ENUM('none', 'small', 'default', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_product_showcase_source" AS ENUM('featured', 'selected');
  CREATE TYPE "public"."enum__pages_v_blocks_product_showcase_appearance" AS ENUM('default', 'muted', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_product_showcase_style_color_scheme" AS ENUM('default', 'muted', 'dark', 'brand', 'energy', 'solar');
  CREATE TYPE "public"."enum__pages_v_blocks_product_showcase_style_accent_colour" AS ENUM('brand', 'energy', 'solar');
  CREATE TYPE "public"."enum__pages_v_blocks_product_showcase_style_width" AS ENUM('narrow', 'default', 'wide', 'full-bleed');
  CREATE TYPE "public"."enum__pages_v_blocks_product_showcase_style_padding_size" AS ENUM('compact', 'standard', 'spacious');
  CREATE TYPE "public"."enum__pages_v_blocks_product_showcase_style_text_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__pages_v_blocks_product_showcase_style_heading_size" AS ENUM('default', 'large', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_product_showcase_style_heading_font" AS ENUM('display', 'mono');
  CREATE TYPE "public"."enum__pages_v_blocks_product_showcase_style_body_font" AS ENUM('sans', 'display', 'mono');
  CREATE TYPE "public"."enum__pages_v_blocks_product_showcase_style_body_size" AS ENUM('sm', 'base', 'lg', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_product_showcase_style_animation_style" AS ENUM('fade-rise', 'slide-left', 'slide-right', 'scale-up', 'stagger', 'none');
  CREATE TYPE "public"."enum__pages_v_blocks_product_showcase_style_animation_delay" AS ENUM('none', 'short', 'medium', 'long');
  CREATE TYPE "public"."enum__pages_v_blocks_product_showcase_style_gap_below" AS ENUM('none', 'small', 'default', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_articles_list_appearance" AS ENUM('default', 'muted', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_articles_list_style_color_scheme" AS ENUM('default', 'muted', 'dark', 'brand', 'energy', 'solar');
  CREATE TYPE "public"."enum__pages_v_blocks_articles_list_style_accent_colour" AS ENUM('brand', 'energy', 'solar');
  CREATE TYPE "public"."enum__pages_v_blocks_articles_list_style_width" AS ENUM('narrow', 'default', 'wide', 'full-bleed');
  CREATE TYPE "public"."enum__pages_v_blocks_articles_list_style_padding_size" AS ENUM('compact', 'standard', 'spacious');
  CREATE TYPE "public"."enum__pages_v_blocks_articles_list_style_text_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__pages_v_blocks_articles_list_style_heading_size" AS ENUM('default', 'large', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_articles_list_style_heading_font" AS ENUM('display', 'mono');
  CREATE TYPE "public"."enum__pages_v_blocks_articles_list_style_body_font" AS ENUM('sans', 'display', 'mono');
  CREATE TYPE "public"."enum__pages_v_blocks_articles_list_style_body_size" AS ENUM('sm', 'base', 'lg', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_articles_list_style_animation_style" AS ENUM('fade-rise', 'slide-left', 'slide-right', 'scale-up', 'stagger', 'none');
  CREATE TYPE "public"."enum__pages_v_blocks_articles_list_style_animation_delay" AS ENUM('none', 'short', 'medium', 'long');
  CREATE TYPE "public"."enum__pages_v_blocks_articles_list_style_gap_below" AS ENUM('none', 'small', 'default', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_testimonials_source" AS ENUM('auto', 'selected');
  CREATE TYPE "public"."enum__pages_v_blocks_testimonials_appearance" AS ENUM('default', 'muted', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_testimonials_style_color_scheme" AS ENUM('default', 'muted', 'dark', 'brand', 'energy', 'solar');
  CREATE TYPE "public"."enum__pages_v_blocks_testimonials_style_accent_colour" AS ENUM('brand', 'energy', 'solar');
  CREATE TYPE "public"."enum__pages_v_blocks_testimonials_style_width" AS ENUM('narrow', 'default', 'wide', 'full-bleed');
  CREATE TYPE "public"."enum__pages_v_blocks_testimonials_style_padding_size" AS ENUM('compact', 'standard', 'spacious');
  CREATE TYPE "public"."enum__pages_v_blocks_testimonials_style_text_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__pages_v_blocks_testimonials_style_heading_size" AS ENUM('default', 'large', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_testimonials_style_heading_font" AS ENUM('display', 'mono');
  CREATE TYPE "public"."enum__pages_v_blocks_testimonials_style_body_font" AS ENUM('sans', 'display', 'mono');
  CREATE TYPE "public"."enum__pages_v_blocks_testimonials_style_body_size" AS ENUM('sm', 'base', 'lg', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_testimonials_style_animation_style" AS ENUM('fade-rise', 'slide-left', 'slide-right', 'scale-up', 'stagger', 'none');
  CREATE TYPE "public"."enum__pages_v_blocks_testimonials_style_animation_delay" AS ENUM('none', 'short', 'medium', 'long');
  CREATE TYPE "public"."enum__pages_v_blocks_testimonials_style_gap_below" AS ENUM('none', 'small', 'default', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_team_grid_source" AS ENUM('auto', 'selected');
  CREATE TYPE "public"."enum__pages_v_blocks_team_grid_appearance" AS ENUM('default', 'muted', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_team_grid_group" AS ENUM('all', 'leadership', 'management', 'engineering', 'consultant', 'advisor', 'other');
  CREATE TYPE "public"."enum__pages_v_blocks_team_grid_style_color_scheme" AS ENUM('default', 'muted', 'dark', 'brand', 'energy', 'solar');
  CREATE TYPE "public"."enum__pages_v_blocks_team_grid_style_accent_colour" AS ENUM('brand', 'energy', 'solar');
  CREATE TYPE "public"."enum__pages_v_blocks_team_grid_style_width" AS ENUM('narrow', 'default', 'wide', 'full-bleed');
  CREATE TYPE "public"."enum__pages_v_blocks_team_grid_style_padding_size" AS ENUM('compact', 'standard', 'spacious');
  CREATE TYPE "public"."enum__pages_v_blocks_team_grid_style_text_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__pages_v_blocks_team_grid_style_heading_size" AS ENUM('default', 'large', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_team_grid_style_heading_font" AS ENUM('display', 'mono');
  CREATE TYPE "public"."enum__pages_v_blocks_team_grid_style_body_font" AS ENUM('sans', 'display', 'mono');
  CREATE TYPE "public"."enum__pages_v_blocks_team_grid_style_body_size" AS ENUM('sm', 'base', 'lg', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_team_grid_style_animation_style" AS ENUM('fade-rise', 'slide-left', 'slide-right', 'scale-up', 'stagger', 'none');
  CREATE TYPE "public"."enum__pages_v_blocks_team_grid_style_animation_delay" AS ENUM('none', 'short', 'medium', 'long');
  CREATE TYPE "public"."enum__pages_v_blocks_team_grid_style_gap_below" AS ENUM('none', 'small', 'default', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_steps_appearance" AS ENUM('default', 'muted', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_steps_style_color_scheme" AS ENUM('default', 'muted', 'dark', 'brand', 'energy', 'solar');
  CREATE TYPE "public"."enum__pages_v_blocks_steps_style_accent_colour" AS ENUM('brand', 'energy', 'solar');
  CREATE TYPE "public"."enum__pages_v_blocks_steps_style_width" AS ENUM('narrow', 'default', 'wide', 'full-bleed');
  CREATE TYPE "public"."enum__pages_v_blocks_steps_style_padding_size" AS ENUM('compact', 'standard', 'spacious');
  CREATE TYPE "public"."enum__pages_v_blocks_steps_style_text_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__pages_v_blocks_steps_style_heading_size" AS ENUM('default', 'large', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_steps_style_heading_font" AS ENUM('display', 'mono');
  CREATE TYPE "public"."enum__pages_v_blocks_steps_style_body_font" AS ENUM('sans', 'display', 'mono');
  CREATE TYPE "public"."enum__pages_v_blocks_steps_style_body_size" AS ENUM('sm', 'base', 'lg', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_steps_style_animation_style" AS ENUM('fade-rise', 'slide-left', 'slide-right', 'scale-up', 'stagger', 'none');
  CREATE TYPE "public"."enum__pages_v_blocks_steps_style_animation_delay" AS ENUM('none', 'short', 'medium', 'long');
  CREATE TYPE "public"."enum__pages_v_blocks_steps_style_gap_below" AS ENUM('none', 'small', 'default', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_band_ctas_type" AS ENUM('page', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_band_ctas_style" AS ENUM('primary', 'secondary');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_band_style_color_scheme" AS ENUM('default', 'muted', 'dark', 'brand', 'energy', 'solar');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_band_style_accent_colour" AS ENUM('brand', 'energy', 'solar');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_band_style_width" AS ENUM('narrow', 'default', 'wide', 'full-bleed');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_band_style_padding_size" AS ENUM('compact', 'standard', 'spacious');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_band_style_text_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_band_style_heading_size" AS ENUM('default', 'large', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_band_style_heading_font" AS ENUM('display', 'mono');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_band_style_body_font" AS ENUM('sans', 'display', 'mono');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_band_style_body_size" AS ENUM('sm', 'base', 'lg', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_band_style_animation_style" AS ENUM('fade-rise', 'slide-left', 'slide-right', 'scale-up', 'stagger', 'none');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_band_style_animation_delay" AS ENUM('none', 'short', 'medium', 'long');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_band_style_gap_below" AS ENUM('none', 'small', 'default', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_faq_appearance" AS ENUM('default', 'muted', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_faq_style_color_scheme" AS ENUM('default', 'muted', 'dark', 'brand', 'energy', 'solar');
  CREATE TYPE "public"."enum__pages_v_blocks_faq_style_accent_colour" AS ENUM('brand', 'energy', 'solar');
  CREATE TYPE "public"."enum__pages_v_blocks_faq_style_width" AS ENUM('narrow', 'default', 'wide', 'full-bleed');
  CREATE TYPE "public"."enum__pages_v_blocks_faq_style_padding_size" AS ENUM('compact', 'standard', 'spacious');
  CREATE TYPE "public"."enum__pages_v_blocks_faq_style_text_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__pages_v_blocks_faq_style_heading_size" AS ENUM('default', 'large', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_faq_style_heading_font" AS ENUM('display', 'mono');
  CREATE TYPE "public"."enum__pages_v_blocks_faq_style_body_font" AS ENUM('sans', 'display', 'mono');
  CREATE TYPE "public"."enum__pages_v_blocks_faq_style_body_size" AS ENUM('sm', 'base', 'lg', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_faq_style_animation_style" AS ENUM('fade-rise', 'slide-left', 'slide-right', 'scale-up', 'stagger', 'none');
  CREATE TYPE "public"."enum__pages_v_blocks_faq_style_animation_delay" AS ENUM('none', 'short', 'medium', 'long');
  CREATE TYPE "public"."enum__pages_v_blocks_faq_style_gap_below" AS ENUM('none', 'small', 'default', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_calculator_embed_appearance" AS ENUM('default', 'muted', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_calculator_embed_tool" AS ENUM('solarcalc', 'roi');
  CREATE TYPE "public"."enum__pages_v_blocks_calculator_embed_style_color_scheme" AS ENUM('default', 'muted', 'dark', 'brand', 'energy', 'solar');
  CREATE TYPE "public"."enum__pages_v_blocks_calculator_embed_style_accent_colour" AS ENUM('brand', 'energy', 'solar');
  CREATE TYPE "public"."enum__pages_v_blocks_calculator_embed_style_width" AS ENUM('narrow', 'default', 'wide', 'full-bleed');
  CREATE TYPE "public"."enum__pages_v_blocks_calculator_embed_style_padding_size" AS ENUM('compact', 'standard', 'spacious');
  CREATE TYPE "public"."enum__pages_v_blocks_calculator_embed_style_text_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__pages_v_blocks_calculator_embed_style_heading_size" AS ENUM('default', 'large', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_calculator_embed_style_heading_font" AS ENUM('display', 'mono');
  CREATE TYPE "public"."enum__pages_v_blocks_calculator_embed_style_body_font" AS ENUM('sans', 'display', 'mono');
  CREATE TYPE "public"."enum__pages_v_blocks_calculator_embed_style_body_size" AS ENUM('sm', 'base', 'lg', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_calculator_embed_style_animation_style" AS ENUM('fade-rise', 'slide-left', 'slide-right', 'scale-up', 'stagger', 'none');
  CREATE TYPE "public"."enum__pages_v_blocks_calculator_embed_style_animation_delay" AS ENUM('none', 'short', 'medium', 'long');
  CREATE TYPE "public"."enum__pages_v_blocks_calculator_embed_style_gap_below" AS ENUM('none', 'small', 'default', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_contact_r_f_q_appearance" AS ENUM('default', 'muted', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_contact_r_f_q_style_color_scheme" AS ENUM('default', 'muted', 'dark', 'brand', 'energy', 'solar');
  CREATE TYPE "public"."enum__pages_v_blocks_contact_r_f_q_style_accent_colour" AS ENUM('brand', 'energy', 'solar');
  CREATE TYPE "public"."enum__pages_v_blocks_contact_r_f_q_style_width" AS ENUM('narrow', 'default', 'wide', 'full-bleed');
  CREATE TYPE "public"."enum__pages_v_blocks_contact_r_f_q_style_padding_size" AS ENUM('compact', 'standard', 'spacious');
  CREATE TYPE "public"."enum__pages_v_blocks_contact_r_f_q_style_text_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__pages_v_blocks_contact_r_f_q_style_heading_size" AS ENUM('default', 'large', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_contact_r_f_q_style_heading_font" AS ENUM('display', 'mono');
  CREATE TYPE "public"."enum__pages_v_blocks_contact_r_f_q_style_body_font" AS ENUM('sans', 'display', 'mono');
  CREATE TYPE "public"."enum__pages_v_blocks_contact_r_f_q_style_body_size" AS ENUM('sm', 'base', 'lg', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_contact_r_f_q_style_animation_style" AS ENUM('fade-rise', 'slide-left', 'slide-right', 'scale-up', 'stagger', 'none');
  CREATE TYPE "public"."enum__pages_v_blocks_contact_r_f_q_style_animation_delay" AS ENUM('none', 'short', 'medium', 'long');
  CREATE TYPE "public"."enum__pages_v_blocks_contact_r_f_q_style_gap_below" AS ENUM('none', 'small', 'default', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_spacer_size" AS ENUM('sm', 'md', 'lg');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_projects_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__projects_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_products_category" AS ENUM('energy', 'solar', 'lighting', 'safety', 'power');
  CREATE TYPE "public"."enum_services_icon" AS ENUM('solar', 'bess', 'lps', 'electrical', 'inspection', 'substation', 'fire', 'lighting', 'training', 'consultancy');
  CREATE TYPE "public"."enum_sectors_icon" AS ENUM('garments', 'government', 'ngo', 'industrial', 'ports', 'healthcare', 'academic', 'food', 'commercial', 'heritage');
  CREATE TYPE "public"."enum_team_category" AS ENUM('leadership', 'management', 'engineering', 'consultant', 'advisor', 'other');
  CREATE TYPE "public"."enum_articles_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__articles_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_knowledge_resources_type" AS ENUM('calculator', 'sample');
  CREATE TYPE "public"."enum_knowledge_resources_calc_type" AS ENUM('solar-roi', 'earthing-resistance', 'cable-sizing', 'lightning-zone', 'solar-yield');
  CREATE TYPE "public"."enum_knowledge_resources_file_format" AS ENUM('pdf', 'docx', 'xlsx', 'image', 'zip', 'other');
  CREATE TYPE "public"."enum_knowledge_resources_open_mode" AS ENUM('both', 'view', 'download');
  CREATE TYPE "public"."enum_news_items_category" AS ENUM('company-update', 'industry-news', 'product-update', 'ai-tech', 'market-insight');
  CREATE TYPE "public"."enum_news_items_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__news_items_v_version_category" AS ENUM('company-update', 'industry-news', 'product-update', 'ai-tech', 'market-insight');
  CREATE TYPE "public"."enum__news_items_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_awards_kind" AS ENUM('award', 'certification', 'accreditation');
  CREATE TYPE "public"."enum_partners_type" AS ENUM('technology', 'distribution', 'channel', 'strategic');
  CREATE TYPE "public"."enum_job_openings_employment_type" AS ENUM('full-time', 'part-time', 'contract', 'internship');
  CREATE TYPE "public"."enum_job_openings_status" AS ENUM('open', 'closed');
  CREATE TYPE "public"."enum_icons_category" AS ENUM('service', 'sector', 'ui', 'brand', '3d', 'ai', 'other');
  CREATE TYPE "public"."enum_rfq_requests_status" AS ENUM('new', 'contacted', 'qualified', 'won', 'closed');
  CREATE TYPE "public"."enum_users_role" AS ENUM('superAdmin', 'admin', 'editor', 'hermes');
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TYPE "public"."enum_site_settings_knowledge_layout" AS ENUM('vertical', 'horizontal');
  CREATE TYPE "public"."enum_site_settings_projects_layout" AS ENUM('vertical', 'horizontal');
  CREATE TYPE "public"."enum_site_settings_whatsapp_position" AS ENUM('bottom-right', 'bottom-left');
  CREATE TYPE "public"."enum_site_settings_chatbot_provider" AS ENUM('hermes', 'n8n', 'crisp', 'custom');
  CREATE TYPE "public"."enum_site_settings_chatbot_chat_position" AS ENUM('bottom-right', 'bottom-left');
  CREATE TYPE "public"."enum_navigation_header_children_type" AS ENUM('page', 'custom');
  CREATE TYPE "public"."enum_navigation_header_type" AS ENUM('page', 'custom');
  CREATE TYPE "public"."enum_navigation_footer_columns_links_type" AS ENUM('page', 'custom');
  CREATE TYPE "public"."enum_navigation_header_cta_type" AS ENUM('page', 'custom');
  CREATE TABLE "pages_blocks_hero_carousel_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar
  );
  
  CREATE TABLE "pages_blocks_hero_side_media_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar
  );
  
  CREATE TABLE "pages_blocks_hero_ctas" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"type" "enum_pages_blocks_hero_ctas_type" DEFAULT 'page',
  	"page_id" integer,
  	"url" varchar,
  	"new_tab" boolean,
  	"style" "enum_pages_blocks_hero_ctas_style" DEFAULT 'primary'
  );
  
  CREATE TABLE "pages_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"subhead" varchar,
  	"height" "enum_pages_blocks_hero_height" DEFAULT 'standard',
  	"tone" "enum_pages_blocks_hero_tone" DEFAULT 'dark',
  	"background_image_id" integer,
  	"background_video_id" integer,
  	"hero_mode" "enum_pages_blocks_hero_hero_mode" DEFAULT 'single',
  	"carousel_interval" numeric DEFAULT 5,
  	"side_media_enabled" boolean DEFAULT false,
  	"side_media_source" "enum_pages_blocks_hero_side_media_source" DEFAULT 'projects',
  	"side_media_interval" numeric DEFAULT 5,
  	"style_color_scheme" "enum_pages_blocks_hero_style_color_scheme" DEFAULT 'default',
  	"style_accent_colour" "enum_pages_blocks_hero_style_accent_colour" DEFAULT 'brand',
  	"style_width" "enum_pages_blocks_hero_style_width" DEFAULT 'default',
  	"style_padding_size" "enum_pages_blocks_hero_style_padding_size" DEFAULT 'standard',
  	"style_text_align" "enum_pages_blocks_hero_style_text_align" DEFAULT 'left',
  	"style_heading_size" "enum_pages_blocks_hero_style_heading_size" DEFAULT 'default',
  	"style_heading_font" "enum_pages_blocks_hero_style_heading_font" DEFAULT 'display',
  	"style_body_font" "enum_pages_blocks_hero_style_body_font" DEFAULT 'sans',
  	"style_body_size" "enum_pages_blocks_hero_style_body_size" DEFAULT 'base',
  	"style_animation_style" "enum_pages_blocks_hero_style_animation_style" DEFAULT 'fade-rise',
  	"style_animation_delay" "enum_pages_blocks_hero_style_animation_delay" DEFAULT 'none',
  	"style_with_border" boolean DEFAULT false,
  	"style_gap_below" "enum_pages_blocks_hero_style_gap_below" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"appearance" "enum_pages_blocks_rich_text_appearance" DEFAULT 'default',
  	"content" jsonb,
  	"style_color_scheme" "enum_pages_blocks_rich_text_style_color_scheme" DEFAULT 'default',
  	"style_accent_colour" "enum_pages_blocks_rich_text_style_accent_colour" DEFAULT 'brand',
  	"style_width" "enum_pages_blocks_rich_text_style_width" DEFAULT 'default',
  	"style_padding_size" "enum_pages_blocks_rich_text_style_padding_size" DEFAULT 'standard',
  	"style_text_align" "enum_pages_blocks_rich_text_style_text_align" DEFAULT 'left',
  	"style_heading_size" "enum_pages_blocks_rich_text_style_heading_size" DEFAULT 'default',
  	"style_heading_font" "enum_pages_blocks_rich_text_style_heading_font" DEFAULT 'display',
  	"style_body_font" "enum_pages_blocks_rich_text_style_body_font" DEFAULT 'sans',
  	"style_body_size" "enum_pages_blocks_rich_text_style_body_size" DEFAULT 'base',
  	"style_animation_style" "enum_pages_blocks_rich_text_style_animation_style" DEFAULT 'fade-rise',
  	"style_animation_delay" "enum_pages_blocks_rich_text_style_animation_delay" DEFAULT 'none',
  	"style_with_border" boolean DEFAULT false,
  	"style_gap_below" "enum_pages_blocks_rich_text_style_gap_below" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_stats_counters_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" numeric,
  	"suffix" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "pages_blocks_stats_counters" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"intro" varchar,
  	"appearance" "enum_pages_blocks_stats_counters_appearance" DEFAULT 'default',
  	"style_color_scheme" "enum_pages_blocks_stats_counters_style_color_scheme" DEFAULT 'default',
  	"style_accent_colour" "enum_pages_blocks_stats_counters_style_accent_colour" DEFAULT 'brand',
  	"style_width" "enum_pages_blocks_stats_counters_style_width" DEFAULT 'default',
  	"style_padding_size" "enum_pages_blocks_stats_counters_style_padding_size" DEFAULT 'standard',
  	"style_text_align" "enum_pages_blocks_stats_counters_style_text_align" DEFAULT 'left',
  	"style_heading_size" "enum_pages_blocks_stats_counters_style_heading_size" DEFAULT 'default',
  	"style_heading_font" "enum_pages_blocks_stats_counters_style_heading_font" DEFAULT 'display',
  	"style_body_font" "enum_pages_blocks_stats_counters_style_body_font" DEFAULT 'sans',
  	"style_body_size" "enum_pages_blocks_stats_counters_style_body_size" DEFAULT 'base',
  	"style_animation_style" "enum_pages_blocks_stats_counters_style_animation_style" DEFAULT 'fade-rise',
  	"style_animation_delay" "enum_pages_blocks_stats_counters_style_animation_delay" DEFAULT 'none',
  	"style_with_border" boolean DEFAULT false,
  	"style_gap_below" "enum_pages_blocks_stats_counters_style_gap_below" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_services_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"lede" varchar,
  	"source" "enum_pages_blocks_services_grid_source" DEFAULT 'auto',
  	"appearance" "enum_pages_blocks_services_grid_appearance" DEFAULT 'default',
  	"style_color_scheme" "enum_pages_blocks_services_grid_style_color_scheme" DEFAULT 'default',
  	"style_accent_colour" "enum_pages_blocks_services_grid_style_accent_colour" DEFAULT 'brand',
  	"style_width" "enum_pages_blocks_services_grid_style_width" DEFAULT 'default',
  	"style_padding_size" "enum_pages_blocks_services_grid_style_padding_size" DEFAULT 'standard',
  	"style_text_align" "enum_pages_blocks_services_grid_style_text_align" DEFAULT 'left',
  	"style_heading_size" "enum_pages_blocks_services_grid_style_heading_size" DEFAULT 'default',
  	"style_heading_font" "enum_pages_blocks_services_grid_style_heading_font" DEFAULT 'display',
  	"style_body_font" "enum_pages_blocks_services_grid_style_body_font" DEFAULT 'sans',
  	"style_body_size" "enum_pages_blocks_services_grid_style_body_size" DEFAULT 'base',
  	"style_animation_style" "enum_pages_blocks_services_grid_style_animation_style" DEFAULT 'fade-rise',
  	"style_animation_delay" "enum_pages_blocks_services_grid_style_animation_delay" DEFAULT 'none',
  	"style_with_border" boolean DEFAULT false,
  	"style_gap_below" "enum_pages_blocks_services_grid_style_gap_below" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_sector_tiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"lede" varchar,
  	"source" "enum_pages_blocks_sector_tiles_source" DEFAULT 'auto',
  	"appearance" "enum_pages_blocks_sector_tiles_appearance" DEFAULT 'default',
  	"style_color_scheme" "enum_pages_blocks_sector_tiles_style_color_scheme" DEFAULT 'default',
  	"style_accent_colour" "enum_pages_blocks_sector_tiles_style_accent_colour" DEFAULT 'brand',
  	"style_width" "enum_pages_blocks_sector_tiles_style_width" DEFAULT 'default',
  	"style_padding_size" "enum_pages_blocks_sector_tiles_style_padding_size" DEFAULT 'standard',
  	"style_text_align" "enum_pages_blocks_sector_tiles_style_text_align" DEFAULT 'left',
  	"style_heading_size" "enum_pages_blocks_sector_tiles_style_heading_size" DEFAULT 'default',
  	"style_heading_font" "enum_pages_blocks_sector_tiles_style_heading_font" DEFAULT 'display',
  	"style_body_font" "enum_pages_blocks_sector_tiles_style_body_font" DEFAULT 'sans',
  	"style_body_size" "enum_pages_blocks_sector_tiles_style_body_size" DEFAULT 'base',
  	"style_animation_style" "enum_pages_blocks_sector_tiles_style_animation_style" DEFAULT 'fade-rise',
  	"style_animation_delay" "enum_pages_blocks_sector_tiles_style_animation_delay" DEFAULT 'none',
  	"style_with_border" boolean DEFAULT false,
  	"style_gap_below" "enum_pages_blocks_sector_tiles_style_gap_below" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_projects_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"lede" varchar,
  	"source" "enum_pages_blocks_projects_list_source" DEFAULT 'featured',
  	"appearance" "enum_pages_blocks_projects_list_appearance" DEFAULT 'default',
  	"view_all_label" varchar DEFAULT 'View all projects',
  	"style_color_scheme" "enum_pages_blocks_projects_list_style_color_scheme" DEFAULT 'default',
  	"style_accent_colour" "enum_pages_blocks_projects_list_style_accent_colour" DEFAULT 'brand',
  	"style_width" "enum_pages_blocks_projects_list_style_width" DEFAULT 'default',
  	"style_padding_size" "enum_pages_blocks_projects_list_style_padding_size" DEFAULT 'standard',
  	"style_text_align" "enum_pages_blocks_projects_list_style_text_align" DEFAULT 'left',
  	"style_heading_size" "enum_pages_blocks_projects_list_style_heading_size" DEFAULT 'default',
  	"style_heading_font" "enum_pages_blocks_projects_list_style_heading_font" DEFAULT 'display',
  	"style_body_font" "enum_pages_blocks_projects_list_style_body_font" DEFAULT 'sans',
  	"style_body_size" "enum_pages_blocks_projects_list_style_body_size" DEFAULT 'base',
  	"style_animation_style" "enum_pages_blocks_projects_list_style_animation_style" DEFAULT 'fade-rise',
  	"style_animation_delay" "enum_pages_blocks_projects_list_style_animation_delay" DEFAULT 'none',
  	"style_with_border" boolean DEFAULT false,
  	"style_gap_below" "enum_pages_blocks_projects_list_style_gap_below" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_image_gallery_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "pages_blocks_image_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"appearance" "enum_pages_blocks_image_gallery_appearance" DEFAULT 'default',
  	"style_color_scheme" "enum_pages_blocks_image_gallery_style_color_scheme" DEFAULT 'default',
  	"style_accent_colour" "enum_pages_blocks_image_gallery_style_accent_colour" DEFAULT 'brand',
  	"style_width" "enum_pages_blocks_image_gallery_style_width" DEFAULT 'default',
  	"style_padding_size" "enum_pages_blocks_image_gallery_style_padding_size" DEFAULT 'standard',
  	"style_text_align" "enum_pages_blocks_image_gallery_style_text_align" DEFAULT 'left',
  	"style_heading_size" "enum_pages_blocks_image_gallery_style_heading_size" DEFAULT 'default',
  	"style_heading_font" "enum_pages_blocks_image_gallery_style_heading_font" DEFAULT 'display',
  	"style_body_font" "enum_pages_blocks_image_gallery_style_body_font" DEFAULT 'sans',
  	"style_body_size" "enum_pages_blocks_image_gallery_style_body_size" DEFAULT 'base',
  	"style_animation_style" "enum_pages_blocks_image_gallery_style_animation_style" DEFAULT 'fade-rise',
  	"style_animation_delay" "enum_pages_blocks_image_gallery_style_animation_delay" DEFAULT 'none',
  	"style_with_border" boolean DEFAULT false,
  	"style_gap_below" "enum_pages_blocks_image_gallery_style_gap_below" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_photo_strip_photos" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar
  );
  
  CREATE TABLE "pages_blocks_photo_strip" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"appearance" "enum_pages_blocks_photo_strip_appearance" DEFAULT 'default',
  	"display_mode" "enum_pages_blocks_photo_strip_display_mode" DEFAULT 'marquee',
  	"speed" "enum_pages_blocks_photo_strip_speed" DEFAULT 'normal',
  	"style_color_scheme" "enum_pages_blocks_photo_strip_style_color_scheme" DEFAULT 'default',
  	"style_accent_colour" "enum_pages_blocks_photo_strip_style_accent_colour" DEFAULT 'brand',
  	"style_width" "enum_pages_blocks_photo_strip_style_width" DEFAULT 'default',
  	"style_padding_size" "enum_pages_blocks_photo_strip_style_padding_size" DEFAULT 'standard',
  	"style_text_align" "enum_pages_blocks_photo_strip_style_text_align" DEFAULT 'left',
  	"style_heading_size" "enum_pages_blocks_photo_strip_style_heading_size" DEFAULT 'default',
  	"style_heading_font" "enum_pages_blocks_photo_strip_style_heading_font" DEFAULT 'display',
  	"style_body_font" "enum_pages_blocks_photo_strip_style_body_font" DEFAULT 'sans',
  	"style_body_size" "enum_pages_blocks_photo_strip_style_body_size" DEFAULT 'base',
  	"style_animation_style" "enum_pages_blocks_photo_strip_style_animation_style" DEFAULT 'fade-rise',
  	"style_animation_delay" "enum_pages_blocks_photo_strip_style_animation_delay" DEFAULT 'none',
  	"style_with_border" boolean DEFAULT false,
  	"style_gap_below" "enum_pages_blocks_photo_strip_style_gap_below" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_video_showcase_videos" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"source" "enum_pages_blocks_video_showcase_videos_source" DEFAULT 'upload',
  	"duration" varchar,
  	"video_file_id" integer,
  	"video_url" varchar,
  	"poster_id" integer,
  	"featured" boolean,
  	"upload_date" timestamp(3) with time zone
  );
  
  CREATE TABLE "pages_blocks_video_showcase" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"lede" varchar,
  	"layout" "enum_pages_blocks_video_showcase_layout" DEFAULT 'spotlight',
  	"tone" "enum_pages_blocks_video_showcase_tone" DEFAULT 'dark',
  	"style_color_scheme" "enum_pages_blocks_video_showcase_style_color_scheme" DEFAULT 'default',
  	"style_accent_colour" "enum_pages_blocks_video_showcase_style_accent_colour" DEFAULT 'brand',
  	"style_width" "enum_pages_blocks_video_showcase_style_width" DEFAULT 'default',
  	"style_padding_size" "enum_pages_blocks_video_showcase_style_padding_size" DEFAULT 'standard',
  	"style_text_align" "enum_pages_blocks_video_showcase_style_text_align" DEFAULT 'left',
  	"style_heading_size" "enum_pages_blocks_video_showcase_style_heading_size" DEFAULT 'default',
  	"style_heading_font" "enum_pages_blocks_video_showcase_style_heading_font" DEFAULT 'display',
  	"style_body_font" "enum_pages_blocks_video_showcase_style_body_font" DEFAULT 'sans',
  	"style_body_size" "enum_pages_blocks_video_showcase_style_body_size" DEFAULT 'base',
  	"style_animation_style" "enum_pages_blocks_video_showcase_style_animation_style" DEFAULT 'fade-rise',
  	"style_animation_delay" "enum_pages_blocks_video_showcase_style_animation_delay" DEFAULT 'none',
  	"style_with_border" boolean DEFAULT false,
  	"style_gap_below" "enum_pages_blocks_video_showcase_style_gap_below" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_logo_wall" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"source" "enum_pages_blocks_logo_wall_source" DEFAULT 'auto',
  	"appearance" "enum_pages_blocks_logo_wall_appearance" DEFAULT 'default',
  	"style_color_scheme" "enum_pages_blocks_logo_wall_style_color_scheme" DEFAULT 'default',
  	"style_accent_colour" "enum_pages_blocks_logo_wall_style_accent_colour" DEFAULT 'brand',
  	"style_width" "enum_pages_blocks_logo_wall_style_width" DEFAULT 'default',
  	"style_padding_size" "enum_pages_blocks_logo_wall_style_padding_size" DEFAULT 'standard',
  	"style_text_align" "enum_pages_blocks_logo_wall_style_text_align" DEFAULT 'left',
  	"style_heading_size" "enum_pages_blocks_logo_wall_style_heading_size" DEFAULT 'default',
  	"style_heading_font" "enum_pages_blocks_logo_wall_style_heading_font" DEFAULT 'display',
  	"style_body_font" "enum_pages_blocks_logo_wall_style_body_font" DEFAULT 'sans',
  	"style_body_size" "enum_pages_blocks_logo_wall_style_body_size" DEFAULT 'base',
  	"style_animation_style" "enum_pages_blocks_logo_wall_style_animation_style" DEFAULT 'fade-rise',
  	"style_animation_delay" "enum_pages_blocks_logo_wall_style_animation_delay" DEFAULT 'none',
  	"style_with_border" boolean DEFAULT false,
  	"style_gap_below" "enum_pages_blocks_logo_wall_style_gap_below" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_partner_bar_partners" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"logo_id" integer
  );
  
  CREATE TABLE "pages_blocks_partner_bar" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"appearance" "enum_pages_blocks_partner_bar_appearance" DEFAULT 'default',
  	"style_color_scheme" "enum_pages_blocks_partner_bar_style_color_scheme" DEFAULT 'default',
  	"style_accent_colour" "enum_pages_blocks_partner_bar_style_accent_colour" DEFAULT 'brand',
  	"style_width" "enum_pages_blocks_partner_bar_style_width" DEFAULT 'default',
  	"style_padding_size" "enum_pages_blocks_partner_bar_style_padding_size" DEFAULT 'standard',
  	"style_text_align" "enum_pages_blocks_partner_bar_style_text_align" DEFAULT 'left',
  	"style_heading_size" "enum_pages_blocks_partner_bar_style_heading_size" DEFAULT 'default',
  	"style_heading_font" "enum_pages_blocks_partner_bar_style_heading_font" DEFAULT 'display',
  	"style_body_font" "enum_pages_blocks_partner_bar_style_body_font" DEFAULT 'sans',
  	"style_body_size" "enum_pages_blocks_partner_bar_style_body_size" DEFAULT 'base',
  	"style_animation_style" "enum_pages_blocks_partner_bar_style_animation_style" DEFAULT 'fade-rise',
  	"style_animation_delay" "enum_pages_blocks_partner_bar_style_animation_delay" DEFAULT 'none',
  	"style_with_border" boolean DEFAULT false,
  	"style_gap_below" "enum_pages_blocks_partner_bar_style_gap_below" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_product_showcase" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"lede" varchar,
  	"source" "enum_pages_blocks_product_showcase_source" DEFAULT 'featured',
  	"appearance" "enum_pages_blocks_product_showcase_appearance" DEFAULT 'default',
  	"view_all_label" varchar DEFAULT 'View all products',
  	"style_color_scheme" "enum_pages_blocks_product_showcase_style_color_scheme" DEFAULT 'default',
  	"style_accent_colour" "enum_pages_blocks_product_showcase_style_accent_colour" DEFAULT 'brand',
  	"style_width" "enum_pages_blocks_product_showcase_style_width" DEFAULT 'default',
  	"style_padding_size" "enum_pages_blocks_product_showcase_style_padding_size" DEFAULT 'standard',
  	"style_text_align" "enum_pages_blocks_product_showcase_style_text_align" DEFAULT 'left',
  	"style_heading_size" "enum_pages_blocks_product_showcase_style_heading_size" DEFAULT 'default',
  	"style_heading_font" "enum_pages_blocks_product_showcase_style_heading_font" DEFAULT 'display',
  	"style_body_font" "enum_pages_blocks_product_showcase_style_body_font" DEFAULT 'sans',
  	"style_body_size" "enum_pages_blocks_product_showcase_style_body_size" DEFAULT 'base',
  	"style_animation_style" "enum_pages_blocks_product_showcase_style_animation_style" DEFAULT 'fade-rise',
  	"style_animation_delay" "enum_pages_blocks_product_showcase_style_animation_delay" DEFAULT 'none',
  	"style_with_border" boolean DEFAULT false,
  	"style_gap_below" "enum_pages_blocks_product_showcase_style_gap_below" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_articles_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"lede" varchar,
  	"appearance" "enum_pages_blocks_articles_list_appearance" DEFAULT 'default',
  	"view_all_label" varchar DEFAULT 'Read the knowledge hub',
  	"style_color_scheme" "enum_pages_blocks_articles_list_style_color_scheme" DEFAULT 'default',
  	"style_accent_colour" "enum_pages_blocks_articles_list_style_accent_colour" DEFAULT 'brand',
  	"style_width" "enum_pages_blocks_articles_list_style_width" DEFAULT 'default',
  	"style_padding_size" "enum_pages_blocks_articles_list_style_padding_size" DEFAULT 'standard',
  	"style_text_align" "enum_pages_blocks_articles_list_style_text_align" DEFAULT 'left',
  	"style_heading_size" "enum_pages_blocks_articles_list_style_heading_size" DEFAULT 'default',
  	"style_heading_font" "enum_pages_blocks_articles_list_style_heading_font" DEFAULT 'display',
  	"style_body_font" "enum_pages_blocks_articles_list_style_body_font" DEFAULT 'sans',
  	"style_body_size" "enum_pages_blocks_articles_list_style_body_size" DEFAULT 'base',
  	"style_animation_style" "enum_pages_blocks_articles_list_style_animation_style" DEFAULT 'fade-rise',
  	"style_animation_delay" "enum_pages_blocks_articles_list_style_animation_delay" DEFAULT 'none',
  	"style_with_border" boolean DEFAULT false,
  	"style_gap_below" "enum_pages_blocks_articles_list_style_gap_below" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"source" "enum_pages_blocks_testimonials_source" DEFAULT 'auto',
  	"appearance" "enum_pages_blocks_testimonials_appearance" DEFAULT 'default',
  	"style_color_scheme" "enum_pages_blocks_testimonials_style_color_scheme" DEFAULT 'default',
  	"style_accent_colour" "enum_pages_blocks_testimonials_style_accent_colour" DEFAULT 'brand',
  	"style_width" "enum_pages_blocks_testimonials_style_width" DEFAULT 'default',
  	"style_padding_size" "enum_pages_blocks_testimonials_style_padding_size" DEFAULT 'standard',
  	"style_text_align" "enum_pages_blocks_testimonials_style_text_align" DEFAULT 'left',
  	"style_heading_size" "enum_pages_blocks_testimonials_style_heading_size" DEFAULT 'default',
  	"style_heading_font" "enum_pages_blocks_testimonials_style_heading_font" DEFAULT 'display',
  	"style_body_font" "enum_pages_blocks_testimonials_style_body_font" DEFAULT 'sans',
  	"style_body_size" "enum_pages_blocks_testimonials_style_body_size" DEFAULT 'base',
  	"style_animation_style" "enum_pages_blocks_testimonials_style_animation_style" DEFAULT 'fade-rise',
  	"style_animation_delay" "enum_pages_blocks_testimonials_style_animation_delay" DEFAULT 'none',
  	"style_with_border" boolean DEFAULT false,
  	"style_gap_below" "enum_pages_blocks_testimonials_style_gap_below" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_team_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"lede" varchar,
  	"source" "enum_pages_blocks_team_grid_source" DEFAULT 'auto',
  	"appearance" "enum_pages_blocks_team_grid_appearance" DEFAULT 'default',
  	"group" "enum_pages_blocks_team_grid_group" DEFAULT 'all',
  	"style_color_scheme" "enum_pages_blocks_team_grid_style_color_scheme" DEFAULT 'default',
  	"style_accent_colour" "enum_pages_blocks_team_grid_style_accent_colour" DEFAULT 'brand',
  	"style_width" "enum_pages_blocks_team_grid_style_width" DEFAULT 'default',
  	"style_padding_size" "enum_pages_blocks_team_grid_style_padding_size" DEFAULT 'standard',
  	"style_text_align" "enum_pages_blocks_team_grid_style_text_align" DEFAULT 'left',
  	"style_heading_size" "enum_pages_blocks_team_grid_style_heading_size" DEFAULT 'default',
  	"style_heading_font" "enum_pages_blocks_team_grid_style_heading_font" DEFAULT 'display',
  	"style_body_font" "enum_pages_blocks_team_grid_style_body_font" DEFAULT 'sans',
  	"style_body_size" "enum_pages_blocks_team_grid_style_body_size" DEFAULT 'base',
  	"style_animation_style" "enum_pages_blocks_team_grid_style_animation_style" DEFAULT 'fade-rise',
  	"style_animation_delay" "enum_pages_blocks_team_grid_style_animation_delay" DEFAULT 'none',
  	"style_with_border" boolean DEFAULT false,
  	"style_gap_below" "enum_pages_blocks_team_grid_style_gap_below" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_steps_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar
  );
  
  CREATE TABLE "pages_blocks_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"appearance" "enum_pages_blocks_steps_appearance" DEFAULT 'default',
  	"heading" varchar,
  	"style_color_scheme" "enum_pages_blocks_steps_style_color_scheme" DEFAULT 'default',
  	"style_accent_colour" "enum_pages_blocks_steps_style_accent_colour" DEFAULT 'brand',
  	"style_width" "enum_pages_blocks_steps_style_width" DEFAULT 'default',
  	"style_padding_size" "enum_pages_blocks_steps_style_padding_size" DEFAULT 'standard',
  	"style_text_align" "enum_pages_blocks_steps_style_text_align" DEFAULT 'left',
  	"style_heading_size" "enum_pages_blocks_steps_style_heading_size" DEFAULT 'default',
  	"style_heading_font" "enum_pages_blocks_steps_style_heading_font" DEFAULT 'display',
  	"style_body_font" "enum_pages_blocks_steps_style_body_font" DEFAULT 'sans',
  	"style_body_size" "enum_pages_blocks_steps_style_body_size" DEFAULT 'base',
  	"style_animation_style" "enum_pages_blocks_steps_style_animation_style" DEFAULT 'fade-rise',
  	"style_animation_delay" "enum_pages_blocks_steps_style_animation_delay" DEFAULT 'none',
  	"style_with_border" boolean DEFAULT false,
  	"style_gap_below" "enum_pages_blocks_steps_style_gap_below" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_cta_band_ctas" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"type" "enum_pages_blocks_cta_band_ctas_type" DEFAULT 'page',
  	"page_id" integer,
  	"url" varchar,
  	"new_tab" boolean,
  	"style" "enum_pages_blocks_cta_band_ctas_style" DEFAULT 'primary'
  );
  
  CREATE TABLE "pages_blocks_cta_band" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subhead" varchar,
  	"style_color_scheme" "enum_pages_blocks_cta_band_style_color_scheme" DEFAULT 'default',
  	"style_accent_colour" "enum_pages_blocks_cta_band_style_accent_colour" DEFAULT 'brand',
  	"style_width" "enum_pages_blocks_cta_band_style_width" DEFAULT 'default',
  	"style_padding_size" "enum_pages_blocks_cta_band_style_padding_size" DEFAULT 'standard',
  	"style_text_align" "enum_pages_blocks_cta_band_style_text_align" DEFAULT 'left',
  	"style_heading_size" "enum_pages_blocks_cta_band_style_heading_size" DEFAULT 'default',
  	"style_heading_font" "enum_pages_blocks_cta_band_style_heading_font" DEFAULT 'display',
  	"style_body_font" "enum_pages_blocks_cta_band_style_body_font" DEFAULT 'sans',
  	"style_body_size" "enum_pages_blocks_cta_band_style_body_size" DEFAULT 'base',
  	"style_animation_style" "enum_pages_blocks_cta_band_style_animation_style" DEFAULT 'fade-rise',
  	"style_animation_delay" "enum_pages_blocks_cta_band_style_animation_delay" DEFAULT 'none',
  	"style_with_border" boolean DEFAULT false,
  	"style_gap_below" "enum_pages_blocks_cta_band_style_gap_below" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "pages_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"appearance" "enum_pages_blocks_faq_appearance" DEFAULT 'default',
  	"style_color_scheme" "enum_pages_blocks_faq_style_color_scheme" DEFAULT 'default',
  	"style_accent_colour" "enum_pages_blocks_faq_style_accent_colour" DEFAULT 'brand',
  	"style_width" "enum_pages_blocks_faq_style_width" DEFAULT 'default',
  	"style_padding_size" "enum_pages_blocks_faq_style_padding_size" DEFAULT 'standard',
  	"style_text_align" "enum_pages_blocks_faq_style_text_align" DEFAULT 'left',
  	"style_heading_size" "enum_pages_blocks_faq_style_heading_size" DEFAULT 'default',
  	"style_heading_font" "enum_pages_blocks_faq_style_heading_font" DEFAULT 'display',
  	"style_body_font" "enum_pages_blocks_faq_style_body_font" DEFAULT 'sans',
  	"style_body_size" "enum_pages_blocks_faq_style_body_size" DEFAULT 'base',
  	"style_animation_style" "enum_pages_blocks_faq_style_animation_style" DEFAULT 'fade-rise',
  	"style_animation_delay" "enum_pages_blocks_faq_style_animation_delay" DEFAULT 'none',
  	"style_with_border" boolean DEFAULT false,
  	"style_gap_below" "enum_pages_blocks_faq_style_gap_below" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_calculator_embed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"appearance" "enum_pages_blocks_calculator_embed_appearance" DEFAULT 'default',
  	"body" varchar,
  	"tool" "enum_pages_blocks_calculator_embed_tool" DEFAULT 'solarcalc',
  	"cta_label" varchar DEFAULT 'Try the calculator',
  	"style_color_scheme" "enum_pages_blocks_calculator_embed_style_color_scheme" DEFAULT 'default',
  	"style_accent_colour" "enum_pages_blocks_calculator_embed_style_accent_colour" DEFAULT 'brand',
  	"style_width" "enum_pages_blocks_calculator_embed_style_width" DEFAULT 'default',
  	"style_padding_size" "enum_pages_blocks_calculator_embed_style_padding_size" DEFAULT 'standard',
  	"style_text_align" "enum_pages_blocks_calculator_embed_style_text_align" DEFAULT 'left',
  	"style_heading_size" "enum_pages_blocks_calculator_embed_style_heading_size" DEFAULT 'default',
  	"style_heading_font" "enum_pages_blocks_calculator_embed_style_heading_font" DEFAULT 'display',
  	"style_body_font" "enum_pages_blocks_calculator_embed_style_body_font" DEFAULT 'sans',
  	"style_body_size" "enum_pages_blocks_calculator_embed_style_body_size" DEFAULT 'base',
  	"style_animation_style" "enum_pages_blocks_calculator_embed_style_animation_style" DEFAULT 'fade-rise',
  	"style_animation_delay" "enum_pages_blocks_calculator_embed_style_animation_delay" DEFAULT 'none',
  	"style_with_border" boolean DEFAULT false,
  	"style_gap_below" "enum_pages_blocks_calculator_embed_style_gap_below" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_contact_r_f_q" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"appearance" "enum_pages_blocks_contact_r_f_q_appearance" DEFAULT 'default',
  	"subhead" varchar,
  	"style_color_scheme" "enum_pages_blocks_contact_r_f_q_style_color_scheme" DEFAULT 'default',
  	"style_accent_colour" "enum_pages_blocks_contact_r_f_q_style_accent_colour" DEFAULT 'brand',
  	"style_width" "enum_pages_blocks_contact_r_f_q_style_width" DEFAULT 'default',
  	"style_padding_size" "enum_pages_blocks_contact_r_f_q_style_padding_size" DEFAULT 'standard',
  	"style_text_align" "enum_pages_blocks_contact_r_f_q_style_text_align" DEFAULT 'left',
  	"style_heading_size" "enum_pages_blocks_contact_r_f_q_style_heading_size" DEFAULT 'default',
  	"style_heading_font" "enum_pages_blocks_contact_r_f_q_style_heading_font" DEFAULT 'display',
  	"style_body_font" "enum_pages_blocks_contact_r_f_q_style_body_font" DEFAULT 'sans',
  	"style_body_size" "enum_pages_blocks_contact_r_f_q_style_body_size" DEFAULT 'base',
  	"style_animation_style" "enum_pages_blocks_contact_r_f_q_style_animation_style" DEFAULT 'fade-rise',
  	"style_animation_delay" "enum_pages_blocks_contact_r_f_q_style_animation_delay" DEFAULT 'none',
  	"style_with_border" boolean DEFAULT false,
  	"style_gap_below" "enum_pages_blocks_contact_r_f_q_style_gap_below" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_spacer" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"size" "enum_pages_blocks_spacer_size" DEFAULT 'md',
  	"divider" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"seo_title" varchar,
  	"seo_canonical" varchar,
  	"seo_description" varchar,
  	"seo_image_id" integer,
  	"seo_noindex" boolean,
  	"show_in_nav" boolean,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"services_id" integer,
  	"sectors_id" integer,
  	"projects_id" integer,
  	"clients_id" integer,
  	"products_id" integer,
  	"testimonials_id" integer,
  	"team_id" integer
  );
  
  CREATE TABLE "_pages_v_blocks_hero_carousel_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_hero_side_media_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_hero_ctas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"type" "enum__pages_v_blocks_hero_ctas_type" DEFAULT 'page',
  	"page_id" integer,
  	"url" varchar,
  	"new_tab" boolean,
  	"style" "enum__pages_v_blocks_hero_ctas_style" DEFAULT 'primary',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"subhead" varchar,
  	"height" "enum__pages_v_blocks_hero_height" DEFAULT 'standard',
  	"tone" "enum__pages_v_blocks_hero_tone" DEFAULT 'dark',
  	"background_image_id" integer,
  	"background_video_id" integer,
  	"hero_mode" "enum__pages_v_blocks_hero_hero_mode" DEFAULT 'single',
  	"carousel_interval" numeric DEFAULT 5,
  	"side_media_enabled" boolean DEFAULT false,
  	"side_media_source" "enum__pages_v_blocks_hero_side_media_source" DEFAULT 'projects',
  	"side_media_interval" numeric DEFAULT 5,
  	"style_color_scheme" "enum__pages_v_blocks_hero_style_color_scheme" DEFAULT 'default',
  	"style_accent_colour" "enum__pages_v_blocks_hero_style_accent_colour" DEFAULT 'brand',
  	"style_width" "enum__pages_v_blocks_hero_style_width" DEFAULT 'default',
  	"style_padding_size" "enum__pages_v_blocks_hero_style_padding_size" DEFAULT 'standard',
  	"style_text_align" "enum__pages_v_blocks_hero_style_text_align" DEFAULT 'left',
  	"style_heading_size" "enum__pages_v_blocks_hero_style_heading_size" DEFAULT 'default',
  	"style_heading_font" "enum__pages_v_blocks_hero_style_heading_font" DEFAULT 'display',
  	"style_body_font" "enum__pages_v_blocks_hero_style_body_font" DEFAULT 'sans',
  	"style_body_size" "enum__pages_v_blocks_hero_style_body_size" DEFAULT 'base',
  	"style_animation_style" "enum__pages_v_blocks_hero_style_animation_style" DEFAULT 'fade-rise',
  	"style_animation_delay" "enum__pages_v_blocks_hero_style_animation_delay" DEFAULT 'none',
  	"style_with_border" boolean DEFAULT false,
  	"style_gap_below" "enum__pages_v_blocks_hero_style_gap_below" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"appearance" "enum__pages_v_blocks_rich_text_appearance" DEFAULT 'default',
  	"content" jsonb,
  	"style_color_scheme" "enum__pages_v_blocks_rich_text_style_color_scheme" DEFAULT 'default',
  	"style_accent_colour" "enum__pages_v_blocks_rich_text_style_accent_colour" DEFAULT 'brand',
  	"style_width" "enum__pages_v_blocks_rich_text_style_width" DEFAULT 'default',
  	"style_padding_size" "enum__pages_v_blocks_rich_text_style_padding_size" DEFAULT 'standard',
  	"style_text_align" "enum__pages_v_blocks_rich_text_style_text_align" DEFAULT 'left',
  	"style_heading_size" "enum__pages_v_blocks_rich_text_style_heading_size" DEFAULT 'default',
  	"style_heading_font" "enum__pages_v_blocks_rich_text_style_heading_font" DEFAULT 'display',
  	"style_body_font" "enum__pages_v_blocks_rich_text_style_body_font" DEFAULT 'sans',
  	"style_body_size" "enum__pages_v_blocks_rich_text_style_body_size" DEFAULT 'base',
  	"style_animation_style" "enum__pages_v_blocks_rich_text_style_animation_style" DEFAULT 'fade-rise',
  	"style_animation_delay" "enum__pages_v_blocks_rich_text_style_animation_delay" DEFAULT 'none',
  	"style_with_border" boolean DEFAULT false,
  	"style_gap_below" "enum__pages_v_blocks_rich_text_style_gap_below" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_stats_counters_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" numeric,
  	"suffix" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_stats_counters" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"intro" varchar,
  	"appearance" "enum__pages_v_blocks_stats_counters_appearance" DEFAULT 'default',
  	"style_color_scheme" "enum__pages_v_blocks_stats_counters_style_color_scheme" DEFAULT 'default',
  	"style_accent_colour" "enum__pages_v_blocks_stats_counters_style_accent_colour" DEFAULT 'brand',
  	"style_width" "enum__pages_v_blocks_stats_counters_style_width" DEFAULT 'default',
  	"style_padding_size" "enum__pages_v_blocks_stats_counters_style_padding_size" DEFAULT 'standard',
  	"style_text_align" "enum__pages_v_blocks_stats_counters_style_text_align" DEFAULT 'left',
  	"style_heading_size" "enum__pages_v_blocks_stats_counters_style_heading_size" DEFAULT 'default',
  	"style_heading_font" "enum__pages_v_blocks_stats_counters_style_heading_font" DEFAULT 'display',
  	"style_body_font" "enum__pages_v_blocks_stats_counters_style_body_font" DEFAULT 'sans',
  	"style_body_size" "enum__pages_v_blocks_stats_counters_style_body_size" DEFAULT 'base',
  	"style_animation_style" "enum__pages_v_blocks_stats_counters_style_animation_style" DEFAULT 'fade-rise',
  	"style_animation_delay" "enum__pages_v_blocks_stats_counters_style_animation_delay" DEFAULT 'none',
  	"style_with_border" boolean DEFAULT false,
  	"style_gap_below" "enum__pages_v_blocks_stats_counters_style_gap_below" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_services_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"lede" varchar,
  	"source" "enum__pages_v_blocks_services_grid_source" DEFAULT 'auto',
  	"appearance" "enum__pages_v_blocks_services_grid_appearance" DEFAULT 'default',
  	"style_color_scheme" "enum__pages_v_blocks_services_grid_style_color_scheme" DEFAULT 'default',
  	"style_accent_colour" "enum__pages_v_blocks_services_grid_style_accent_colour" DEFAULT 'brand',
  	"style_width" "enum__pages_v_blocks_services_grid_style_width" DEFAULT 'default',
  	"style_padding_size" "enum__pages_v_blocks_services_grid_style_padding_size" DEFAULT 'standard',
  	"style_text_align" "enum__pages_v_blocks_services_grid_style_text_align" DEFAULT 'left',
  	"style_heading_size" "enum__pages_v_blocks_services_grid_style_heading_size" DEFAULT 'default',
  	"style_heading_font" "enum__pages_v_blocks_services_grid_style_heading_font" DEFAULT 'display',
  	"style_body_font" "enum__pages_v_blocks_services_grid_style_body_font" DEFAULT 'sans',
  	"style_body_size" "enum__pages_v_blocks_services_grid_style_body_size" DEFAULT 'base',
  	"style_animation_style" "enum__pages_v_blocks_services_grid_style_animation_style" DEFAULT 'fade-rise',
  	"style_animation_delay" "enum__pages_v_blocks_services_grid_style_animation_delay" DEFAULT 'none',
  	"style_with_border" boolean DEFAULT false,
  	"style_gap_below" "enum__pages_v_blocks_services_grid_style_gap_below" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_sector_tiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"lede" varchar,
  	"source" "enum__pages_v_blocks_sector_tiles_source" DEFAULT 'auto',
  	"appearance" "enum__pages_v_blocks_sector_tiles_appearance" DEFAULT 'default',
  	"style_color_scheme" "enum__pages_v_blocks_sector_tiles_style_color_scheme" DEFAULT 'default',
  	"style_accent_colour" "enum__pages_v_blocks_sector_tiles_style_accent_colour" DEFAULT 'brand',
  	"style_width" "enum__pages_v_blocks_sector_tiles_style_width" DEFAULT 'default',
  	"style_padding_size" "enum__pages_v_blocks_sector_tiles_style_padding_size" DEFAULT 'standard',
  	"style_text_align" "enum__pages_v_blocks_sector_tiles_style_text_align" DEFAULT 'left',
  	"style_heading_size" "enum__pages_v_blocks_sector_tiles_style_heading_size" DEFAULT 'default',
  	"style_heading_font" "enum__pages_v_blocks_sector_tiles_style_heading_font" DEFAULT 'display',
  	"style_body_font" "enum__pages_v_blocks_sector_tiles_style_body_font" DEFAULT 'sans',
  	"style_body_size" "enum__pages_v_blocks_sector_tiles_style_body_size" DEFAULT 'base',
  	"style_animation_style" "enum__pages_v_blocks_sector_tiles_style_animation_style" DEFAULT 'fade-rise',
  	"style_animation_delay" "enum__pages_v_blocks_sector_tiles_style_animation_delay" DEFAULT 'none',
  	"style_with_border" boolean DEFAULT false,
  	"style_gap_below" "enum__pages_v_blocks_sector_tiles_style_gap_below" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_projects_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"lede" varchar,
  	"source" "enum__pages_v_blocks_projects_list_source" DEFAULT 'featured',
  	"appearance" "enum__pages_v_blocks_projects_list_appearance" DEFAULT 'default',
  	"view_all_label" varchar DEFAULT 'View all projects',
  	"style_color_scheme" "enum__pages_v_blocks_projects_list_style_color_scheme" DEFAULT 'default',
  	"style_accent_colour" "enum__pages_v_blocks_projects_list_style_accent_colour" DEFAULT 'brand',
  	"style_width" "enum__pages_v_blocks_projects_list_style_width" DEFAULT 'default',
  	"style_padding_size" "enum__pages_v_blocks_projects_list_style_padding_size" DEFAULT 'standard',
  	"style_text_align" "enum__pages_v_blocks_projects_list_style_text_align" DEFAULT 'left',
  	"style_heading_size" "enum__pages_v_blocks_projects_list_style_heading_size" DEFAULT 'default',
  	"style_heading_font" "enum__pages_v_blocks_projects_list_style_heading_font" DEFAULT 'display',
  	"style_body_font" "enum__pages_v_blocks_projects_list_style_body_font" DEFAULT 'sans',
  	"style_body_size" "enum__pages_v_blocks_projects_list_style_body_size" DEFAULT 'base',
  	"style_animation_style" "enum__pages_v_blocks_projects_list_style_animation_style" DEFAULT 'fade-rise',
  	"style_animation_delay" "enum__pages_v_blocks_projects_list_style_animation_delay" DEFAULT 'none',
  	"style_with_border" boolean DEFAULT false,
  	"style_gap_below" "enum__pages_v_blocks_projects_list_style_gap_below" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_image_gallery_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_image_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"appearance" "enum__pages_v_blocks_image_gallery_appearance" DEFAULT 'default',
  	"style_color_scheme" "enum__pages_v_blocks_image_gallery_style_color_scheme" DEFAULT 'default',
  	"style_accent_colour" "enum__pages_v_blocks_image_gallery_style_accent_colour" DEFAULT 'brand',
  	"style_width" "enum__pages_v_blocks_image_gallery_style_width" DEFAULT 'default',
  	"style_padding_size" "enum__pages_v_blocks_image_gallery_style_padding_size" DEFAULT 'standard',
  	"style_text_align" "enum__pages_v_blocks_image_gallery_style_text_align" DEFAULT 'left',
  	"style_heading_size" "enum__pages_v_blocks_image_gallery_style_heading_size" DEFAULT 'default',
  	"style_heading_font" "enum__pages_v_blocks_image_gallery_style_heading_font" DEFAULT 'display',
  	"style_body_font" "enum__pages_v_blocks_image_gallery_style_body_font" DEFAULT 'sans',
  	"style_body_size" "enum__pages_v_blocks_image_gallery_style_body_size" DEFAULT 'base',
  	"style_animation_style" "enum__pages_v_blocks_image_gallery_style_animation_style" DEFAULT 'fade-rise',
  	"style_animation_delay" "enum__pages_v_blocks_image_gallery_style_animation_delay" DEFAULT 'none',
  	"style_with_border" boolean DEFAULT false,
  	"style_gap_below" "enum__pages_v_blocks_image_gallery_style_gap_below" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_photo_strip_photos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_photo_strip" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"appearance" "enum__pages_v_blocks_photo_strip_appearance" DEFAULT 'default',
  	"display_mode" "enum__pages_v_blocks_photo_strip_display_mode" DEFAULT 'marquee',
  	"speed" "enum__pages_v_blocks_photo_strip_speed" DEFAULT 'normal',
  	"style_color_scheme" "enum__pages_v_blocks_photo_strip_style_color_scheme" DEFAULT 'default',
  	"style_accent_colour" "enum__pages_v_blocks_photo_strip_style_accent_colour" DEFAULT 'brand',
  	"style_width" "enum__pages_v_blocks_photo_strip_style_width" DEFAULT 'default',
  	"style_padding_size" "enum__pages_v_blocks_photo_strip_style_padding_size" DEFAULT 'standard',
  	"style_text_align" "enum__pages_v_blocks_photo_strip_style_text_align" DEFAULT 'left',
  	"style_heading_size" "enum__pages_v_blocks_photo_strip_style_heading_size" DEFAULT 'default',
  	"style_heading_font" "enum__pages_v_blocks_photo_strip_style_heading_font" DEFAULT 'display',
  	"style_body_font" "enum__pages_v_blocks_photo_strip_style_body_font" DEFAULT 'sans',
  	"style_body_size" "enum__pages_v_blocks_photo_strip_style_body_size" DEFAULT 'base',
  	"style_animation_style" "enum__pages_v_blocks_photo_strip_style_animation_style" DEFAULT 'fade-rise',
  	"style_animation_delay" "enum__pages_v_blocks_photo_strip_style_animation_delay" DEFAULT 'none',
  	"style_with_border" boolean DEFAULT false,
  	"style_gap_below" "enum__pages_v_blocks_photo_strip_style_gap_below" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_video_showcase_videos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"source" "enum__pages_v_blocks_video_showcase_videos_source" DEFAULT 'upload',
  	"duration" varchar,
  	"video_file_id" integer,
  	"video_url" varchar,
  	"poster_id" integer,
  	"featured" boolean,
  	"upload_date" timestamp(3) with time zone,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_video_showcase" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"lede" varchar,
  	"layout" "enum__pages_v_blocks_video_showcase_layout" DEFAULT 'spotlight',
  	"tone" "enum__pages_v_blocks_video_showcase_tone" DEFAULT 'dark',
  	"style_color_scheme" "enum__pages_v_blocks_video_showcase_style_color_scheme" DEFAULT 'default',
  	"style_accent_colour" "enum__pages_v_blocks_video_showcase_style_accent_colour" DEFAULT 'brand',
  	"style_width" "enum__pages_v_blocks_video_showcase_style_width" DEFAULT 'default',
  	"style_padding_size" "enum__pages_v_blocks_video_showcase_style_padding_size" DEFAULT 'standard',
  	"style_text_align" "enum__pages_v_blocks_video_showcase_style_text_align" DEFAULT 'left',
  	"style_heading_size" "enum__pages_v_blocks_video_showcase_style_heading_size" DEFAULT 'default',
  	"style_heading_font" "enum__pages_v_blocks_video_showcase_style_heading_font" DEFAULT 'display',
  	"style_body_font" "enum__pages_v_blocks_video_showcase_style_body_font" DEFAULT 'sans',
  	"style_body_size" "enum__pages_v_blocks_video_showcase_style_body_size" DEFAULT 'base',
  	"style_animation_style" "enum__pages_v_blocks_video_showcase_style_animation_style" DEFAULT 'fade-rise',
  	"style_animation_delay" "enum__pages_v_blocks_video_showcase_style_animation_delay" DEFAULT 'none',
  	"style_with_border" boolean DEFAULT false,
  	"style_gap_below" "enum__pages_v_blocks_video_showcase_style_gap_below" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_logo_wall" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"source" "enum__pages_v_blocks_logo_wall_source" DEFAULT 'auto',
  	"appearance" "enum__pages_v_blocks_logo_wall_appearance" DEFAULT 'default',
  	"style_color_scheme" "enum__pages_v_blocks_logo_wall_style_color_scheme" DEFAULT 'default',
  	"style_accent_colour" "enum__pages_v_blocks_logo_wall_style_accent_colour" DEFAULT 'brand',
  	"style_width" "enum__pages_v_blocks_logo_wall_style_width" DEFAULT 'default',
  	"style_padding_size" "enum__pages_v_blocks_logo_wall_style_padding_size" DEFAULT 'standard',
  	"style_text_align" "enum__pages_v_blocks_logo_wall_style_text_align" DEFAULT 'left',
  	"style_heading_size" "enum__pages_v_blocks_logo_wall_style_heading_size" DEFAULT 'default',
  	"style_heading_font" "enum__pages_v_blocks_logo_wall_style_heading_font" DEFAULT 'display',
  	"style_body_font" "enum__pages_v_blocks_logo_wall_style_body_font" DEFAULT 'sans',
  	"style_body_size" "enum__pages_v_blocks_logo_wall_style_body_size" DEFAULT 'base',
  	"style_animation_style" "enum__pages_v_blocks_logo_wall_style_animation_style" DEFAULT 'fade-rise',
  	"style_animation_delay" "enum__pages_v_blocks_logo_wall_style_animation_delay" DEFAULT 'none',
  	"style_with_border" boolean DEFAULT false,
  	"style_gap_below" "enum__pages_v_blocks_logo_wall_style_gap_below" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_partner_bar_partners" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"logo_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_partner_bar" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"appearance" "enum__pages_v_blocks_partner_bar_appearance" DEFAULT 'default',
  	"style_color_scheme" "enum__pages_v_blocks_partner_bar_style_color_scheme" DEFAULT 'default',
  	"style_accent_colour" "enum__pages_v_blocks_partner_bar_style_accent_colour" DEFAULT 'brand',
  	"style_width" "enum__pages_v_blocks_partner_bar_style_width" DEFAULT 'default',
  	"style_padding_size" "enum__pages_v_blocks_partner_bar_style_padding_size" DEFAULT 'standard',
  	"style_text_align" "enum__pages_v_blocks_partner_bar_style_text_align" DEFAULT 'left',
  	"style_heading_size" "enum__pages_v_blocks_partner_bar_style_heading_size" DEFAULT 'default',
  	"style_heading_font" "enum__pages_v_blocks_partner_bar_style_heading_font" DEFAULT 'display',
  	"style_body_font" "enum__pages_v_blocks_partner_bar_style_body_font" DEFAULT 'sans',
  	"style_body_size" "enum__pages_v_blocks_partner_bar_style_body_size" DEFAULT 'base',
  	"style_animation_style" "enum__pages_v_blocks_partner_bar_style_animation_style" DEFAULT 'fade-rise',
  	"style_animation_delay" "enum__pages_v_blocks_partner_bar_style_animation_delay" DEFAULT 'none',
  	"style_with_border" boolean DEFAULT false,
  	"style_gap_below" "enum__pages_v_blocks_partner_bar_style_gap_below" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_product_showcase" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"lede" varchar,
  	"source" "enum__pages_v_blocks_product_showcase_source" DEFAULT 'featured',
  	"appearance" "enum__pages_v_blocks_product_showcase_appearance" DEFAULT 'default',
  	"view_all_label" varchar DEFAULT 'View all products',
  	"style_color_scheme" "enum__pages_v_blocks_product_showcase_style_color_scheme" DEFAULT 'default',
  	"style_accent_colour" "enum__pages_v_blocks_product_showcase_style_accent_colour" DEFAULT 'brand',
  	"style_width" "enum__pages_v_blocks_product_showcase_style_width" DEFAULT 'default',
  	"style_padding_size" "enum__pages_v_blocks_product_showcase_style_padding_size" DEFAULT 'standard',
  	"style_text_align" "enum__pages_v_blocks_product_showcase_style_text_align" DEFAULT 'left',
  	"style_heading_size" "enum__pages_v_blocks_product_showcase_style_heading_size" DEFAULT 'default',
  	"style_heading_font" "enum__pages_v_blocks_product_showcase_style_heading_font" DEFAULT 'display',
  	"style_body_font" "enum__pages_v_blocks_product_showcase_style_body_font" DEFAULT 'sans',
  	"style_body_size" "enum__pages_v_blocks_product_showcase_style_body_size" DEFAULT 'base',
  	"style_animation_style" "enum__pages_v_blocks_product_showcase_style_animation_style" DEFAULT 'fade-rise',
  	"style_animation_delay" "enum__pages_v_blocks_product_showcase_style_animation_delay" DEFAULT 'none',
  	"style_with_border" boolean DEFAULT false,
  	"style_gap_below" "enum__pages_v_blocks_product_showcase_style_gap_below" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_articles_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"lede" varchar,
  	"appearance" "enum__pages_v_blocks_articles_list_appearance" DEFAULT 'default',
  	"view_all_label" varchar DEFAULT 'Read the knowledge hub',
  	"style_color_scheme" "enum__pages_v_blocks_articles_list_style_color_scheme" DEFAULT 'default',
  	"style_accent_colour" "enum__pages_v_blocks_articles_list_style_accent_colour" DEFAULT 'brand',
  	"style_width" "enum__pages_v_blocks_articles_list_style_width" DEFAULT 'default',
  	"style_padding_size" "enum__pages_v_blocks_articles_list_style_padding_size" DEFAULT 'standard',
  	"style_text_align" "enum__pages_v_blocks_articles_list_style_text_align" DEFAULT 'left',
  	"style_heading_size" "enum__pages_v_blocks_articles_list_style_heading_size" DEFAULT 'default',
  	"style_heading_font" "enum__pages_v_blocks_articles_list_style_heading_font" DEFAULT 'display',
  	"style_body_font" "enum__pages_v_blocks_articles_list_style_body_font" DEFAULT 'sans',
  	"style_body_size" "enum__pages_v_blocks_articles_list_style_body_size" DEFAULT 'base',
  	"style_animation_style" "enum__pages_v_blocks_articles_list_style_animation_style" DEFAULT 'fade-rise',
  	"style_animation_delay" "enum__pages_v_blocks_articles_list_style_animation_delay" DEFAULT 'none',
  	"style_with_border" boolean DEFAULT false,
  	"style_gap_below" "enum__pages_v_blocks_articles_list_style_gap_below" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"source" "enum__pages_v_blocks_testimonials_source" DEFAULT 'auto',
  	"appearance" "enum__pages_v_blocks_testimonials_appearance" DEFAULT 'default',
  	"style_color_scheme" "enum__pages_v_blocks_testimonials_style_color_scheme" DEFAULT 'default',
  	"style_accent_colour" "enum__pages_v_blocks_testimonials_style_accent_colour" DEFAULT 'brand',
  	"style_width" "enum__pages_v_blocks_testimonials_style_width" DEFAULT 'default',
  	"style_padding_size" "enum__pages_v_blocks_testimonials_style_padding_size" DEFAULT 'standard',
  	"style_text_align" "enum__pages_v_blocks_testimonials_style_text_align" DEFAULT 'left',
  	"style_heading_size" "enum__pages_v_blocks_testimonials_style_heading_size" DEFAULT 'default',
  	"style_heading_font" "enum__pages_v_blocks_testimonials_style_heading_font" DEFAULT 'display',
  	"style_body_font" "enum__pages_v_blocks_testimonials_style_body_font" DEFAULT 'sans',
  	"style_body_size" "enum__pages_v_blocks_testimonials_style_body_size" DEFAULT 'base',
  	"style_animation_style" "enum__pages_v_blocks_testimonials_style_animation_style" DEFAULT 'fade-rise',
  	"style_animation_delay" "enum__pages_v_blocks_testimonials_style_animation_delay" DEFAULT 'none',
  	"style_with_border" boolean DEFAULT false,
  	"style_gap_below" "enum__pages_v_blocks_testimonials_style_gap_below" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_team_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"lede" varchar,
  	"source" "enum__pages_v_blocks_team_grid_source" DEFAULT 'auto',
  	"appearance" "enum__pages_v_blocks_team_grid_appearance" DEFAULT 'default',
  	"group" "enum__pages_v_blocks_team_grid_group" DEFAULT 'all',
  	"style_color_scheme" "enum__pages_v_blocks_team_grid_style_color_scheme" DEFAULT 'default',
  	"style_accent_colour" "enum__pages_v_blocks_team_grid_style_accent_colour" DEFAULT 'brand',
  	"style_width" "enum__pages_v_blocks_team_grid_style_width" DEFAULT 'default',
  	"style_padding_size" "enum__pages_v_blocks_team_grid_style_padding_size" DEFAULT 'standard',
  	"style_text_align" "enum__pages_v_blocks_team_grid_style_text_align" DEFAULT 'left',
  	"style_heading_size" "enum__pages_v_blocks_team_grid_style_heading_size" DEFAULT 'default',
  	"style_heading_font" "enum__pages_v_blocks_team_grid_style_heading_font" DEFAULT 'display',
  	"style_body_font" "enum__pages_v_blocks_team_grid_style_body_font" DEFAULT 'sans',
  	"style_body_size" "enum__pages_v_blocks_team_grid_style_body_size" DEFAULT 'base',
  	"style_animation_style" "enum__pages_v_blocks_team_grid_style_animation_style" DEFAULT 'fade-rise',
  	"style_animation_delay" "enum__pages_v_blocks_team_grid_style_animation_delay" DEFAULT 'none',
  	"style_with_border" boolean DEFAULT false,
  	"style_gap_below" "enum__pages_v_blocks_team_grid_style_gap_below" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_steps_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"appearance" "enum__pages_v_blocks_steps_appearance" DEFAULT 'default',
  	"heading" varchar,
  	"style_color_scheme" "enum__pages_v_blocks_steps_style_color_scheme" DEFAULT 'default',
  	"style_accent_colour" "enum__pages_v_blocks_steps_style_accent_colour" DEFAULT 'brand',
  	"style_width" "enum__pages_v_blocks_steps_style_width" DEFAULT 'default',
  	"style_padding_size" "enum__pages_v_blocks_steps_style_padding_size" DEFAULT 'standard',
  	"style_text_align" "enum__pages_v_blocks_steps_style_text_align" DEFAULT 'left',
  	"style_heading_size" "enum__pages_v_blocks_steps_style_heading_size" DEFAULT 'default',
  	"style_heading_font" "enum__pages_v_blocks_steps_style_heading_font" DEFAULT 'display',
  	"style_body_font" "enum__pages_v_blocks_steps_style_body_font" DEFAULT 'sans',
  	"style_body_size" "enum__pages_v_blocks_steps_style_body_size" DEFAULT 'base',
  	"style_animation_style" "enum__pages_v_blocks_steps_style_animation_style" DEFAULT 'fade-rise',
  	"style_animation_delay" "enum__pages_v_blocks_steps_style_animation_delay" DEFAULT 'none',
  	"style_with_border" boolean DEFAULT false,
  	"style_gap_below" "enum__pages_v_blocks_steps_style_gap_below" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cta_band_ctas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"type" "enum__pages_v_blocks_cta_band_ctas_type" DEFAULT 'page',
  	"page_id" integer,
  	"url" varchar,
  	"new_tab" boolean,
  	"style" "enum__pages_v_blocks_cta_band_ctas_style" DEFAULT 'primary',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cta_band" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subhead" varchar,
  	"style_color_scheme" "enum__pages_v_blocks_cta_band_style_color_scheme" DEFAULT 'default',
  	"style_accent_colour" "enum__pages_v_blocks_cta_band_style_accent_colour" DEFAULT 'brand',
  	"style_width" "enum__pages_v_blocks_cta_band_style_width" DEFAULT 'default',
  	"style_padding_size" "enum__pages_v_blocks_cta_band_style_padding_size" DEFAULT 'standard',
  	"style_text_align" "enum__pages_v_blocks_cta_band_style_text_align" DEFAULT 'left',
  	"style_heading_size" "enum__pages_v_blocks_cta_band_style_heading_size" DEFAULT 'default',
  	"style_heading_font" "enum__pages_v_blocks_cta_band_style_heading_font" DEFAULT 'display',
  	"style_body_font" "enum__pages_v_blocks_cta_band_style_body_font" DEFAULT 'sans',
  	"style_body_size" "enum__pages_v_blocks_cta_band_style_body_size" DEFAULT 'base',
  	"style_animation_style" "enum__pages_v_blocks_cta_band_style_animation_style" DEFAULT 'fade-rise',
  	"style_animation_delay" "enum__pages_v_blocks_cta_band_style_animation_delay" DEFAULT 'none',
  	"style_with_border" boolean DEFAULT false,
  	"style_gap_below" "enum__pages_v_blocks_cta_band_style_gap_below" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"appearance" "enum__pages_v_blocks_faq_appearance" DEFAULT 'default',
  	"style_color_scheme" "enum__pages_v_blocks_faq_style_color_scheme" DEFAULT 'default',
  	"style_accent_colour" "enum__pages_v_blocks_faq_style_accent_colour" DEFAULT 'brand',
  	"style_width" "enum__pages_v_blocks_faq_style_width" DEFAULT 'default',
  	"style_padding_size" "enum__pages_v_blocks_faq_style_padding_size" DEFAULT 'standard',
  	"style_text_align" "enum__pages_v_blocks_faq_style_text_align" DEFAULT 'left',
  	"style_heading_size" "enum__pages_v_blocks_faq_style_heading_size" DEFAULT 'default',
  	"style_heading_font" "enum__pages_v_blocks_faq_style_heading_font" DEFAULT 'display',
  	"style_body_font" "enum__pages_v_blocks_faq_style_body_font" DEFAULT 'sans',
  	"style_body_size" "enum__pages_v_blocks_faq_style_body_size" DEFAULT 'base',
  	"style_animation_style" "enum__pages_v_blocks_faq_style_animation_style" DEFAULT 'fade-rise',
  	"style_animation_delay" "enum__pages_v_blocks_faq_style_animation_delay" DEFAULT 'none',
  	"style_with_border" boolean DEFAULT false,
  	"style_gap_below" "enum__pages_v_blocks_faq_style_gap_below" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_calculator_embed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"appearance" "enum__pages_v_blocks_calculator_embed_appearance" DEFAULT 'default',
  	"body" varchar,
  	"tool" "enum__pages_v_blocks_calculator_embed_tool" DEFAULT 'solarcalc',
  	"cta_label" varchar DEFAULT 'Try the calculator',
  	"style_color_scheme" "enum__pages_v_blocks_calculator_embed_style_color_scheme" DEFAULT 'default',
  	"style_accent_colour" "enum__pages_v_blocks_calculator_embed_style_accent_colour" DEFAULT 'brand',
  	"style_width" "enum__pages_v_blocks_calculator_embed_style_width" DEFAULT 'default',
  	"style_padding_size" "enum__pages_v_blocks_calculator_embed_style_padding_size" DEFAULT 'standard',
  	"style_text_align" "enum__pages_v_blocks_calculator_embed_style_text_align" DEFAULT 'left',
  	"style_heading_size" "enum__pages_v_blocks_calculator_embed_style_heading_size" DEFAULT 'default',
  	"style_heading_font" "enum__pages_v_blocks_calculator_embed_style_heading_font" DEFAULT 'display',
  	"style_body_font" "enum__pages_v_blocks_calculator_embed_style_body_font" DEFAULT 'sans',
  	"style_body_size" "enum__pages_v_blocks_calculator_embed_style_body_size" DEFAULT 'base',
  	"style_animation_style" "enum__pages_v_blocks_calculator_embed_style_animation_style" DEFAULT 'fade-rise',
  	"style_animation_delay" "enum__pages_v_blocks_calculator_embed_style_animation_delay" DEFAULT 'none',
  	"style_with_border" boolean DEFAULT false,
  	"style_gap_below" "enum__pages_v_blocks_calculator_embed_style_gap_below" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_contact_r_f_q" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"appearance" "enum__pages_v_blocks_contact_r_f_q_appearance" DEFAULT 'default',
  	"subhead" varchar,
  	"style_color_scheme" "enum__pages_v_blocks_contact_r_f_q_style_color_scheme" DEFAULT 'default',
  	"style_accent_colour" "enum__pages_v_blocks_contact_r_f_q_style_accent_colour" DEFAULT 'brand',
  	"style_width" "enum__pages_v_blocks_contact_r_f_q_style_width" DEFAULT 'default',
  	"style_padding_size" "enum__pages_v_blocks_contact_r_f_q_style_padding_size" DEFAULT 'standard',
  	"style_text_align" "enum__pages_v_blocks_contact_r_f_q_style_text_align" DEFAULT 'left',
  	"style_heading_size" "enum__pages_v_blocks_contact_r_f_q_style_heading_size" DEFAULT 'default',
  	"style_heading_font" "enum__pages_v_blocks_contact_r_f_q_style_heading_font" DEFAULT 'display',
  	"style_body_font" "enum__pages_v_blocks_contact_r_f_q_style_body_font" DEFAULT 'sans',
  	"style_body_size" "enum__pages_v_blocks_contact_r_f_q_style_body_size" DEFAULT 'base',
  	"style_animation_style" "enum__pages_v_blocks_contact_r_f_q_style_animation_style" DEFAULT 'fade-rise',
  	"style_animation_delay" "enum__pages_v_blocks_contact_r_f_q_style_animation_delay" DEFAULT 'none',
  	"style_with_border" boolean DEFAULT false,
  	"style_gap_below" "enum__pages_v_blocks_contact_r_f_q_style_gap_below" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_spacer" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"size" "enum__pages_v_blocks_spacer_size" DEFAULT 'md',
  	"divider" boolean,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_seo_title" varchar,
  	"version_seo_canonical" varchar,
  	"version_seo_description" varchar,
  	"version_seo_image_id" integer,
  	"version_seo_noindex" boolean,
  	"version_show_in_nav" boolean,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_pages_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"services_id" integer,
  	"sectors_id" integer,
  	"projects_id" integer,
  	"clients_id" integer,
  	"products_id" integer,
  	"testimonials_id" integer,
  	"team_id" integer
  );
  
  CREATE TABLE "projects_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "projects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"slug" varchar,
  	"sector_id" integer,
  	"year" numeric,
  	"featured" boolean,
  	"location" varchar,
  	"capacity" varchar,
  	"scale_note" varchar,
  	"client_public" boolean DEFAULT false,
  	"summary" varchar,
  	"challenge" jsonb,
  	"solution" jsonb,
  	"outcome" jsonb,
  	"client_id" integer,
  	"import_key" varchar,
  	"import_source" varchar,
  	"needs_sector_review" boolean,
  	"import_notes" varchar,
  	"seo_title" varchar,
  	"seo_canonical" varchar,
  	"seo_description" varchar,
  	"seo_image_id" integer,
  	"seo_noindex" boolean,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_projects_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "projects_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"services_id" integer
  );
  
  CREATE TABLE "_projects_v_version_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_slug" varchar,
  	"version_sector_id" integer,
  	"version_year" numeric,
  	"version_featured" boolean,
  	"version_location" varchar,
  	"version_capacity" varchar,
  	"version_scale_note" varchar,
  	"version_client_public" boolean DEFAULT false,
  	"version_summary" varchar,
  	"version_challenge" jsonb,
  	"version_solution" jsonb,
  	"version_outcome" jsonb,
  	"version_client_id" integer,
  	"version_import_key" varchar,
  	"version_import_source" varchar,
  	"version_needs_sector_review" boolean,
  	"version_import_notes" varchar,
  	"version_seo_title" varchar,
  	"version_seo_canonical" varchar,
  	"version_seo_description" varchar,
  	"version_seo_image_id" integer,
  	"version_seo_noindex" boolean,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__projects_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_projects_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"services_id" integer
  );
  
  CREATE TABLE "products" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"brand" varchar,
  	"category" "enum_products_category" DEFAULT 'energy' NOT NULL,
  	"summary" varchar NOT NULL,
  	"image_id" integer NOT NULL,
  	"featured" boolean,
  	"order" numeric,
  	"external_url" varchar,
  	"details" jsonb,
  	"seo_title" varchar,
  	"seo_canonical" varchar,
  	"seo_description" varchar,
  	"seo_image_id" integer,
  	"seo_noindex" boolean,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "services_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL
  );
  
  CREATE TABLE "services" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"icon" "enum_services_icon" DEFAULT 'solar' NOT NULL,
  	"order" numeric,
  	"summary" varchar NOT NULL,
  	"hero_image_id" integer,
  	"explainer_video_id" integer,
  	"explainer_poster_id" integer,
  	"scope" jsonb,
  	"standards" jsonb,
  	"seo_title" varchar,
  	"seo_canonical" varchar,
  	"seo_description" varchar,
  	"seo_image_id" integer,
  	"seo_noindex" boolean,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "sectors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"icon" "enum_sectors_icon" DEFAULT 'garments' NOT NULL,
  	"order" numeric,
  	"summary" varchar NOT NULL,
  	"challenges" jsonb,
  	"seo_title" varchar,
  	"seo_canonical" varchar,
  	"seo_description" varchar,
  	"seo_image_id" integer,
  	"seo_noindex" boolean,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "sectors_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"services_id" integer
  );
  
  CREATE TABLE "team" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" varchar NOT NULL,
  	"category" "enum_team_category" DEFAULT 'leadership',
  	"photo_id" integer,
  	"bio" varchar,
  	"order" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "testimonials" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"quote" varchar NOT NULL,
  	"person" varchar NOT NULL,
  	"role" varchar,
  	"company" varchar NOT NULL,
  	"logo_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "clients" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"logo_id" integer,
  	"order" numeric,
  	"url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "clients_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"sectors_id" integer
  );
  
  CREATE TABLE "articles_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "articles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"author" varchar,
  	"published_date" timestamp(3) with time zone,
  	"excerpt" varchar,
  	"body" jsonb,
  	"seo_title" varchar,
  	"seo_canonical" varchar,
  	"seo_description" varchar,
  	"seo_image_id" integer,
  	"seo_noindex" boolean,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_articles_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_articles_v_version_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_articles_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_author" varchar,
  	"version_published_date" timestamp(3) with time zone,
  	"version_excerpt" varchar,
  	"version_body" jsonb,
  	"version_seo_title" varchar,
  	"version_seo_canonical" varchar,
  	"version_seo_description" varchar,
  	"version_seo_image_id" integer,
  	"version_seo_noindex" boolean,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__articles_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "knowledge_resources" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"type" "enum_knowledge_resources_type" NOT NULL,
  	"description" varchar,
  	"order" numeric DEFAULT 10,
  	"enabled" boolean DEFAULT true,
  	"calc_type" "enum_knowledge_resources_calc_type",
  	"file_upload_id" integer,
  	"file_url" varchar,
  	"file_size" varchar,
  	"file_format" "enum_knowledge_resources_file_format",
  	"open_mode" "enum_knowledge_resources_open_mode" DEFAULT 'both',
  	"download_label" varchar DEFAULT 'Download',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "news_items_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar
  );
  
  CREATE TABLE "news_items_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "news_items" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"category" "enum_news_items_category" DEFAULT 'industry-news',
  	"published_date" timestamp(3) with time zone,
  	"summary" varchar,
  	"body" jsonb,
  	"hero_image_id" integer,
  	"source" varchar,
  	"source_url" varchar,
  	"seo_title" varchar,
  	"seo_canonical" varchar,
  	"seo_description" varchar,
  	"seo_image_id" integer,
  	"seo_noindex" boolean,
  	"agent_meta_generated_by" varchar,
  	"agent_meta_model" varchar,
  	"agent_meta_source_urls" varchar,
  	"agent_meta_generated_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_news_items_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_news_items_v_version_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"tag" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_news_items_v_version_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_news_items_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_category" "enum__news_items_v_version_category" DEFAULT 'industry-news',
  	"version_published_date" timestamp(3) with time zone,
  	"version_summary" varchar,
  	"version_body" jsonb,
  	"version_hero_image_id" integer,
  	"version_source" varchar,
  	"version_source_url" varchar,
  	"version_seo_title" varchar,
  	"version_seo_canonical" varchar,
  	"version_seo_description" varchar,
  	"version_seo_image_id" integer,
  	"version_seo_noindex" boolean,
  	"version_agent_meta_generated_by" varchar,
  	"version_agent_meta_model" varchar,
  	"version_agent_meta_source_urls" varchar,
  	"version_agent_meta_generated_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__news_items_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "awards" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"kind" "enum_awards_kind" DEFAULT 'certification',
  	"issuer" varchar,
  	"date_awarded" timestamp(3) with time zone,
  	"valid_until" timestamp(3) with time zone,
  	"description" varchar,
  	"certificate_id" integer,
  	"reference_url" varchar,
  	"order" numeric DEFAULT 10,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "partners" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"logo_id" integer,
  	"type" "enum_partners_type" DEFAULT 'technology',
  	"description" varchar,
  	"url" varchar,
  	"order" numeric DEFAULT 10,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "job_openings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"department" varchar,
  	"location" varchar,
  	"employment_type" "enum_job_openings_employment_type" DEFAULT 'full-time',
  	"status" "enum_job_openings_status" DEFAULT 'open',
  	"summary" varchar,
  	"description" varchar,
  	"apply_email" varchar,
  	"apply_url" varchar,
  	"closing_date" timestamp(3) with time zone,
  	"order" numeric DEFAULT 10,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"caption" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_feature_url" varchar,
  	"sizes_feature_width" numeric,
  	"sizes_feature_height" numeric,
  	"sizes_feature_mime_type" varchar,
  	"sizes_feature_filesize" numeric,
  	"sizes_feature_filename" varchar,
  	"sizes_og_url" varchar,
  	"sizes_og_width" numeric,
  	"sizes_og_height" numeric,
  	"sizes_og_mime_type" varchar,
  	"sizes_og_filesize" numeric,
  	"sizes_og_filename" varchar
  );
  
  CREATE TABLE "icons" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"category" "enum_icons_category" DEFAULT 'ui',
  	"tags" varchar,
  	"alt" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "rfq_requests" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"company" varchar,
  	"email" varchar,
  	"phone" varchar,
  	"service_interest" varchar,
  	"location" varchar,
  	"message" varchar NOT NULL,
  	"status" "enum_rfq_requests_status" DEFAULT 'new',
  	"source_path" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role" "enum_users_role" DEFAULT 'editor' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_jobs_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"executed_at" timestamp(3) with time zone NOT NULL,
  	"completed_at" timestamp(3) with time zone NOT NULL,
  	"task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
  	"task_i_d" varchar NOT NULL,
  	"input" jsonb,
  	"output" jsonb,
  	"state" "enum_payload_jobs_log_state" NOT NULL,
  	"error" jsonb
  );
  
  CREATE TABLE "payload_jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"input" jsonb,
  	"completed_at" timestamp(3) with time zone,
  	"total_tried" numeric DEFAULT 0,
  	"has_error" boolean DEFAULT false,
  	"error" jsonb,
  	"task_slug" "enum_payload_jobs_task_slug",
  	"queue" varchar DEFAULT 'default',
  	"wait_until" timestamp(3) with time zone,
  	"processing" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"projects_id" integer,
  	"products_id" integer,
  	"services_id" integer,
  	"sectors_id" integer,
  	"team_id" integer,
  	"testimonials_id" integer,
  	"clients_id" integer,
  	"articles_id" integer,
  	"knowledge_resources_id" integer,
  	"news_items_id" integer,
  	"awards_id" integer,
  	"partners_id" integer,
  	"job_openings_id" integer,
  	"media_id" integer,
  	"icons_id" integer,
  	"rfq_requests_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings_phones" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"number" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_social" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_key_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"fact" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_ai_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"logo_id" integer,
  	"company_name" varchar DEFAULT 'Sustech Technology Ltd' NOT NULL,
  	"short_name" varchar DEFAULT 'Sustech',
  	"tagline" varchar,
  	"description" varchar,
  	"founding_year" numeric DEFAULT 2017,
  	"area_served" varchar DEFAULT 'Bangladesh',
  	"email" varchar NOT NULL,
  	"address_street" varchar,
  	"address_city" varchar,
  	"address_region" varchar,
  	"address_postal_code" varchar,
  	"address_country" varchar DEFAULT 'BD',
  	"hours" varchar,
  	"geo_latitude" numeric,
  	"geo_longitude" numeric,
  	"default_title" varchar,
  	"title_template" varchar DEFAULT '%s · Sustech Technology Ltd',
  	"default_description" varchar,
  	"og_image_id" integer,
  	"knowledge_layout" "enum_site_settings_knowledge_layout" DEFAULT 'vertical',
  	"projects_layout" "enum_site_settings_projects_layout" DEFAULT 'vertical',
  	"ai_overview" varchar,
  	"whatsapp_enabled" boolean DEFAULT false,
  	"whatsapp_number" varchar,
  	"whatsapp_prefilled_message" varchar DEFAULT 'Hello, I would like to get a quote.',
  	"whatsapp_position" "enum_site_settings_whatsapp_position" DEFAULT 'bottom-right',
  	"chatbot_enabled" boolean DEFAULT false,
  	"chatbot_provider" "enum_site_settings_chatbot_provider" DEFAULT 'hermes',
  	"chatbot_hermes_webhook_url" varchar,
  	"chatbot_hermes_greeting" varchar DEFAULT 'Hello! I''m the Sustech AI assistant. How can I help you today?',
  	"chatbot_crisp_website_id" varchar,
  	"chatbot_custom_script" varchar,
  	"chatbot_chat_position" "enum_site_settings_chatbot_chat_position" DEFAULT 'bottom-right',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "navigation_header_children" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"type" "enum_navigation_header_children_type" DEFAULT 'page',
  	"page_id" integer,
  	"url" varchar,
  	"new_tab" boolean,
  	"description" varchar
  );
  
  CREATE TABLE "navigation_header" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"type" "enum_navigation_header_type" DEFAULT 'page',
  	"page_id" integer,
  	"url" varchar,
  	"new_tab" boolean
  );
  
  CREATE TABLE "navigation_footer_columns_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"type" "enum_navigation_footer_columns_links_type" DEFAULT 'page',
  	"page_id" integer,
  	"url" varchar,
  	"new_tab" boolean
  );
  
  CREATE TABLE "navigation_footer_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL
  );
  
  CREATE TABLE "navigation" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"header_cta_label" varchar NOT NULL,
  	"header_cta_type" "enum_navigation_header_cta_type" DEFAULT 'page',
  	"header_cta_page_id" integer,
  	"header_cta_url" varchar,
  	"header_cta_new_tab" boolean,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "pages_blocks_hero_carousel_items" ADD CONSTRAINT "pages_blocks_hero_carousel_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_carousel_items" ADD CONSTRAINT "pages_blocks_hero_carousel_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_side_media_items" ADD CONSTRAINT "pages_blocks_hero_side_media_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_side_media_items" ADD CONSTRAINT "pages_blocks_hero_side_media_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_ctas" ADD CONSTRAINT "pages_blocks_hero_ctas_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_ctas" ADD CONSTRAINT "pages_blocks_hero_ctas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_background_video_id_media_id_fk" FOREIGN KEY ("background_video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_rich_text" ADD CONSTRAINT "pages_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_stats_counters_stats" ADD CONSTRAINT "pages_blocks_stats_counters_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_stats_counters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_stats_counters" ADD CONSTRAINT "pages_blocks_stats_counters_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_services_grid" ADD CONSTRAINT "pages_blocks_services_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_sector_tiles" ADD CONSTRAINT "pages_blocks_sector_tiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_projects_list" ADD CONSTRAINT "pages_blocks_projects_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_image_gallery_images" ADD CONSTRAINT "pages_blocks_image_gallery_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_image_gallery_images" ADD CONSTRAINT "pages_blocks_image_gallery_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_image_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_image_gallery" ADD CONSTRAINT "pages_blocks_image_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_photo_strip_photos" ADD CONSTRAINT "pages_blocks_photo_strip_photos_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_photo_strip_photos" ADD CONSTRAINT "pages_blocks_photo_strip_photos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_photo_strip"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_photo_strip" ADD CONSTRAINT "pages_blocks_photo_strip_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_video_showcase_videos" ADD CONSTRAINT "pages_blocks_video_showcase_videos_video_file_id_media_id_fk" FOREIGN KEY ("video_file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_video_showcase_videos" ADD CONSTRAINT "pages_blocks_video_showcase_videos_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_video_showcase_videos" ADD CONSTRAINT "pages_blocks_video_showcase_videos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_video_showcase"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_video_showcase" ADD CONSTRAINT "pages_blocks_video_showcase_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_logo_wall" ADD CONSTRAINT "pages_blocks_logo_wall_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_partner_bar_partners" ADD CONSTRAINT "pages_blocks_partner_bar_partners_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_partner_bar_partners" ADD CONSTRAINT "pages_blocks_partner_bar_partners_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_partner_bar"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_partner_bar" ADD CONSTRAINT "pages_blocks_partner_bar_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_product_showcase" ADD CONSTRAINT "pages_blocks_product_showcase_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_articles_list" ADD CONSTRAINT "pages_blocks_articles_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonials" ADD CONSTRAINT "pages_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_team_grid" ADD CONSTRAINT "pages_blocks_team_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_steps_steps" ADD CONSTRAINT "pages_blocks_steps_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_steps" ADD CONSTRAINT "pages_blocks_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta_band_ctas" ADD CONSTRAINT "pages_blocks_cta_band_ctas_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta_band_ctas" ADD CONSTRAINT "pages_blocks_cta_band_ctas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_cta_band"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta_band" ADD CONSTRAINT "pages_blocks_cta_band_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq_items" ADD CONSTRAINT "pages_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq" ADD CONSTRAINT "pages_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_calculator_embed" ADD CONSTRAINT "pages_blocks_calculator_embed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_contact_r_f_q" ADD CONSTRAINT "pages_blocks_contact_r_f_q_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_spacer" ADD CONSTRAINT "pages_blocks_spacer_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_sectors_fk" FOREIGN KEY ("sectors_id") REFERENCES "public"."sectors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_clients_fk" FOREIGN KEY ("clients_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_team_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_carousel_items" ADD CONSTRAINT "_pages_v_blocks_hero_carousel_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_carousel_items" ADD CONSTRAINT "_pages_v_blocks_hero_carousel_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_side_media_items" ADD CONSTRAINT "_pages_v_blocks_hero_side_media_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_side_media_items" ADD CONSTRAINT "_pages_v_blocks_hero_side_media_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_ctas" ADD CONSTRAINT "_pages_v_blocks_hero_ctas_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_ctas" ADD CONSTRAINT "_pages_v_blocks_hero_ctas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_background_video_id_media_id_fk" FOREIGN KEY ("background_video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_rich_text" ADD CONSTRAINT "_pages_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_stats_counters_stats" ADD CONSTRAINT "_pages_v_blocks_stats_counters_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_stats_counters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_stats_counters" ADD CONSTRAINT "_pages_v_blocks_stats_counters_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_services_grid" ADD CONSTRAINT "_pages_v_blocks_services_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sector_tiles" ADD CONSTRAINT "_pages_v_blocks_sector_tiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_projects_list" ADD CONSTRAINT "_pages_v_blocks_projects_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image_gallery_images" ADD CONSTRAINT "_pages_v_blocks_image_gallery_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image_gallery_images" ADD CONSTRAINT "_pages_v_blocks_image_gallery_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_image_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image_gallery" ADD CONSTRAINT "_pages_v_blocks_image_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_photo_strip_photos" ADD CONSTRAINT "_pages_v_blocks_photo_strip_photos_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_photo_strip_photos" ADD CONSTRAINT "_pages_v_blocks_photo_strip_photos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_photo_strip"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_photo_strip" ADD CONSTRAINT "_pages_v_blocks_photo_strip_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_video_showcase_videos" ADD CONSTRAINT "_pages_v_blocks_video_showcase_videos_video_file_id_media_id_fk" FOREIGN KEY ("video_file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_video_showcase_videos" ADD CONSTRAINT "_pages_v_blocks_video_showcase_videos_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_video_showcase_videos" ADD CONSTRAINT "_pages_v_blocks_video_showcase_videos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_video_showcase"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_video_showcase" ADD CONSTRAINT "_pages_v_blocks_video_showcase_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_logo_wall" ADD CONSTRAINT "_pages_v_blocks_logo_wall_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_partner_bar_partners" ADD CONSTRAINT "_pages_v_blocks_partner_bar_partners_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_partner_bar_partners" ADD CONSTRAINT "_pages_v_blocks_partner_bar_partners_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_partner_bar"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_partner_bar" ADD CONSTRAINT "_pages_v_blocks_partner_bar_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_product_showcase" ADD CONSTRAINT "_pages_v_blocks_product_showcase_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_articles_list" ADD CONSTRAINT "_pages_v_blocks_articles_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonials" ADD CONSTRAINT "_pages_v_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_team_grid" ADD CONSTRAINT "_pages_v_blocks_team_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_steps_steps" ADD CONSTRAINT "_pages_v_blocks_steps_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_steps" ADD CONSTRAINT "_pages_v_blocks_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta_band_ctas" ADD CONSTRAINT "_pages_v_blocks_cta_band_ctas_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta_band_ctas" ADD CONSTRAINT "_pages_v_blocks_cta_band_ctas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_cta_band"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta_band" ADD CONSTRAINT "_pages_v_blocks_cta_band_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq_items" ADD CONSTRAINT "_pages_v_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq" ADD CONSTRAINT "_pages_v_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_calculator_embed" ADD CONSTRAINT "_pages_v_blocks_calculator_embed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contact_r_f_q" ADD CONSTRAINT "_pages_v_blocks_contact_r_f_q_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_spacer" ADD CONSTRAINT "_pages_v_blocks_spacer_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_sectors_fk" FOREIGN KEY ("sectors_id") REFERENCES "public"."sectors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_clients_fk" FOREIGN KEY ("clients_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_team_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_gallery" ADD CONSTRAINT "projects_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_gallery" ADD CONSTRAINT "projects_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_sector_id_sectors_id_fk" FOREIGN KEY ("sector_id") REFERENCES "public"."sectors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_gallery" ADD CONSTRAINT "_projects_v_version_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_version_gallery" ADD CONSTRAINT "_projects_v_version_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_parent_id_projects_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_sector_id_sectors_id_fk" FOREIGN KEY ("version_sector_id") REFERENCES "public"."sectors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_client_id_clients_id_fk" FOREIGN KEY ("version_client_id") REFERENCES "public"."clients"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_rels" ADD CONSTRAINT "_projects_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_rels" ADD CONSTRAINT "_projects_v_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_faq" ADD CONSTRAINT "services_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_explainer_video_id_media_id_fk" FOREIGN KEY ("explainer_video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_explainer_poster_id_media_id_fk" FOREIGN KEY ("explainer_poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sectors" ADD CONSTRAINT "sectors_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sectors_rels" ADD CONSTRAINT "sectors_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."sectors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectors_rels" ADD CONSTRAINT "sectors_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "team" ADD CONSTRAINT "team_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "clients" ADD CONSTRAINT "clients_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "clients_rels" ADD CONSTRAINT "clients_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "clients_rels" ADD CONSTRAINT "clients_rels_sectors_fk" FOREIGN KEY ("sectors_id") REFERENCES "public"."sectors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_faq" ADD CONSTRAINT "articles_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v_version_faq" ADD CONSTRAINT "_articles_v_version_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_parent_id_articles_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "knowledge_resources" ADD CONSTRAINT "knowledge_resources_file_upload_id_media_id_fk" FOREIGN KEY ("file_upload_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "news_items_tags" ADD CONSTRAINT "news_items_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."news_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news_items_faq" ADD CONSTRAINT "news_items_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."news_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news_items" ADD CONSTRAINT "news_items_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "news_items" ADD CONSTRAINT "news_items_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_news_items_v_version_tags" ADD CONSTRAINT "_news_items_v_version_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_news_items_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_news_items_v_version_faq" ADD CONSTRAINT "_news_items_v_version_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_news_items_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_news_items_v" ADD CONSTRAINT "_news_items_v_parent_id_news_items_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."news_items"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_news_items_v" ADD CONSTRAINT "_news_items_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_news_items_v" ADD CONSTRAINT "_news_items_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "awards" ADD CONSTRAINT "awards_certificate_id_media_id_fk" FOREIGN KEY ("certificate_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners" ADD CONSTRAINT "partners_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sectors_fk" FOREIGN KEY ("sectors_id") REFERENCES "public"."sectors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_team_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_clients_fk" FOREIGN KEY ("clients_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_knowledge_resources_fk" FOREIGN KEY ("knowledge_resources_id") REFERENCES "public"."knowledge_resources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_news_items_fk" FOREIGN KEY ("news_items_id") REFERENCES "public"."news_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_awards_fk" FOREIGN KEY ("awards_id") REFERENCES "public"."awards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_partners_fk" FOREIGN KEY ("partners_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_job_openings_fk" FOREIGN KEY ("job_openings_id") REFERENCES "public"."job_openings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_icons_fk" FOREIGN KEY ("icons_id") REFERENCES "public"."icons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_rfq_requests_fk" FOREIGN KEY ("rfq_requests_id") REFERENCES "public"."rfq_requests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_phones" ADD CONSTRAINT "site_settings_phones_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_social" ADD CONSTRAINT "site_settings_social_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_key_facts" ADD CONSTRAINT "site_settings_key_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_ai_faqs" ADD CONSTRAINT "site_settings_ai_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_og_image_id_media_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_header_children" ADD CONSTRAINT "navigation_header_children_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_header_children" ADD CONSTRAINT "navigation_header_children_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_header" ADD CONSTRAINT "navigation_header_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_header" ADD CONSTRAINT "navigation_header_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_footer_columns_links" ADD CONSTRAINT "navigation_footer_columns_links_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_footer_columns_links" ADD CONSTRAINT "navigation_footer_columns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_footer_columns" ADD CONSTRAINT "navigation_footer_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation" ADD CONSTRAINT "navigation_header_cta_page_id_pages_id_fk" FOREIGN KEY ("header_cta_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_blocks_hero_carousel_items_order_idx" ON "pages_blocks_hero_carousel_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_carousel_items_parent_id_idx" ON "pages_blocks_hero_carousel_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_carousel_items_media_idx" ON "pages_blocks_hero_carousel_items" USING btree ("media_id");
  CREATE INDEX "pages_blocks_hero_side_media_items_order_idx" ON "pages_blocks_hero_side_media_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_side_media_items_parent_id_idx" ON "pages_blocks_hero_side_media_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_side_media_items_media_idx" ON "pages_blocks_hero_side_media_items" USING btree ("media_id");
  CREATE INDEX "pages_blocks_hero_ctas_order_idx" ON "pages_blocks_hero_ctas" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_ctas_parent_id_idx" ON "pages_blocks_hero_ctas" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_ctas_page_idx" ON "pages_blocks_hero_ctas" USING btree ("page_id");
  CREATE INDEX "pages_blocks_hero_order_idx" ON "pages_blocks_hero" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_parent_id_idx" ON "pages_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_path_idx" ON "pages_blocks_hero" USING btree ("_path");
  CREATE INDEX "pages_blocks_hero_background_image_idx" ON "pages_blocks_hero" USING btree ("background_image_id");
  CREATE INDEX "pages_blocks_hero_background_video_idx" ON "pages_blocks_hero" USING btree ("background_video_id");
  CREATE INDEX "pages_blocks_rich_text_order_idx" ON "pages_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "pages_blocks_rich_text_parent_id_idx" ON "pages_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_rich_text_path_idx" ON "pages_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "pages_blocks_stats_counters_stats_order_idx" ON "pages_blocks_stats_counters_stats" USING btree ("_order");
  CREATE INDEX "pages_blocks_stats_counters_stats_parent_id_idx" ON "pages_blocks_stats_counters_stats" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_stats_counters_order_idx" ON "pages_blocks_stats_counters" USING btree ("_order");
  CREATE INDEX "pages_blocks_stats_counters_parent_id_idx" ON "pages_blocks_stats_counters" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_stats_counters_path_idx" ON "pages_blocks_stats_counters" USING btree ("_path");
  CREATE INDEX "pages_blocks_services_grid_order_idx" ON "pages_blocks_services_grid" USING btree ("_order");
  CREATE INDEX "pages_blocks_services_grid_parent_id_idx" ON "pages_blocks_services_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_services_grid_path_idx" ON "pages_blocks_services_grid" USING btree ("_path");
  CREATE INDEX "pages_blocks_sector_tiles_order_idx" ON "pages_blocks_sector_tiles" USING btree ("_order");
  CREATE INDEX "pages_blocks_sector_tiles_parent_id_idx" ON "pages_blocks_sector_tiles" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_sector_tiles_path_idx" ON "pages_blocks_sector_tiles" USING btree ("_path");
  CREATE INDEX "pages_blocks_projects_list_order_idx" ON "pages_blocks_projects_list" USING btree ("_order");
  CREATE INDEX "pages_blocks_projects_list_parent_id_idx" ON "pages_blocks_projects_list" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_projects_list_path_idx" ON "pages_blocks_projects_list" USING btree ("_path");
  CREATE INDEX "pages_blocks_image_gallery_images_order_idx" ON "pages_blocks_image_gallery_images" USING btree ("_order");
  CREATE INDEX "pages_blocks_image_gallery_images_parent_id_idx" ON "pages_blocks_image_gallery_images" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_image_gallery_images_image_idx" ON "pages_blocks_image_gallery_images" USING btree ("image_id");
  CREATE INDEX "pages_blocks_image_gallery_order_idx" ON "pages_blocks_image_gallery" USING btree ("_order");
  CREATE INDEX "pages_blocks_image_gallery_parent_id_idx" ON "pages_blocks_image_gallery" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_image_gallery_path_idx" ON "pages_blocks_image_gallery" USING btree ("_path");
  CREATE INDEX "pages_blocks_photo_strip_photos_order_idx" ON "pages_blocks_photo_strip_photos" USING btree ("_order");
  CREATE INDEX "pages_blocks_photo_strip_photos_parent_id_idx" ON "pages_blocks_photo_strip_photos" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_photo_strip_photos_image_idx" ON "pages_blocks_photo_strip_photos" USING btree ("image_id");
  CREATE INDEX "pages_blocks_photo_strip_order_idx" ON "pages_blocks_photo_strip" USING btree ("_order");
  CREATE INDEX "pages_blocks_photo_strip_parent_id_idx" ON "pages_blocks_photo_strip" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_photo_strip_path_idx" ON "pages_blocks_photo_strip" USING btree ("_path");
  CREATE INDEX "pages_blocks_video_showcase_videos_order_idx" ON "pages_blocks_video_showcase_videos" USING btree ("_order");
  CREATE INDEX "pages_blocks_video_showcase_videos_parent_id_idx" ON "pages_blocks_video_showcase_videos" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_video_showcase_videos_video_file_idx" ON "pages_blocks_video_showcase_videos" USING btree ("video_file_id");
  CREATE INDEX "pages_blocks_video_showcase_videos_poster_idx" ON "pages_blocks_video_showcase_videos" USING btree ("poster_id");
  CREATE INDEX "pages_blocks_video_showcase_order_idx" ON "pages_blocks_video_showcase" USING btree ("_order");
  CREATE INDEX "pages_blocks_video_showcase_parent_id_idx" ON "pages_blocks_video_showcase" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_video_showcase_path_idx" ON "pages_blocks_video_showcase" USING btree ("_path");
  CREATE INDEX "pages_blocks_logo_wall_order_idx" ON "pages_blocks_logo_wall" USING btree ("_order");
  CREATE INDEX "pages_blocks_logo_wall_parent_id_idx" ON "pages_blocks_logo_wall" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_logo_wall_path_idx" ON "pages_blocks_logo_wall" USING btree ("_path");
  CREATE INDEX "pages_blocks_partner_bar_partners_order_idx" ON "pages_blocks_partner_bar_partners" USING btree ("_order");
  CREATE INDEX "pages_blocks_partner_bar_partners_parent_id_idx" ON "pages_blocks_partner_bar_partners" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_partner_bar_partners_logo_idx" ON "pages_blocks_partner_bar_partners" USING btree ("logo_id");
  CREATE INDEX "pages_blocks_partner_bar_order_idx" ON "pages_blocks_partner_bar" USING btree ("_order");
  CREATE INDEX "pages_blocks_partner_bar_parent_id_idx" ON "pages_blocks_partner_bar" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_partner_bar_path_idx" ON "pages_blocks_partner_bar" USING btree ("_path");
  CREATE INDEX "pages_blocks_product_showcase_order_idx" ON "pages_blocks_product_showcase" USING btree ("_order");
  CREATE INDEX "pages_blocks_product_showcase_parent_id_idx" ON "pages_blocks_product_showcase" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_product_showcase_path_idx" ON "pages_blocks_product_showcase" USING btree ("_path");
  CREATE INDEX "pages_blocks_articles_list_order_idx" ON "pages_blocks_articles_list" USING btree ("_order");
  CREATE INDEX "pages_blocks_articles_list_parent_id_idx" ON "pages_blocks_articles_list" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_articles_list_path_idx" ON "pages_blocks_articles_list" USING btree ("_path");
  CREATE INDEX "pages_blocks_testimonials_order_idx" ON "pages_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "pages_blocks_testimonials_parent_id_idx" ON "pages_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_testimonials_path_idx" ON "pages_blocks_testimonials" USING btree ("_path");
  CREATE INDEX "pages_blocks_team_grid_order_idx" ON "pages_blocks_team_grid" USING btree ("_order");
  CREATE INDEX "pages_blocks_team_grid_parent_id_idx" ON "pages_blocks_team_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_team_grid_path_idx" ON "pages_blocks_team_grid" USING btree ("_path");
  CREATE INDEX "pages_blocks_steps_steps_order_idx" ON "pages_blocks_steps_steps" USING btree ("_order");
  CREATE INDEX "pages_blocks_steps_steps_parent_id_idx" ON "pages_blocks_steps_steps" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_steps_order_idx" ON "pages_blocks_steps" USING btree ("_order");
  CREATE INDEX "pages_blocks_steps_parent_id_idx" ON "pages_blocks_steps" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_steps_path_idx" ON "pages_blocks_steps" USING btree ("_path");
  CREATE INDEX "pages_blocks_cta_band_ctas_order_idx" ON "pages_blocks_cta_band_ctas" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_band_ctas_parent_id_idx" ON "pages_blocks_cta_band_ctas" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_band_ctas_page_idx" ON "pages_blocks_cta_band_ctas" USING btree ("page_id");
  CREATE INDEX "pages_blocks_cta_band_order_idx" ON "pages_blocks_cta_band" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_band_parent_id_idx" ON "pages_blocks_cta_band" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_band_path_idx" ON "pages_blocks_cta_band" USING btree ("_path");
  CREATE INDEX "pages_blocks_faq_items_order_idx" ON "pages_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_items_parent_id_idx" ON "pages_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_order_idx" ON "pages_blocks_faq" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_parent_id_idx" ON "pages_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_path_idx" ON "pages_blocks_faq" USING btree ("_path");
  CREATE INDEX "pages_blocks_calculator_embed_order_idx" ON "pages_blocks_calculator_embed" USING btree ("_order");
  CREATE INDEX "pages_blocks_calculator_embed_parent_id_idx" ON "pages_blocks_calculator_embed" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_calculator_embed_path_idx" ON "pages_blocks_calculator_embed" USING btree ("_path");
  CREATE INDEX "pages_blocks_contact_r_f_q_order_idx" ON "pages_blocks_contact_r_f_q" USING btree ("_order");
  CREATE INDEX "pages_blocks_contact_r_f_q_parent_id_idx" ON "pages_blocks_contact_r_f_q" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_contact_r_f_q_path_idx" ON "pages_blocks_contact_r_f_q" USING btree ("_path");
  CREATE INDEX "pages_blocks_spacer_order_idx" ON "pages_blocks_spacer" USING btree ("_order");
  CREATE INDEX "pages_blocks_spacer_parent_id_idx" ON "pages_blocks_spacer" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_spacer_path_idx" ON "pages_blocks_spacer" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_seo_seo_image_idx" ON "pages" USING btree ("seo_image_id");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE INDEX "pages_rels_order_idx" ON "pages_rels" USING btree ("order");
  CREATE INDEX "pages_rels_parent_idx" ON "pages_rels" USING btree ("parent_id");
  CREATE INDEX "pages_rels_path_idx" ON "pages_rels" USING btree ("path");
  CREATE INDEX "pages_rels_services_id_idx" ON "pages_rels" USING btree ("services_id");
  CREATE INDEX "pages_rels_sectors_id_idx" ON "pages_rels" USING btree ("sectors_id");
  CREATE INDEX "pages_rels_projects_id_idx" ON "pages_rels" USING btree ("projects_id");
  CREATE INDEX "pages_rels_clients_id_idx" ON "pages_rels" USING btree ("clients_id");
  CREATE INDEX "pages_rels_products_id_idx" ON "pages_rels" USING btree ("products_id");
  CREATE INDEX "pages_rels_testimonials_id_idx" ON "pages_rels" USING btree ("testimonials_id");
  CREATE INDEX "pages_rels_team_id_idx" ON "pages_rels" USING btree ("team_id");
  CREATE INDEX "_pages_v_blocks_hero_carousel_items_order_idx" ON "_pages_v_blocks_hero_carousel_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_carousel_items_parent_id_idx" ON "_pages_v_blocks_hero_carousel_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_carousel_items_media_idx" ON "_pages_v_blocks_hero_carousel_items" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_hero_side_media_items_order_idx" ON "_pages_v_blocks_hero_side_media_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_side_media_items_parent_id_idx" ON "_pages_v_blocks_hero_side_media_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_side_media_items_media_idx" ON "_pages_v_blocks_hero_side_media_items" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_hero_ctas_order_idx" ON "_pages_v_blocks_hero_ctas" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_ctas_parent_id_idx" ON "_pages_v_blocks_hero_ctas" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_ctas_page_idx" ON "_pages_v_blocks_hero_ctas" USING btree ("page_id");
  CREATE INDEX "_pages_v_blocks_hero_order_idx" ON "_pages_v_blocks_hero" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_parent_id_idx" ON "_pages_v_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_path_idx" ON "_pages_v_blocks_hero" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_hero_background_image_idx" ON "_pages_v_blocks_hero" USING btree ("background_image_id");
  CREATE INDEX "_pages_v_blocks_hero_background_video_idx" ON "_pages_v_blocks_hero" USING btree ("background_video_id");
  CREATE INDEX "_pages_v_blocks_rich_text_order_idx" ON "_pages_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_rich_text_parent_id_idx" ON "_pages_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_rich_text_path_idx" ON "_pages_v_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_stats_counters_stats_order_idx" ON "_pages_v_blocks_stats_counters_stats" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_stats_counters_stats_parent_id_idx" ON "_pages_v_blocks_stats_counters_stats" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_stats_counters_order_idx" ON "_pages_v_blocks_stats_counters" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_stats_counters_parent_id_idx" ON "_pages_v_blocks_stats_counters" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_stats_counters_path_idx" ON "_pages_v_blocks_stats_counters" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_services_grid_order_idx" ON "_pages_v_blocks_services_grid" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_services_grid_parent_id_idx" ON "_pages_v_blocks_services_grid" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_services_grid_path_idx" ON "_pages_v_blocks_services_grid" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_sector_tiles_order_idx" ON "_pages_v_blocks_sector_tiles" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_sector_tiles_parent_id_idx" ON "_pages_v_blocks_sector_tiles" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_sector_tiles_path_idx" ON "_pages_v_blocks_sector_tiles" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_projects_list_order_idx" ON "_pages_v_blocks_projects_list" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_projects_list_parent_id_idx" ON "_pages_v_blocks_projects_list" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_projects_list_path_idx" ON "_pages_v_blocks_projects_list" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_image_gallery_images_order_idx" ON "_pages_v_blocks_image_gallery_images" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_image_gallery_images_parent_id_idx" ON "_pages_v_blocks_image_gallery_images" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_image_gallery_images_image_idx" ON "_pages_v_blocks_image_gallery_images" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_image_gallery_order_idx" ON "_pages_v_blocks_image_gallery" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_image_gallery_parent_id_idx" ON "_pages_v_blocks_image_gallery" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_image_gallery_path_idx" ON "_pages_v_blocks_image_gallery" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_photo_strip_photos_order_idx" ON "_pages_v_blocks_photo_strip_photos" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_photo_strip_photos_parent_id_idx" ON "_pages_v_blocks_photo_strip_photos" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_photo_strip_photos_image_idx" ON "_pages_v_blocks_photo_strip_photos" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_photo_strip_order_idx" ON "_pages_v_blocks_photo_strip" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_photo_strip_parent_id_idx" ON "_pages_v_blocks_photo_strip" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_photo_strip_path_idx" ON "_pages_v_blocks_photo_strip" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_video_showcase_videos_order_idx" ON "_pages_v_blocks_video_showcase_videos" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_video_showcase_videos_parent_id_idx" ON "_pages_v_blocks_video_showcase_videos" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_video_showcase_videos_video_file_idx" ON "_pages_v_blocks_video_showcase_videos" USING btree ("video_file_id");
  CREATE INDEX "_pages_v_blocks_video_showcase_videos_poster_idx" ON "_pages_v_blocks_video_showcase_videos" USING btree ("poster_id");
  CREATE INDEX "_pages_v_blocks_video_showcase_order_idx" ON "_pages_v_blocks_video_showcase" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_video_showcase_parent_id_idx" ON "_pages_v_blocks_video_showcase" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_video_showcase_path_idx" ON "_pages_v_blocks_video_showcase" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_logo_wall_order_idx" ON "_pages_v_blocks_logo_wall" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_logo_wall_parent_id_idx" ON "_pages_v_blocks_logo_wall" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_logo_wall_path_idx" ON "_pages_v_blocks_logo_wall" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_partner_bar_partners_order_idx" ON "_pages_v_blocks_partner_bar_partners" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_partner_bar_partners_parent_id_idx" ON "_pages_v_blocks_partner_bar_partners" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_partner_bar_partners_logo_idx" ON "_pages_v_blocks_partner_bar_partners" USING btree ("logo_id");
  CREATE INDEX "_pages_v_blocks_partner_bar_order_idx" ON "_pages_v_blocks_partner_bar" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_partner_bar_parent_id_idx" ON "_pages_v_blocks_partner_bar" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_partner_bar_path_idx" ON "_pages_v_blocks_partner_bar" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_product_showcase_order_idx" ON "_pages_v_blocks_product_showcase" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_product_showcase_parent_id_idx" ON "_pages_v_blocks_product_showcase" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_product_showcase_path_idx" ON "_pages_v_blocks_product_showcase" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_articles_list_order_idx" ON "_pages_v_blocks_articles_list" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_articles_list_parent_id_idx" ON "_pages_v_blocks_articles_list" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_articles_list_path_idx" ON "_pages_v_blocks_articles_list" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_testimonials_order_idx" ON "_pages_v_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_testimonials_parent_id_idx" ON "_pages_v_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_testimonials_path_idx" ON "_pages_v_blocks_testimonials" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_team_grid_order_idx" ON "_pages_v_blocks_team_grid" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_team_grid_parent_id_idx" ON "_pages_v_blocks_team_grid" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_team_grid_path_idx" ON "_pages_v_blocks_team_grid" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_steps_steps_order_idx" ON "_pages_v_blocks_steps_steps" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_steps_steps_parent_id_idx" ON "_pages_v_blocks_steps_steps" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_steps_order_idx" ON "_pages_v_blocks_steps" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_steps_parent_id_idx" ON "_pages_v_blocks_steps" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_steps_path_idx" ON "_pages_v_blocks_steps" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_cta_band_ctas_order_idx" ON "_pages_v_blocks_cta_band_ctas" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cta_band_ctas_parent_id_idx" ON "_pages_v_blocks_cta_band_ctas" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_band_ctas_page_idx" ON "_pages_v_blocks_cta_band_ctas" USING btree ("page_id");
  CREATE INDEX "_pages_v_blocks_cta_band_order_idx" ON "_pages_v_blocks_cta_band" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cta_band_parent_id_idx" ON "_pages_v_blocks_cta_band" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_band_path_idx" ON "_pages_v_blocks_cta_band" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_faq_items_order_idx" ON "_pages_v_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_items_parent_id_idx" ON "_pages_v_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_order_idx" ON "_pages_v_blocks_faq" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_parent_id_idx" ON "_pages_v_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_path_idx" ON "_pages_v_blocks_faq" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_calculator_embed_order_idx" ON "_pages_v_blocks_calculator_embed" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_calculator_embed_parent_id_idx" ON "_pages_v_blocks_calculator_embed" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_calculator_embed_path_idx" ON "_pages_v_blocks_calculator_embed" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_contact_r_f_q_order_idx" ON "_pages_v_blocks_contact_r_f_q" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_contact_r_f_q_parent_id_idx" ON "_pages_v_blocks_contact_r_f_q" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_contact_r_f_q_path_idx" ON "_pages_v_blocks_contact_r_f_q" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_spacer_order_idx" ON "_pages_v_blocks_spacer" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_spacer_parent_id_idx" ON "_pages_v_blocks_spacer" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_spacer_path_idx" ON "_pages_v_blocks_spacer" USING btree ("_path");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_seo_version_seo_image_idx" ON "_pages_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX "_pages_v_autosave_idx" ON "_pages_v" USING btree ("autosave");
  CREATE INDEX "_pages_v_rels_order_idx" ON "_pages_v_rels" USING btree ("order");
  CREATE INDEX "_pages_v_rels_parent_idx" ON "_pages_v_rels" USING btree ("parent_id");
  CREATE INDEX "_pages_v_rels_path_idx" ON "_pages_v_rels" USING btree ("path");
  CREATE INDEX "_pages_v_rels_services_id_idx" ON "_pages_v_rels" USING btree ("services_id");
  CREATE INDEX "_pages_v_rels_sectors_id_idx" ON "_pages_v_rels" USING btree ("sectors_id");
  CREATE INDEX "_pages_v_rels_projects_id_idx" ON "_pages_v_rels" USING btree ("projects_id");
  CREATE INDEX "_pages_v_rels_clients_id_idx" ON "_pages_v_rels" USING btree ("clients_id");
  CREATE INDEX "_pages_v_rels_products_id_idx" ON "_pages_v_rels" USING btree ("products_id");
  CREATE INDEX "_pages_v_rels_testimonials_id_idx" ON "_pages_v_rels" USING btree ("testimonials_id");
  CREATE INDEX "_pages_v_rels_team_id_idx" ON "_pages_v_rels" USING btree ("team_id");
  CREATE INDEX "projects_gallery_order_idx" ON "projects_gallery" USING btree ("_order");
  CREATE INDEX "projects_gallery_parent_id_idx" ON "projects_gallery" USING btree ("_parent_id");
  CREATE INDEX "projects_gallery_image_idx" ON "projects_gallery" USING btree ("image_id");
  CREATE UNIQUE INDEX "projects_slug_idx" ON "projects" USING btree ("slug");
  CREATE INDEX "projects_sector_idx" ON "projects" USING btree ("sector_id");
  CREATE INDEX "projects_client_idx" ON "projects" USING btree ("client_id");
  CREATE INDEX "projects_import_key_idx" ON "projects" USING btree ("import_key");
  CREATE INDEX "projects_seo_seo_image_idx" ON "projects" USING btree ("seo_image_id");
  CREATE INDEX "projects_updated_at_idx" ON "projects" USING btree ("updated_at");
  CREATE INDEX "projects_created_at_idx" ON "projects" USING btree ("created_at");
  CREATE INDEX "projects__status_idx" ON "projects" USING btree ("_status");
  CREATE INDEX "projects_rels_order_idx" ON "projects_rels" USING btree ("order");
  CREATE INDEX "projects_rels_parent_idx" ON "projects_rels" USING btree ("parent_id");
  CREATE INDEX "projects_rels_path_idx" ON "projects_rels" USING btree ("path");
  CREATE INDEX "projects_rels_services_id_idx" ON "projects_rels" USING btree ("services_id");
  CREATE INDEX "_projects_v_version_gallery_order_idx" ON "_projects_v_version_gallery" USING btree ("_order");
  CREATE INDEX "_projects_v_version_gallery_parent_id_idx" ON "_projects_v_version_gallery" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_version_gallery_image_idx" ON "_projects_v_version_gallery" USING btree ("image_id");
  CREATE INDEX "_projects_v_parent_idx" ON "_projects_v" USING btree ("parent_id");
  CREATE INDEX "_projects_v_version_version_slug_idx" ON "_projects_v" USING btree ("version_slug");
  CREATE INDEX "_projects_v_version_version_sector_idx" ON "_projects_v" USING btree ("version_sector_id");
  CREATE INDEX "_projects_v_version_version_client_idx" ON "_projects_v" USING btree ("version_client_id");
  CREATE INDEX "_projects_v_version_version_import_key_idx" ON "_projects_v" USING btree ("version_import_key");
  CREATE INDEX "_projects_v_version_seo_version_seo_image_idx" ON "_projects_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_projects_v_version_version_updated_at_idx" ON "_projects_v" USING btree ("version_updated_at");
  CREATE INDEX "_projects_v_version_version_created_at_idx" ON "_projects_v" USING btree ("version_created_at");
  CREATE INDEX "_projects_v_version_version__status_idx" ON "_projects_v" USING btree ("version__status");
  CREATE INDEX "_projects_v_created_at_idx" ON "_projects_v" USING btree ("created_at");
  CREATE INDEX "_projects_v_updated_at_idx" ON "_projects_v" USING btree ("updated_at");
  CREATE INDEX "_projects_v_latest_idx" ON "_projects_v" USING btree ("latest");
  CREATE INDEX "_projects_v_autosave_idx" ON "_projects_v" USING btree ("autosave");
  CREATE INDEX "_projects_v_rels_order_idx" ON "_projects_v_rels" USING btree ("order");
  CREATE INDEX "_projects_v_rels_parent_idx" ON "_projects_v_rels" USING btree ("parent_id");
  CREATE INDEX "_projects_v_rels_path_idx" ON "_projects_v_rels" USING btree ("path");
  CREATE INDEX "_projects_v_rels_services_id_idx" ON "_projects_v_rels" USING btree ("services_id");
  CREATE UNIQUE INDEX "products_slug_idx" ON "products" USING btree ("slug");
  CREATE INDEX "products_image_idx" ON "products" USING btree ("image_id");
  CREATE INDEX "products_seo_seo_image_idx" ON "products" USING btree ("seo_image_id");
  CREATE INDEX "products_updated_at_idx" ON "products" USING btree ("updated_at");
  CREATE INDEX "products_created_at_idx" ON "products" USING btree ("created_at");
  CREATE INDEX "services_faq_order_idx" ON "services_faq" USING btree ("_order");
  CREATE INDEX "services_faq_parent_id_idx" ON "services_faq" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "services_slug_idx" ON "services" USING btree ("slug");
  CREATE INDEX "services_hero_image_idx" ON "services" USING btree ("hero_image_id");
  CREATE INDEX "services_explainer_video_idx" ON "services" USING btree ("explainer_video_id");
  CREATE INDEX "services_explainer_poster_idx" ON "services" USING btree ("explainer_poster_id");
  CREATE INDEX "services_seo_seo_image_idx" ON "services" USING btree ("seo_image_id");
  CREATE INDEX "services_updated_at_idx" ON "services" USING btree ("updated_at");
  CREATE INDEX "services_created_at_idx" ON "services" USING btree ("created_at");
  CREATE UNIQUE INDEX "sectors_slug_idx" ON "sectors" USING btree ("slug");
  CREATE INDEX "sectors_seo_seo_image_idx" ON "sectors" USING btree ("seo_image_id");
  CREATE INDEX "sectors_updated_at_idx" ON "sectors" USING btree ("updated_at");
  CREATE INDEX "sectors_created_at_idx" ON "sectors" USING btree ("created_at");
  CREATE INDEX "sectors_rels_order_idx" ON "sectors_rels" USING btree ("order");
  CREATE INDEX "sectors_rels_parent_idx" ON "sectors_rels" USING btree ("parent_id");
  CREATE INDEX "sectors_rels_path_idx" ON "sectors_rels" USING btree ("path");
  CREATE INDEX "sectors_rels_services_id_idx" ON "sectors_rels" USING btree ("services_id");
  CREATE INDEX "team_photo_idx" ON "team" USING btree ("photo_id");
  CREATE INDEX "team_updated_at_idx" ON "team" USING btree ("updated_at");
  CREATE INDEX "team_created_at_idx" ON "team" USING btree ("created_at");
  CREATE INDEX "testimonials_logo_idx" ON "testimonials" USING btree ("logo_id");
  CREATE INDEX "testimonials_updated_at_idx" ON "testimonials" USING btree ("updated_at");
  CREATE INDEX "testimonials_created_at_idx" ON "testimonials" USING btree ("created_at");
  CREATE INDEX "clients_logo_idx" ON "clients" USING btree ("logo_id");
  CREATE INDEX "clients_updated_at_idx" ON "clients" USING btree ("updated_at");
  CREATE INDEX "clients_created_at_idx" ON "clients" USING btree ("created_at");
  CREATE INDEX "clients_rels_order_idx" ON "clients_rels" USING btree ("order");
  CREATE INDEX "clients_rels_parent_idx" ON "clients_rels" USING btree ("parent_id");
  CREATE INDEX "clients_rels_path_idx" ON "clients_rels" USING btree ("path");
  CREATE INDEX "clients_rels_sectors_id_idx" ON "clients_rels" USING btree ("sectors_id");
  CREATE INDEX "articles_faq_order_idx" ON "articles_faq" USING btree ("_order");
  CREATE INDEX "articles_faq_parent_id_idx" ON "articles_faq" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "articles_slug_idx" ON "articles" USING btree ("slug");
  CREATE INDEX "articles_seo_seo_image_idx" ON "articles" USING btree ("seo_image_id");
  CREATE INDEX "articles_updated_at_idx" ON "articles" USING btree ("updated_at");
  CREATE INDEX "articles_created_at_idx" ON "articles" USING btree ("created_at");
  CREATE INDEX "articles__status_idx" ON "articles" USING btree ("_status");
  CREATE INDEX "_articles_v_version_faq_order_idx" ON "_articles_v_version_faq" USING btree ("_order");
  CREATE INDEX "_articles_v_version_faq_parent_id_idx" ON "_articles_v_version_faq" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_parent_idx" ON "_articles_v" USING btree ("parent_id");
  CREATE INDEX "_articles_v_version_version_slug_idx" ON "_articles_v" USING btree ("version_slug");
  CREATE INDEX "_articles_v_version_seo_version_seo_image_idx" ON "_articles_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_articles_v_version_version_updated_at_idx" ON "_articles_v" USING btree ("version_updated_at");
  CREATE INDEX "_articles_v_version_version_created_at_idx" ON "_articles_v" USING btree ("version_created_at");
  CREATE INDEX "_articles_v_version_version__status_idx" ON "_articles_v" USING btree ("version__status");
  CREATE INDEX "_articles_v_created_at_idx" ON "_articles_v" USING btree ("created_at");
  CREATE INDEX "_articles_v_updated_at_idx" ON "_articles_v" USING btree ("updated_at");
  CREATE INDEX "_articles_v_latest_idx" ON "_articles_v" USING btree ("latest");
  CREATE INDEX "_articles_v_autosave_idx" ON "_articles_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "knowledge_resources_slug_idx" ON "knowledge_resources" USING btree ("slug");
  CREATE INDEX "knowledge_resources_file_upload_idx" ON "knowledge_resources" USING btree ("file_upload_id");
  CREATE INDEX "knowledge_resources_updated_at_idx" ON "knowledge_resources" USING btree ("updated_at");
  CREATE INDEX "knowledge_resources_created_at_idx" ON "knowledge_resources" USING btree ("created_at");
  CREATE INDEX "news_items_tags_order_idx" ON "news_items_tags" USING btree ("_order");
  CREATE INDEX "news_items_tags_parent_id_idx" ON "news_items_tags" USING btree ("_parent_id");
  CREATE INDEX "news_items_faq_order_idx" ON "news_items_faq" USING btree ("_order");
  CREATE INDEX "news_items_faq_parent_id_idx" ON "news_items_faq" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "news_items_slug_idx" ON "news_items" USING btree ("slug");
  CREATE INDEX "news_items_hero_image_idx" ON "news_items" USING btree ("hero_image_id");
  CREATE INDEX "news_items_seo_seo_image_idx" ON "news_items" USING btree ("seo_image_id");
  CREATE INDEX "news_items_updated_at_idx" ON "news_items" USING btree ("updated_at");
  CREATE INDEX "news_items_created_at_idx" ON "news_items" USING btree ("created_at");
  CREATE INDEX "news_items__status_idx" ON "news_items" USING btree ("_status");
  CREATE INDEX "_news_items_v_version_tags_order_idx" ON "_news_items_v_version_tags" USING btree ("_order");
  CREATE INDEX "_news_items_v_version_tags_parent_id_idx" ON "_news_items_v_version_tags" USING btree ("_parent_id");
  CREATE INDEX "_news_items_v_version_faq_order_idx" ON "_news_items_v_version_faq" USING btree ("_order");
  CREATE INDEX "_news_items_v_version_faq_parent_id_idx" ON "_news_items_v_version_faq" USING btree ("_parent_id");
  CREATE INDEX "_news_items_v_parent_idx" ON "_news_items_v" USING btree ("parent_id");
  CREATE INDEX "_news_items_v_version_version_slug_idx" ON "_news_items_v" USING btree ("version_slug");
  CREATE INDEX "_news_items_v_version_version_hero_image_idx" ON "_news_items_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_news_items_v_version_seo_version_seo_image_idx" ON "_news_items_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_news_items_v_version_version_updated_at_idx" ON "_news_items_v" USING btree ("version_updated_at");
  CREATE INDEX "_news_items_v_version_version_created_at_idx" ON "_news_items_v" USING btree ("version_created_at");
  CREATE INDEX "_news_items_v_version_version__status_idx" ON "_news_items_v" USING btree ("version__status");
  CREATE INDEX "_news_items_v_created_at_idx" ON "_news_items_v" USING btree ("created_at");
  CREATE INDEX "_news_items_v_updated_at_idx" ON "_news_items_v" USING btree ("updated_at");
  CREATE INDEX "_news_items_v_latest_idx" ON "_news_items_v" USING btree ("latest");
  CREATE INDEX "_news_items_v_autosave_idx" ON "_news_items_v" USING btree ("autosave");
  CREATE INDEX "awards_certificate_idx" ON "awards" USING btree ("certificate_id");
  CREATE INDEX "awards_updated_at_idx" ON "awards" USING btree ("updated_at");
  CREATE INDEX "awards_created_at_idx" ON "awards" USING btree ("created_at");
  CREATE INDEX "partners_logo_idx" ON "partners" USING btree ("logo_id");
  CREATE INDEX "partners_updated_at_idx" ON "partners" USING btree ("updated_at");
  CREATE INDEX "partners_created_at_idx" ON "partners" USING btree ("created_at");
  CREATE UNIQUE INDEX "job_openings_slug_idx" ON "job_openings" USING btree ("slug");
  CREATE INDEX "job_openings_updated_at_idx" ON "job_openings" USING btree ("updated_at");
  CREATE INDEX "job_openings_created_at_idx" ON "job_openings" USING btree ("created_at");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_feature_sizes_feature_filename_idx" ON "media" USING btree ("sizes_feature_filename");
  CREATE INDEX "media_sizes_og_sizes_og_filename_idx" ON "media" USING btree ("sizes_og_filename");
  CREATE INDEX "icons_updated_at_idx" ON "icons" USING btree ("updated_at");
  CREATE INDEX "icons_created_at_idx" ON "icons" USING btree ("created_at");
  CREATE UNIQUE INDEX "icons_filename_idx" ON "icons" USING btree ("filename");
  CREATE INDEX "rfq_requests_updated_at_idx" ON "rfq_requests" USING btree ("updated_at");
  CREATE INDEX "rfq_requests_created_at_idx" ON "rfq_requests" USING btree ("created_at");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  CREATE INDEX "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  CREATE INDEX "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  CREATE INDEX "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  CREATE INDEX "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  CREATE INDEX "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  CREATE INDEX "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  CREATE INDEX "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  CREATE INDEX "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  CREATE INDEX "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_projects_id_idx" ON "payload_locked_documents_rels" USING btree ("projects_id");
  CREATE INDEX "payload_locked_documents_rels_products_id_idx" ON "payload_locked_documents_rels" USING btree ("products_id");
  CREATE INDEX "payload_locked_documents_rels_services_id_idx" ON "payload_locked_documents_rels" USING btree ("services_id");
  CREATE INDEX "payload_locked_documents_rels_sectors_id_idx" ON "payload_locked_documents_rels" USING btree ("sectors_id");
  CREATE INDEX "payload_locked_documents_rels_team_id_idx" ON "payload_locked_documents_rels" USING btree ("team_id");
  CREATE INDEX "payload_locked_documents_rels_testimonials_id_idx" ON "payload_locked_documents_rels" USING btree ("testimonials_id");
  CREATE INDEX "payload_locked_documents_rels_clients_id_idx" ON "payload_locked_documents_rels" USING btree ("clients_id");
  CREATE INDEX "payload_locked_documents_rels_articles_id_idx" ON "payload_locked_documents_rels" USING btree ("articles_id");
  CREATE INDEX "payload_locked_documents_rels_knowledge_resources_id_idx" ON "payload_locked_documents_rels" USING btree ("knowledge_resources_id");
  CREATE INDEX "payload_locked_documents_rels_news_items_id_idx" ON "payload_locked_documents_rels" USING btree ("news_items_id");
  CREATE INDEX "payload_locked_documents_rels_awards_id_idx" ON "payload_locked_documents_rels" USING btree ("awards_id");
  CREATE INDEX "payload_locked_documents_rels_partners_id_idx" ON "payload_locked_documents_rels" USING btree ("partners_id");
  CREATE INDEX "payload_locked_documents_rels_job_openings_id_idx" ON "payload_locked_documents_rels" USING btree ("job_openings_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_icons_id_idx" ON "payload_locked_documents_rels" USING btree ("icons_id");
  CREATE INDEX "payload_locked_documents_rels_rfq_requests_id_idx" ON "payload_locked_documents_rels" USING btree ("rfq_requests_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_settings_phones_order_idx" ON "site_settings_phones" USING btree ("_order");
  CREATE INDEX "site_settings_phones_parent_id_idx" ON "site_settings_phones" USING btree ("_parent_id");
  CREATE INDEX "site_settings_social_order_idx" ON "site_settings_social" USING btree ("_order");
  CREATE INDEX "site_settings_social_parent_id_idx" ON "site_settings_social" USING btree ("_parent_id");
  CREATE INDEX "site_settings_key_facts_order_idx" ON "site_settings_key_facts" USING btree ("_order");
  CREATE INDEX "site_settings_key_facts_parent_id_idx" ON "site_settings_key_facts" USING btree ("_parent_id");
  CREATE INDEX "site_settings_ai_faqs_order_idx" ON "site_settings_ai_faqs" USING btree ("_order");
  CREATE INDEX "site_settings_ai_faqs_parent_id_idx" ON "site_settings_ai_faqs" USING btree ("_parent_id");
  CREATE INDEX "site_settings_logo_idx" ON "site_settings" USING btree ("logo_id");
  CREATE INDEX "site_settings_og_image_idx" ON "site_settings" USING btree ("og_image_id");
  CREATE INDEX "navigation_header_children_order_idx" ON "navigation_header_children" USING btree ("_order");
  CREATE INDEX "navigation_header_children_parent_id_idx" ON "navigation_header_children" USING btree ("_parent_id");
  CREATE INDEX "navigation_header_children_page_idx" ON "navigation_header_children" USING btree ("page_id");
  CREATE INDEX "navigation_header_order_idx" ON "navigation_header" USING btree ("_order");
  CREATE INDEX "navigation_header_parent_id_idx" ON "navigation_header" USING btree ("_parent_id");
  CREATE INDEX "navigation_header_page_idx" ON "navigation_header" USING btree ("page_id");
  CREATE INDEX "navigation_footer_columns_links_order_idx" ON "navigation_footer_columns_links" USING btree ("_order");
  CREATE INDEX "navigation_footer_columns_links_parent_id_idx" ON "navigation_footer_columns_links" USING btree ("_parent_id");
  CREATE INDEX "navigation_footer_columns_links_page_idx" ON "navigation_footer_columns_links" USING btree ("page_id");
  CREATE INDEX "navigation_footer_columns_order_idx" ON "navigation_footer_columns" USING btree ("_order");
  CREATE INDEX "navigation_footer_columns_parent_id_idx" ON "navigation_footer_columns" USING btree ("_parent_id");
  CREATE INDEX "navigation_header_cta_header_cta_page_idx" ON "navigation" USING btree ("header_cta_page_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Refuse to tear down the baseline — that would DROP every table and destroy
  // all data. To roll back, down-migrate the specific later migration instead.
  // The generated full DROP is kept below but is intentionally unreachable.
  payload.logger.warn("Refusing to run baseline down() — it would drop the entire schema.");
  return;

  await db.execute(sql`
   DROP TABLE "pages_blocks_hero_carousel_items" CASCADE;
  DROP TABLE "pages_blocks_hero_side_media_items" CASCADE;
  DROP TABLE "pages_blocks_hero_ctas" CASCADE;
  DROP TABLE "pages_blocks_hero" CASCADE;
  DROP TABLE "pages_blocks_rich_text" CASCADE;
  DROP TABLE "pages_blocks_stats_counters_stats" CASCADE;
  DROP TABLE "pages_blocks_stats_counters" CASCADE;
  DROP TABLE "pages_blocks_services_grid" CASCADE;
  DROP TABLE "pages_blocks_sector_tiles" CASCADE;
  DROP TABLE "pages_blocks_projects_list" CASCADE;
  DROP TABLE "pages_blocks_image_gallery_images" CASCADE;
  DROP TABLE "pages_blocks_image_gallery" CASCADE;
  DROP TABLE "pages_blocks_photo_strip_photos" CASCADE;
  DROP TABLE "pages_blocks_photo_strip" CASCADE;
  DROP TABLE "pages_blocks_video_showcase_videos" CASCADE;
  DROP TABLE "pages_blocks_video_showcase" CASCADE;
  DROP TABLE "pages_blocks_logo_wall" CASCADE;
  DROP TABLE "pages_blocks_partner_bar_partners" CASCADE;
  DROP TABLE "pages_blocks_partner_bar" CASCADE;
  DROP TABLE "pages_blocks_product_showcase" CASCADE;
  DROP TABLE "pages_blocks_articles_list" CASCADE;
  DROP TABLE "pages_blocks_testimonials" CASCADE;
  DROP TABLE "pages_blocks_team_grid" CASCADE;
  DROP TABLE "pages_blocks_steps_steps" CASCADE;
  DROP TABLE "pages_blocks_steps" CASCADE;
  DROP TABLE "pages_blocks_cta_band_ctas" CASCADE;
  DROP TABLE "pages_blocks_cta_band" CASCADE;
  DROP TABLE "pages_blocks_faq_items" CASCADE;
  DROP TABLE "pages_blocks_faq" CASCADE;
  DROP TABLE "pages_blocks_calculator_embed" CASCADE;
  DROP TABLE "pages_blocks_contact_r_f_q" CASCADE;
  DROP TABLE "pages_blocks_spacer" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_rels" CASCADE;
  DROP TABLE "_pages_v_blocks_hero_carousel_items" CASCADE;
  DROP TABLE "_pages_v_blocks_hero_side_media_items" CASCADE;
  DROP TABLE "_pages_v_blocks_hero_ctas" CASCADE;
  DROP TABLE "_pages_v_blocks_hero" CASCADE;
  DROP TABLE "_pages_v_blocks_rich_text" CASCADE;
  DROP TABLE "_pages_v_blocks_stats_counters_stats" CASCADE;
  DROP TABLE "_pages_v_blocks_stats_counters" CASCADE;
  DROP TABLE "_pages_v_blocks_services_grid" CASCADE;
  DROP TABLE "_pages_v_blocks_sector_tiles" CASCADE;
  DROP TABLE "_pages_v_blocks_projects_list" CASCADE;
  DROP TABLE "_pages_v_blocks_image_gallery_images" CASCADE;
  DROP TABLE "_pages_v_blocks_image_gallery" CASCADE;
  DROP TABLE "_pages_v_blocks_photo_strip_photos" CASCADE;
  DROP TABLE "_pages_v_blocks_photo_strip" CASCADE;
  DROP TABLE "_pages_v_blocks_video_showcase_videos" CASCADE;
  DROP TABLE "_pages_v_blocks_video_showcase" CASCADE;
  DROP TABLE "_pages_v_blocks_logo_wall" CASCADE;
  DROP TABLE "_pages_v_blocks_partner_bar_partners" CASCADE;
  DROP TABLE "_pages_v_blocks_partner_bar" CASCADE;
  DROP TABLE "_pages_v_blocks_product_showcase" CASCADE;
  DROP TABLE "_pages_v_blocks_articles_list" CASCADE;
  DROP TABLE "_pages_v_blocks_testimonials" CASCADE;
  DROP TABLE "_pages_v_blocks_team_grid" CASCADE;
  DROP TABLE "_pages_v_blocks_steps_steps" CASCADE;
  DROP TABLE "_pages_v_blocks_steps" CASCADE;
  DROP TABLE "_pages_v_blocks_cta_band_ctas" CASCADE;
  DROP TABLE "_pages_v_blocks_cta_band" CASCADE;
  DROP TABLE "_pages_v_blocks_faq_items" CASCADE;
  DROP TABLE "_pages_v_blocks_faq" CASCADE;
  DROP TABLE "_pages_v_blocks_calculator_embed" CASCADE;
  DROP TABLE "_pages_v_blocks_contact_r_f_q" CASCADE;
  DROP TABLE "_pages_v_blocks_spacer" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "_pages_v_rels" CASCADE;
  DROP TABLE "projects_gallery" CASCADE;
  DROP TABLE "projects" CASCADE;
  DROP TABLE "projects_rels" CASCADE;
  DROP TABLE "_projects_v_version_gallery" CASCADE;
  DROP TABLE "_projects_v" CASCADE;
  DROP TABLE "_projects_v_rels" CASCADE;
  DROP TABLE "products" CASCADE;
  DROP TABLE "services_faq" CASCADE;
  DROP TABLE "services" CASCADE;
  DROP TABLE "sectors" CASCADE;
  DROP TABLE "sectors_rels" CASCADE;
  DROP TABLE "team" CASCADE;
  DROP TABLE "testimonials" CASCADE;
  DROP TABLE "clients" CASCADE;
  DROP TABLE "clients_rels" CASCADE;
  DROP TABLE "articles_faq" CASCADE;
  DROP TABLE "articles" CASCADE;
  DROP TABLE "_articles_v_version_faq" CASCADE;
  DROP TABLE "_articles_v" CASCADE;
  DROP TABLE "knowledge_resources" CASCADE;
  DROP TABLE "news_items_tags" CASCADE;
  DROP TABLE "news_items_faq" CASCADE;
  DROP TABLE "news_items" CASCADE;
  DROP TABLE "_news_items_v_version_tags" CASCADE;
  DROP TABLE "_news_items_v_version_faq" CASCADE;
  DROP TABLE "_news_items_v" CASCADE;
  DROP TABLE "awards" CASCADE;
  DROP TABLE "partners" CASCADE;
  DROP TABLE "job_openings" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "icons" CASCADE;
  DROP TABLE "rfq_requests" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_jobs_log" CASCADE;
  DROP TABLE "payload_jobs" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_settings_phones" CASCADE;
  DROP TABLE "site_settings_social" CASCADE;
  DROP TABLE "site_settings_key_facts" CASCADE;
  DROP TABLE "site_settings_ai_faqs" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "navigation_header_children" CASCADE;
  DROP TABLE "navigation_header" CASCADE;
  DROP TABLE "navigation_footer_columns_links" CASCADE;
  DROP TABLE "navigation_footer_columns" CASCADE;
  DROP TABLE "navigation" CASCADE;
  DROP TYPE "public"."enum_pages_blocks_hero_ctas_type";
  DROP TYPE "public"."enum_pages_blocks_hero_ctas_style";
  DROP TYPE "public"."enum_pages_blocks_hero_height";
  DROP TYPE "public"."enum_pages_blocks_hero_tone";
  DROP TYPE "public"."enum_pages_blocks_hero_hero_mode";
  DROP TYPE "public"."enum_pages_blocks_hero_side_media_source";
  DROP TYPE "public"."enum_pages_blocks_hero_style_color_scheme";
  DROP TYPE "public"."enum_pages_blocks_hero_style_accent_colour";
  DROP TYPE "public"."enum_pages_blocks_hero_style_width";
  DROP TYPE "public"."enum_pages_blocks_hero_style_padding_size";
  DROP TYPE "public"."enum_pages_blocks_hero_style_text_align";
  DROP TYPE "public"."enum_pages_blocks_hero_style_heading_size";
  DROP TYPE "public"."enum_pages_blocks_hero_style_heading_font";
  DROP TYPE "public"."enum_pages_blocks_hero_style_body_font";
  DROP TYPE "public"."enum_pages_blocks_hero_style_body_size";
  DROP TYPE "public"."enum_pages_blocks_hero_style_animation_style";
  DROP TYPE "public"."enum_pages_blocks_hero_style_animation_delay";
  DROP TYPE "public"."enum_pages_blocks_hero_style_gap_below";
  DROP TYPE "public"."enum_pages_blocks_rich_text_appearance";
  DROP TYPE "public"."enum_pages_blocks_rich_text_style_color_scheme";
  DROP TYPE "public"."enum_pages_blocks_rich_text_style_accent_colour";
  DROP TYPE "public"."enum_pages_blocks_rich_text_style_width";
  DROP TYPE "public"."enum_pages_blocks_rich_text_style_padding_size";
  DROP TYPE "public"."enum_pages_blocks_rich_text_style_text_align";
  DROP TYPE "public"."enum_pages_blocks_rich_text_style_heading_size";
  DROP TYPE "public"."enum_pages_blocks_rich_text_style_heading_font";
  DROP TYPE "public"."enum_pages_blocks_rich_text_style_body_font";
  DROP TYPE "public"."enum_pages_blocks_rich_text_style_body_size";
  DROP TYPE "public"."enum_pages_blocks_rich_text_style_animation_style";
  DROP TYPE "public"."enum_pages_blocks_rich_text_style_animation_delay";
  DROP TYPE "public"."enum_pages_blocks_rich_text_style_gap_below";
  DROP TYPE "public"."enum_pages_blocks_stats_counters_appearance";
  DROP TYPE "public"."enum_pages_blocks_stats_counters_style_color_scheme";
  DROP TYPE "public"."enum_pages_blocks_stats_counters_style_accent_colour";
  DROP TYPE "public"."enum_pages_blocks_stats_counters_style_width";
  DROP TYPE "public"."enum_pages_blocks_stats_counters_style_padding_size";
  DROP TYPE "public"."enum_pages_blocks_stats_counters_style_text_align";
  DROP TYPE "public"."enum_pages_blocks_stats_counters_style_heading_size";
  DROP TYPE "public"."enum_pages_blocks_stats_counters_style_heading_font";
  DROP TYPE "public"."enum_pages_blocks_stats_counters_style_body_font";
  DROP TYPE "public"."enum_pages_blocks_stats_counters_style_body_size";
  DROP TYPE "public"."enum_pages_blocks_stats_counters_style_animation_style";
  DROP TYPE "public"."enum_pages_blocks_stats_counters_style_animation_delay";
  DROP TYPE "public"."enum_pages_blocks_stats_counters_style_gap_below";
  DROP TYPE "public"."enum_pages_blocks_services_grid_source";
  DROP TYPE "public"."enum_pages_blocks_services_grid_appearance";
  DROP TYPE "public"."enum_pages_blocks_services_grid_style_color_scheme";
  DROP TYPE "public"."enum_pages_blocks_services_grid_style_accent_colour";
  DROP TYPE "public"."enum_pages_blocks_services_grid_style_width";
  DROP TYPE "public"."enum_pages_blocks_services_grid_style_padding_size";
  DROP TYPE "public"."enum_pages_blocks_services_grid_style_text_align";
  DROP TYPE "public"."enum_pages_blocks_services_grid_style_heading_size";
  DROP TYPE "public"."enum_pages_blocks_services_grid_style_heading_font";
  DROP TYPE "public"."enum_pages_blocks_services_grid_style_body_font";
  DROP TYPE "public"."enum_pages_blocks_services_grid_style_body_size";
  DROP TYPE "public"."enum_pages_blocks_services_grid_style_animation_style";
  DROP TYPE "public"."enum_pages_blocks_services_grid_style_animation_delay";
  DROP TYPE "public"."enum_pages_blocks_services_grid_style_gap_below";
  DROP TYPE "public"."enum_pages_blocks_sector_tiles_source";
  DROP TYPE "public"."enum_pages_blocks_sector_tiles_appearance";
  DROP TYPE "public"."enum_pages_blocks_sector_tiles_style_color_scheme";
  DROP TYPE "public"."enum_pages_blocks_sector_tiles_style_accent_colour";
  DROP TYPE "public"."enum_pages_blocks_sector_tiles_style_width";
  DROP TYPE "public"."enum_pages_blocks_sector_tiles_style_padding_size";
  DROP TYPE "public"."enum_pages_blocks_sector_tiles_style_text_align";
  DROP TYPE "public"."enum_pages_blocks_sector_tiles_style_heading_size";
  DROP TYPE "public"."enum_pages_blocks_sector_tiles_style_heading_font";
  DROP TYPE "public"."enum_pages_blocks_sector_tiles_style_body_font";
  DROP TYPE "public"."enum_pages_blocks_sector_tiles_style_body_size";
  DROP TYPE "public"."enum_pages_blocks_sector_tiles_style_animation_style";
  DROP TYPE "public"."enum_pages_blocks_sector_tiles_style_animation_delay";
  DROP TYPE "public"."enum_pages_blocks_sector_tiles_style_gap_below";
  DROP TYPE "public"."enum_pages_blocks_projects_list_source";
  DROP TYPE "public"."enum_pages_blocks_projects_list_appearance";
  DROP TYPE "public"."enum_pages_blocks_projects_list_style_color_scheme";
  DROP TYPE "public"."enum_pages_blocks_projects_list_style_accent_colour";
  DROP TYPE "public"."enum_pages_blocks_projects_list_style_width";
  DROP TYPE "public"."enum_pages_blocks_projects_list_style_padding_size";
  DROP TYPE "public"."enum_pages_blocks_projects_list_style_text_align";
  DROP TYPE "public"."enum_pages_blocks_projects_list_style_heading_size";
  DROP TYPE "public"."enum_pages_blocks_projects_list_style_heading_font";
  DROP TYPE "public"."enum_pages_blocks_projects_list_style_body_font";
  DROP TYPE "public"."enum_pages_blocks_projects_list_style_body_size";
  DROP TYPE "public"."enum_pages_blocks_projects_list_style_animation_style";
  DROP TYPE "public"."enum_pages_blocks_projects_list_style_animation_delay";
  DROP TYPE "public"."enum_pages_blocks_projects_list_style_gap_below";
  DROP TYPE "public"."enum_pages_blocks_image_gallery_appearance";
  DROP TYPE "public"."enum_pages_blocks_image_gallery_style_color_scheme";
  DROP TYPE "public"."enum_pages_blocks_image_gallery_style_accent_colour";
  DROP TYPE "public"."enum_pages_blocks_image_gallery_style_width";
  DROP TYPE "public"."enum_pages_blocks_image_gallery_style_padding_size";
  DROP TYPE "public"."enum_pages_blocks_image_gallery_style_text_align";
  DROP TYPE "public"."enum_pages_blocks_image_gallery_style_heading_size";
  DROP TYPE "public"."enum_pages_blocks_image_gallery_style_heading_font";
  DROP TYPE "public"."enum_pages_blocks_image_gallery_style_body_font";
  DROP TYPE "public"."enum_pages_blocks_image_gallery_style_body_size";
  DROP TYPE "public"."enum_pages_blocks_image_gallery_style_animation_style";
  DROP TYPE "public"."enum_pages_blocks_image_gallery_style_animation_delay";
  DROP TYPE "public"."enum_pages_blocks_image_gallery_style_gap_below";
  DROP TYPE "public"."enum_pages_blocks_photo_strip_appearance";
  DROP TYPE "public"."enum_pages_blocks_photo_strip_display_mode";
  DROP TYPE "public"."enum_pages_blocks_photo_strip_speed";
  DROP TYPE "public"."enum_pages_blocks_photo_strip_style_color_scheme";
  DROP TYPE "public"."enum_pages_blocks_photo_strip_style_accent_colour";
  DROP TYPE "public"."enum_pages_blocks_photo_strip_style_width";
  DROP TYPE "public"."enum_pages_blocks_photo_strip_style_padding_size";
  DROP TYPE "public"."enum_pages_blocks_photo_strip_style_text_align";
  DROP TYPE "public"."enum_pages_blocks_photo_strip_style_heading_size";
  DROP TYPE "public"."enum_pages_blocks_photo_strip_style_heading_font";
  DROP TYPE "public"."enum_pages_blocks_photo_strip_style_body_font";
  DROP TYPE "public"."enum_pages_blocks_photo_strip_style_body_size";
  DROP TYPE "public"."enum_pages_blocks_photo_strip_style_animation_style";
  DROP TYPE "public"."enum_pages_blocks_photo_strip_style_animation_delay";
  DROP TYPE "public"."enum_pages_blocks_photo_strip_style_gap_below";
  DROP TYPE "public"."enum_pages_blocks_video_showcase_videos_source";
  DROP TYPE "public"."enum_pages_blocks_video_showcase_layout";
  DROP TYPE "public"."enum_pages_blocks_video_showcase_tone";
  DROP TYPE "public"."enum_pages_blocks_video_showcase_style_color_scheme";
  DROP TYPE "public"."enum_pages_blocks_video_showcase_style_accent_colour";
  DROP TYPE "public"."enum_pages_blocks_video_showcase_style_width";
  DROP TYPE "public"."enum_pages_blocks_video_showcase_style_padding_size";
  DROP TYPE "public"."enum_pages_blocks_video_showcase_style_text_align";
  DROP TYPE "public"."enum_pages_blocks_video_showcase_style_heading_size";
  DROP TYPE "public"."enum_pages_blocks_video_showcase_style_heading_font";
  DROP TYPE "public"."enum_pages_blocks_video_showcase_style_body_font";
  DROP TYPE "public"."enum_pages_blocks_video_showcase_style_body_size";
  DROP TYPE "public"."enum_pages_blocks_video_showcase_style_animation_style";
  DROP TYPE "public"."enum_pages_blocks_video_showcase_style_animation_delay";
  DROP TYPE "public"."enum_pages_blocks_video_showcase_style_gap_below";
  DROP TYPE "public"."enum_pages_blocks_logo_wall_source";
  DROP TYPE "public"."enum_pages_blocks_logo_wall_appearance";
  DROP TYPE "public"."enum_pages_blocks_logo_wall_style_color_scheme";
  DROP TYPE "public"."enum_pages_blocks_logo_wall_style_accent_colour";
  DROP TYPE "public"."enum_pages_blocks_logo_wall_style_width";
  DROP TYPE "public"."enum_pages_blocks_logo_wall_style_padding_size";
  DROP TYPE "public"."enum_pages_blocks_logo_wall_style_text_align";
  DROP TYPE "public"."enum_pages_blocks_logo_wall_style_heading_size";
  DROP TYPE "public"."enum_pages_blocks_logo_wall_style_heading_font";
  DROP TYPE "public"."enum_pages_blocks_logo_wall_style_body_font";
  DROP TYPE "public"."enum_pages_blocks_logo_wall_style_body_size";
  DROP TYPE "public"."enum_pages_blocks_logo_wall_style_animation_style";
  DROP TYPE "public"."enum_pages_blocks_logo_wall_style_animation_delay";
  DROP TYPE "public"."enum_pages_blocks_logo_wall_style_gap_below";
  DROP TYPE "public"."enum_pages_blocks_partner_bar_appearance";
  DROP TYPE "public"."enum_pages_blocks_partner_bar_style_color_scheme";
  DROP TYPE "public"."enum_pages_blocks_partner_bar_style_accent_colour";
  DROP TYPE "public"."enum_pages_blocks_partner_bar_style_width";
  DROP TYPE "public"."enum_pages_blocks_partner_bar_style_padding_size";
  DROP TYPE "public"."enum_pages_blocks_partner_bar_style_text_align";
  DROP TYPE "public"."enum_pages_blocks_partner_bar_style_heading_size";
  DROP TYPE "public"."enum_pages_blocks_partner_bar_style_heading_font";
  DROP TYPE "public"."enum_pages_blocks_partner_bar_style_body_font";
  DROP TYPE "public"."enum_pages_blocks_partner_bar_style_body_size";
  DROP TYPE "public"."enum_pages_blocks_partner_bar_style_animation_style";
  DROP TYPE "public"."enum_pages_blocks_partner_bar_style_animation_delay";
  DROP TYPE "public"."enum_pages_blocks_partner_bar_style_gap_below";
  DROP TYPE "public"."enum_pages_blocks_product_showcase_source";
  DROP TYPE "public"."enum_pages_blocks_product_showcase_appearance";
  DROP TYPE "public"."enum_pages_blocks_product_showcase_style_color_scheme";
  DROP TYPE "public"."enum_pages_blocks_product_showcase_style_accent_colour";
  DROP TYPE "public"."enum_pages_blocks_product_showcase_style_width";
  DROP TYPE "public"."enum_pages_blocks_product_showcase_style_padding_size";
  DROP TYPE "public"."enum_pages_blocks_product_showcase_style_text_align";
  DROP TYPE "public"."enum_pages_blocks_product_showcase_style_heading_size";
  DROP TYPE "public"."enum_pages_blocks_product_showcase_style_heading_font";
  DROP TYPE "public"."enum_pages_blocks_product_showcase_style_body_font";
  DROP TYPE "public"."enum_pages_blocks_product_showcase_style_body_size";
  DROP TYPE "public"."enum_pages_blocks_product_showcase_style_animation_style";
  DROP TYPE "public"."enum_pages_blocks_product_showcase_style_animation_delay";
  DROP TYPE "public"."enum_pages_blocks_product_showcase_style_gap_below";
  DROP TYPE "public"."enum_pages_blocks_articles_list_appearance";
  DROP TYPE "public"."enum_pages_blocks_articles_list_style_color_scheme";
  DROP TYPE "public"."enum_pages_blocks_articles_list_style_accent_colour";
  DROP TYPE "public"."enum_pages_blocks_articles_list_style_width";
  DROP TYPE "public"."enum_pages_blocks_articles_list_style_padding_size";
  DROP TYPE "public"."enum_pages_blocks_articles_list_style_text_align";
  DROP TYPE "public"."enum_pages_blocks_articles_list_style_heading_size";
  DROP TYPE "public"."enum_pages_blocks_articles_list_style_heading_font";
  DROP TYPE "public"."enum_pages_blocks_articles_list_style_body_font";
  DROP TYPE "public"."enum_pages_blocks_articles_list_style_body_size";
  DROP TYPE "public"."enum_pages_blocks_articles_list_style_animation_style";
  DROP TYPE "public"."enum_pages_blocks_articles_list_style_animation_delay";
  DROP TYPE "public"."enum_pages_blocks_articles_list_style_gap_below";
  DROP TYPE "public"."enum_pages_blocks_testimonials_source";
  DROP TYPE "public"."enum_pages_blocks_testimonials_appearance";
  DROP TYPE "public"."enum_pages_blocks_testimonials_style_color_scheme";
  DROP TYPE "public"."enum_pages_blocks_testimonials_style_accent_colour";
  DROP TYPE "public"."enum_pages_blocks_testimonials_style_width";
  DROP TYPE "public"."enum_pages_blocks_testimonials_style_padding_size";
  DROP TYPE "public"."enum_pages_blocks_testimonials_style_text_align";
  DROP TYPE "public"."enum_pages_blocks_testimonials_style_heading_size";
  DROP TYPE "public"."enum_pages_blocks_testimonials_style_heading_font";
  DROP TYPE "public"."enum_pages_blocks_testimonials_style_body_font";
  DROP TYPE "public"."enum_pages_blocks_testimonials_style_body_size";
  DROP TYPE "public"."enum_pages_blocks_testimonials_style_animation_style";
  DROP TYPE "public"."enum_pages_blocks_testimonials_style_animation_delay";
  DROP TYPE "public"."enum_pages_blocks_testimonials_style_gap_below";
  DROP TYPE "public"."enum_pages_blocks_team_grid_source";
  DROP TYPE "public"."enum_pages_blocks_team_grid_appearance";
  DROP TYPE "public"."enum_pages_blocks_team_grid_group";
  DROP TYPE "public"."enum_pages_blocks_team_grid_style_color_scheme";
  DROP TYPE "public"."enum_pages_blocks_team_grid_style_accent_colour";
  DROP TYPE "public"."enum_pages_blocks_team_grid_style_width";
  DROP TYPE "public"."enum_pages_blocks_team_grid_style_padding_size";
  DROP TYPE "public"."enum_pages_blocks_team_grid_style_text_align";
  DROP TYPE "public"."enum_pages_blocks_team_grid_style_heading_size";
  DROP TYPE "public"."enum_pages_blocks_team_grid_style_heading_font";
  DROP TYPE "public"."enum_pages_blocks_team_grid_style_body_font";
  DROP TYPE "public"."enum_pages_blocks_team_grid_style_body_size";
  DROP TYPE "public"."enum_pages_blocks_team_grid_style_animation_style";
  DROP TYPE "public"."enum_pages_blocks_team_grid_style_animation_delay";
  DROP TYPE "public"."enum_pages_blocks_team_grid_style_gap_below";
  DROP TYPE "public"."enum_pages_blocks_steps_appearance";
  DROP TYPE "public"."enum_pages_blocks_steps_style_color_scheme";
  DROP TYPE "public"."enum_pages_blocks_steps_style_accent_colour";
  DROP TYPE "public"."enum_pages_blocks_steps_style_width";
  DROP TYPE "public"."enum_pages_blocks_steps_style_padding_size";
  DROP TYPE "public"."enum_pages_blocks_steps_style_text_align";
  DROP TYPE "public"."enum_pages_blocks_steps_style_heading_size";
  DROP TYPE "public"."enum_pages_blocks_steps_style_heading_font";
  DROP TYPE "public"."enum_pages_blocks_steps_style_body_font";
  DROP TYPE "public"."enum_pages_blocks_steps_style_body_size";
  DROP TYPE "public"."enum_pages_blocks_steps_style_animation_style";
  DROP TYPE "public"."enum_pages_blocks_steps_style_animation_delay";
  DROP TYPE "public"."enum_pages_blocks_steps_style_gap_below";
  DROP TYPE "public"."enum_pages_blocks_cta_band_ctas_type";
  DROP TYPE "public"."enum_pages_blocks_cta_band_ctas_style";
  DROP TYPE "public"."enum_pages_blocks_cta_band_style_color_scheme";
  DROP TYPE "public"."enum_pages_blocks_cta_band_style_accent_colour";
  DROP TYPE "public"."enum_pages_blocks_cta_band_style_width";
  DROP TYPE "public"."enum_pages_blocks_cta_band_style_padding_size";
  DROP TYPE "public"."enum_pages_blocks_cta_band_style_text_align";
  DROP TYPE "public"."enum_pages_blocks_cta_band_style_heading_size";
  DROP TYPE "public"."enum_pages_blocks_cta_band_style_heading_font";
  DROP TYPE "public"."enum_pages_blocks_cta_band_style_body_font";
  DROP TYPE "public"."enum_pages_blocks_cta_band_style_body_size";
  DROP TYPE "public"."enum_pages_blocks_cta_band_style_animation_style";
  DROP TYPE "public"."enum_pages_blocks_cta_band_style_animation_delay";
  DROP TYPE "public"."enum_pages_blocks_cta_band_style_gap_below";
  DROP TYPE "public"."enum_pages_blocks_faq_appearance";
  DROP TYPE "public"."enum_pages_blocks_faq_style_color_scheme";
  DROP TYPE "public"."enum_pages_blocks_faq_style_accent_colour";
  DROP TYPE "public"."enum_pages_blocks_faq_style_width";
  DROP TYPE "public"."enum_pages_blocks_faq_style_padding_size";
  DROP TYPE "public"."enum_pages_blocks_faq_style_text_align";
  DROP TYPE "public"."enum_pages_blocks_faq_style_heading_size";
  DROP TYPE "public"."enum_pages_blocks_faq_style_heading_font";
  DROP TYPE "public"."enum_pages_blocks_faq_style_body_font";
  DROP TYPE "public"."enum_pages_blocks_faq_style_body_size";
  DROP TYPE "public"."enum_pages_blocks_faq_style_animation_style";
  DROP TYPE "public"."enum_pages_blocks_faq_style_animation_delay";
  DROP TYPE "public"."enum_pages_blocks_faq_style_gap_below";
  DROP TYPE "public"."enum_pages_blocks_calculator_embed_appearance";
  DROP TYPE "public"."enum_pages_blocks_calculator_embed_tool";
  DROP TYPE "public"."enum_pages_blocks_calculator_embed_style_color_scheme";
  DROP TYPE "public"."enum_pages_blocks_calculator_embed_style_accent_colour";
  DROP TYPE "public"."enum_pages_blocks_calculator_embed_style_width";
  DROP TYPE "public"."enum_pages_blocks_calculator_embed_style_padding_size";
  DROP TYPE "public"."enum_pages_blocks_calculator_embed_style_text_align";
  DROP TYPE "public"."enum_pages_blocks_calculator_embed_style_heading_size";
  DROP TYPE "public"."enum_pages_blocks_calculator_embed_style_heading_font";
  DROP TYPE "public"."enum_pages_blocks_calculator_embed_style_body_font";
  DROP TYPE "public"."enum_pages_blocks_calculator_embed_style_body_size";
  DROP TYPE "public"."enum_pages_blocks_calculator_embed_style_animation_style";
  DROP TYPE "public"."enum_pages_blocks_calculator_embed_style_animation_delay";
  DROP TYPE "public"."enum_pages_blocks_calculator_embed_style_gap_below";
  DROP TYPE "public"."enum_pages_blocks_contact_r_f_q_appearance";
  DROP TYPE "public"."enum_pages_blocks_contact_r_f_q_style_color_scheme";
  DROP TYPE "public"."enum_pages_blocks_contact_r_f_q_style_accent_colour";
  DROP TYPE "public"."enum_pages_blocks_contact_r_f_q_style_width";
  DROP TYPE "public"."enum_pages_blocks_contact_r_f_q_style_padding_size";
  DROP TYPE "public"."enum_pages_blocks_contact_r_f_q_style_text_align";
  DROP TYPE "public"."enum_pages_blocks_contact_r_f_q_style_heading_size";
  DROP TYPE "public"."enum_pages_blocks_contact_r_f_q_style_heading_font";
  DROP TYPE "public"."enum_pages_blocks_contact_r_f_q_style_body_font";
  DROP TYPE "public"."enum_pages_blocks_contact_r_f_q_style_body_size";
  DROP TYPE "public"."enum_pages_blocks_contact_r_f_q_style_animation_style";
  DROP TYPE "public"."enum_pages_blocks_contact_r_f_q_style_animation_delay";
  DROP TYPE "public"."enum_pages_blocks_contact_r_f_q_style_gap_below";
  DROP TYPE "public"."enum_pages_blocks_spacer_size";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_blocks_hero_ctas_type";
  DROP TYPE "public"."enum__pages_v_blocks_hero_ctas_style";
  DROP TYPE "public"."enum__pages_v_blocks_hero_height";
  DROP TYPE "public"."enum__pages_v_blocks_hero_tone";
  DROP TYPE "public"."enum__pages_v_blocks_hero_hero_mode";
  DROP TYPE "public"."enum__pages_v_blocks_hero_side_media_source";
  DROP TYPE "public"."enum__pages_v_blocks_hero_style_color_scheme";
  DROP TYPE "public"."enum__pages_v_blocks_hero_style_accent_colour";
  DROP TYPE "public"."enum__pages_v_blocks_hero_style_width";
  DROP TYPE "public"."enum__pages_v_blocks_hero_style_padding_size";
  DROP TYPE "public"."enum__pages_v_blocks_hero_style_text_align";
  DROP TYPE "public"."enum__pages_v_blocks_hero_style_heading_size";
  DROP TYPE "public"."enum__pages_v_blocks_hero_style_heading_font";
  DROP TYPE "public"."enum__pages_v_blocks_hero_style_body_font";
  DROP TYPE "public"."enum__pages_v_blocks_hero_style_body_size";
  DROP TYPE "public"."enum__pages_v_blocks_hero_style_animation_style";
  DROP TYPE "public"."enum__pages_v_blocks_hero_style_animation_delay";
  DROP TYPE "public"."enum__pages_v_blocks_hero_style_gap_below";
  DROP TYPE "public"."enum__pages_v_blocks_rich_text_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_rich_text_style_color_scheme";
  DROP TYPE "public"."enum__pages_v_blocks_rich_text_style_accent_colour";
  DROP TYPE "public"."enum__pages_v_blocks_rich_text_style_width";
  DROP TYPE "public"."enum__pages_v_blocks_rich_text_style_padding_size";
  DROP TYPE "public"."enum__pages_v_blocks_rich_text_style_text_align";
  DROP TYPE "public"."enum__pages_v_blocks_rich_text_style_heading_size";
  DROP TYPE "public"."enum__pages_v_blocks_rich_text_style_heading_font";
  DROP TYPE "public"."enum__pages_v_blocks_rich_text_style_body_font";
  DROP TYPE "public"."enum__pages_v_blocks_rich_text_style_body_size";
  DROP TYPE "public"."enum__pages_v_blocks_rich_text_style_animation_style";
  DROP TYPE "public"."enum__pages_v_blocks_rich_text_style_animation_delay";
  DROP TYPE "public"."enum__pages_v_blocks_rich_text_style_gap_below";
  DROP TYPE "public"."enum__pages_v_blocks_stats_counters_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_stats_counters_style_color_scheme";
  DROP TYPE "public"."enum__pages_v_blocks_stats_counters_style_accent_colour";
  DROP TYPE "public"."enum__pages_v_blocks_stats_counters_style_width";
  DROP TYPE "public"."enum__pages_v_blocks_stats_counters_style_padding_size";
  DROP TYPE "public"."enum__pages_v_blocks_stats_counters_style_text_align";
  DROP TYPE "public"."enum__pages_v_blocks_stats_counters_style_heading_size";
  DROP TYPE "public"."enum__pages_v_blocks_stats_counters_style_heading_font";
  DROP TYPE "public"."enum__pages_v_blocks_stats_counters_style_body_font";
  DROP TYPE "public"."enum__pages_v_blocks_stats_counters_style_body_size";
  DROP TYPE "public"."enum__pages_v_blocks_stats_counters_style_animation_style";
  DROP TYPE "public"."enum__pages_v_blocks_stats_counters_style_animation_delay";
  DROP TYPE "public"."enum__pages_v_blocks_stats_counters_style_gap_below";
  DROP TYPE "public"."enum__pages_v_blocks_services_grid_source";
  DROP TYPE "public"."enum__pages_v_blocks_services_grid_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_services_grid_style_color_scheme";
  DROP TYPE "public"."enum__pages_v_blocks_services_grid_style_accent_colour";
  DROP TYPE "public"."enum__pages_v_blocks_services_grid_style_width";
  DROP TYPE "public"."enum__pages_v_blocks_services_grid_style_padding_size";
  DROP TYPE "public"."enum__pages_v_blocks_services_grid_style_text_align";
  DROP TYPE "public"."enum__pages_v_blocks_services_grid_style_heading_size";
  DROP TYPE "public"."enum__pages_v_blocks_services_grid_style_heading_font";
  DROP TYPE "public"."enum__pages_v_blocks_services_grid_style_body_font";
  DROP TYPE "public"."enum__pages_v_blocks_services_grid_style_body_size";
  DROP TYPE "public"."enum__pages_v_blocks_services_grid_style_animation_style";
  DROP TYPE "public"."enum__pages_v_blocks_services_grid_style_animation_delay";
  DROP TYPE "public"."enum__pages_v_blocks_services_grid_style_gap_below";
  DROP TYPE "public"."enum__pages_v_blocks_sector_tiles_source";
  DROP TYPE "public"."enum__pages_v_blocks_sector_tiles_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_sector_tiles_style_color_scheme";
  DROP TYPE "public"."enum__pages_v_blocks_sector_tiles_style_accent_colour";
  DROP TYPE "public"."enum__pages_v_blocks_sector_tiles_style_width";
  DROP TYPE "public"."enum__pages_v_blocks_sector_tiles_style_padding_size";
  DROP TYPE "public"."enum__pages_v_blocks_sector_tiles_style_text_align";
  DROP TYPE "public"."enum__pages_v_blocks_sector_tiles_style_heading_size";
  DROP TYPE "public"."enum__pages_v_blocks_sector_tiles_style_heading_font";
  DROP TYPE "public"."enum__pages_v_blocks_sector_tiles_style_body_font";
  DROP TYPE "public"."enum__pages_v_blocks_sector_tiles_style_body_size";
  DROP TYPE "public"."enum__pages_v_blocks_sector_tiles_style_animation_style";
  DROP TYPE "public"."enum__pages_v_blocks_sector_tiles_style_animation_delay";
  DROP TYPE "public"."enum__pages_v_blocks_sector_tiles_style_gap_below";
  DROP TYPE "public"."enum__pages_v_blocks_projects_list_source";
  DROP TYPE "public"."enum__pages_v_blocks_projects_list_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_projects_list_style_color_scheme";
  DROP TYPE "public"."enum__pages_v_blocks_projects_list_style_accent_colour";
  DROP TYPE "public"."enum__pages_v_blocks_projects_list_style_width";
  DROP TYPE "public"."enum__pages_v_blocks_projects_list_style_padding_size";
  DROP TYPE "public"."enum__pages_v_blocks_projects_list_style_text_align";
  DROP TYPE "public"."enum__pages_v_blocks_projects_list_style_heading_size";
  DROP TYPE "public"."enum__pages_v_blocks_projects_list_style_heading_font";
  DROP TYPE "public"."enum__pages_v_blocks_projects_list_style_body_font";
  DROP TYPE "public"."enum__pages_v_blocks_projects_list_style_body_size";
  DROP TYPE "public"."enum__pages_v_blocks_projects_list_style_animation_style";
  DROP TYPE "public"."enum__pages_v_blocks_projects_list_style_animation_delay";
  DROP TYPE "public"."enum__pages_v_blocks_projects_list_style_gap_below";
  DROP TYPE "public"."enum__pages_v_blocks_image_gallery_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_image_gallery_style_color_scheme";
  DROP TYPE "public"."enum__pages_v_blocks_image_gallery_style_accent_colour";
  DROP TYPE "public"."enum__pages_v_blocks_image_gallery_style_width";
  DROP TYPE "public"."enum__pages_v_blocks_image_gallery_style_padding_size";
  DROP TYPE "public"."enum__pages_v_blocks_image_gallery_style_text_align";
  DROP TYPE "public"."enum__pages_v_blocks_image_gallery_style_heading_size";
  DROP TYPE "public"."enum__pages_v_blocks_image_gallery_style_heading_font";
  DROP TYPE "public"."enum__pages_v_blocks_image_gallery_style_body_font";
  DROP TYPE "public"."enum__pages_v_blocks_image_gallery_style_body_size";
  DROP TYPE "public"."enum__pages_v_blocks_image_gallery_style_animation_style";
  DROP TYPE "public"."enum__pages_v_blocks_image_gallery_style_animation_delay";
  DROP TYPE "public"."enum__pages_v_blocks_image_gallery_style_gap_below";
  DROP TYPE "public"."enum__pages_v_blocks_photo_strip_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_photo_strip_display_mode";
  DROP TYPE "public"."enum__pages_v_blocks_photo_strip_speed";
  DROP TYPE "public"."enum__pages_v_blocks_photo_strip_style_color_scheme";
  DROP TYPE "public"."enum__pages_v_blocks_photo_strip_style_accent_colour";
  DROP TYPE "public"."enum__pages_v_blocks_photo_strip_style_width";
  DROP TYPE "public"."enum__pages_v_blocks_photo_strip_style_padding_size";
  DROP TYPE "public"."enum__pages_v_blocks_photo_strip_style_text_align";
  DROP TYPE "public"."enum__pages_v_blocks_photo_strip_style_heading_size";
  DROP TYPE "public"."enum__pages_v_blocks_photo_strip_style_heading_font";
  DROP TYPE "public"."enum__pages_v_blocks_photo_strip_style_body_font";
  DROP TYPE "public"."enum__pages_v_blocks_photo_strip_style_body_size";
  DROP TYPE "public"."enum__pages_v_blocks_photo_strip_style_animation_style";
  DROP TYPE "public"."enum__pages_v_blocks_photo_strip_style_animation_delay";
  DROP TYPE "public"."enum__pages_v_blocks_photo_strip_style_gap_below";
  DROP TYPE "public"."enum__pages_v_blocks_video_showcase_videos_source";
  DROP TYPE "public"."enum__pages_v_blocks_video_showcase_layout";
  DROP TYPE "public"."enum__pages_v_blocks_video_showcase_tone";
  DROP TYPE "public"."enum__pages_v_blocks_video_showcase_style_color_scheme";
  DROP TYPE "public"."enum__pages_v_blocks_video_showcase_style_accent_colour";
  DROP TYPE "public"."enum__pages_v_blocks_video_showcase_style_width";
  DROP TYPE "public"."enum__pages_v_blocks_video_showcase_style_padding_size";
  DROP TYPE "public"."enum__pages_v_blocks_video_showcase_style_text_align";
  DROP TYPE "public"."enum__pages_v_blocks_video_showcase_style_heading_size";
  DROP TYPE "public"."enum__pages_v_blocks_video_showcase_style_heading_font";
  DROP TYPE "public"."enum__pages_v_blocks_video_showcase_style_body_font";
  DROP TYPE "public"."enum__pages_v_blocks_video_showcase_style_body_size";
  DROP TYPE "public"."enum__pages_v_blocks_video_showcase_style_animation_style";
  DROP TYPE "public"."enum__pages_v_blocks_video_showcase_style_animation_delay";
  DROP TYPE "public"."enum__pages_v_blocks_video_showcase_style_gap_below";
  DROP TYPE "public"."enum__pages_v_blocks_logo_wall_source";
  DROP TYPE "public"."enum__pages_v_blocks_logo_wall_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_logo_wall_style_color_scheme";
  DROP TYPE "public"."enum__pages_v_blocks_logo_wall_style_accent_colour";
  DROP TYPE "public"."enum__pages_v_blocks_logo_wall_style_width";
  DROP TYPE "public"."enum__pages_v_blocks_logo_wall_style_padding_size";
  DROP TYPE "public"."enum__pages_v_blocks_logo_wall_style_text_align";
  DROP TYPE "public"."enum__pages_v_blocks_logo_wall_style_heading_size";
  DROP TYPE "public"."enum__pages_v_blocks_logo_wall_style_heading_font";
  DROP TYPE "public"."enum__pages_v_blocks_logo_wall_style_body_font";
  DROP TYPE "public"."enum__pages_v_blocks_logo_wall_style_body_size";
  DROP TYPE "public"."enum__pages_v_blocks_logo_wall_style_animation_style";
  DROP TYPE "public"."enum__pages_v_blocks_logo_wall_style_animation_delay";
  DROP TYPE "public"."enum__pages_v_blocks_logo_wall_style_gap_below";
  DROP TYPE "public"."enum__pages_v_blocks_partner_bar_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_partner_bar_style_color_scheme";
  DROP TYPE "public"."enum__pages_v_blocks_partner_bar_style_accent_colour";
  DROP TYPE "public"."enum__pages_v_blocks_partner_bar_style_width";
  DROP TYPE "public"."enum__pages_v_blocks_partner_bar_style_padding_size";
  DROP TYPE "public"."enum__pages_v_blocks_partner_bar_style_text_align";
  DROP TYPE "public"."enum__pages_v_blocks_partner_bar_style_heading_size";
  DROP TYPE "public"."enum__pages_v_blocks_partner_bar_style_heading_font";
  DROP TYPE "public"."enum__pages_v_blocks_partner_bar_style_body_font";
  DROP TYPE "public"."enum__pages_v_blocks_partner_bar_style_body_size";
  DROP TYPE "public"."enum__pages_v_blocks_partner_bar_style_animation_style";
  DROP TYPE "public"."enum__pages_v_blocks_partner_bar_style_animation_delay";
  DROP TYPE "public"."enum__pages_v_blocks_partner_bar_style_gap_below";
  DROP TYPE "public"."enum__pages_v_blocks_product_showcase_source";
  DROP TYPE "public"."enum__pages_v_blocks_product_showcase_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_product_showcase_style_color_scheme";
  DROP TYPE "public"."enum__pages_v_blocks_product_showcase_style_accent_colour";
  DROP TYPE "public"."enum__pages_v_blocks_product_showcase_style_width";
  DROP TYPE "public"."enum__pages_v_blocks_product_showcase_style_padding_size";
  DROP TYPE "public"."enum__pages_v_blocks_product_showcase_style_text_align";
  DROP TYPE "public"."enum__pages_v_blocks_product_showcase_style_heading_size";
  DROP TYPE "public"."enum__pages_v_blocks_product_showcase_style_heading_font";
  DROP TYPE "public"."enum__pages_v_blocks_product_showcase_style_body_font";
  DROP TYPE "public"."enum__pages_v_blocks_product_showcase_style_body_size";
  DROP TYPE "public"."enum__pages_v_blocks_product_showcase_style_animation_style";
  DROP TYPE "public"."enum__pages_v_blocks_product_showcase_style_animation_delay";
  DROP TYPE "public"."enum__pages_v_blocks_product_showcase_style_gap_below";
  DROP TYPE "public"."enum__pages_v_blocks_articles_list_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_articles_list_style_color_scheme";
  DROP TYPE "public"."enum__pages_v_blocks_articles_list_style_accent_colour";
  DROP TYPE "public"."enum__pages_v_blocks_articles_list_style_width";
  DROP TYPE "public"."enum__pages_v_blocks_articles_list_style_padding_size";
  DROP TYPE "public"."enum__pages_v_blocks_articles_list_style_text_align";
  DROP TYPE "public"."enum__pages_v_blocks_articles_list_style_heading_size";
  DROP TYPE "public"."enum__pages_v_blocks_articles_list_style_heading_font";
  DROP TYPE "public"."enum__pages_v_blocks_articles_list_style_body_font";
  DROP TYPE "public"."enum__pages_v_blocks_articles_list_style_body_size";
  DROP TYPE "public"."enum__pages_v_blocks_articles_list_style_animation_style";
  DROP TYPE "public"."enum__pages_v_blocks_articles_list_style_animation_delay";
  DROP TYPE "public"."enum__pages_v_blocks_articles_list_style_gap_below";
  DROP TYPE "public"."enum__pages_v_blocks_testimonials_source";
  DROP TYPE "public"."enum__pages_v_blocks_testimonials_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_testimonials_style_color_scheme";
  DROP TYPE "public"."enum__pages_v_blocks_testimonials_style_accent_colour";
  DROP TYPE "public"."enum__pages_v_blocks_testimonials_style_width";
  DROP TYPE "public"."enum__pages_v_blocks_testimonials_style_padding_size";
  DROP TYPE "public"."enum__pages_v_blocks_testimonials_style_text_align";
  DROP TYPE "public"."enum__pages_v_blocks_testimonials_style_heading_size";
  DROP TYPE "public"."enum__pages_v_blocks_testimonials_style_heading_font";
  DROP TYPE "public"."enum__pages_v_blocks_testimonials_style_body_font";
  DROP TYPE "public"."enum__pages_v_blocks_testimonials_style_body_size";
  DROP TYPE "public"."enum__pages_v_blocks_testimonials_style_animation_style";
  DROP TYPE "public"."enum__pages_v_blocks_testimonials_style_animation_delay";
  DROP TYPE "public"."enum__pages_v_blocks_testimonials_style_gap_below";
  DROP TYPE "public"."enum__pages_v_blocks_team_grid_source";
  DROP TYPE "public"."enum__pages_v_blocks_team_grid_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_team_grid_group";
  DROP TYPE "public"."enum__pages_v_blocks_team_grid_style_color_scheme";
  DROP TYPE "public"."enum__pages_v_blocks_team_grid_style_accent_colour";
  DROP TYPE "public"."enum__pages_v_blocks_team_grid_style_width";
  DROP TYPE "public"."enum__pages_v_blocks_team_grid_style_padding_size";
  DROP TYPE "public"."enum__pages_v_blocks_team_grid_style_text_align";
  DROP TYPE "public"."enum__pages_v_blocks_team_grid_style_heading_size";
  DROP TYPE "public"."enum__pages_v_blocks_team_grid_style_heading_font";
  DROP TYPE "public"."enum__pages_v_blocks_team_grid_style_body_font";
  DROP TYPE "public"."enum__pages_v_blocks_team_grid_style_body_size";
  DROP TYPE "public"."enum__pages_v_blocks_team_grid_style_animation_style";
  DROP TYPE "public"."enum__pages_v_blocks_team_grid_style_animation_delay";
  DROP TYPE "public"."enum__pages_v_blocks_team_grid_style_gap_below";
  DROP TYPE "public"."enum__pages_v_blocks_steps_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_steps_style_color_scheme";
  DROP TYPE "public"."enum__pages_v_blocks_steps_style_accent_colour";
  DROP TYPE "public"."enum__pages_v_blocks_steps_style_width";
  DROP TYPE "public"."enum__pages_v_blocks_steps_style_padding_size";
  DROP TYPE "public"."enum__pages_v_blocks_steps_style_text_align";
  DROP TYPE "public"."enum__pages_v_blocks_steps_style_heading_size";
  DROP TYPE "public"."enum__pages_v_blocks_steps_style_heading_font";
  DROP TYPE "public"."enum__pages_v_blocks_steps_style_body_font";
  DROP TYPE "public"."enum__pages_v_blocks_steps_style_body_size";
  DROP TYPE "public"."enum__pages_v_blocks_steps_style_animation_style";
  DROP TYPE "public"."enum__pages_v_blocks_steps_style_animation_delay";
  DROP TYPE "public"."enum__pages_v_blocks_steps_style_gap_below";
  DROP TYPE "public"."enum__pages_v_blocks_cta_band_ctas_type";
  DROP TYPE "public"."enum__pages_v_blocks_cta_band_ctas_style";
  DROP TYPE "public"."enum__pages_v_blocks_cta_band_style_color_scheme";
  DROP TYPE "public"."enum__pages_v_blocks_cta_band_style_accent_colour";
  DROP TYPE "public"."enum__pages_v_blocks_cta_band_style_width";
  DROP TYPE "public"."enum__pages_v_blocks_cta_band_style_padding_size";
  DROP TYPE "public"."enum__pages_v_blocks_cta_band_style_text_align";
  DROP TYPE "public"."enum__pages_v_blocks_cta_band_style_heading_size";
  DROP TYPE "public"."enum__pages_v_blocks_cta_band_style_heading_font";
  DROP TYPE "public"."enum__pages_v_blocks_cta_band_style_body_font";
  DROP TYPE "public"."enum__pages_v_blocks_cta_band_style_body_size";
  DROP TYPE "public"."enum__pages_v_blocks_cta_band_style_animation_style";
  DROP TYPE "public"."enum__pages_v_blocks_cta_band_style_animation_delay";
  DROP TYPE "public"."enum__pages_v_blocks_cta_band_style_gap_below";
  DROP TYPE "public"."enum__pages_v_blocks_faq_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_faq_style_color_scheme";
  DROP TYPE "public"."enum__pages_v_blocks_faq_style_accent_colour";
  DROP TYPE "public"."enum__pages_v_blocks_faq_style_width";
  DROP TYPE "public"."enum__pages_v_blocks_faq_style_padding_size";
  DROP TYPE "public"."enum__pages_v_blocks_faq_style_text_align";
  DROP TYPE "public"."enum__pages_v_blocks_faq_style_heading_size";
  DROP TYPE "public"."enum__pages_v_blocks_faq_style_heading_font";
  DROP TYPE "public"."enum__pages_v_blocks_faq_style_body_font";
  DROP TYPE "public"."enum__pages_v_blocks_faq_style_body_size";
  DROP TYPE "public"."enum__pages_v_blocks_faq_style_animation_style";
  DROP TYPE "public"."enum__pages_v_blocks_faq_style_animation_delay";
  DROP TYPE "public"."enum__pages_v_blocks_faq_style_gap_below";
  DROP TYPE "public"."enum__pages_v_blocks_calculator_embed_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_calculator_embed_tool";
  DROP TYPE "public"."enum__pages_v_blocks_calculator_embed_style_color_scheme";
  DROP TYPE "public"."enum__pages_v_blocks_calculator_embed_style_accent_colour";
  DROP TYPE "public"."enum__pages_v_blocks_calculator_embed_style_width";
  DROP TYPE "public"."enum__pages_v_blocks_calculator_embed_style_padding_size";
  DROP TYPE "public"."enum__pages_v_blocks_calculator_embed_style_text_align";
  DROP TYPE "public"."enum__pages_v_blocks_calculator_embed_style_heading_size";
  DROP TYPE "public"."enum__pages_v_blocks_calculator_embed_style_heading_font";
  DROP TYPE "public"."enum__pages_v_blocks_calculator_embed_style_body_font";
  DROP TYPE "public"."enum__pages_v_blocks_calculator_embed_style_body_size";
  DROP TYPE "public"."enum__pages_v_blocks_calculator_embed_style_animation_style";
  DROP TYPE "public"."enum__pages_v_blocks_calculator_embed_style_animation_delay";
  DROP TYPE "public"."enum__pages_v_blocks_calculator_embed_style_gap_below";
  DROP TYPE "public"."enum__pages_v_blocks_contact_r_f_q_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_contact_r_f_q_style_color_scheme";
  DROP TYPE "public"."enum__pages_v_blocks_contact_r_f_q_style_accent_colour";
  DROP TYPE "public"."enum__pages_v_blocks_contact_r_f_q_style_width";
  DROP TYPE "public"."enum__pages_v_blocks_contact_r_f_q_style_padding_size";
  DROP TYPE "public"."enum__pages_v_blocks_contact_r_f_q_style_text_align";
  DROP TYPE "public"."enum__pages_v_blocks_contact_r_f_q_style_heading_size";
  DROP TYPE "public"."enum__pages_v_blocks_contact_r_f_q_style_heading_font";
  DROP TYPE "public"."enum__pages_v_blocks_contact_r_f_q_style_body_font";
  DROP TYPE "public"."enum__pages_v_blocks_contact_r_f_q_style_body_size";
  DROP TYPE "public"."enum__pages_v_blocks_contact_r_f_q_style_animation_style";
  DROP TYPE "public"."enum__pages_v_blocks_contact_r_f_q_style_animation_delay";
  DROP TYPE "public"."enum__pages_v_blocks_contact_r_f_q_style_gap_below";
  DROP TYPE "public"."enum__pages_v_blocks_spacer_size";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum_projects_status";
  DROP TYPE "public"."enum__projects_v_version_status";
  DROP TYPE "public"."enum_products_category";
  DROP TYPE "public"."enum_services_icon";
  DROP TYPE "public"."enum_sectors_icon";
  DROP TYPE "public"."enum_team_category";
  DROP TYPE "public"."enum_articles_status";
  DROP TYPE "public"."enum__articles_v_version_status";
  DROP TYPE "public"."enum_knowledge_resources_type";
  DROP TYPE "public"."enum_knowledge_resources_calc_type";
  DROP TYPE "public"."enum_knowledge_resources_file_format";
  DROP TYPE "public"."enum_knowledge_resources_open_mode";
  DROP TYPE "public"."enum_news_items_category";
  DROP TYPE "public"."enum_news_items_status";
  DROP TYPE "public"."enum__news_items_v_version_category";
  DROP TYPE "public"."enum__news_items_v_version_status";
  DROP TYPE "public"."enum_awards_kind";
  DROP TYPE "public"."enum_partners_type";
  DROP TYPE "public"."enum_job_openings_employment_type";
  DROP TYPE "public"."enum_job_openings_status";
  DROP TYPE "public"."enum_icons_category";
  DROP TYPE "public"."enum_rfq_requests_status";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  DROP TYPE "public"."enum_payload_jobs_log_state";
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  DROP TYPE "public"."enum_site_settings_knowledge_layout";
  DROP TYPE "public"."enum_site_settings_projects_layout";
  DROP TYPE "public"."enum_site_settings_whatsapp_position";
  DROP TYPE "public"."enum_site_settings_chatbot_provider";
  DROP TYPE "public"."enum_site_settings_chatbot_chat_position";
  DROP TYPE "public"."enum_navigation_header_children_type";
  DROP TYPE "public"."enum_navigation_header_type";
  DROP TYPE "public"."enum_navigation_footer_columns_links_type";
  DROP TYPE "public"."enum_navigation_header_cta_type";`)
}
