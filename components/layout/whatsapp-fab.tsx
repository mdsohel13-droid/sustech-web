import { MessageCircle } from "lucide-react";

/**
 * Floating WhatsApp button (Brief Part 9). Server component — a plain link, no
 * client JS. Hidden when no phone number is configured (no invented number).
 */
export function WhatsAppFab({ phone }: { phone?: string | null }) {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (!digits) return null;
  const href = `https://wa.me/${digits}?text=${encodeURIComponent(
    "Hi Sustech, I'd like a quote for...",
  )}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="ease-standard bg-energy fixed bottom-5 left-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-transform duration-[var(--duration-base)] hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-95"
    >
      <MessageCircle className="h-7 w-7" aria-hidden />
    </a>
  );
}
