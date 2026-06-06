import { expect, test } from "@playwright/test";

test.describe("About page", () => {
  test("is published and renders story, team and certifications", async ({ page }) => {
    const res = await page.goto("/about");
    expect(res?.status()).toBe(200);
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toHaveCount(1);
    await expect(page.getByRole("heading", { name: "Our story" })).toBeVisible();
    // Team grid is populated from the Team collection.
    await expect(page.getByRole("heading", { name: "Md. Sohel Sikder" })).toBeVisible();
    // The exact role text is admin-editable (CMS-driven). Match the stable prefix so
    // an admin's edit to "& CEO" / "& Founder" / etc. doesn't break the test.
    await expect(page.getByText(/Managing Director/i).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Certifications & credentials" })).toBeVisible();
  });

  test("team bio is hidden at rest and reveals below the role on hover and focus", async ({
    page,
  }) => {
    await page.goto("/about");
    const name = page.getByRole("heading", { name: "Md. Sohel Sikder" });
    await expect(name).toBeVisible();
    const card = name.locator("xpath=ancestor::li[1]");
    // The bio paragraph lives inside the expanding container below the role.
    const bio = card.getByText(/CUET graduate/i);
    const trigger = card.locator("[tabindex='0']").first();

    // At rest the bio is collapsed (transparent + nudged up); under prefers-reduced-motion
    // it would already be visible, so we run this test with motion enabled (Playwright default).
    await expect(bio).toHaveCSS("opacity", "0");

    // Hovering the card reveals the bio.
    await card.hover();
    await expect(bio).toHaveCSS("opacity", "1");

    // Move hover away → bio collapses; keyboard focus reveals it again.
    await page.mouse.move(0, 0);
    await expect(bio).toHaveCSS("opacity", "0");
    await trigger.focus();
    await expect(bio).toHaveCSS("opacity", "1");
  });
});
