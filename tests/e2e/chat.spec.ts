import { expect, test } from "@playwright/test";

test.describe("Chat widget", () => {
  test("opens, runs a quote flow and confirms", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open chat assistant" }).click();
    const dialog = page.getByRole("dialog", { name: "Sustech assistant" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/Ask me anything/)).toBeVisible();

    await dialog.getByRole("button", { name: "Get a quote" }).click();
    await dialog.getByLabel("Service").selectOption({ index: 1 });
    await dialog.getByLabel("Project scale").selectOption({ label: "10–50 Lakh" });
    await dialog.getByRole("button", { name: /Send to an engineer/ }).click();
    await expect(dialog.getByText("Thanks — request received.")).toBeVisible();
  });

  test("offers a call fallback", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open chat assistant" }).click();
    const dialog = page.getByRole("dialog", { name: "Sustech assistant" });
    await expect(dialog.getByRole("link", { name: /Call \+880/ })).toBeVisible();
  });
});
