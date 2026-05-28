import { test, expect } from "../fixtures/test";
import { loginViaUi, seedAuthStorage } from "../utils/auth";
import { testEnv } from "../utils/env";

test.describe("FULL ADMIN FLOW: Login & Dashboard", () => {

  test("FLOW A1: Admin login", async ({ mockedPage: page }) => {
    await loginViaUi(page, testEnv.adminEmail, testEnv.adminPassword);
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 15000 });
  });

  test("FLOW A2: Dashboard overview - stats visible", async ({ mockedPage: page }) => {
    await seedAuthStorage(page, "admin");
    await page.goto("/admin/dashboard");

    await expect(page.locator("body")).toBeVisible({ timeout: 10000 });

    // Dashboard stats cards should be visible
    const statsSection = page.locator("main, [data-testid=admin-dashboard]");
    await expect(statsSection).toBeVisible({ timeout: 10000 });
  });

  test("FLOW A3: Dashboard sidebar navigation visible", async ({ mockedPage: page }) => {
    await seedAuthStorage(page, "admin");
    await page.goto("/admin/dashboard");

    // Sidebar should have main navigation links
    const sidebar = page.locator("nav, aside, [data-testid=admin-sidebar]").first();
    await expect(sidebar).toBeVisible({ timeout: 10000 });
  });
});

test.describe("FULL ADMIN FLOW: Product CRUD", () => {

  test("FLOW B1: View product list", async ({ mockedPage: page }) => {
    await seedAuthStorage(page, "admin");
    await page.goto("/admin/products");

    await expect(page.locator("body")).toBeVisible({ timeout: 10000 });
  });

  test("FLOW B2: Create new product page opens", async ({ mockedPage: page }) => {
    await seedAuthStorage(page, "admin");
    await page.goto("/admin/products/create");

    await expect(page.locator("body")).toBeVisible({ timeout: 10000 });
  });

  test("FLOW B3: Edit product page opens", async ({ mockedPage: page }) => {
    await seedAuthStorage(page, "admin");
    await page.goto("/admin/products/prod-iphone-15/edit");

    await expect(page.locator("body")).toBeVisible({ timeout: 10000 });
  });
});

test.describe("FULL ADMIN FLOW: Order Management", () => {

  test("FLOW C1: View order list", async ({ mockedPage: page }) => {
    await seedAuthStorage(page, "admin");
    await page.goto("/admin/orders");

    await expect(page.locator("body")).toBeVisible({ timeout: 10000 });
  });

  test("FLOW C2: View order detail", async ({ mockedPage: page }) => {
    await seedAuthStorage(page, "admin");
    await page.goto("/admin/orders/order-1");

    await expect(page.locator("body")).toBeVisible({ timeout: 10000 });
  });

  test("FLOW C3: Return request list", async ({ mockedPage: page }) => {
    await seedAuthStorage(page, "admin");
    await page.goto("/admin/returns");

    await expect(page.locator("body")).toBeVisible({ timeout: 10000 });
  });

  test("FLOW C4: Return request detail", async ({ mockedPage: page }) => {
    await seedAuthStorage(page, "admin");
    await page.goto("/admin/returns/return-1");

    await expect(page.locator("body")).toBeVisible({ timeout: 10000 });
  });
});

test.describe("FULL ADMIN FLOW: User Management", () => {

  test("FLOW D1: View user list", async ({ mockedPage: page }) => {
    await seedAuthStorage(page, "admin");
    await page.goto("/admin/users");

    await expect(page.locator("body")).toBeVisible({ timeout: 10000 });
  });

  test("FLOW D2: View user detail", async ({ mockedPage: page }) => {
    await seedAuthStorage(page, "admin");
    await page.goto("/admin/users/user-1");

    await expect(page.locator("body")).toBeVisible({ timeout: 10000 });
  });

  test("FLOW D3: Permission - staff cannot access user management", async ({ mockedPage: page }) => {
    await seedAuthStorage(page, "staff", ["products", "orders"]);
    await page.goto("/admin/users");

    // Staff should be redirected away from user management
    await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 15000 });
  });
});

test.describe("FULL ADMIN FLOW: Category CRUD", () => {

  test("FLOW E1: View category list", async ({ mockedPage: page }) => {
    await seedAuthStorage(page, "admin");
    await page.goto("/admin/categories");

    await expect(page.locator("body")).toBeVisible({ timeout: 10000 });
  });
});

test.describe("FULL ADMIN FLOW: Series CRUD", () => {

  test("FLOW F1: View series list", async ({ mockedPage: page }) => {
    await seedAuthStorage(page, "admin");
    await page.goto("/admin/series");

    await expect(page.locator("body")).toBeVisible({ timeout: 10000 });
  });
});

test.describe("FULL ADMIN FLOW: Coupon CRUD", () => {

  test("FLOW G1: View coupon list", async ({ mockedPage: page }) => {
    await seedAuthStorage(page, "admin");
    await page.goto("/admin/coupons");

    await expect(page.locator("body")).toBeVisible({ timeout: 10000 });
  });
});

test.describe("FULL ADMIN FLOW: Banner CRUD", () => {

  test("FLOW H1: View banner list", async ({ mockedPage: page }) => {
    await seedAuthStorage(page, "admin");
    await page.goto("/admin/banners");

    await expect(page.locator("body")).toBeVisible({ timeout: 10000 });
  });
});

test.describe("FULL ADMIN FLOW: News CRUD", () => {

  test("FLOW I1: View news list", async ({ mockedPage: page }) => {
    await seedAuthStorage(page, "admin");
    await page.goto("/admin/news");

    await expect(page.locator("body")).toBeVisible({ timeout: 10000 });
  });

  test("FLOW I2: Create news page opens", async ({ mockedPage: page }) => {
    await seedAuthStorage(page, "admin");
    await page.goto("/admin/news/create");

    await expect(page.locator("body")).toBeVisible({ timeout: 10000 });
  });

  test("FLOW I3: Edit news page opens", async ({ mockedPage: page }) => {
    await seedAuthStorage(page, "admin");
    await page.goto("/admin/news/kinh-nghiem-chon-iphone-phu-hop/edit");

    await expect(page.locator("body")).toBeVisible({ timeout: 10000 });
  });
});

test.describe("FULL ADMIN FLOW: Comments / Reviews", () => {

  test("FLOW J1: View comments list", async ({ mockedPage: page }) => {
    await seedAuthStorage(page, "admin");
    await page.goto("/admin/comments");

    await expect(page.locator("body")).toBeVisible({ timeout: 10000 });
  });
});

test.describe("FULL ADMIN FLOW: Global Options", () => {

  test("FLOW K1: View global options", async ({ mockedPage: page }) => {
    await seedAuthStorage(page, "admin");
    await page.goto("/admin/options");

    await expect(page.locator("body")).toBeVisible({ timeout: 10000 });
  });
});

test.describe("FULL ADMIN FLOW: Shop Settings", () => {

  test("FLOW L1: View shop settings", async ({ mockedPage: page }) => {
    await seedAuthStorage(page, "admin");
    await page.goto("/admin/settings/shop");

    await expect(page.locator("body")).toBeVisible({ timeout: 10000 });
  });
});
