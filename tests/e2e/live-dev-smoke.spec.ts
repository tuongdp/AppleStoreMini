import { test, expect } from "@playwright/test";
import { testEnv } from "../utils/env";

const consoleIssues: string[] = [];

test.describe.configure({ mode: "serial" });

test.beforeEach(async ({ page }) => {
  consoleIssues.length = 0;
  page.on("console", (message) => {
    if (!["error", "warning"].includes(message.type())) return;
    const text = message.text();
    if (/Download the React DevTools/i.test(text)) return;
    if (/Missing `Description` or `aria-describedby=\{undefined\}` for \{DialogContent\}/i.test(text)) return;
    if (/cdnv2\.tgdd\.vn.*violates the following Content Security Policy directive/i.test(text)) return;
    if (/res\.cloudinary\.com.*violates the following Content Security Policy directive/i.test(text)) return;
    if (/Failed to load resource: net::ERR_NAME_NOT_RESOLVED/i.test(text)) return;
    consoleIssues.push(`${message.type()}: ${text}`);
  });
});

test.afterEach(async () => {
  expect(consoleIssues).toEqual([]);
});

test("live public storefront routes render from the real API", async ({ page }) => {
  for (const path of [
    "/",
    "/products",
    "/search",
    "/news",
    "/about",
    "/contact",
    "/warranty",
    "/return",
    "/privacy",
    "/terms",
    "/apple-care",
    "/order-lookup",
  ]) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("body")).not.toContainText(/Cannot read|TypeError|ReferenceError|Internal Server Error/i);
  }
});

test("live product browsing, detail, and local cart flow works", async ({ page }) => {
  await page.goto("/products", { waitUntil: "domcontentloaded" });
  const firstProduct = page.getByTestId("product-card-link").first();
  await expect(firstProduct).toBeVisible();
  await firstProduct.click();
  await expect(page).toHaveURL(/\/products\//);
  await expect(page.locator("h1")).toBeVisible();

  const addToCart = page.getByRole("button", { name: /thêm vào giỏ|thêm vào giỏ hàng|add to cart/i }).first();
  if (await addToCart.isEnabled().catch(() => false)) {
    await addToCart.click();
    await page.goto("/cart", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toBeVisible();
  }
});

test("live user login and account routes work", async ({ page }) => {
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.getByTestId("login-email").fill(testEnv.userEmail);
  await page.getByTestId("login-password").fill(testEnv.userPassword);
  await page.getByTestId("login-submit").click();
  await expect(page).toHaveURL(/\/$|\/products|\/profile/);

  for (const path of ["/profile", "/profile/orders", "/profile/wishlist", "/profile/points", "/profile/change-password"]) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("body")).not.toContainText(/Cannot read|TypeError|ReferenceError|Internal Server Error/i);
  }
});

test("live admin login and read-only admin routes work", async ({ page }) => {
  await page.goto("/admin/login", { waitUntil: "domcontentloaded" });
  await page.locator('input[type="email"]').fill(testEnv.adminEmail);
  await page.locator('input[type="password"]').fill(testEnv.adminPassword);
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/admin\/dashboard/);

  for (const path of [
    "/admin/dashboard",
    "/admin/products",
    "/admin/orders",
    "/admin/returns",
    "/admin/users",
    "/admin/comments",
    "/admin/reviews/sentiment",
    "/admin/coupons",
    "/admin/categories",
    "/admin/series",
    "/admin/news",
    "/admin/banners",
    "/admin/options",
    "/admin/settings/shop",
  ]) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("body")).not.toContainText(/Cannot read|TypeError|ReferenceError|Internal Server Error/i);
  }
});
