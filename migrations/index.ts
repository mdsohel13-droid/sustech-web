import * as migration_20260609_052220_initial_schema from "./20260609_052220_initial_schema";
import * as migration_20260609_053000_content_layouts_and_stats from "./20260609_053000_content_layouts_and_stats";
import * as migration_20260609_054000_page_intros_and_chat_config from "./20260609_054000_page_intros_and_chat_config";
import * as migration_20260609_055000_emails_array from "./20260609_055000_emails_array";
import * as migration_20260609_056000_capabilities_surface from "./20260609_056000_capabilities_surface";
import * as migration_20260609_057000_block_style_defaults from "./20260609_057000_block_style_defaults";

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
];
