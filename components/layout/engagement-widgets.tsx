/**
 * EngagementWidgets — server component that reads the SiteSettings global
 * and conditionally renders the WhatsApp button and/or chatbot widget.
 *
 * Backwards compatibility:
 *  - If the CMS "Chat & Engagement" tab has NOT yet been configured, the
 *    component falls back to the legacy behaviour: WhatsApp shows if
 *    settings.phones[0] is set; Hermes chatbot is on by default.
 *  - Once an admin explicitly sets whatsapp.enabled = false or
 *    chatbot.enabled = false, the widget is hidden.
 *
 * Rendering rules:
 *  - WhatsApp button: pure anchor tag — zero JS, works without hydration.
 *  - Hermes chatbot: renders the existing <ChatWidgetLoader> client component.
 *  - Crisp: injects the Crisp SDK script in a <Script> tag.
 *  - Custom embed: injects the admin-supplied script safely via dangerouslySetInnerHTML
 *    (trusted source — comes from an authenticated admin save, not user input).
 *
 * Accessibility:
 *  - Both widgets have aria-label and are keyboard-focusable.
 *  - Both widgets are stacked so they never overlap.
 *
 * AI/SEO: neither widget hides content. They are purely engagement tools and
 * do not affect the crawlable HTML of the page.
 */
import Script from "next/script";
import { getSiteSettings, getServices } from "@/lib/payload";
import { ChatWidgetLoader } from "@/components/chat/chat-widget-loader";

export async function EngagementWidgets() {
  const [settings, services] = await Promise.all([getSiteSettings(), getServices()]);

  // ── WhatsApp ─────────────────────────────────────────────────────────────
  const wa = settings.whatsapp;
  // Backwards compat: if the CMS field is not yet configured (null/undefined),
  // fall back to settings.phones[0] — same as the old hardcoded WhatsAppFab.
  const legacyPhone = settings.phones?.[0]?.number ?? "";
  const waEnabled = wa?.enabled !== false && Boolean(wa?.number ?? legacyPhone);
  const waNumber = (wa?.number ?? legacyPhone).replace(/\D/g, "");
  const waMessage = wa?.prefilledMessage ?? "Hi Sustech, I'd like a quote for...";
  const waPos = wa?.position ?? "bottom-left";

  // ── Chatbot ───────────────────────────────────────────────────────────────
  const chat = settings.chatbot;
  // Backwards compat: if the CMS field is not yet configured, default to
  // showing the Hermes chatbot (as it was before).
  const chatEnabled = chat?.enabled !== false;
  const chatProvider = chat?.provider ?? "hermes";
  const chatPos = chat?.chatPosition ?? "bottom-right";

  const posClass = (pos: string) =>
    pos === "bottom-left" ? "left-5 bottom-5" : "right-5 bottom-5";

  return (
    <>
      {/* ── WhatsApp floating button ───────────────────────────────────── */}
      {waEnabled && waNumber && (
        <a
          href={`https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with us on WhatsApp"
          className={`fixed z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg ring-2 ring-white/20 transition hover:scale-105 hover:shadow-xl focus-visible:outline-offset-2 focus-visible:outline-[#25D366] ${posClass(waPos)}`}
        >
          {/* WhatsApp SVG icon — inline for zero-dependency rendering */}
          <svg viewBox="0 0 32 32" fill="currentColor" className="h-7 w-7" aria-hidden="true">
            <path d="M16.002 3C9.374 3 4 8.373 4 15c0 2.385.67 4.614 1.832 6.516L4 29l7.697-1.804A11.93 11.93 0 0016.002 28c6.628 0 12-5.373 12-12S22.63 3 16.002 3zm0 21.818a9.77 9.77 0 01-4.98-1.362l-.356-.212-3.696.867.937-3.588-.233-.37A9.77 9.77 0 016.182 15c0-5.42 4.4-9.818 9.82-9.818 5.42 0 9.818 4.398 9.818 9.818 0 5.42-4.398 9.818-9.818 9.818zm5.38-7.353c-.295-.148-1.748-.862-2.02-.96-.27-.099-.467-.148-.663.148-.196.295-.76.96-.932 1.157-.172.197-.344.222-.638.074-.295-.148-1.244-.459-2.37-1.462-.875-.78-1.467-1.745-1.639-2.04-.172-.295-.018-.454.13-.601.133-.132.295-.344.443-.516.148-.172.197-.295.296-.492.098-.197.049-.37-.025-.517-.074-.148-.663-1.6-.908-2.191-.24-.573-.484-.495-.663-.504l-.565-.01c-.196 0-.516.074-.786.37-.27.295-1.033 1.01-1.033 2.462 0 1.452 1.059 2.855 1.207 3.051.148.197 2.083 3.182 5.046 4.462.706.305 1.256.487 1.685.623.709.226 1.354.194 1.864.118.569-.085 1.748-.714 1.994-1.404.246-.69.246-1.282.172-1.405-.074-.122-.27-.197-.566-.345z" />
          </svg>
        </a>
      )}

      {/* ── Chatbot widget ─────────────────────────────────────────────── */}
      {chatEnabled && (
        <>
          {/* Hermes and n8n both resolve to the same brand-styled, open-ended
              assistant. It posts to the same-origin /api/chat route, which
              proxies to the configured n8n workflow (CHAT_N8N_ENDPOINT) —
              keeping the secret server-side and the call inside the strict CSP. */}
          {(chatProvider === "hermes" || chatProvider === "n8n") && (
            <ChatWidgetLoader
              services={services.map((sv) => sv.title)}
              phone={settings.phones?.[0]?.number}
            />
          )}

          {chatProvider === "crisp" && chat?.crispWebsiteId && (
            <Script
              id="crisp-widget"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.$crisp=[];
                  window.CRISP_WEBSITE_ID="${chat.crispWebsiteId}";
                  (function(){var d=document;var s=d.createElement("script");
                  s.src="https://client.crisp.chat/l.js";
                  s.async=1;d.getElementsByTagName("head")[0].appendChild(s);})();
                  ${chatPos === "bottom-left" ? "window.$crisp.push(['config', 'position:reverse', [true]]);" : ""}
                `,
              }}
            />
          )}

          {chatProvider === "custom" && chat?.customScript && (
            <Script
              id="custom-chat-widget"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                // Custom scripts from the CMS are admin-entered — trusted source.
                // They are NOT user-submitted content.
                __html: chat.customScript
                  .replace(/<script[^>]*>/gi, "")
                  .replace(/<\/script>/gi, ""),
              }}
            />
          )}
        </>
      )}
    </>
  );
}
