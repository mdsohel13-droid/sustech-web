import { expect, test } from "@playwright/test";

// Use name-attribute locators rather than getByLabel: the required "*" inside
// each <label> (aria-hidden) makes the accessible name ambiguous across Chromium
// builds, so label-text matching is not portable here.

test.describe("Request a Consultation (RFQ)", () => {
  test("renders the form server-side with one h1", async ({ page }) => {
    const res = await page.goto("/request-quote");
    expect(res?.status()).toBe(200);
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toHaveCount(1);
    await expect(h1).toHaveText("Request a Consultation");
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('textarea[name="message"]')).toBeVisible();
  });

  test("shows server-side validation errors on empty submit", async ({ page }) => {
    await page.goto("/request-quote");
    await page.getByRole("button", { name: "Request a Consultation" }).click();
    await expect(page.getByText("Please enter your name.")).toBeVisible();
    await expect(page.getByText("Please enter a valid email address.")).toBeVisible();
  });

  test("submits a valid request and shows a thank-you", async ({ page }) => {
    await page.goto("/request-quote");
    await page.locator('input[name="name"]').fill("Test Engineer");
    await page.locator('input[name="email"]').fill("test@example.com");
    await page
      .locator('textarea[name="message"]')
      .fill("Need a rooftop solar plant scoped for a 5000 sqm factory.");
    await page.getByRole("button", { name: "Request a Consultation" }).click();
    await expect(page.getByText("Thank you — request received.")).toBeVisible();
  });
});
