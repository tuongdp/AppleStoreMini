import { test, expect } from "../fixtures/test";

test.describe("footer", () => {
  test("renders footer links with valid storefront categories", async ({ mockedPage: page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
    await expect(footer.getByRole("link", { name: "Tai nghe & Loa" })).toHaveAttribute(
      "href",
      /category=tai-nghe-loa/,
    );
    await expect(footer.locator('a[href*="category=airpods"]')).toHaveCount(0);
  });
});
