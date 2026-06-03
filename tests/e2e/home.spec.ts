import { expect, test } from "@playwright/test";

test.describe("home page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders exactly one h1 with the real hero headline", async ({ page }) => {
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toHaveCount(1);
    await expect(h1).toHaveText("Single-point EPC for industrial power, solar and safety.");
  });

  test("primary navigation renders", async ({ page }) => {
    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(nav).toBeVisible();
    await expect(nav.getByRole("button", { name: "Solutions" })).toBeVisible();
    await expect(nav.getByRole("button", { name: "Services" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Projects" })).toBeVisible();
  });

  test("the Solutions mega-menu opens and reveals sector links", async ({ page }) => {
    const header = page.getByRole("banner");
    const trigger = header.getByRole("button", { name: "Solutions" });
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(header.getByRole("link", { name: "Power & Utilities" })).toBeVisible();
    // Escape closes it.
    await page.keyboard.press("Escape");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  test("the persistent primary CTA is present and focusable", async ({ page }) => {
    const cta = page.getByRole("banner").getByRole("link", { name: "Request a Consultation" });
    await expect(cta).toBeVisible();
    await cta.focus();
    await expect(cta).toBeFocused();
    await expect(cta).toHaveAttribute("href", "/request-quote");
  });
});
