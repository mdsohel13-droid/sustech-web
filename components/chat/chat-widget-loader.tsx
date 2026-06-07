"use client";

/**
 * Client-side loader for ChatWidget.
 *
 * next/dynamic with ssr:false cannot be used in a Server Component layout.
 * This thin client wrapper is the correct pattern: the Server Component
 * imports this file; dynamic() with ssr:false lives entirely in client space.
 */
import dynamic from "next/dynamic";

const ChatWidgetLazy = dynamic(
  () => import("@/components/chat/chat-widget").then((m) => m.ChatWidget),
  { ssr: false },
);

interface ChatWidgetLoaderProps {
  services: string[];
  phone?: string;
}

export function ChatWidgetLoader({ services, phone }: ChatWidgetLoaderProps) {
  return <ChatWidgetLazy services={services} phone={phone} />;
}
