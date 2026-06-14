"use client";

/**
 * Gated-asset form (master plan §3.3). The asset's summary stays open and
 * indexable (rendered by the server block); only the file download sits behind
 * this short form, which captures a consented lead and returns a signed 24-hour
 * link. `gateLevel` controls whether company is required.
 */

import { Download, FileText, Lock } from "lucide-react";
import { useId, useState } from "react";
import { getUtm } from "@/lib/analytics/client";
import { captureGatedLead } from "@/lib/actions/gated";

interface Props {
  resourceId: number | string;
  gateLevel: "email" | "email-company";
  downloadLabel?: string | null;
  fileFormat?: string | null;
  fileSize?: string | null;
  segment?: string;
}

export function GatedAssetForm({
  resourceId,
  gateLevel,
  downloadLabel,
  fileFormat,
  fileSize,
  segment,
}: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [optIn, setOptIn] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "ready" | "error">("idle");
  const [url, setUrl] = useState<string | null>(null);
  const id = useId();
  const needCompany = gateLevel === "email-company";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending" || !email.trim() || (needCompany && !company.trim())) return;
    setStatus("sending");
    try {
      const res = await captureGatedLead({
        resourceId,
        name,
        email,
        company,
        segment,
        marketingOptIn: optIn,
        sourcePath: typeof window !== "undefined" ? window.location.pathname : undefined,
        utm: getUtm(),
        company_website: honeypot,
      });
      if (res.ok && res.downloadUrl) {
        setUrl(res.downloadUrl);
        setStatus("ready");
      } else if (res.ok) {
        // Configured without a download secret — lead captured, link emailed later.
        setStatus("ready");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "ready") {
    return (
      <div className="border-brand/30 bg-brand/5 rounded-xl border p-5">
        <p className="text-ink-900 font-semibold">Your download is ready.</p>
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener"
            className="bg-brand hover:bg-brand-600 ease-standard mt-3 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors"
          >
            <Download className="h-4 w-4" aria-hidden /> {downloadLabel || "Download"}
          </a>
        ) : (
          <p className="text-text-soft mt-1 text-sm">
            We&apos;ve emailed your download link to {email}.
          </p>
        )}
        <p className="text-text-soft mt-2 text-xs">Link valid for 24 hours.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="border-border bg-surface-2 rounded-xl border p-5">
      <p className="text-ink-900 flex items-center gap-2 font-semibold">
        <Lock className="text-brand h-4 w-4" aria-hidden /> Get the {downloadLabel || "download"}
      </p>
      {(fileFormat || fileSize) && (
        <p className="text-text-soft mt-1 flex items-center gap-1.5 text-xs">
          <FileText className="h-3.5 w-3.5" aria-hidden />
          {[fileFormat?.toUpperCase(), fileSize].filter(Boolean).join(" · ")}
        </p>
      )}
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
          placeholder={needCompany ? "Company (required)" : "Company"}
          required={needCompany}
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
          Email me occasional Sustech insights. Optional — you&apos;ll get this download either way.
        </span>
      </label>
      <button
        type="submit"
        disabled={status === "sending"}
        className="bg-brand hover:bg-brand-600 ease-standard mt-4 w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60"
        id={`${id}-submit`}
      >
        {status === "sending" ? "Preparing…" : `Get the ${downloadLabel || "download"}`}
      </button>
      {status === "error" && (
        <p role="alert" className="mt-2 text-xs text-red-700">
          Something went wrong — please try again.
        </p>
      )}
      <p className="text-text-soft mt-2 text-[11px]">
        We use your details only to send this asset and follow up about your enquiry.
      </p>
    </form>
  );
}
