"use client";

/**
 * EmailReportGate (Lead Engine master plan §3.3). The conversion step on every
 * calculator: results stay fully visible above this — the gate is the *emailed
 * report*, not the answer. A visitor who wants the detailed report leaves their
 * details; the unticked marketing checkbox is the ONLY place consent is granted.
 *
 * On submit → captureLead (server action) with the calc payload. No email is
 * sent from the web tier; n8n's lead-intake workflow delivers the report
 * (Phase 5). Until then the lead + its calcPayload are captured for follow-up,
 * and the visitor can print the page immediately.
 */

import { CheckCircle2, Printer } from "lucide-react";
import { useId, useState } from "react";
import { captureLead } from "@/lib/actions/lead";
import { getUtm } from "@/lib/analytics/client";

export interface ReportPayload {
  calculator: string; // calcType, e.g. "diesel-vs-bess"
  title: string;
  segment?: string;
  data: Record<string, unknown>; // inputs + outputs
}

export function EmailReportGate({ payload }: { payload: ReportPayload }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [optIn, setOptIn] = useState(false); // NEVER pre-ticked
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const formId = useId();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    if (!email.trim()) return;
    setStatus("sending");
    try {
      const res = await captureLead({
        source: "calculator",
        name,
        email,
        company,
        segment: payload.segment,
        sourcePath: typeof window !== "undefined" ? window.location.pathname : undefined,
        marketingOptIn: optIn,
        calcPayload: { calculator: payload.calculator, title: payload.title, ...payload.data },
        utm: getUtm(),
        company_website: honeypot,
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="border-brand/30 bg-brand/5 mt-6 rounded-xl border p-5">
        <p className="text-ink-900 flex items-center gap-2 font-semibold">
          <CheckCircle2 className="text-brand h-5 w-5" aria-hidden />
          Thanks — your report is on its way.
        </p>
        <p className="text-text-soft mt-1 text-sm">
          We&apos;ve recorded your details and an engineer can follow up with a tailored assessment.
          You can also print this page now.
        </p>
        <button
          type="button"
          onClick={() => window.print()}
          className="border-border hover:bg-surface-2 mt-3 inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium"
        >
          <Printer className="h-4 w-4" aria-hidden /> Print this report
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="border-border bg-surface-2 mt-6 rounded-xl border p-5"
      aria-labelledby={`${formId}-h`}
    >
      <p id={`${formId}-h`} className="text-ink-900 font-semibold">
        Email me this report
      </p>
      <p className="text-text-soft mt-1 text-sm">
        Get a detailed, sourced breakdown you can share with your team.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          autoComplete="name"
          aria-label="Your name"
          className="border-border bg-surface focus-visible:outline-brand rounded-lg border px-3 py-2 text-sm focus-visible:outline-2"
        />
        <input
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Company"
          autoComplete="organization"
          aria-label="Company"
          className="border-border bg-surface focus-visible:outline-brand rounded-lg border px-3 py-2 text-sm focus-visible:outline-2"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
          placeholder="Work email"
          autoComplete="email"
          aria-label="Work email"
          className="border-border bg-surface focus-visible:outline-brand rounded-lg border px-3 py-2 text-sm focus-visible:outline-2 sm:col-span-2"
        />
      </div>

      {/* Honeypot — visually hidden, real users never fill it */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        className="sr-only"
        aria-hidden
      />

      <label className="text-text-soft mt-3 flex items-start gap-2 text-xs">
        <input
          type="checkbox"
          checked={optIn}
          onChange={(e) => setOptIn(e.target.checked)}
          className="mt-0.5"
        />
        <span>
          Email me occasional Sustech insights on energy savings &amp; load-shedding solutions. You
          can unsubscribe anytime. (Optional — we&apos;ll send your report either way.)
        </span>
      </label>

      <button
        type="submit"
        disabled={status === "sending" || !email.trim()}
        className="bg-brand hover:bg-brand-600 ease-standard mt-4 w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Email me the report"}
      </button>
      {status === "error" && (
        <p role="alert" className="mt-2 text-xs text-red-700">
          Something went wrong — please try again, or call +880 1722 00 21 25.
        </p>
      )}
      <p className="text-text-soft mt-2 text-[11px]">
        We use your details only to send this report and follow up about your enquiry.
      </p>
    </form>
  );
}
