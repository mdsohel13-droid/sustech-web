import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://127.0.0.1:4123",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // Port 3000 is reserved on some Windows hosts (WinNAT excluded port range),
    // so the server for e2e binds 4123. CI/Linux is unaffected.
    //
    // In CI run against the PRODUCTION build (`pnpm start`): the dev server
    // compiles each route on first hit, and under CI CPU load that first-compile
    // latency makes ssr:false widgets (the chat launcher) and heavy routes
    // (/projects) flake on the initial assertion. A prod build is precompiled and
    // deterministic. The CI workflow runs `pnpm build` immediately before e2e.
    // Locally keep `pnpm dev` for fast iteration.
    command: process.env.CI
      ? "pnpm start --port 4123 --hostname 127.0.0.1"
      : "pnpm dev --port 4123 --hostname 127.0.0.1",
    url: "http://127.0.0.1:4123",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
