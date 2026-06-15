import { test, expect } from "../fixtures/test";
import { seedAuthStorage } from "../utils/auth";
import { waitForNoBlockingLoaders } from "../utils/waits";

const checkoutCartState = {
  items: [{
    variantId: "v1",
    quantity: 1,
    selected: true,
    product: {
      id: "prod-iphone-15",
      _id: "prod-iphone-15",
      name: "iPhone 15 Pro E2E",
      slug: "iphone-15-pro-e2e",
      price: 29990000,
      salePrice: 27990000,
      stock: 5,
      inStock: true,
      variantId: "v1",
      images: ["/assets/test/iphone.png"],
    },
  }],
};

async function seedCheckoutState(page, { authenticated = false } = {}) {
  await page.addInitScript((state) => {
    const auth = state.authenticated
      ? { user: { id: "checkout-user", role: "user", isVerified: true, fullName: "Checkout User", email: "checkout@example.com", phone: "0900000000" }, accessToken: "user.access", refreshToken: "user.refresh", isAuthenticated: true }
      : { user: null, accessToken: null, refreshToken: null, isAuthenticated: false };
    const persisted = {
      auth: JSON.stringify(auth),
      cart: JSON.stringify(state.cart),
      wishlist: JSON.stringify({ items: [] }),
      _persist: JSON.stringify({ version: -1, rehydrated: true }),
    };
    sessionStorage.setItem("persist:apple-store", JSON.stringify(persisted));
    localStorage.setItem("persist:apple-store", JSON.stringify(persisted));
    window.__E2E_PRELOADED_STATE__ = {
      auth,
      cart: state.cart,
      wishlist: { items: [] },
      ui: {},
    };
  }, { cart: checkoutCartState, authenticated });
}

async function fillCheckoutAddress(page) {
  await page.getByTestId("checkout-full-name").fill("Nguyen Van Test");
  await page.getByTestId("checkout-phone").fill("0901234567");
  await page.getByTestId("checkout-email").fill("checkout@example.com");
  await page.getByTestId("checkout-province").click();
  await page.getByRole("option", { name: /Hồ Chí Minh/ }).click();
  await page.getByTestId("checkout-ward").click();
  await page.getByRole("option", { name: /Xóm Chiếu/ }).click();
  await page.getByTestId("checkout-street-address").fill("123 Nguyễn Huệ");
}

test.describe("ecommerce flows", () => {
  test("shows product listing with pagination-ready cards", async ({ mockedPage: page }) => {
    await page.goto("/products");
    await waitForNoBlockingLoaders(page);
    await expect(page.getByTestId("product-card")).toHaveCount(3);
  });

  test("highlights the active category in the desktop navbar", async ({ mockedPage: page }, testInfo) => {
    test.skip(testInfo.project.name.includes("mobile"), "Desktop navbar is hidden on mobile viewports");

    await page.goto("/products?category=iphone");
    const iphoneNavItem = page.locator("header").getByRole("link", { name: "iPhone", exact: true });

    await expect(iphoneNavItem).toHaveClass(/bg-muted/);
  });

  test("does not open a category submenu from the header navbar", async ({ mockedPage: page }, testInfo) => {
    test.skip(testInfo.project.name.includes("mobile"), "Desktop navbar is hidden on mobile viewports");

    const header = page.locator("header");

    await page.goto("/products?category=iphone");
    await header.getByRole("link", { name: "iPhone", exact: true }).hover();

    await expect(header.locator('a[href*="sort="]')).toHaveCount(0);
  });

  test("uses consistent hover background for simple header nav links", async ({ mockedPage: page }, testInfo) => {
    test.skip(testInfo.project.name.includes("mobile"), "Desktop navbar is hidden on mobile viewports");

    const header = page.locator("header");

    await page.goto("/products?category=iphone");

    await expect(header.locator('a[href="/apple-care"]')).toHaveClass(/hover:bg-muted/);
    await expect(header.locator('a[href="/news"]')).toHaveClass(/hover:bg-muted/);
  });

  test("does not show duplicate category tabs on product listing pages", async ({ mockedPage: page }, testInfo) => {
    test.skip(testInfo.project.name.includes("mobile"), "Desktop navbar is hidden on mobile viewports");

    await page.goto("/products?category=iphone");

    await expect(page.getByRole("button", { name: /danh/i })).toHaveCount(0);
  });

  test("uses simplified product filter and sort nav", async ({ mockedPage: page }) => {
    await page.goto("/products?category=iphone&sort=price_asc");

    await expect(page.getByText("Sắp xếp theo")).toBeVisible();
    await expect(page.getByRole("button", { name: "Giá thấp đến cao" })).toHaveClass(/bg-foreground/);
    await page.getByRole("button", { name: "Bán chạy" }).click();
    await expect(page).toHaveURL(/sort=best_seller/);
    await expect(page.getByTestId("active-filter-chip")).toHaveCount(0);
  });

  test("opens product detail from a stable card selector", async ({ mockedPage: page }) => {
    await page.goto("/products");
    await page.getByTestId("product-card-link").first().click();
    await expect(page).toHaveURL(/\/products\/iphone-15-pro-e2e/);
  });

  test("shows mobile sticky buy bar on product detail", async ({ mockedPage: page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/products/iphone-15-pro-e2e");

    const stickyBar = page.getByTestId("mobile-sticky-buy-bar");
    await expect(stickyBar).toBeVisible();
    await expect(stickyBar).toContainText("iPhone 15 Pro E2E");
    await expect(stickyBar.getByRole("button", { name: "Mua ngay" })).toBeVisible();
  });

  test("search suggestions and search results route are available", async ({ mockedPage: page }) => {
    await page.goto("/search", { waitUntil: "domcontentloaded" });
    await page.getByTestId("search-page-input").fill("iphone");
    await page.getByTestId("search-page-input").press("Enter");
    await expect(page.getByTestId("product-card").first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Tin tức liên quan" })).toBeVisible();
  });

  test("opens global search with keyboard shortcut", async ({ mockedPage: page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("app-welcome-dismissed", "1");
    });
    await page.goto("/");
    await page.keyboard.press("ControlOrMeta+K");

    const overlayInput = page.getByTestId("global-search-input");
    await expect(overlayInput).toBeVisible();
    await expect(overlayInput).toBeFocused();
  });

  test("does not hijack keyboard shortcut while typing in a field", async ({ mockedPage: page }) => {
    await page.goto("/search", { waitUntil: "domcontentloaded" });

    const pageInput = page.getByTestId("search-page-input");
    await pageInput.focus();
    await page.keyboard.press("ControlOrMeta+K");

    await expect(pageInput).toBeFocused();
    await expect(page.getByRole("button", { name: "Đóng tìm kiếm" })).toHaveCount(0);
  });

  test("updates cart quantity using deterministic controls", async ({ mockedPage: page }) => {
    await page.addInitScript(() => {
      const persisted = {
        auth: JSON.stringify({ user: { id: "storage-user", role: "user", isVerified: true }, accessToken: "user.access", refreshToken: "user.refresh", isAuthenticated: true }),
        cart: JSON.stringify({ items: [{ variantId: "v1", quantity: 1, product: { id: "prod-iphone-15", name: "iPhone 15 Pro E2E", slug: "iphone-15-pro-e2e", price: 29990000, stock: 5, inStock: true } }] }),
        wishlist: JSON.stringify({ items: [] }),
        _persist: JSON.stringify({ version: -1, rehydrated: true }),
      };
      sessionStorage.setItem("persist:apple-store", JSON.stringify(persisted));
      localStorage.setItem("persist:apple-store", JSON.stringify(persisted));
      window.__E2E_PRELOADED_STATE__ = {
        auth: { user: { id: "storage-user", role: "user", isVerified: true }, accessToken: "user.access", refreshToken: "user.refresh", isAuthenticated: true },
        cart: { items: [{ variantId: "v1", quantity: 1, product: { id: "prod-iphone-15", name: "iPhone 15 Pro E2E", slug: "iphone-15-pro-e2e", price: 29990000, stock: 5, inStock: true } }] },
        wishlist: { items: [] },
        ui: {},
      };
    });
    await page.goto("/cart", { waitUntil: "domcontentloaded" });
    const line = page.getByTestId("cart-line-item").first();
    await expect(line).toBeVisible();
    await line.getByTestId("quantity-value").fill("2");
    await line.getByTestId("quantity-value").blur();
    await expect(line.getByTestId("quantity-value")).toHaveValue("2");
  });

  test("supports wishlist toggle behind auth", async ({ mockedPage: page }) => {
    await seedAuthStorage(page);
    await page.goto("/products");
    await page.getByTestId("product-card").first().hover();
    await page.getByTestId("wishlist-toggle").first().click();
    await expect(page.getByTestId("wishlist-toggle").first()).toBeVisible();
  });

  test("guest checkout shows login prompt for coupon and creates COD order", async ({ mockedPage: page }) => {
    await seedCheckoutState(page);
    const orderRequestPromise = page.waitForRequest((request) =>
      request.method() === "POST" && request.url().includes("/api/orders"),
    );

    await page.goto("/checkout", { waitUntil: "domcontentloaded" });

    // Guest should not see coupon input, instead see login prompt
    await expect(page.getByTestId("coupon-code-input")).not.toBeVisible();
    await expect(page.getByText("đăng nhập")).toBeVisible();
    await expect(page.getByText("để sử dụng mã giảm giá")).toBeVisible();

    await fillCheckoutAddress(page);
    await page.getByTestId("payment-method-cod").click();
    await page.getByTestId("checkout-payment-next").click();
    await page.getByTestId("checkout-place-order").click();

    const orderBody = orderRequestPromise.then((request) => request.postDataJSON());
    await expect(page.getByText(/ORD-CHECKOUT-E2E/)).toBeVisible();
    // Guest order should NOT have a coupon
    await expect(orderBody).resolves.toMatchObject({
      paymentMethod: "cod",
      usePoints: false,
    });
    const body = await orderBody;
    expect(body.couponCode).toBeUndefined();
  });

  test("authenticated checkout supports coupon, points, and VNPay redirect", async ({ mockedPage: page }) => {
    await seedCheckoutState(page, { authenticated: true });
    const orderRequestPromise = page.waitForRequest((request) =>
      request.method() === "POST" && request.url().includes("/api/orders"),
    );
    const paymentRequestPromise = page.waitForRequest((request) =>
      request.method() === "POST" && /\/api\/orders\/[^/]+\/payment$/.test(new URL(request.url()).pathname),
    );

    await page.goto("/checkout", { waitUntil: "domcontentloaded" });
    await page.getByTestId("coupon-code-input").fill("SUMMER2024");
    await page.getByTestId("coupon-apply-button").click();
    await expect(page.getByText("SUMMER2024", { exact: true })).toBeVisible();
    await page.getByTestId("checkout-use-points").click();

    await fillCheckoutAddress(page);
    await page.getByTestId("payment-method-vnpay").click();
    await page.getByTestId("checkout-payment-next").click();
    await page.getByTestId("checkout-place-order").click();

    const orderBody = orderRequestPromise.then((request) => request.postDataJSON());
    await paymentRequestPromise;
    await expect(page).toHaveURL(/\/payment\/success\?order=test/);
    await expect(orderBody).resolves.toMatchObject({
      paymentMethod: "vnpay",
      couponCode: "SUMMER2024",
      usePoints: true,
    });
  });

  test("wishlist page shows the product added from listing", async ({ mockedPage: page }) => {
    await page.addInitScript(() => {
      const auth = { user: { id: "storage-user", role: "user", isVerified: true }, accessToken: "user.access", refreshToken: "user.refresh", isAuthenticated: true };
      const wishlist = {
        items: [{
          id: "prod-iphone-15",
          _id: "prod-iphone-15",
          name: "iPhone 15 Pro E2E",
          slug: "iphone-15-pro-e2e",
          category: "iphone",
          price: 29990000,
          salePrice: 27990000,
          stock: 12,
          inStock: true,
          images: JSON.stringify(["/assets/test/iphone.png"]),
        }],
      };
      const persisted = {
        auth: JSON.stringify(auth),
        cart: JSON.stringify({ items: [] }),
        wishlist: JSON.stringify(wishlist),
        _persist: JSON.stringify({ version: -1, rehydrated: true }),
      };
      sessionStorage.setItem("persist:apple-store", JSON.stringify(persisted));
      localStorage.setItem("persist:apple-store", JSON.stringify(persisted));
      window.__E2E_PRELOADED_STATE__ = {
        auth,
        cart: { items: [] },
        wishlist,
        ui: {},
      };
    });

    await page.goto("/profile/wishlist", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("product-card")).toHaveCount(1);
    await expect(page.getByText("iPhone 15 Pro E2E")).toBeVisible();
  });

  test("AI search keeps AI mode in the URL", async ({ mockedPage: page }) => {
    await page.route("**/api/chat/search", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: { products: [] } }),
      });
    });

    await page.goto("/search?ai=1", { waitUntil: "domcontentloaded" });
    await page.getByTestId("search-page-input").fill("iphone pin trau");
    await page.getByTestId("search-page-input").press("Enter");

    await expect(page).toHaveURL(/\/search\?q=iphone\+pin\+trau&ai=1|\/search\?q=iphone%20pin%20trau&ai=1/);
  });
});
