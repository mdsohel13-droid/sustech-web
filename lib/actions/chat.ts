"use server";

import { headers } from "next/headers";
import { getPayloadClient } from "@/lib/payload";

/**
 * Web-chat lead handler (Brief Part 15). The client widget calls this server
 * action with a structured enquiry. It validates + rate-limits, forwards to the
 * n8n webhook (best-effort), and always captures the lead as an RFQ so nothing
 * is lost if n8n is down. No LLM runs here — it routes a structured enquiry only.
 */

export interface ChatLead {
  intent?: string;
  service?: string;
  scale?: string;
  location?: string;
  name?: string;
  phone?: string;
  message?: string;
  company_website?: string; // honeypot
}

const hits = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 8;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

const str = (v: unknown, max: number): string =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

export async function submitChat(lead: ChatLead): Promise<{ ok: boolean }> {
  // Honeypot — real users never fill this.
  if (str(lead.company_website, 100) !== "") return { ok: true };

  const intent = str(lead.intent, 40) || "general";
  const service = str(lead.service, 120);
  const scale = str(lead.scale, 60);
  const location = str(lead.location, 160);
  const name = str(lead.name, 120);
  const phone = str(lead.phone, 60);
  const message = str(lead.message, 2000);

  if (!service && !message && !phone) return { ok: false };

  const hdrs = await headers();
  const ip = (hdrs.get("x-forwarded-for") ?? "").split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) return { ok: false };

  const summary = [
    `Web-chat enquiry: ${intent}`,
    service && `Service: ${service}`,
    scale && `Scale: ${scale}`,
    location && `Location: ${location}`,
    phone && `Phone: ${phone}`,
    message && `Notes: ${message}`,
  ]
    .filter(Boolean)
    .join("\n");

  // Forward to n8n (best-effort; never block the user if it fails or is unset).
  const webhook = process.env.CHAT_WEBHOOK_URL;
  if (webhook) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intent,
          service,
          scale,
          location,
          name,
          phone,
          message,
          source: "web-chat",
        }),
        signal: AbortSignal.timeout(5000),
      });
    } catch {
      /* n8n unreachable — the lead is still captured below */
    }
  }

  // Always capture as a lead.
  try {
    const payload = await getPayloadClient();
    await payload.create({
      collection: "rfq-requests",
      overrideAccess: true,
      data: {
        name: name || "Website chat visitor",
        phone: phone || undefined,
        serviceInterest: service || undefined,
        location: location || undefined,
        message: summary,
        status: "new",
        sourcePath: "/chat",
      },
    });
  } catch {
    /* storage failed but n8n may have it — still return ok */
  }

  return { ok: true };
}
