"use client";

import { MessageSquare, X } from "lucide-react";
import Link from "next/link";
import { useId, useState, useTransition } from "react";
import { submitChat } from "@/lib/actions/chat";
import { Skeleton } from "@/components/ui/skeleton";

type Stage = "home" | "quote" | "info" | "done";
const SCALES = ["< 10 Lakh", "10–50 Lakh", "50 Lakh – 1 Crore", "1 Crore+", "Not sure"];

const fieldClass =
  "border-border bg-surface focus-visible:border-brand focus-visible:outline-brand w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:outline-2";

export function ChatWidget({ services, phone }: { services: string[]; phone?: string | null }) {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<Stage>("home");
  const [intent, setIntent] = useState("Get a quote");
  const [info, setInfo] = useState<{ text: string; href?: string; cta?: string } | null>(null);
  const [service, setService] = useState("");
  const [scale, setScale] = useState("");
  const [location, setLocation] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [pending, startTransition] = useTransition();
  const titleId = useId();
  const tel = (phone ?? "").replace(/\s+/g, "");

  function reset() {
    setStage("home");
    setService("");
    setScale("");
    setLocation("");
    setContactPhone("");
    setInfo(null);
  }

  function pickIntent(value: string) {
    setIntent(value);
    if (value === "Get a quote" || value === "Request inspection") {
      if (value === "Request inspection") setService("Inspection, Testing & Thermography");
      setStage("quote");
    } else if (value === "Learn about solar") {
      setInfo({
        text: "Sustech delivers on-grid, off-grid and hybrid solar EPC from 1 kWp to utility scale.",
        href: "/services/solar-renewable",
        cta: "Explore solar & renewable energy",
      });
      setStage("info");
    } else {
      setInfo({
        text: "We'd be glad to help. Reach the team here:",
        href: "/contact",
        cta: "Contact us",
      });
      setStage("info");
    }
  }

  function send() {
    startTransition(async () => {
      await submitChat({ intent, service, scale, location, phone: contactPhone });
      setStage("done");
    });
  }

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-labelledby={titleId}
          className="border-border bg-surface fixed right-5 bottom-24 z-50 flex max-h-[70vh] w-[min(92vw,360px)] flex-col overflow-hidden rounded-xl border shadow-lg"
        >
          <div className="bg-ink-900 text-text-invert flex items-center justify-between px-4 py-3">
            <p id={titleId} className="text-sm font-semibold">
              Sustech assistant
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="text-text-invert-soft hover:text-text-invert"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
            <p className="text-text-soft">
              Hi! I&rsquo;m Sustech&rsquo;s assistant. How can I help?
            </p>

            {stage === "home" && (
              <div className="grid gap-2">
                {["Get a quote", "Learn about solar", "Contact the team", "Request inspection"].map(
                  (o) => (
                    <button
                      key={o}
                      type="button"
                      onClick={() => pickIntent(o)}
                      className="border-border hover:border-brand/40 hover:text-brand rounded-md border px-3 py-2 text-left font-medium"
                    >
                      {o}
                    </button>
                  ),
                )}
              </div>
            )}

            {stage === "info" && info && (
              <div className="space-y-3">
                <p className="text-text-soft">{info.text}</p>
                {info.href && (
                  <Link
                    href={info.href}
                    prefetch={false}
                    onClick={() => setOpen(false)}
                    className="text-brand block font-medium underline-offset-4 hover:underline"
                  >
                    {info.cta}
                  </Link>
                )}
                <button type="button" onClick={reset} className="text-text-soft text-xs underline">
                  ← Back
                </button>
              </div>
            )}

            {stage === "quote" && (
              <div className="space-y-3">
                <label className="block">
                  <span className="text-ink-900 mb-1 block text-xs font-semibold">Service</span>
                  <select
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className={fieldClass}
                  >
                    <option value="">Select…</option>
                    {services.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                    <option value="Multiple / Not sure">Multiple / Not sure</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-ink-900 mb-1 block text-xs font-semibold">
                    Project scale
                  </span>
                  <select
                    value={scale}
                    onChange={(e) => setScale(e.target.value)}
                    className={fieldClass}
                  >
                    <option value="">Select…</option>
                    {SCALES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-ink-900 mb-1 block text-xs font-semibold">Location</span>
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className={fieldClass}
                    placeholder="City / site"
                  />
                </label>
                <label className="block">
                  <span className="text-ink-900 mb-1 block text-xs font-semibold">
                    Your phone (so we can call back)
                  </span>
                  <input
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className={fieldClass}
                    inputMode="tel"
                  />
                </label>
                <button
                  type="button"
                  onClick={send}
                  disabled={pending || (!service && !contactPhone)}
                  className="bg-solar text-solar-text hover:bg-solar-600 ease-standard w-full rounded-md px-4 py-2 text-sm font-semibold transition-[background-color,opacity] duration-[var(--duration-base)] disabled:opacity-60"
                >
                  {pending ? "Sending…" : "Send to an engineer"}
                </button>

                {/* Real async area: skeleton placeholder while the lead is forwarded to n8n. */}
                {pending && (
                  <div aria-live="polite" className="space-y-2 pt-1">
                    <p className="text-text-soft text-xs">Connecting you to an engineer…</p>
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                )}
              </div>
            )}

            {stage === "done" && (
              <div className="space-y-2">
                <p className="text-ink-900 font-semibold">Thanks — request received.</p>
                <p className="text-text-soft">An engineer will get back to you shortly.</p>
              </div>
            )}
          </div>

          {tel && (
            <div className="border-border text-text-soft border-t px-4 py-2 text-xs">
              Prefer to talk?{" "}
              <a href={`tel:${tel}`} className="text-brand font-medium">
                Call {phone}
              </a>
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open chat assistant"}
        aria-expanded={open}
        className="ease-standard bg-brand fixed right-5 bottom-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-transform duration-[var(--duration-base)] hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-95"
      >
        {open ? (
          <X className="h-7 w-7" aria-hidden />
        ) : (
          <MessageSquare className="h-7 w-7" aria-hidden />
        )}
      </button>
    </>
  );
}
