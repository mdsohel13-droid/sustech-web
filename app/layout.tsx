import type { Metadata } from "next";
import "@/styles/globals.css";
import { cabinet, switzer, jetbrains } from "./fonts";

const siteUrl = process.env.SITE_URL ?? "https://beta.sustechltd.com";
// Beta safety: stay noindex until the production cutover flips SITE_INDEXABLE=true.
const indexable = process.env.SITE_INDEXABLE === "true";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Sustech Technology Ltd — Industrial EPC Engineering",
    template: "%s · Sustech Technology Ltd",
  },
  description:
    "Single-point EPC for industrial power, solar & safety — engineered to IEC, BNBC & NFPA. " +
    "Serving corporate, commercial & industrial clients in Bangladesh.",
  robots: indexable ? undefined : { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${cabinet.variable} ${switzer.variable} ${jetbrains.variable}`}>
      <body>{children}</body>
    </html>
  );
}
