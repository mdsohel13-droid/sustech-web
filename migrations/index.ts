import * as migration_20260609_052220_initial_schema from "./20260609_052220_initial_schema";
import * as migration_20260609_053000_content_layouts_and_stats from "./20260609_053000_content_layouts_and_stats";
import * as migration_20260609_054000_page_intros_and_chat_config from "./20260609_054000_page_intros_and_chat_config";
import * as migration_20260609_055000_emails_array from "./20260609_055000_emails_array";
import * as migration_20260609_056000_capabilities_surface from "./20260609_056000_capabilities_surface";
import * as migration_20260609_057000_block_style_defaults from "./20260609_057000_block_style_defaults";
import * as migration_20260609_058000_design_version from "./20260609_058000_design_version";
import * as migration_20260610_060000_custom_icons from "./20260610_060000_custom_icons";
import * as migration_20260610_061000_hero_background_fx from "./20260610_061000_hero_background_fx";
import * as migration_20260610_062000_hero_fx_options from "./20260610_062000_hero_fx_options";
import * as migration_20260610_063000_nav_style from "./20260610_063000_nav_style";
import * as migration_20260610_064000_nav_style_options from "./20260610_064000_nav_style_options";

export const migrations = [
  {
    up: migration_20260609_052220_initial_schema.up,
    down: migration_20260609_052220_initial_schema.down,
    name: "20260609_052220_initial_schema",
  },
  {
    up: migration_20260609_053000_content_layouts_and_stats.up,
    down: migration_20260609_053000_content_layouts_and_stats.down,
    name: "20260609_053000_content_layouts_and_stats",
  },
  {
    up: migration_20260609_054000_page_intros_and_chat_config.up,
    down: migration_20260609_054000_page_intros_and_chat_config.down,
    name: "20260609_054000_page_intros_and_chat_config",
  },
  {
    up: migration_20260609_055000_emails_array.up,
    down: migration_20260609_055000_emails_array.down,
    name: "20260609_055000_emails_array",
  },
  {
    up: migration_20260609_056000_capabilities_surface.up,
    down: migration_20260609_056000_capabilities_surface.down,
    name: "20260609_056000_capabilities_surface",
  },
  {
    up: migration_20260609_057000_block_style_defaults.up,
    down: migration_20260609_057000_block_style_defaults.down,
    name: "20260609_057000_block_style_defaults",
  },
  {
    up: migration_20260609_058000_design_version.up,
    down: migration_20260609_058000_design_version.down,
    name: "20260609_058000_design_version",
  },
  {
    up: migration_20260610_060000_custom_icons.up,
    down: migration_20260610_060000_custom_icons.down,
    name: "20260610_060000_custom_icons",
  },
  {
    up: migration_20260610_061000_hero_background_fx.up,
    down: migration_20260610_061000_hero_background_fx.down,
    name: "20260610_061000_hero_background_fx",
  },
  {
    up: migration_20260610_062000_hero_fx_options.up,
    down: migration_20260610_062000_hero_fx_options.down,
    name: "20260610_062000_hero_fx_options",
  },
  {
    up: migration_20260610_063000_nav_style.up,
    down: migration_20260610_063000_nav_style.down,
    name: "20260610_063000_nav_style",
  },
  {
    up: migration_20260610_064000_nav_style_options.up,
    down: migration_20260610_064000_nav_style_options.down,
    name: "20260610_064000_nav_style_options",
  },
];
