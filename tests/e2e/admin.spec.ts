import { test, expect } from "../fixtures/test";
import { loginViaUi, seedAuthStorage } from "../utils/auth";
import { testEnv } from "../utils/env";

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

  test("admin product/category/statistics routes render without hard failure", async ({ mockedPage: page }) => {
    await seedAuthStorage(page, "admin");
    for (const path of ["/admin/products", "/admin/categories", "/admin/dashboard"]) {
      await page.goto(path);
      await expect(page.locator("body")).toBeVisible();
    }
  });
});
