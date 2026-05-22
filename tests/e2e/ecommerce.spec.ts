import { test, expect } from "../fixtures/test";
import { seedAuthStorage } from "../utils/auth";
import { waitForNoBlockingLoaders } from "../utils/waits";

test.describe("ecommerce flows", () => {
  test("shows product listing with pagination-ready cards", async ({ mockedPage: page }) => {
    await page.goto("/products");
    await waitForNoBlockingLoaders(page);
    await expect(page.getByTestId("product-card")).toHaveCount(2);
  });

  test("highlights the active category in the desktop navbar", async ({ mockedPage: page }, testInfo) => {
    test.skip(testInfo.project.name.includes("mobile"), "Desktop navbar is hidden on mobile viewports");

    await page.goto("/products?category=iphone");
    const iphoneNavItem = page.locator("header").getByRole("link", { name: "iPhone", exact: true });

    await expect(iphoneNavItem).toHaveClass(/bg-muted/);
  });

  test("does not open a category submenu from the header navbar", async ({ mockedPage: page }, testInfo) => {
    test.skip(testInfo.project.name.includes("mobile"), "Desktop navbar is hidden on mobile viewports");

    const header = page.locator("header");

    await page.goto("/products?category=iphone");
    await header.getByRole("link", { name: "iPhone", exact: true }).hover();

    await expect(header.locator('a[href*="sort="]')).toHaveCount(0);
  });

  test("does not show duplicate category tabs on product listing pages", async ({ mockedPage: page }, testInfo) => {
    test.skip(testInfo.project.name.includes("mobile"), "Desktop navbar is hidden on mobile viewports");

    await page.goto("/products?category=iphone");

    await expect(page.getByRole("button", { name: /danh/i })).toHaveCount(0);
  });

  test("opens product detail from a stable card selector", async ({ mockedPage: page }) => {
    await page.goto("/products");
    await page.getByTestId("product-card-link").first().click();
    await expect(page).toHaveURL(/\/products\/iphone-15-pro-e2e/);
  });

  test("search suggestions and search results route are available", async ({ mockedPage: page }) => {
    await page.goto("/search", { waitUntil: "domcontentloaded" });
    await page.getByTestId("search-page-input").fill("iphone");
    await page.getByTestId("search-page-input").press("Enter");
    await expect(page.getByTestId("product-card").first()).toBeVisible();
  });

  test("updates cart quantity using deterministic controls", async ({ mockedPage: page }) => {
    await page.addInitScript(() => {
      const persisted = {
        auth: JSON.stringify({ user: { id: "storage-user", role: "user", isVerified: true }, accessToken: "user.access", refreshToken: "user.refresh", isAuthenticated: true }),
        cart: JSON.stringify({ items: [{ variantId: "v1", quantity: 1, product: { id: "prod-iphone-15", name: "iPhone 15 Pro E2E", slug: "iphone-15-pro-e2e", price: 29990000, stock: 5, inStock: true } }] }),
        wishlist: JSON.stringify({ items: [] }),
        _persist: JSON.stringify({ version: -1, rehydrated: true }),
      };
      sessionStorage.setItem("persist:apple-store", JSON.stringify(persisted));
      localStorage.setItem("persist:apple-store", JSON.stringify(persisted));
      window.__E2E_PRELOADED_STATE__ = {
        auth: { user: { id: "storage-user", role: "user", isVerified: true }, accessToken: "user.access", refreshToken: "user.refresh", isAuthenticated: true },
        cart: { items: [{ variantId: "v1", quantity: 1, product: { id: "prod-iphone-15", name: "iPhone 15 Pro E2E", slug: "iphone-15-pro-e2e", price: 29990000, stock: 5, inStock: true } }] },
        wishlist: { items: [] },
        ui: {},
      };
    });
    await page.goto("/cart", { waitUntil: "domcontentloaded" });
    const line = page.getByTestId("cart-line-item").first();
    await expect(line).toBeVisible();
    await line.getByTestId("quantity-value").fill("2");
    await line.getByTestId("quantity-value").blur();
    await expect(line.getByTestId("quantity-value")).toHaveValue("2");
  });

  test("supports wishlist toggle behind auth", async ({ mockedPage: page }) => {
    await seedAuthStorage(page);
    await page.goto("/products");
    await page.getByTestId("product-card").first().hover();
    await page.getByTestId("wishlist-toggle").first().click();
    await expect(page.getByTestId("wishlist-toggle").first()).toBeVisible();
  });
});
