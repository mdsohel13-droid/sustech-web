import { createHash } from "node:crypto";
import ExcelJS from "exceljs";
import { evaluateEligibility } from "./eligibility";
import { mapServiceLines } from "./service-taxonomy";
import {
  CANONICAL_SERVICES,
  type CanonicalProject,
  type ProjectSource,
  type ServiceSlug,
  type SkippedRow,
  type SourceResult,
} from "./types";

const PRIORITY: ServiceSlug[] = [
  "solar-energy",
  "electrical-epc",
  "grounding-lightning-protection",
  "smart-systems",
];

const hashKey = (s: string): string =>
  createHash("sha256").update(s.trim().toLowerCase()).digest("hex").slice(0, 16);

/** Coerce any ExcelJS cell value to plain text (handles formulas, rich text, hyperlinks). */
function cellText(v: ExcelJS.CellValue): string {
  if (v == null) return "";
  if (typeof v === "string") return v.trim();
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "object") {
    const o = v as { result?: unknown; text?: unknown; richText?: { text: string }[] };
    if (o.richText)
      return o.richText
        .map((r) => r.text)
        .join("")
        .trim();
    if (o.text != null) return String(o.text).trim();
    if (o.result != null) return String(o.result).trim();
  }
  return "";
}

function cellNum(v: ExcelJS.CellValue): number {
  if (typeof v === "number") return v;
  const n = parseFloat(cellText(v).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function cellYear(v: ExcelJS.CellValue): number | undefined {
  if (v instanceof Date) return v.getFullYear();
  const match = cellText(v).match(/20\d{2}/);
  return match ? parseInt(match[0], 10) : undefined;
}

function headerMap(ws: ExcelJS.Worksheet): Map<string, number> {
  const map = new Map<string, number>();
  ws.getRow(1).eachCell((cell, col) => {
    const name = cellText(cell.value);
    if (name) map.set(name, col);
  });
  return map;
}

export function excelAdapter(filePath: string): ProjectSource {
  return {
    id: "excel",
    async load(): Promise<SourceResult> {
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.readFile(filePath);

      const clients = wb.getWorksheet("Client List");
      if (!clients) throw new Error('Sheet "Client List" not found in the workbook.');

      // Latest WON/billed year per client from "Quotations & Jobs" (refines the project year).
      const wonYear = new Map<string, number>();
      const jobs = wb.getWorksheet("Quotations & Jobs");
      if (jobs) {
        const jh = headerMap(jobs);
        const jClient = jh.get("Client");
        const jType = jh.get("Type");
        const jDate = jh.get("Date");
        if (jClient && jType && jDate) {
          jobs.eachRow((row, n) => {
            if (n === 1) return;
            const client = cellText(row.getCell(jClient).value).toLowerCase();
            if (!client) return;
            if (!/won|bill|invoice/i.test(cellText(row.getCell(jType).value))) return;
            const y = cellYear(row.getCell(jDate).value);
            if (y) wonYear.set(client, Math.max(wonYear.get(client) ?? 0, y));
          });
        }
      }

      const ch = headerMap(clients);
      const need = (name: string): number => {
        const c = ch.get(name);
        if (!c) throw new Error(`Column "${name}" not found in "Client List".`);
        return c;
      };
      const cClient = need("Client");
      const cStatus = need("Status");
      const cJobs = need("Jobs Won (PO)");
      const cBills = need("Bills");
      const cSvc = need("Service Lines");
      const cCat = ch.get("Category");
      const cLast = ch.get("Last Activity");
      const cLastFy = ch.get("Last FY");

      const records: CanonicalProject[] = [];
      const skipped: SkippedRow[] = [];
      const seen = new Set<string>();
      let rowsRead = 0;

      clients.eachRow((row, n) => {
        if (n === 1) return;
        const client = cellText(row.getCell(cClient).value);
        if (!client) return; // blank spacer row — not counted
        rowsRead++;

        const status = cellText(row.getCell(cStatus).value);
        const elig = evaluateEligibility({
          status,
          jobsWon: cellNum(row.getCell(cJobs).value),
          bills: cellNum(row.getCell(cBills).value),
        });
        if (!elig.eligible) {
          skipped.push({ reason: elig.reason });
          return;
        }

        const importKey = hashKey(client);
        if (seen.has(importKey)) {
          skipped.push({ reason: "duplicate client" });
          return;
        }
        seen.add(importKey);

        const rawServiceLines = cellText(row.getCell(cSvc).value);
        const { services, proposed } = mapServiceLines(rawServiceLines);
        const category = cCat ? cellText(row.getCell(cCat).value) || undefined : undefined;
        const year =
          wonYear.get(client.toLowerCase()) ??
          (cLast ? cellYear(row.getCell(cLast).value) : undefined) ??
          (cLastFy ? cellYear(row.getCell(cLastFy).value) : undefined);

        const primary = PRIORITY.find((s) => services.includes(s));
        const primaryLabel = primary ? CANONICAL_SERVICES[primary] : (proposed[0] ?? "Engineering");
        const title = `${primaryLabel} project${year ? ` (${year})` : ""}`;

        records.push({
          importKey,
          title,
          clientName: client,
          clientPublic: false,
          sector: "TODO",
          services,
          proposedServices: proposed,
          year,
          category,
          rawServiceLines: rawServiceLines || undefined,
          source: "excel",
        });
      });

      return { records, skipped, rowsRead };
    },
  };
}
