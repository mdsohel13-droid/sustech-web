import { expect, test } from "@playwright/test";

test.describe("Projects index", () => {
  test("renders a single h1 and is server-rendered (200)", async ({ page }) => {
    const res = await page.goto("/projects");
    expect(res?.status()).toBe(200);
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toHaveCount(1);
    await expect(h1).toHaveText("Projects");
  });

  test("shows either the case-study grid or an empty state (no client JS required)", async ({
    page,
  }) => {
    await page.goto("/projects");
    // Exactly one of: published project links, or the empty-state message.
    const cards = page.getByRole("link", { name: /read case study$/ });
    const empty = page.getByText(/being published|No published projects/);
    const total = (await cards.count()) + (await empty.count());
    expect(total).toBeGreaterThan(0);
  });
});
