"use client";

/**
 * CalculatorShell — shared wrapper for all interactive calculators.
 *
 * Provides:
 *  - Two-column layout (inputs left, results right → stacks on mobile)
 *  - Engineering disclaimer
 *  - Clear all / reset button
 *  - Consistent heading, description
 *  - Accessible form with visible focus rings
 *
 * Usage:
 *   <CalculatorShell
 *     title="Solar ROI Calculator"
 *     description="Estimate the return on investment for a rooftop solar installation."
 *     inputs={<YourInputFields />}
 *     results={<YourResultCards />}
 *     hasResults={someResult !== null}
 *     onReset={handleReset}
 *   />
 */

import type { ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { EmailReportGate, type ReportPayload } from "./email-report-gate";

interface CalculatorShellProps {
  title: string;
  description?: string;
  /** Left / top column: form inputs */
  inputs: ReactNode;
  /** Right / bottom column: result panels (shown after calculation) */
  results: ReactNode;
  /** Whether results are currently visible */
  hasResults: boolean;
  /** Called when the Reset button is clicked */
  onReset: () => void;
  /**
   * When present and results are showing, renders the "email me this report"
   * lead-capture gate below the results (master plan §3.3). Results stay fully
   * visible regardless — the gate is the emailed report, not the answer.
   */
  reportPayload?: ReportPayload | null;
}

export function CalculatorShell({
  title,
  description,
  inputs,
  results,
  hasResults,
  onReset,
  reportPayload,
}: CalculatorShellProps) {
  return (
    <div className="w-full">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h2 className="text-h2 text-ink-900 font-bold">{title}</h2>
        {description && (
          <p className="text-text-soft mt-2 max-w-2xl text-[0.9375rem]">{description}</p>
        )}
      </div>

      {/* ── Main grid ──────────────────────────────────────────────────── */}
      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        {/* Inputs */}
        <div>
          <div className="bg-surface-2 border-border rounded-xl border p-6">{inputs}</div>

          {hasResults && (
            <button
              type="button"
              onClick={onReset}
              className="text-text-soft hover:text-ink-900 focus-visible:outline-brand mt-4 flex items-center gap-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden />
              Reset
            </button>
          )}
        </div>

        {/* Results */}
        <div aria-live="polite" aria-atomic="true">
          {hasResults ? (
            <div className="space-y-4">{results}</div>
          ) : (
            <div className="border-border bg-surface-2 flex h-full min-h-48 items-center justify-center rounded-xl border border-dashed">
              <p className="text-text-soft text-sm">
                Results will appear here after you calculate.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Lead-capture gate (results stay visible above) ───────────────── */}
      {hasResults && reportPayload && <EmailReportGate payload={reportPayload} />}

      {/* ── Disclaimer ─────────────────────────────────────────────────── */}
      <p className="text-text-soft border-border mt-8 flex items-start gap-2 border-t pt-4 text-xs">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" aria-hidden />
        <span>
          <strong>For estimation purposes only.</strong> Results are indicative and based on
          simplified engineering models. Always consult a qualified engineer before making design or
          investment decisions. Sustech Technology Ltd accepts no liability for decisions made based
          on these calculations.
        </span>
      </p>
    </div>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────

interface InputGroupProps {
  label: string;
  hint?: string;
  children: ReactNode;
}

export function InputGroup({ label, hint, children }: InputGroupProps) {
  return (
    <div className="mb-5">
      <label className="text-ink-800 mb-1.5 block text-sm font-semibold">{label}</label>
      {children}
      {hint && <p className="text-text-soft mt-1 text-xs">{hint}</p>}
    </div>
  );
}

interface NumberInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  unit?: string;
}

export function NumberInput({ unit, className = "", ...props }: NumberInputProps) {
  return (
    <div className="relative">
      <input
        type="number"
        className={`border-border bg-surface focus-visible:outline-brand w-full rounded-lg border px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 ${unit ? "pr-12" : ""} ${className}`}
        {...props}
      />
      {unit && (
        <span className="text-text-soft pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm">
          {unit}
        </span>
      )}
    </div>
  );
}

interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { label: string; value: string }[];
}

export function SelectInput({ options, className = "", ...props }: SelectInputProps) {
  return (
    <select
      className={`border-border bg-surface focus-visible:outline-brand w-full rounded-lg border px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 ${className}`}
      {...props}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

interface CalcButtonProps {
  onClick: () => void;
  children?: ReactNode;
}

export function CalcButton({ onClick, children = "Calculate" }: CalcButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-brand hover:bg-brand-dark focus-visible:outline-brand mt-6 w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      {children}
    </button>
  );
}

interface ResultCardProps {
  label: string;
  value: string;
  subtext?: string;
  highlight?: boolean;
}

export function ResultCard({ label, value, subtext, highlight }: ResultCardProps) {
  return (
    <div
      className={`rounded-xl border p-5 ${
        highlight ? "border-brand/30 bg-brand/5 shadow-sm" : "border-border bg-surface"
      }`}
    >
      <p className="text-text-soft text-xs font-medium tracking-widest uppercase">{label}</p>
      <p
        className={`mt-1 text-2xl font-bold tracking-tight ${
          highlight ? "text-brand" : "text-ink-900"
        }`}
      >
        {value}
      </p>
      {subtext && <p className="text-text-soft mt-1 text-xs">{subtext}</p>}
    </div>
  );
}
