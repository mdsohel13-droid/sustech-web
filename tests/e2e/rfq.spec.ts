import { expect, test } from "@playwright/test";

test.describe("Request a Consultation (RFQ)", () => {
  test("renders the form server-side with one h1", async ({ page }) => {
    const res = await page.goto("/request-quote");
    expect(res?.status()).toBe(200);
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toHaveCount(1);
    await expect(h1).toHaveText("Request a Consultation");
    await expect(page.getByLabel("Name", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Work email")).toBeVisible();
    await expect(page.getByLabel("About your project")).toBeVisible();
  });

  test("shows server-side validation errors on empty submit", async ({ page }) => {
    await page.goto("/request-quote");
    await page.getByRole("button", { name: "Request a Consultation" }).click();
    await expect(page.getByText("Please enter your name.")).toBeVisible();
    await expect(page.getByText("Please enter a valid email address.")).toBeVisible();
  });

  test("submits a valid request and shows a thank-you", async ({ page }) => {
    await page.goto("/request-quote");
    await page.getByLabel("Name", { exact: true }).fill("Test Engineer");
    await page.getByLabel("Work email").fill("test@example.com");
    await page
      .getByLabel("About your project")
      .fill("Need a rooftop solar plant scoped for a 5000 sqm factory.");
    await page.getByRole("button", { name: "Request a Consultation" }).click();
    await expect(page.getByText("Thank you — request received.")).toBeVisible();
  });
});
