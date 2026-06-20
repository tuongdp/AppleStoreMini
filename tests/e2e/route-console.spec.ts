import { test, expect } from "../fixtures/test";
import { seedAuthStorage } from "../utils/auth";

type RouteCase = {
  path: string;
  role?: "user" | "admin";
};

const ignoredConsoleMessages = [
  /Download the React DevTools/i,
  /Service worker registration failed/i,
];

const routeCases: RouteCase[] = [
  { path: "/" },
  { path: "/products" },
  { path: "/products/iphone-15-pro-e2e" },
  { path: "/cart" },
  { path: "/search" },
  { path: "/about" },
  { path: "/contact" },
  { path: "/warranty" },
  { path: "/return" },
  { path: "/privacy" },
  { path: "/terms" },
  { path: "/apple-care" },
  { path: "/news" },
  { path: "/news/kinh-nghiem-chon-iphone-phu-hop" },
  { path: "/verify-email" },
  { path: "/payment/success" },
  { path: "/payment/fail" },
  { path: "/payment/vnpay-return" },
  { path: "/order-lookup" },
  { path: "/login" },
  { path: "/register" },
  { path: "/forgot-password" },
  { path: "/reset-password/test-token" },
  { path: "/checkout" },
  { path: "/profile", role: "user" },
  { path: "/profile/wishlist", role: "user" },
  { path: "/profile/orders", role: "user" },
  { path: "/profile/orders/order-1", role: "user" },
  { path: "/profile/change-password", role: "user" },
  { path: "/profile/points", role: "user" },
  { path: "/admin/login" },
  { path: "/admin/dashboard", role: "admin" },
  { path: "/admin/products", role: "admin" },
  { path: "/admin/products/create", role: "admin" },
  { path: "/admin/products/prod-iphone-15/edit", role: "admin" },
  { path: "/admin/orders", role: "admin" },
  { path: "/admin/orders/order-1", role: "admin" },
  { path: "/admin/returns", role: "admin" },
  { path: "/admin/returns/return-1", role: "admin" },
  { path: "/admin/users", role: "admin" },
  { path: "/admin/users/user-1", role: "admin" },
  { path: "/admin/comments", role: "admin" },
  { path: "/admin/reviews/sentiment", role: "admin" },
  { path: "/admin/coupons", role: "admin" },
  { path: "/admin/categories", role: "admin" },
  { path: "/admin/news", role: "admin" },
  { path: "/admin/news/create", role: "admin" },
  { path: "/admin/news/kinh-nghiem-chon-iphone-phu-hop/edit", role: "admin" },
  { path: "/admin/banners", role: "admin" },
  { path: "/admin/options", role: "admin" },
  { path: "/admin/settings/shop", role: "admin" },
  { path: "/missing-route" },
];

test.describe("route console smoke", () => {
  for (const routeCase of routeCases) {
    test(`${routeCase.path} renders without console errors or warnings`, async ({ mockedPage: page }) => {
      const messages: string[] = [];

      page.on("console", (message) => {
        if (!["error", "warning"].includes(message.type())) return;

        const text = message.text();
        if (ignoredConsoleMessages.some((pattern) => pattern.test(text))) return;

        messages.push(`${message.type()}: ${text}`);
      });

      if (routeCase.role) {
        await seedAuthStorage(page, routeCase.role);
      }

      await page.goto(routeCase.path, { waitUntil: "domcontentloaded" });
      await expect(page.locator("body")).toBeVisible({ timeout: 10000 });
      await page.waitForLoadState("networkidle").catch(() => undefined);

      expect(messages, `Console issues on ${routeCase.path}`).toEqual([]);
    });
  }
});
