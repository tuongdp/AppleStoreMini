import { test, expect } from "../fixtures/test";
import { seedAuthStorage } from "../utils/auth";

const BROKEN_TEXT_PATTERN = /Ã|Â|�/;

const publicRoutes = [
  "/",
  "/products",
  "/search",
  "/about",
  "/contact",
  "/warranty",
  "/return",
  "/privacy",
  "/terms",
  "/apple-care",
  "/news",
  "/order-lookup",
  "/login",
  "/register",
  "/forgot-password",
  "/payment/success",
  "/payment/fail",
];

const authenticatedRoutes = [
  "/profile",
  "/profile/orders",
  "/profile/change-password",
  "/profile/wishlist",
  "/profile/points",
];

test.describe("content quality", () => {
  for (const route of publicRoutes) {
    test(`visible text is readable on ${route}`, async ({ mockedPage: page }) => {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await expect(page.locator("body")).toBeVisible({ timeout: 10000 });

      await expect(page.locator("body")).not.toContainText(BROKEN_TEXT_PATTERN);
    });
  }

  for (const route of authenticatedRoutes) {
    test(`visible text is readable on ${route}`, async ({ mockedPage: page }) => {
      await seedAuthStorage(page);
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await expect(page.locator("body")).toBeVisible({ timeout: 10000 });

      await expect(page.locator("body")).not.toContainText(BROKEN_TEXT_PATTERN);
    });
  }
});
