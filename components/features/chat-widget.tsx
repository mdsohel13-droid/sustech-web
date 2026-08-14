"use client";

import { useEffect } from "react";

const WEBHOOK_URL = process.env.NEXT_PUBLIC_CHAT_N8N_ENDPOINT!;
const WIDGET_SECRET = process.env.NEXT_PUBLIC_CHAT_WIDGET_SECRET!;

export function ChatWidget() {
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    async function init() {
      try {
        const { createChat } = await import("@n8n/chat");

        const app = createChat({
          webhookUrl: WEBHOOK_URL,
          mode: "window",
          showWelcomeScreen: true,
          initialMessages: ["Hello! Welcome to Sustech Technology Ltd. How can I help you today?"],
          metadata: {
            secret: WIDGET_SECRET,
          },
          i18n: {
            en: {
              title: "Sustech Assistant",
              subtitle: "Ask us anything about our services",
              footer: "",
              getStarted: "Get Started",
              inputPlaceholder: "Type your message...",
              closeButtonTooltip: "Close chat",
            },
          },
        });

        const el = document.createElement("div");
        el.id = "sustech-chat";
        document.body.appendChild(el);
        app.mount(el);

        cleanup = () => {
          app.unmount();
          el.remove();
        };
      } catch (err) {
        console.error("Chat widget failed to load:", err);
      }
    }

    init();

    return () => cleanup?.();
  }, []);

  return null;
}
