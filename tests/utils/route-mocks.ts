import type { Page } from "@playwright/test";
import { apiEnvelope, apiPaginated, makeOrder, testNews, testProducts, testUsers, adminUsersList, testCategories, testSeries, testCoupons, testBanners, testOrders, testReviews, adminReviewReplySuggestion, testReturnRequests, dashboardStats, dashboardOperations, dashboardAiInsights, dashboardRevenue, dashboardRevenueDay, dashboardCategoryRevenue, dashboardCategoryRevenueDay, dashboardTopProducts, dashboardTopProductsDay, dashboardSlowProducts, dashboardLowStock, dashboardTopCustomers, globalOptionsList, appSettings, adminAiSettings, adminAiLogs } from "./mock-data";

const json = (body: unknown, status = 200) => ({
  status,
  contentType: "application/json",
  body: JSON.stringify(body),
});

const paged = (data: unknown[]) => json(apiPaginated(data));

export async function mockApi(page: Page) {
  let serverCartQuantity = 1;
  const makeCartPayload = () => ({
    items: [{
      quantity: serverCartQuantity,
      variantId: "v1",
      variant: { id: "v1", stock: 5, inStock: true, images: ["/assets/test/iphone.png"], product: testProducts[0] },
    }],
  });

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
    if (path === "/auth/send-verification") {
      await route.fulfill(json(apiEnvelope(null, "Verification email sent")));
      return;
    }
    if (path === "/auth/verify-email") {
      await route.fulfill(json(apiEnvelope({ user: testUsers.customer, accessToken: "user.access", refreshToken: "user.refresh" })));
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
    if (/^\/news\/[^/]+$/.test(path)) {
      const slug = path.split("/").at(-1);
      await route.fulfill(json(apiEnvelope(testNews.find((item) => item.slug === slug) || testNews[0])));
      return;
    }

    // ─── CART ─────────────────────────────────────
    if (path === "/cart/sync") {
      const body = route.request().postDataJSON?.() || {};
      const firstItem = body.items?.[0];
      if (firstItem?.quantity) serverCartQuantity = firstItem.quantity;
      await route.fulfill(json(apiEnvelope(makeCartPayload())));
      return;
    }
    if (path === "/cart/clear") {
      serverCartQuantity = 0;
      await route.fulfill(json(apiEnvelope({ items: [] })));
      return;
    }
    if (path === "/cart") {
      const body = route.request().postDataJSON?.() || {};
      if (method === "DELETE") {
        serverCartQuantity = 0;
        await route.fulfill(json(apiEnvelope({ items: [] })));
      } else {
        if (body.quantity) serverCartQuantity = body.quantity;
        await route.fulfill(json(apiEnvelope(makeCartPayload())));
      }
      return;
    }

    // ─── ORDERS ───────────────────────────────────
    if (path === "/orders") {
      if (method === "POST") {
        const body = route.request().postDataJSON?.() || {};
        await route.fulfill(json(apiEnvelope(makeOrder({
          id: "order-checkout-e2e",
          code: "ORD-CHECKOUT-E2E",
          paymentMethod: body.paymentMethod || "cod",
          couponCode: body.couponCode,
          usedPoints: body.usePoints ? 500 : 0,
          totalAmount: body.usePoints ? 26990000 : 27490000,
          fullName: body.fullName,
          shippingAddress: body.address,
          shippingPhone: body.phone,
        }))));
      } else {
        await route.fulfill(paged(testOrders));
      }
      return;
    }
    if (/^\/orders\/[^/]+$/.test(path)) {
      await route.fulfill(json(apiEnvelope(testOrders[0])));
      return;
    }

    // ─── COUPONS ──────────────────────────────────
    if (path === "/coupons/apply" || path === "/coupons/validate") {
      const body = route.request().postDataJSON?.() || {};
      await route.fulfill(json(apiEnvelope({
        valid: true,
        code: body.code || "SUMMER2024",
        discountAmount: 500000,
        discount: 500000,
        discountType: "PERCENT",
        discountValue: 10,
        description: "Giam 500.000d cho don hang test",
      })));
      return;
    }

    // ─── PAYMENT ──────────────────────────────────
    if (path === "/payment/create" || /^\/payment\/[^/]+\/create$/.test(path) || /^\/orders\/[^/]+\/payment$/.test(path)) {
      await route.fulfill(json(apiEnvelope({ paymentUrl: "/payment/success?order=test" })));
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
    if (path === "/points" || path === "/users/points") {
      await route.fulfill(json(apiEnvelope({ points: 500, transactions: [] })));
      return;
    }
    if (path === "/points/history") {
      await route.fulfill(json({ ...apiEnvelope([]), pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } }));
      return;
    }

    // ─── ADMIN DASHBOARD ──────────────────────────
    if (path === "/admin/dashboard/stats") {
      await route.fulfill(json(apiEnvelope(dashboardStats)));
      return;
    }
    if (path === "/admin/dashboard/operations") {
      await route.fulfill(json(apiEnvelope(dashboardOperations)));
      return;
    }
    if (path === "/admin/dashboard/ai-insights") {
      await route.fulfill(json(apiEnvelope(dashboardAiInsights)));
      return;
    }
    if (path === "/admin/dashboard/revenue") {
      await route.fulfill(json(apiEnvelope(url.searchParams.get("period") === "day" ? dashboardRevenueDay : dashboardRevenue)));
      return;
    }
    if (path === "/admin/dashboard/category-revenue") {
      await route.fulfill(json(apiEnvelope(url.searchParams.get("period") === "day" ? dashboardCategoryRevenueDay : dashboardCategoryRevenue)));
      return;
    }
    if (path === "/admin/dashboard/top-products") {
      await route.fulfill(json(apiEnvelope(url.searchParams.get("period") === "day" ? dashboardTopProductsDay : dashboardTopProducts)));
      return;
    }
    if (path === "/admin/dashboard/slow-products") {
      await route.fulfill(json(apiEnvelope(dashboardSlowProducts)));
      return;
    }
    if (path === "/admin/dashboard/low-stock") {
      await route.fulfill(json(apiEnvelope(dashboardLowStock)));
      return;
    }
    if (path === "/admin/dashboard/order-status-distribution") {
      await route.fulfill(json(apiEnvelope(dashboardStats.orderStatusDistribution)));
      return;
    }
    if (path === "/admin/dashboard/top-customers") {
      await route.fulfill(json(apiEnvelope(dashboardTopCustomers)));
      return;
    }
    if (path === "/admin/dashboard/recent-orders") {
      await route.fulfill(json(apiEnvelope(testOrders)));
      return;
    }
    if (path === "/admin/dashboard/review-reward") {
      if (method === "PATCH") {
        const body = route.request().postDataJSON?.() || {};
        await route.fulfill(json(apiEnvelope({ points: body.points ?? 20000, type: body.type || "FIXED" })));
      } else {
        await route.fulfill(json(apiEnvelope({ points: 20000, type: "FIXED" })));
      }
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
    if (/^\/admin\/orders\/[^/]+\/status$/.test(path)) {
      await route.fulfill(json(apiEnvelope(null, "Cập nhật trạng thái thành công")));
      return;
    }
    if (/^\/admin\/orders\/[^/]+$/.test(path)) {
      await route.fulfill(json(apiEnvelope(testOrders[0])));
      return;
    }

    // ─── ADMIN USERS ──────────────────────────────
    if (path === "/admin/users") {
      await route.fulfill(paged(adminUsersList));
      return;
    }
    if (path === "/admin/users/stats") {
      await route.fulfill(json(apiEnvelope({
        total: adminUsersList.length,
        active: adminUsersList.filter((user) => !user.isBlocked).length,
        staff: adminUsersList.filter((user) => user.role === "staff").length,
        admins: adminUsersList.filter((user) => user.role === "admin").length,
        blocked: adminUsersList.filter((user) => user.isBlocked).length,
        unverified: adminUsersList.filter((user) => !user.isVerified).length,
      })));
      return;
    }
    if (/^\/admin\/users\/[^/]+\/role$/.test(path)) {
      const body = route.request().postDataJSON?.() || {};
      await route.fulfill(json(apiEnvelope({ ...adminUsersList[0], role: String(body.role || "USER").toLowerCase() })));
      return;
    }
    if (/^\/admin\/users\/[^/]+\/permissions$/.test(path)) {
      const body = route.request().postDataJSON?.() || {};
      await route.fulfill(json(apiEnvelope({ ...adminUsersList[0], role: "staff", permissions: body.permissions || [] })));
      return;
    }
    if (/^\/admin\/users\/[^/]+\/toggle$/.test(path)) {
      await route.fulfill(json(apiEnvelope({ ...adminUsersList[0], isBlocked: true })));
      return;
    }
    if (/^\/admin\/users\/[^/]+\/reset-password$/.test(path)) {
      await route.fulfill(json(apiEnvelope({ newPassword: "Temp@123456" })));
      return;
    }
    if (/^\/admin\/users\/[^/]+$/.test(path)) {
      if (method === "PUT") await route.fulfill(json(apiEnvelope(adminUsersList[0])));
      else if (method === "DELETE") await route.fulfill(json(apiEnvelope(null, "Xoá tài khoản thành công")));
      else await route.fulfill(json(apiEnvelope(adminUsersList[0])));
      return;
    }

    // ─── ADMIN CATEGORIES ─────────────────────────
    if (path === "/admin/categories") {
      if (method === "POST") await route.fulfill(json(apiEnvelope({ ...testCategories[0], id: "cat-new" })));
      else await route.fulfill(paged(testCategories));
      return;
    }
    if (/^\/admin\/categories\/[^/]+\/toggle$/.test(path)) {
      await route.fulfill(json(apiEnvelope({ ...testCategories[0], isActive: false })));
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
      if (method === "POST") await route.fulfill(json(apiEnvelope({ ...testSeries[0], id: "series-new" })));
      else await route.fulfill(paged(testSeries));
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
      if (method === "POST") await route.fulfill(json(apiEnvelope({ ...testCoupons[0], id: "coupon-new" })));
      else await route.fulfill(paged(testCoupons));
      return;
    }
    if (/^\/admin\/coupons\/[^/]+\/toggle$/.test(path)) {
      await route.fulfill(json(apiEnvelope({ ...testCoupons[0], isActive: false })));
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
      if (method === "POST") await route.fulfill(json(apiEnvelope({ ...testBanners[0], id: "banner-new" })));
      else await route.fulfill(paged(testBanners));
      return;
    }
    if (/^\/admin\/banners\/[^/]+\/toggle$/.test(path)) {
      await route.fulfill(json(apiEnvelope({ ...testBanners[0], isActive: false })));
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
      if (method === "POST") await route.fulfill(json(apiEnvelope({ ...testNews[0], id: "news-new" })));
      else await route.fulfill(paged(testNews));
      return;
    }
    if (path === "/admin/news/stats") {
      await route.fulfill(json(apiEnvelope({
        total: testNews.length,
        published: testNews.filter((item) => item.isPublished).length,
        draft: testNews.filter((item) => !item.isPublished).length,
        views: testNews.reduce((sum, item) => sum + (item.viewCount || item.views || 0), 0),
      })));
      return;
    }
    if (/^\/admin\/news\/[^/]+\/toggle$/.test(path)) {
      await route.fulfill(json(apiEnvelope({ ...testNews[0], isPublished: false })));
      return;
    }
    if (/^\/admin\/news\/[^/]+$/.test(path)) {
      const key = path.split("/").at(-1);
      const item = testNews.find((news) => news.id === key || news._id === key || news.slug === key) || testNews[0];
      if (method === "PUT") await route.fulfill(json(apiEnvelope(item)));
      else if (method === "DELETE") await route.fulfill(json(apiEnvelope(null, "Xoá bài viết thành công")));
      else await route.fulfill(json(apiEnvelope(item)));
      return;
    }

    // ─── ADMIN REVIEWS ────────────────────────────
    if (path === "/admin/reviews" || path === "/admin/comments") {
      await route.fulfill(paged(testReviews));
      return;
    }
    if (path === "/admin/reviews/sentiment") {
      await route.fulfill(json(apiEnvelope({
        overview: { total: testReviews.length, averageScore: 0.75 },
        products: [
          { productId: "prod-iphone-15", name: "iPhone 15 Pro E2E", positive: 1, negative: 0, neutral: 0, averageScore: 0.75 },
        ],
      })));
      return;
    }
    if (/^\/admin\/reviews\/[^/]+\/visibility$/.test(path)) {
      await route.fulfill(json(apiEnvelope({ ...testReviews[0], isVisible: false })));
      return;
    }
    if (/^\/admin\/reviews\/[^/]+\/reply$/.test(path)) {
      const body = route.request().postDataJSON?.() || {};
      await route.fulfill(json(apiEnvelope({ ...testReviews[0], adminReply: body.content || "Cảm ơn bạn đã đánh giá." })));
      return;
    }
    if (/^\/admin\/reviews\/[^/]+\/reply-suggestion$/.test(path)) {
      await route.fulfill(json(apiEnvelope(adminReviewReplySuggestion)));
      return;
    }
    if (/^\/admin\/reviews\/[^/]+$/.test(path)) {
      if (method === "DELETE") await route.fulfill(json(apiEnvelope(null, "Xoá bình luận thành công")));
      else await route.fulfill(json(apiEnvelope(testReviews[0])));
      return;
    }

    // ─── ADMIN RETURNS ────────────────────────────
    if (path === "/admin/returns") {
      await route.fulfill(paged(testReturnRequests));
      return;
    }
    if (/^\/admin\/returns\/[^/]+\/approve$/.test(path)) {
      await route.fulfill(json(apiEnvelope({ ...testReturnRequests[0], status: "APPROVED" })));
      return;
    }
    if (/^\/admin\/returns\/[^/]+\/reject$/.test(path)) {
      await route.fulfill(json(apiEnvelope({ ...testReturnRequests[0], status: "REJECTED" })));
      return;
    }
    if (/^\/admin\/returns\/[^/]+\/receive$/.test(path)) {
      await route.fulfill(json(apiEnvelope({ ...testReturnRequests[0], status: "RECEIVED" })));
      return;
    }
    if (/^\/admin\/returns\/[^/]+\/refund$/.test(path)) {
      await route.fulfill(json(apiEnvelope({ ...testReturnRequests[0], status: "REFUNDED" })));
      return;
    }
    if (/^\/admin\/returns\/[^/]+$/.test(path)) {
      await route.fulfill(json(apiEnvelope(testReturnRequests[0])));
      return;
    }

    // ─── ADMIN GLOBAL OPTIONS ─────────────────────
    if (path === "/admin/options" || path === "/admin/global-options") {
      if (method === "POST") {
        const body = route.request().postDataJSON?.() || {};
        await route.fulfill(json(apiEnvelope({ id: "opt-new", isActive: true, ...body })));
      } else {
        const type = url.searchParams.get("type");
        const items = type ? globalOptionsList.filter((item) => item.type === type) : globalOptionsList;
        await route.fulfill(json(apiEnvelope(items)));
      }
      return;
    }
    if (/^\/admin\/global-options\/[^/]+$/.test(path)) {
      const key = path.split("/").at(-1);
      const item = globalOptionsList.find((option) => option.id === key) || globalOptionsList[0];
      if (method === "PUT") {
        const body = route.request().postDataJSON?.() || {};
        await route.fulfill(json(apiEnvelope({ ...item, ...body })));
      } else if (method === "DELETE") {
        await route.fulfill(json(apiEnvelope(null, "Xoá tuỳ chọn thành công")));
      } else {
        await route.fulfill(json(apiEnvelope(item)));
      }
      return;
    }

    // ─── ADMIN SETTINGS ───────────────────────────
    if (path === "/admin/dashboard/settings") {
      if (method === "PUT") {
        const body = route.request().postDataJSON?.() || {};
        await route.fulfill(json(apiEnvelope({ ...appSettings, ...body })));
      } else {
        await route.fulfill(json(apiEnvelope(appSettings)));
      }
      return;
    }
    if (path === "/admin/settings" || path === "/admin/settings/shop") {
      await route.fulfill(json(apiEnvelope(appSettings)));
      return;
    }

    if (path === "/admin/ai/settings") {
      if (method === "PUT") {
        const body = route.request().postDataJSON?.() || {};
        await route.fulfill(json(apiEnvelope({ ...adminAiSettings, ...body, features: { ...adminAiSettings.features, ...body.features } })));
      } else {
        await route.fulfill(json(apiEnvelope(adminAiSettings)));
      }
      return;
    }

    if (path === "/admin/ai/test") {
      await route.fulfill(json(apiEnvelope({ ok: true, ...adminAiSettings, latencyMs: 42, message: "Kết nối AI hoạt động" })));
      return;
    }

    if (path === "/admin/ai/logs") {
      const feature = url.searchParams.get("feature");
      const status = url.searchParams.get("status");
      await route.fulfill(json(apiEnvelope(adminAiLogs.filter((log) => (!feature || log.feature === feature) && (!status || log.status === status)))));
      return;
    }

    if (path === "/settings/public") {
      await route.fulfill(json(apiEnvelope({ shop: appSettings.shop })));
      return;
    }

    if (path === "/contact") {
      await route.fulfill(json(apiEnvelope({ sent: true }, "Contact message sent")));
      return;
    }

    // ─── ADMIN UPLOAD ─────────────────────────────
    if (path === "/admin/upload" || path === "/admin/upload/image") {
      await route.fulfill(json(apiEnvelope({ url: "/assets/test/uploaded.png" })));
      return;
    }

    // ─── SEARCH / CHAT ────────────────────────────
    if (path === "/chat/health") {
      await route.fulfill(json({ aiEnabled: adminAiSettings.enabled && adminAiSettings.hasApiKey, provider: adminAiSettings.provider, model: adminAiSettings.modelName, features: adminAiSettings.features }));
      return;
    }

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
  await page.route("**/api/auth/send-verification", async (route) => {
    await route.fulfill(json(apiEnvelope(null, "Verification email sent")));
  });
  await page.route("**/api/auth/verify-email", async (route) => {
    await route.fulfill(json(apiEnvelope({ user: testUsers.customer, accessToken: "user.access", refreshToken: "user.refresh" })));
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
  await page.route(/.*\/api\/news\/[^/?]+$/, async (route) => {
    const slug = new URL(route.request().url()).pathname.split("/").at(-1);
    await route.fulfill(json(apiEnvelope(testNews.find((item) => item.slug === slug) || testNews[0])));
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
  await page.route("**/api/coupons/apply", async (route) => {
    const body = route.request().postDataJSON?.() || {};
    await route.fulfill(json(apiEnvelope({
      valid: true,
      code: body.code || "SUMMER2024",
      discountAmount: 500000,
      discount: 500000,
      discountType: "PERCENT",
      discountValue: 10,
      description: "Giam 500.000d cho don hang test",
    })));
  });
  await page.route("**/api/points", async (route) => {
    await route.fulfill(json(apiEnvelope({ points: 500, transactions: [] })));
  });
  await page.route("**/api/orders", async (route) => {
    if (route.request().method() === "POST") {
      const body = route.request().postDataJSON?.() || {};
      await route.fulfill(json(apiEnvelope(makeOrder({
        id: "order-checkout-e2e",
        code: "ORD-CHECKOUT-E2E",
        paymentMethod: body.paymentMethod || "cod",
        couponCode: body.couponCode,
        usedPoints: body.usePoints ? 500 : 0,
        totalAmount: body.usePoints ? 26990000 : 27490000,
        fullName: body.fullName,
        shippingAddress: body.address,
        shippingPhone: body.phone,
      }))));
      return;
    }
    await route.fulfill(paged(testOrders));
  });
  await page.route(/.*\/api\/orders\/[^/]+\/payment$/, async (route) => {
    await route.fulfill(json(apiEnvelope({ paymentUrl: "/payment/success?order=test" })));
  });
  await page.route("**/api/contact", async (route) => {
    await route.fulfill(json(apiEnvelope({ sent: true }, "Contact message sent")));
  });
  await page.route(/.*\/api\/categories(\?.*)?$/, async (route) => {
    await route.fulfill(json(apiEnvelope(testCategories)));
  });
  await page.route(/.*\/api\/banners(\?.*)?$/, async (route) => {
    await route.fulfill(json(apiEnvelope(testBanners)));
  });
}
