import type { Page } from "@playwright/test";
import { apiEnvelope, apiPaginated, makeOrder, testNews, testProducts, testUsers, adminUsersList, testCategories, testSeries, testCoupons, testBanners, testOrders, testReviews, testReturnRequests, dashboardStats, globalOptions, appSettings } from "./mock-data";

const json = (body: unknown, status = 200) => ({
  status,
  contentType: "application/json",
  body: JSON.stringify(body),
});

const paged = (data: unknown[]) => json(apiPaginated(data));

export async function mockApi(page: Page) {
  let serverCartQuantity = 1;

  await page.route(/^https?:\/\/(localhost|127\.0\.0\.1):5000\/api\/.*$/, async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname.replace(/^\/api/, "");
    const method = route.request().method();

    if (method === "OPTIONS") {
      await route.fulfill(json({}, 204));
      return;
    }

    // ─── AUTH ──────────────────────────────────────
    if (path === "/auth/login") {
      const body = route.request().postDataJSON();
      const user = body.email?.includes("admin") ? testUsers.admin : testUsers.customer;
      await route.fulfill(json(apiEnvelope({ user, accessToken: `${user.role}.access`, refreshToken: `${user.role}.refresh` })));
      return;
    }
    if (path === "/auth/register") {
      await route.fulfill(json(apiEnvelope({ user: testUsers.customer })));
      return;
    }
    if (path === "/auth/check-email") {
      await route.fulfill(json(apiEnvelope({ exists: false })));
      return;
    }
    if (path === "/auth/refresh-token") {
      await route.fulfill(json(apiEnvelope({ accessToken: "refreshed.access", refreshToken: "refreshed.refresh", user: testUsers.customer })));
      return;
    }
    if (path === "/auth/me") {
      await route.fulfill(json(apiEnvelope({ user: testUsers.customer, accessToken: "existing.access", refreshToken: "existing.refresh" })));
      return;
    }
    if (path === "/auth/forgot-password") {
      await route.fulfill(json(apiEnvelope(null, "Email đặt lại mật khẩu đã được gửi")));
      return;
    }

    // ─── PUBLIC PRODUCTS ───────────────────────────
    if (path === "/products/search" || path === "/products/suggestions") {
      await route.fulfill(json(apiEnvelope(testProducts)));
      return;
    }
    if (/^\/products\/slug\/[^/]+\/related$/.test(path)) {
      await route.fulfill(json(apiEnvelope(testProducts)));
      return;
    }
    if (/^\/products\/slug\/[^/]+$/.test(path)) {
      await route.fulfill(json(apiEnvelope(testProducts[0])));
      return;
    }
    if (path === "/products") {
      await route.fulfill(paged(testProducts));
      return;
    }
    if (path === "/products/featured") {
      await route.fulfill(json(apiEnvelope(testProducts.slice(0, 2))));
      return;
    }
    if (path === "/products/sale") {
      await route.fulfill(json(apiEnvelope([testProducts[0]])));
      return;
    }
    if (path === "/products/new-releases") {
      await route.fulfill(json(apiEnvelope([testProducts[2]])));
      return;
    }

    // ─── PUBLIC CATEGORIES / SERIES ────────────────
    if (path === "/categories" || path === "/categories/public") {
      await route.fulfill(json(apiEnvelope(testCategories)));
      return;
    }
    if (path === "/series" || path === "/series/public") {
      await route.fulfill(json(apiEnvelope(testSeries)));
      return;
    }

    // ─── PUBLIC BANNERS ────────────────────────────
    if (path === "/banners" || path === "/banners/public") {
      await route.fulfill(json(apiEnvelope(testBanners)));
      return;
    }

    // ─── NEWS ─────────────────────────────────────
    if (path === "/news") {
      await route.fulfill(json({ ...apiEnvelope(testNews), pagination: { page: 1, limit: 6, total: testNews.length, totalPages: 1 } }));
      return;
    }
    if (/^\/news\/slug\/[^/]+$/.test(path)) {
      await route.fulfill(json(apiEnvelope(testNews[0])));
      return;
    }

    // ─── CART ─────────────────────────────────────
    if (path === "/cart") {
      const body = route.request().postDataJSON?.() || {};
      if (body.quantity) serverCartQuantity = body.quantity;
      await route.fulfill(json(apiEnvelope({
        items: [{
          quantity: serverCartQuantity,
          variantId: "v1",
          variant: { id: "v1", stock: 5, product: testProducts[0] },
        }],
      })));
      return;
    }

    // ─── ORDERS ───────────────────────────────────
    if (path === "/orders") {
      await route.fulfill(paged(testOrders));
      return;
    }
    if (/^\/orders\/[^/]+$/.test(path)) {
      await route.fulfill(json(apiEnvelope(testOrders[0])));
      return;
    }

    // ─── COUPONS ──────────────────────────────────
    if (path === "/coupons/validate") {
      await route.fulfill(json(apiEnvelope({ valid: true, discount: 500000, discountType: "PERCENT", discountValue: 10 })));
      return;
    }

    // ─── PAYMENT ──────────────────────────────────
    if (path === "/payment/create" || /^\/payment\/[^/]+\/create$/.test(path)) {
      await route.fulfill(json(apiEnvelope({ paymentUrl: "https://sandbox.vnpayment.vn/pay?order=test" })));
      return;
    }
    if (path === "/payment/vnpay-mock-ipn") {
      await route.fulfill(json(apiEnvelope(null, "Payment confirmed (mock)")));
      return;
    }

    // ─── REVIEWS ──────────────────────────────────
    if (path === "/reviews" || /^\/reviews\/product\/[^/]+$/.test(path)) {
      await route.fulfill(paged(testReviews));
      return;
    }

    // ─── USER PROFILE ─────────────────────────────
    if (path === "/users/profile" || path === "/users/me") {
      await route.fulfill(json(apiEnvelope(testUsers.customer)));
      return;
    }
    if (path === "/users/change-password") {
      await route.fulfill(json(apiEnvelope(null, "Đổi mật khẩu thành công")));
      return;
    }
    if (path === "/users/points") {
      await route.fulfill(json(apiEnvelope({ points: 500, transactions: [] })));
      return;
    }

    // ─── ADMIN DASHBOARD ──────────────────────────
    if (path === "/admin/dashboard/stats") {
      await route.fulfill(json(apiEnvelope(dashboardStats)));
      return;
    }
    if (path === "/admin/dashboard/recent-orders") {
      await route.fulfill(json(apiEnvelope(testOrders)));
      return;
    }

    // ─── ADMIN PRODUCTS ───────────────────────────
    if (path === "/admin/products") {
      await route.fulfill(paged(testProducts));
      return;
    }
    if (/^\/admin\/products\/[^/]+$/.test(path)) {
      if (method === "PUT") await route.fulfill(json(apiEnvelope({ ...testProducts[0], name: "iPhone 15 Pro (Đã sửa)" })));
      else if (method === "DELETE") await route.fulfill(json(apiEnvelope(null, "Xoá sản phẩm thành công")));
      else await route.fulfill(json(apiEnvelope(testProducts[0])));
      return;
    }

    // ─── ADMIN ORDERS ─────────────────────────────
    if (path === "/admin/orders") {
      await route.fulfill(paged(testOrders));
      return;
    }
    if (/^\/admin\/orders\/[^/]+$/.test(path)) {
      await route.fulfill(json(apiEnvelope(testOrders[0])));
      return;
    }
    if (/^\/admin\/orders\/[^/]+\/status$/.test(path)) {
      await route.fulfill(json(apiEnvelope(null, "Cập nhật trạng thái thành công")));
      return;
    }

    // ─── ADMIN USERS ──────────────────────────────
    if (path === "/admin/users") {
      await route.fulfill(paged(adminUsersList));
      return;
    }
    if (/^\/admin\/users\/[^/]+$/.test(path)) {
      if (method === "PUT") await route.fulfill(json(apiEnvelope(adminUsersList[0])));
      else await route.fulfill(json(apiEnvelope(adminUsersList[0])));
      return;
    }

    // ─── ADMIN CATEGORIES ─────────────────────────
    if (path === "/admin/categories") {
      await route.fulfill(paged(testCategories));
      return;
    }
    if (/^\/admin\/categories\/[^/]+$/.test(path)) {
      if (method === "PUT") await route.fulfill(json(apiEnvelope(testCategories[0])));
      else if (method === "DELETE") await route.fulfill(json(apiEnvelope(null, "Xoá danh mục thành công")));
      else await route.fulfill(json(apiEnvelope(testCategories[0])));
      return;
    }

    // ─── ADMIN SERIES ─────────────────────────────
    if (path === "/admin/series") {
      await route.fulfill(paged(testSeries));
      return;
    }
    if (/^\/admin\/series\/[^/]+$/.test(path)) {
      if (method === "PUT") await route.fulfill(json(apiEnvelope(testSeries[0])));
      else if (method === "DELETE") await route.fulfill(json(apiEnvelope(null, "Xoá series thành công")));
      else await route.fulfill(json(apiEnvelope(testSeries[0])));
      return;
    }

    // ─── ADMIN COUPONS ────────────────────────────
    if (path === "/admin/coupons") {
      await route.fulfill(paged(testCoupons));
      return;
    }
    if (/^\/admin\/coupons\/[^/]+$/.test(path)) {
      if (method === "PUT") await route.fulfill(json(apiEnvelope(testCoupons[0])));
      else if (method === "DELETE") await route.fulfill(json(apiEnvelope(null, "Xoá mã giảm giá thành công")));
      else await route.fulfill(json(apiEnvelope(testCoupons[0])));
      return;
    }

    // ─── ADMIN BANNERS ────────────────────────────
    if (path === "/admin/banners") {
      await route.fulfill(paged(testBanners));
      return;
    }
    if (/^\/admin\/banners\/[^/]+$/.test(path)) {
      if (method === "PUT") await route.fulfill(json(apiEnvelope(testBanners[0])));
      else if (method === "DELETE") await route.fulfill(json(apiEnvelope(null, "Xoá banner thành công")));
      else await route.fulfill(json(apiEnvelope(testBanners[0])));
      return;
    }

    // ─── ADMIN NEWS ───────────────────────────────
    if (path === "/admin/news") {
      await route.fulfill(paged(testNews));
      return;
    }
    if (/^\/admin\/news\/[^/]+$/.test(path)) {
      if (method === "PUT") await route.fulfill(json(apiEnvelope(testNews[0])));
      else if (method === "DELETE") await route.fulfill(json(apiEnvelope(null, "Xoá bài viết thành công")));
      else await route.fulfill(json(apiEnvelope(testNews[0])));
      return;
    }

    // ─── ADMIN REVIEWS ────────────────────────────
    if (path === "/admin/reviews" || path === "/admin/comments") {
      await route.fulfill(paged(testReviews));
      return;
    }
    if (/^\/admin\/reviews\/[^/]+$/.test(path)) {
      await route.fulfill(json(apiEnvelope(testReviews[0])));
      return;
    }

    // ─── ADMIN RETURNS ────────────────────────────
    if (path === "/admin/returns") {
      await route.fulfill(paged(testReturnRequests));
      return;
    }
    if (/^\/admin\/returns\/[^/]+$/.test(path)) {
      await route.fulfill(json(apiEnvelope(testReturnRequests[0])));
      return;
    }

    // ─── ADMIN GLOBAL OPTIONS ─────────────────────
    if (path === "/admin/options" || path === "/admin/global-options") {
      await route.fulfill(json(apiEnvelope(globalOptions)));
      return;
    }

    // ─── ADMIN SETTINGS ───────────────────────────
    if (path === "/admin/settings" || path === "/admin/settings/shop") {
      await route.fulfill(json(apiEnvelope(appSettings)));
      return;
    }

    // ─── ADMIN UPLOAD ─────────────────────────────
    if (path === "/admin/upload" || path === "/admin/upload/image") {
      await route.fulfill(json(apiEnvelope({ url: "/assets/test/uploaded.png" })));
      return;
    }

    // ─── SEARCH / CHAT ────────────────────────────
    if (path === "/chat" || path === "/chat/message") {
      await route.fulfill(json(apiEnvelope({ reply: "Tôi gợi ý iPhone 15 Pro cho bạn.", products: [testProducts[0]] })));
      return;
    }

    await route.fulfill(json(apiEnvelope([])));
  });

  // ─── WILDCARD MOCKS (for Vite-proxied paths) ──
  await page.route("**/api/auth/login", async (route) => {
    const body = route.request().postDataJSON();
    const user = body.email?.includes("admin") ? testUsers.admin : testUsers.customer;
    await route.fulfill(json(apiEnvelope({ user, accessToken: `${user.role}.access`, refreshToken: `${user.role}.refresh` })));
  });
  await page.route("**/api/auth/register", async (route) => {
    await route.fulfill(json(apiEnvelope({ user: testUsers.customer })));
  });
  await page.route("**/api/auth/check-email**", async (route) => {
    await route.fulfill(json(apiEnvelope({ exists: false })));
  });
  await page.route("**/api/auth/refresh-token", async (route) => {
    await route.fulfill(json(apiEnvelope({ accessToken: "refreshed.access", refreshToken: "refreshed.refresh", user: testUsers.customer })));
  });
  await page.route("**/api/auth/me", async (route) => {
    await route.fulfill(json(apiEnvelope({ user: testUsers.customer, accessToken: "existing.access", refreshToken: "existing.refresh" })));
  });
  await page.route("**/api/products/search**", async (route) => {
    await route.fulfill(json(apiEnvelope(testProducts)));
  });
  await page.route(/.*\/api\/news(\?.*)?$/, async (route) => {
    await route.fulfill(json({ ...apiEnvelope(testNews), pagination: { page: 1, limit: 6, total: testNews.length, totalPages: 1 } }));
  });
  await page.route(/.*\/api\/products\/slug\/[^/]+\/related(\?.*)?$/, async (route) => {
    await route.fulfill(json(apiEnvelope(testProducts)));
  });
  await page.route(/.*\/api\/products\/slug\/[^/]+$/, async (route) => {
    await route.fulfill(json(apiEnvelope(testProducts[0])));
  });
  await page.route(/.*\/api\/products(\?.*)?$/, async (route) => {
    await route.fulfill(json({ ...apiEnvelope(testProducts), pagination: { page: 1, limit: 12, total: testProducts.length, totalPages: 1 } }));
  });
  await page.route(/.*\/api\/categories(\?.*)?$/, async (route) => {
    await route.fulfill(json(apiEnvelope(testCategories)));
  });
  await page.route(/.*\/api\/banners(\?.*)?$/, async (route) => {
    await route.fulfill(json(apiEnvelope(testBanners)));
  });
}
