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

  test("blocks staff from direct user management routes", async ({ mockedPage: page }) => {
    await seedAuthStorage(page, "staff");
    await page.goto("/admin/users");
    await expect(page).toHaveURL(/\/admin\/dashboard$/);
  });

  test("shows staff sidebar links for granted modules", async ({ mockedPage: page }) => {
    await seedAuthStorage(page, "staff", ["PRODUCTS", "orders"]);
    await page.goto("/admin/dashboard");

    await expect(page.getByRole("link", { name: /tổng quan/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /sản phẩm/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /đơn hàng/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /người dùng/i })).toHaveCount(0);
  });

  test("keeps staff dashboard navigation visible without module permissions", async ({ mockedPage: page }) => {
    await seedAuthStorage(page, "staff", []);
    await page.goto("/admin/dashboard");

    await expect(page.getByRole("link", { name: /tổng quan/i })).toBeVisible();
    await expect(page.getByText(/chưa có module được cấp/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /sản phẩm/i })).toHaveCount(0);
  });

  test("shows admin entry in storefront profile menu for staff", async ({ mockedPage: page }) => {
    await seedAuthStorage(page, "staff", ["products"]);
    await page.addInitScript(() => {
      localStorage.setItem("app-welcome-dismissed", "1");
    });
    await page.goto("/");

    await page.getByRole("button", { name: /mở menu tài khoản/i }).click();
    await expect(page.getByRole("menuitem", { name: /quản trị/i })).toBeVisible();
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

    const breadcrumb = page.getByRole("navigation", { name: /admin breadcrumb/i });
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb.getByRole("link", { name: /sản phẩm/i })).toBeVisible();
    await expect(breadcrumb.getByText(/tạo mới/i)).toBeVisible();
  });

  test("flash sale filters are shareable through URL params", async ({ mockedPage: page }) => {
    await seedAuthStorage(page, "admin");
    await page.goto("/admin/flash-sales?search=school&status=upcoming");

    await expect(page.getByRole("textbox", { name: /tìm kiếm flash sale/i })).toHaveValue("school");
    await expect(page.getByText(/back to school e2e/i)).toBeVisible();
    await expect(page.getByText(/tet flash sale e2e/i)).toHaveCount(0);

    await page.getByRole("textbox", { name: /tìm kiếm flash sale/i }).fill("tet");
    await expect(page).toHaveURL(/search=tet/);

    await page.getByRole("combobox", { name: /lọc trạng thái flash sale/i }).click();
    await page.getByRole("option", { name: /tất cả trạng thái/i }).click();
    await expect(page).toHaveURL(/status=all|\/admin\/flash-sales\?search=tet/);
  });
});
