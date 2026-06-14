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
    // so the dev server for e2e binds 4123. CI/Linux is unaffected.
    command: "pnpm dev --port 4123 --hostname 127.0.0.1",
    url: "http://127.0.0.1:4123",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
