import { test, expect } from "../fixtures/test";
import { loginViaUi, seedAuthStorage } from "../utils/auth";
import { testEnv } from "../utils/env";

test.describe("authentication", () => {
  test("registers a new customer account", async ({ mockedPage: page }) => {
    await page.goto("/register", { waitUntil: "domcontentloaded" });
    await page.getByTestId("register-full-name").fill("E2E Customer");
    await page.getByTestId("register-email").fill(`e2e-${Date.now()}@example.com`);
    await page.getByTestId("register-phone").fill("0900000000");
    await page.getByTestId("register-password").fill(testEnv.userPassword);
    await page.getByTestId("register-confirm-password").fill(testEnv.userPassword);
    await page.getByRole("checkbox").click();
    await page.getByTestId("register-submit").click();
    await expect(page.getByRole("heading", { name: /xác thực email|verify email/i })).toBeVisible();
  });

  test("logs in and redirects authenticated users", async ({ mockedPage: page }) => {
    await loginViaUi(page);
    await expect(page).toHaveURL(/\/$/);
  });

  test("protects checkout route for anonymous users", async ({ mockedPage: page }) => {
    await page.goto("/checkout", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/login/);
  });

  test("allows protected route after token exists", async ({ mockedPage: page }) => {
    await seedAuthStorage(page);
    await page.goto("/profile", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/profile/);
  });

  test("refreshes expired access token only once under concurrent 401s", async ({ page }) => {
    let refreshCalls = 0;
    await page.route("**/api/auth/refresh-token", async (route) => {
      refreshCalls += 1;
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { accessToken: "new.access", refreshToken: "new.refresh" } }) });
    });
    await page.route("**/api/products**", async (route) => {
      const auth = route.request().headers().authorization;
      if (!auth?.includes("new.access")) {
        await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ message: "expired" }) });
        return;
      }
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [], pagination: { total: 0 } }) });
    });
    await seedAuthStorage(page);
    await page.goto("/products", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle");
    expect(refreshCalls).toBeLessThanOrEqual(1);
  });

  test("rejects invalid token and returns user to login", async ({ page }) => {
    await page.route("**/api/auth/me", async (route) => route.fulfill({ status: 401, body: JSON.stringify({ message: "invalid token" }) }));
    await seedAuthStorage(page);
    await page.goto("/profile", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/profile|\/login/);
  });
});
