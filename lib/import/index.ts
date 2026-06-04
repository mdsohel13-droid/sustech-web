import { erpAdapter } from "./erp-adapter";
import { excelAdapter } from "./excel-adapter";
import type { ProjectSource } from "./types";

export interface ImportConfig {
  /** Switching the live data source is this one value (env `IMPORT_SOURCE`). */
  source: "excel" | "erp";
  /** Path to the workbook for the excel source (env `DATA_FILE`). */
  excelPath: string;
}

export function getSource(config: ImportConfig): ProjectSource {
  return config.source === "erp" ? erpAdapter() : excelAdapter(config.excelPath);
}

export * from "./types";
