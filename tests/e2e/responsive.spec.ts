import { test, expect } from "../fixtures/test";

const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
];

for (const viewport of viewports) {
  test(`responsive product layout: ${viewport.name}`, async ({ mockedPage: page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/products");
    await expect(page.getByTestId("product-card").first()).toBeVisible();
    await expect(page.locator("body")).toHaveCSS("overflow-x", "visible");
  });
}
