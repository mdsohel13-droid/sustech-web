import type { ProjectSource, SourceResult } from "./types";

/**
 * ERP source — STUB (the ERP has no project data yet).
 *
 * When the ERP exposes won/completed jobs, implement `load()` here against the SAME
 * `ProjectSource` interface, emitting `CanonicalProject` records with identical eligibility +
 * field rules. Switching the live source is then ONE config change: `IMPORT_SOURCE=erp`
 * (see data/field-map.md for the future ERP field column).
 *
 * SECURITY: the ERP lives on the private ops tier and is reached only by Hermes' importer —
 * never by the web app at runtime. The web tier holds no ERP credentials.
 */
export function erpAdapter(): ProjectSource {
  return {
    id: "erp",
    load(): Promise<SourceResult> {
      throw new Error(
        "erpAdapter is not implemented yet — the ERP has no project data. Use IMPORT_SOURCE=excel for now.",
      );
    },
  };
}
