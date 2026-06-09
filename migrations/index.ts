import * as migration_20260609_052220_initial_schema from "./20260609_052220_initial_schema";
import * as migration_20260609_053000_content_layouts_and_stats from "./20260609_053000_content_layouts_and_stats";

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
];
