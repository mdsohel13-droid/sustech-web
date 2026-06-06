import { expect, test } from "@playwright/test";

/**
 * Dropdown description reveal (per-menu-item). Descriptions are present in the SSR HTML
 * (crawlable) but visually hidden until the item is hovered OR keyboard-focused — and the
 * reveal must work both ways for accessibility.
 */
test.describe("Nav dropdown description reveal", () => {
  test("description is hidden at rest and fades in on hover", async ({ page }) => {
    await page.goto("/");
    const header = page.getByRole("banner");
    await header.getByRole("button", { name: "Services" }).click();

    const item = header.getByRole("link", { name: "Solar & Renewable Energy" });
    await expect(item).toBeVisible();

    // The innermost span is the description; it is in the DOM but starts transparent.
    const description = item.locator("span").last();
    await expect(description).toHaveCSS("opacity", "0");

    // Hover the parent item → description animates into view.
    await item.hover();
    await expect(description).toHaveCSS("opacity", "1");
  });

  test("description also reveals on keyboard focus (no mouse)", async ({ page }) => {
    await page.goto("/");
    const header = page.getByRole("banner");
    await header.getByRole("button", { name: "Services" }).click();

    const item = header.getByRole("link", { name: "Solar & Renewable Energy" });
    const description = item.locator("span").last();
    await expect(description).toHaveCSS("opacity", "0");

    // Focus via keyboard path — focus-within on the item reveals the description.
    await item.focus();
    await expect(description).toHaveCSS("opacity", "1");
  });
});
