/**
 * /reports/[leadId]/[token] (Lead Engine master plan §3.3) — the persistent,
 * print-styled "PDF" report a calculator lead can revisit and the owner's email
 * links to. Gated by a signed 30-day token (lib/report-token), noindex, no PDF
 * library — just print-friendly server-rendered HTML.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PrintButton } from "@/components/ui/print-button";
import { getPayloadClient } from "@/lib/payload";
import { verifyReport } from "@/lib/report-token";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: { absolute: "Your Sustech report" },
};

const LABELS: Record<string, string> = {
  loadKw: "Backed-up load (kW)",
  outageHoursPerDay: "Outage hours / day",
  daysPerMonth: "Operating days / month",
  rateClass: "Grid rate class",
  units: "Units (ATMs / loads)",
  loadWattsPerUnit: "Load per unit (W)",
  backupMinutes: "Backup time (min)",
  revenuePerHour: "Lost value / hour (BDT)",
  outageHoursPerMonth: "Outage hours / month",
  idleStaffCostPerHour: "Idle staff cost / hour (BDT)",
  backupKwhPerMonth: "Backup energy / month (kWh)",
};

function humanize(k: string): string {
  return LABELS[k] ?? k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}

function fmt(v: unknown): string {
  if (v == null) return "—";
  if (typeof v === "number") return new Intl.NumberFormat("en-BD").format(v);
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    if ("low" in o && "high" in o) return `BDT ${fmt(o.low)} – ${fmt(o.high)}`;
    return Object.entries(o)
      .map(([k, val]) => `${humanize(k)}: ${fmt(val)}`)
      .join("; ");
  }
  return String(v);
}

function Rows({ obj }: { obj: Record<string, unknown> }) {
  return (
    <table className="w-full border-collapse text-sm">
      <tbody>
        {Object.entries(obj).map(([k, v]) => (
          <tr key={k} className="border-border border-b">
            <td className="text-text-soft py-1.5 pr-4">{humanize(k)}</td>
            <td className="text-ink-900 py-1.5 text-right font-medium">{fmt(v)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default async function ReportPage({
  params,
}: {
  params: Promise<{ leadId: string; token: string }>;
}) {
  const { leadId, token } = await params;
  if (!verifyReport(leadId, decodeURIComponent(token))) notFound();

  interface LeadReport {
    name?: string | null;
    company?: string | null;
    calcPayload?: unknown;
  }
  let lead: LeadReport | null = null;
  try {
    const payload = await getPayloadClient();
    const doc = await payload.findByID({
      collection: "leads",
      id: leadId,
      depth: 0,
      overrideAccess: true,
    });
    lead = doc as unknown as LeadReport;
  } catch {
    notFound();
  }
  if (!lead || !lead.calcPayload) notFound();

  const payloadData = lead.calcPayload as {
    title?: string;
    calculator?: string;
    inputs?: Record<string, unknown>;
    result?: Record<string, unknown>;
  };
  const inputs = payloadData.inputs ?? {};
  const result = payloadData.result ?? {};

  return (
    <main className="mx-auto max-w-2xl px-5 py-10 print:py-0">
      <header className="border-border mb-8 flex items-center justify-between border-b pb-5">
        <div>
          <p className="text-brand text-lg font-bold">Sustech Technology Ltd</p>
          <p className="text-text-soft text-sm">Smart Energy · Strong Engineering</p>
        </div>
        <PrintButton className="border-border hover:bg-surface-2 rounded-md border px-3 py-1.5 text-sm font-medium print:hidden" />
      </header>

      <h1 className="text-h2 text-ink-900 font-bold text-balance">
        {payloadData.title ?? "Your estimate"}
      </h1>
      {lead.name && (
        <p className="text-text-soft mt-2">
          Prepared for <span className="text-ink-900 font-medium">{lead.name}</span>
          {lead.company ? `, ${lead.company}` : ""}.
        </p>
      )}

      {Object.keys(inputs).length > 0 && (
        <section className="mt-8">
          <h2 className="text-ink-900 mb-2 text-sm font-semibold tracking-widest uppercase">
            Your inputs
          </h2>
          <Rows obj={inputs} />
        </section>
      )}

      {Object.keys(result).length > 0 && (
        <section className="mt-8">
          <h2 className="text-ink-900 mb-2 text-sm font-semibold tracking-widest uppercase">
            Indicative results
          </h2>
          <Rows obj={result} />
        </section>
      )}

      <p className="border-border text-text-soft mt-8 border-t pt-4 text-xs">
        <strong>Indicative estimate — not a quote or guarantee.</strong> Based on the values you
        entered and Sustech&apos;s cited 2026 reference rates. Actual figures depend on a site
        assessment.
      </p>

      <div className="bg-surface-2 mt-6 rounded-xl p-5 text-center print:hidden">
        <p className="text-ink-900 font-semibold">Want the exact numbers for your site?</p>
        <Link
          href="/request-quote"
          className="bg-brand hover:bg-brand-600 mt-3 inline-block rounded-lg px-5 py-2.5 text-sm font-semibold text-white"
        >
          Request a free assessment
        </Link>
        <p className="text-text-soft mt-3 text-sm">
          Or call +880 1722 00 21 25 · www.sustechltd.com
        </p>
      </div>
    </main>
  );
}
