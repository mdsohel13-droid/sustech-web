"use server";

import { headers } from "next/headers";
import { getPayloadClient } from "@/lib/payload";
import { isRateLimited } from "@/lib/rate-limit";

export type RfqState = {
  ok: boolean;
  errors?: Partial<Record<"name" | "email" | "message" | "form", string>>;
  values?: {
    name: string;
    company: string;
    email: string;
    phone: string;
    serviceInterest: string;
    location: string;
    message: string;
  };
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const str = (v: FormDataEntryValue | null, max: number): string =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

export async function submitRfq(_prev: RfqState, formData: FormData): Promise<RfqState> {
  // Honeypot: real users never fill this hidden field. Pretend success.
  if (str(formData.get("company_website"), 200) !== "") return { ok: true };

  const values = {
    name: str(formData.get("name"), 120),
    company: str(formData.get("company"), 160),
    email: str(formData.get("email"), 200),
    phone: str(formData.get("phone"), 60),
    serviceInterest: str(formData.get("serviceInterest"), 160),
    location: str(formData.get("location"), 160),
    message: str(formData.get("message"), 5000),
  };

  const errors: NonNullable<RfqState["errors"]> = {};
  if (values.name.length < 2) errors.name = "Please enter your name.";
  if (!EMAIL_RE.test(values.email)) errors.email = "Please enter a valid email address.";
  if (values.message.length < 5) errors.message = "Please tell us a little about your project.";
  if (Object.keys(errors).length > 0) return { ok: false, errors, values };

  const hdrs = await headers();
  const ip = (hdrs.get("x-forwarded-for") ?? "").split(",")[0]?.trim() || "unknown";
  if (await isRateLimited(ip, "rfq", 5, "10 m")) {
    return { ok: false, errors: { form: "Too many requests. Please try again shortly." }, values };
  }

  try {
    const payload = await getPayloadClient();
    await payload.create({
      collection: "rfq-requests",
      overrideAccess: true,
      data: {
        name: values.name,
        company: values.company || undefined,
        email: values.email,
        phone: values.phone || undefined,
        serviceInterest: values.serviceInterest || undefined,
        location: values.location || undefined,
        message: values.message,
        status: "new",
        sourcePath: str(formData.get("sourcePath"), 200) || undefined,
      },
    });
    return { ok: true };
  } catch {
    return {
      ok: false,
      errors: { form: "Something went wrong submitting your request. Please try again." },
      values,
    };
  }
}
