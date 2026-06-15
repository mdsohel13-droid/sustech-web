"use client";

/**
 * Client wrapper for ChatWidget.
 *
 * ChatWidget is server-render-safe (its only browser-API access — localStorage,
 * canvas — is guarded behind a `typeof window` check / runs in event handlers),
 * so it renders with the route bundle and hydrates like any other client
 * component. We deliberately do NOT load it via `next/dynamic({ ssr:false })`:
 * an ssr:false widget exists only after the browser fetches and (in dev)
 * compiles a separate chunk on demand, which under CI's constrained headless
 * Chromium could exceed the test timeout — the launcher button simply never
 * appeared. Rendering it with the route keeps the button in the initial HTML
 * (better UX too: it's visible immediately, no pop-in).
 */
import { ChatWidget } from "@/components/chat/chat-widget";

interface ChatWidgetLoaderProps {
  services: string[];
  phone?: string;
  /** CMS-driven starter chips + quote-scale options (fall back to defaults if empty). */
  suggestions?: string[];
  scales?: string[];
}

export function ChatWidgetLoader({ services, phone, suggestions, scales }: ChatWidgetLoaderProps) {
  return <ChatWidget services={services} phone={phone} suggestions={suggestions} scales={scales} />;
}
