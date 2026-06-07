import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * Validated, typed env — import this instead of process.env throughout the app.
 * Required vars throw at startup if missing; optional ones return undefined.
 * next.config.ts and payload.config.ts run before this module loads, so they
 * continue to read process.env directly.
 */
export const env = createEnv({
  server: {
    SITE_URL: z.url().optional(),
    SITE_INDEXABLE: z.string().default("false"),
    DATABASE_URI: z.string().min(1),
    PAYLOAD_SECRET: z.string().min(1),
    PREVIEW_SECRET: z.string().optional(),
    CHAT_WEBHOOK_URL: z.url().optional(),
    SEED_ADMIN_EMAIL: z.email().optional(),
    SEED_ADMIN_PASSWORD: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_SERVER_URL: z.url().optional(),
  },
  // Next.js 16 statically replaces NEXT_PUBLIC_* at build time; only those
  // vars need to be listed here. Server vars are read directly from process.env.
  experimental__runtimeEnv: {
    NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
