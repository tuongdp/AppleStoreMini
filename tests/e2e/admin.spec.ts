import { test, expect } from "../fixtures/test";
import { loginViaUi, seedAuthStorage } from "../utils/auth";
import { testEnv } from "../utils/env";

const adminLink = (page, href) => page.locator(`a[href="${href}"]`).first();

test.describe("admin dashboard", () => {
  test("admin can log in", async ({ mockedPage: page }) => {
    await loginViaUi(page, testEnv.adminEmail, testEnv.adminPassword);
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/admin\/dashboard/);
  });

  test("blocks non-admin users from admin dashboard", async ({ mockedPage: page }) => {
    await seedAuthStorage(page, "user");
    await page.goto("/admin/dashboard");
    await expect(page).not.toHaveURL(/\/admin\/dashboard$/);
  });

  test("keeps staff user management route visible for backend permission checks", async ({ mockedPage: page }) => {
    await seedAuthStorage(page, "staff");
    await page.goto("/admin/users");
    await expect(page).toHaveURL(/\/admin\/users$/);
    await expect(page.locator("main")).toBeVisible();
  });

  test("keeps the complete admin sidebar visible for staff", async ({ mockedPage: page }) => {
    await seedAuthStorage(page, "staff", ["PRODUCTS", "orders"]);
    await page.goto("/admin/dashboard");

    await expect(adminLink(page, "/admin/dashboard")).toBeVisible();
    await expect(adminLink(page, "/admin/products")).toBeVisible();
    await expect(adminLink(page, "/admin/orders")).toBeVisible();
    await expect(adminLink(page, "/admin/users")).toBeVisible();
  });

  test("keeps complete staff dashboard navigation visible without module permissions", async ({ mockedPage: page }) => {
    await seedAuthStorage(page, "staff", []);
    await page.goto("/admin/dashboard");

    await expect(adminLink(page, "/admin/dashboard")).toBeVisible();
    await expect(adminLink(page, "/admin/products")).toBeVisible();
    await expect(adminLink(page, "/admin/users")).toBeVisible();
  });

  test("shows admin entry in storefront profile menu for staff", async ({ mockedPage: page }) => {
    await seedAuthStorage(page, "staff", ["products"]);
    await page.addInitScript(() => {
      localStorage.setItem("app-welcome-dismissed", "1");
    });
    await page.goto("/");

    await page.getByRole("button", { name: /menu|tÃ i khoáº£n|tài khoản/i }).click();
    await expect(page.locator('a[href="/admin/dashboard"]').first()).toBeVisible();
  });

  test("admin product/category/statistics routes render without hard failure", async ({ mockedPage: page }) => {
    await seedAuthStorage(page, "admin");
    for (const path of ["/admin/products", "/admin/categories", "/admin/dashboard"]) {
      await page.goto(path);
      await expect(page.locator("body")).toBeVisible();
    }
  });

  test("admin header shows breadcrumb for nested management pages", async ({ mockedPage: page }) => {
    await seedAuthStorage(page, "admin");
    await page.goto("/admin/products/create");

    const breadcrumb = page.locator("header nav").first();
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb.locator('a[href="/admin/products"]')).toBeVisible();
  });
});
