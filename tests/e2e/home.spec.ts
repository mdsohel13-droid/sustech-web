import { expect, test } from "@playwright/test";

test("home page renders a single h1 with the brand name", async ({ page }) => {
  await page.goto("/");
  const h1 = page.getByRole("heading", { level: 1 });
  await expect(h1).toBeVisible();
  await expect(h1).toHaveText("Sustech Technology Ltd");
});
