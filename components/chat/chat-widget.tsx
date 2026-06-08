"use client";

import { ImagePlus, MessageSquare, Send, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { submitChat } from "@/lib/actions/chat";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; text: string; image?: string };
type Mode = "chat" | "quote" | "done";

const MAX_UPLOAD_BYTES = 12 * 1024 * 1024; // pre-compression guard

/**
 * Downscale (max 1280px on the long edge) and re-encode as JPEG so attachments
 * stay small and reliable to upload — a phone photo of a panel/bill is often
 * 4–8 MB; this brings it to a few hundred KB before it leaves the browser.
 */
async function compressImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const MAX = 1280;
  let { width, height } = bitmap;
  if (width > MAX || height > MAX) {
    const scale = Math.min(MAX / width, MAX / height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();
  return canvas.toDataURL("image/jpeg", 0.82);
}

const SCALES = ["< 10 Lakh", "10–50 Lakh", "50 Lakh – 1 Crore", "1 Crore+", "Not sure"];
const GREETING =
  "Hi! I’m Sustech’s assistant. Ask me anything about our solar, electrical, lightning-protection or safety work — or pick a quick option below.";
const SUGGESTIONS = [
  "Get a quote",
  "Solar for my factory",
  "What is lightning protection?",
  "Where are you located?",
];

const fieldClass =
  "border-border bg-surface focus-visible:border-brand focus-visible:outline-brand w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:outline-2";

/** Stable per-visitor id so the n8n workflow can keep conversation memory.
 *  The widget is client-only (loaded with ssr:false), so reading localStorage
 *  in a lazy initialiser is safe and avoids a setState-in-effect. */
function useUserRef() {
  const [ref] = useState(() => {
    if (typeof window === "undefined") return "web";
    let id = window.localStorage.getItem("stc_uid");
    if (!id) {
      id = "web-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
      window.localStorage.setItem("stc_uid", id);
    }
    return id;
  });
  return ref;
}

export function ChatWidget({ services, phone }: { services: string[]; phone?: string | null }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("chat");
  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", text: GREETING }]);
  const [input, setInput] = useState("");
  const [attachment, setAttachment] = useState<string | null>(null);
  const [imgError, setImgError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const userRef = useUserRef();
  const titleId = useId();
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const tel = (phone ?? "").replace(/\s+/g, "");

  // Quote-form state (lead capture — forwarded to n8n via the existing server action)
  const [service, setService] = useState("");
  const [scale, setScale] = useState("");
  const [location, setLocation] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [pending, startTransition] = useTransition();

  // Auto-scroll to the latest message
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, sending, mode]);

  async function ask(text: string, image?: string | null) {
    const q = text.trim();
    if ((!q && !image) || sending) return;
    setMessages((m) => [...m, { role: "user", text: q, image: image ?? undefined }]);
    setInput("");
    setAttachment(null);
    setSending(true);
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: q,
          user_ref: userRef,
          ...(image ? { image } : {}),
        }),
      });
      const data = (await r.json().catch(() => ({}))) as { answer?: string };
      setMessages((m) => [
        ...m,
        { role: "assistant", text: data.answer || "Sorry, I couldn’t answer that just now." },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: "I’m having trouble connecting — please try again, or use the Contact page.",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  async function onPickImage(file: File | undefined) {
    setImgError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setImgError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setImgError("That image is too large — please pick one under 12 MB.");
      return;
    }
    try {
      setAttachment(await compressImage(file));
    } catch {
      setImgError("Couldn’t read that image — please try another.");
    }
  }

  function onSuggestion(s: string) {
    if (s === "Get a quote") {
      setMode("quote");
      return;
    }
    void ask(s);
  }

  function sendQuote() {
    startTransition(async () => {
      await submitChat({ intent: "Get a quote", service, scale, location, phone: contactPhone });
      setMode("done");
    });
  }

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-labelledby={titleId}
          className="border-border bg-surface fixed right-5 bottom-24 z-50 flex h-[min(72vh,560px)] w-[min(92vw,380px)] flex-col overflow-hidden rounded-xl border shadow-lg"
        >
          {/* Header */}
          <div className="bg-ink-900 text-text-invert flex items-center justify-between px-4 py-3">
            <div>
              <p id={titleId} className="text-sm font-semibold">
                Sustech assistant
              </p>
              <p className="text-text-invert-soft text-[11px]">Usually replies in a few seconds</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="text-text-invert-soft hover:text-text-invert"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>

          {/* Body */}
          <div
            ref={scrollRef}
            className="bg-surface-2 flex-1 space-y-3 overflow-y-auto p-4 text-sm"
          >
            {mode === "quote" ? (
              <div className="bg-surface border-border space-y-3 rounded-lg border p-3">
                <p className="text-ink-900 font-semibold">Request a quote</p>
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
                  onClick={sendQuote}
                  disabled={pending || (!service && !contactPhone)}
                  className="bg-solar text-solar-text hover:bg-solar-600 ease-standard w-full rounded-md px-4 py-2 text-sm font-semibold transition-[background-color,opacity] duration-[var(--duration-base)] disabled:opacity-60"
                >
                  {pending ? "Sending…" : "Send to an engineer"}
                </button>
                <button
                  type="button"
                  onClick={() => setMode("chat")}
                  className="text-text-soft text-xs underline"
                >
                  ← Back to chat
                </button>
              </div>
            ) : mode === "done" ? (
              <div className="bg-surface border-border space-y-2 rounded-lg border p-3">
                <p className="text-ink-900 font-semibold">Thanks — request received.</p>
                <p className="text-text-soft">An engineer will get back to you shortly.</p>
                <button
                  type="button"
                  onClick={() => setMode("chat")}
                  className="text-brand text-xs font-medium underline"
                >
                  Ask another question
                </button>
              </div>
            ) : (
              <div aria-live="polite" className="space-y-3">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={cn(
                      "max-w-[85%] space-y-2 rounded-2xl px-3.5 py-2 whitespace-pre-wrap",
                      m.role === "user"
                        ? "bg-brand ml-auto rounded-br-sm text-white"
                        : "bg-surface border-border text-ink-900 rounded-bl-sm border",
                    )}
                  >
                    {m.image && (
                      <Image
                        src={m.image}
                        alt="Attached image"
                        width={240}
                        height={180}
                        unoptimized
                        className="h-auto max-h-48 w-auto rounded-lg object-contain"
                      />
                    )}
                    {m.text && <span>{m.text}</span>}
                  </div>
                ))}

                {sending && (
                  <div className="bg-surface border-border text-text-soft flex w-fit items-center gap-1 rounded-2xl rounded-bl-sm border px-3.5 py-2.5">
                    <span className="bg-text-soft h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:0ms]" />
                    <span className="bg-text-soft h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:120ms]" />
                    <span className="bg-text-soft h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:240ms]" />
                  </div>
                )}

                {messages.length <= 1 && !sending && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => onSuggestion(s)}
                        className="border-border bg-surface hover:border-brand/40 hover:text-brand rounded-full border px-3 py-1.5 text-xs font-medium transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Input (chat mode only) */}
          {mode === "chat" && (
            <div className="border-border border-t">
              {/* Attachment preview */}
              {attachment && (
                <div className="flex items-center gap-2 px-2 pt-2">
                  <div className="relative">
                    <Image
                      src={attachment}
                      alt="Attachment preview"
                      width={48}
                      height={48}
                      unoptimized
                      className="border-border h-12 w-12 rounded-md border object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setAttachment(null)}
                      aria-label="Remove image"
                      className="bg-ink-900 absolute -top-1.5 -right-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full text-white"
                    >
                      <X className="h-3 w-3" aria-hidden />
                    </button>
                  </div>
                  <span className="text-text-soft text-xs">Image attached</span>
                </div>
              )}
              {imgError && (
                <p role="alert" className="px-3 pt-2 text-xs text-red-700">
                  {imgError}
                </p>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void ask(input, attachment);
                }}
                className="flex items-center gap-1.5 p-2"
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="sr-only"
                  onChange={(e) => {
                    void onPickImage(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  aria-label="Attach an image"
                  className="text-text-soft hover:text-brand hover:bg-surface focus-visible:outline-brand inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition-colors focus-visible:outline-2"
                >
                  <ImagePlus className="h-5 w-5" aria-hidden />
                </button>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything, or attach a photo…"
                  aria-label="Type your message"
                  autoComplete="off"
                  className="focus-visible:outline-brand min-w-0 flex-1 rounded-md px-3 py-2 text-sm outline-none focus-visible:outline-2"
                />
                <button
                  type="submit"
                  disabled={sending || (!input.trim() && !attachment)}
                  aria-label="Send message"
                  className="bg-brand hover:bg-brand-600 ease-standard inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-white transition-colors disabled:opacity-50"
                >
                  <Send className="h-4 w-4" aria-hidden />
                </button>
              </form>
            </div>
          )}

          {tel && (
            <div className="border-border text-text-soft border-t px-4 py-2 text-xs">
              Prefer to talk?{" "}
              <a href={`tel:${tel}`} className="text-brand font-medium">
                Call {phone}
              </a>
            </div>
          )}

          {mode === "chat" && (
            <Link
              href="/request-quote"
              prefetch={false}
              onClick={() => setOpen(false)}
              className="sr-only"
            >
              Request a quote
            </Link>
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
