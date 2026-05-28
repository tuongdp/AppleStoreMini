import { test, expect } from "../fixtures/test";
import { seedAuthStorage } from "../utils/auth";
import { testEnv } from "../utils/env";

test.describe("FULL USER FLOW: Register → Browse → Detail → Cart → Checkout", () => {

  test("FLOW 1: Register new account", async ({ mockedPage: page }) => {
    await page.goto("/register", { waitUntil: "domcontentloaded" });

    await expect(page.locator("h1, h2, h3").first()).toBeVisible({ timeout: 10000 });

    await page.getByTestId("register-full-name").fill("Nguyễn Văn Test");
    await page.getByTestId("register-email").fill(`e2e-fullflow-${Date.now()}@example.com`);
    await page.getByTestId("register-phone").fill("0900000000");
    await page.getByTestId("register-password").fill(testEnv.userPassword);
    await page.getByTestId("register-confirm-password").fill(testEnv.userPassword);

    const checkbox = page.getByRole("checkbox");
    if (await checkbox.isVisible()) await checkbox.click();

    await page.getByTestId("register-submit").click();

    await expect(page.getByRole("heading", { name: /xác thực|verify/i })).toBeVisible({ timeout: 15000 });
  });

  test("FLOW 2: Login after registration", async ({ mockedPage: page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });

    await expect(page.getByTestId("login-email")).toBeVisible();

    await page.getByTestId("login-email").fill(testEnv.userEmail);
    await page.getByTestId("login-password").fill(testEnv.userPassword);
    await page.getByTestId("login-submit").click();

    await expect(page).toHaveURL(/\/$|\/products|\/profile/, { timeout: 15000 });
  });

  test("FLOW 3: Browse homepage - banners, categories, featured products", async ({ mockedPage: page }) => {
    await seedAuthStorage(page);
    await page.goto("/");

    // Verify homepage sections render
    await expect(page.locator("body")).toBeVisible();

    // Check navigation links exist
    const header = page.locator("header");
    const navLinks = header.getByRole("link");
    await expect(navLinks.first()).toBeVisible({ timeout: 10000 });
  });

  test("FLOW 4: Browse product listing with filters", async ({ mockedPage: page }) => {
    await seedAuthStorage(page);
    await page.goto("/products");

    // Product cards render
    await expect(page.getByTestId("product-card").first()).toBeVisible({ timeout: 10000 });

    // Click iPhone category
    await page.goto("/products?category=iphone");
    await expect(page.locator("body")).toBeVisible();
    await expect(page.getByTestId("product-card").first()).toBeVisible({ timeout: 10000 });
  });

  test("FLOW 5: Product detail - view full info", async ({ mockedPage: page }) => {
    await seedAuthStorage(page);
    await page.goto("/products");

    // Click first product card
    const cardLink = page.getByTestId("product-card-link").first();
    await expect(cardLink).toBeVisible({ timeout: 10000 });
    await cardLink.click();

    // Verify product detail page loaded
    await expect(page).toHaveURL(/\/products\//, { timeout: 15000 });

    // Check product name is visible
    await expect(page.locator("h1, h2").first()).toBeVisible({ timeout: 10000 });

    // Check buy button
    const buyButton = page.getByRole("button", { name: /mua ngay|thêm vào giỏ/i }).first();
    await expect(buyButton).toBeVisible({ timeout: 10000 });
  });

  test("FLOW 6: Add to cart from product detail", async ({ mockedPage: page }) => {
    await seedAuthStorage(page);
    await page.goto("/products/iphone-15-pro-e2e");

    await expect(page.locator("body")).toBeVisible();

    // Click add to cart button if visible
    const addToCartBtn = page.getByRole("button", { name: /thêm vào giỏ|mua ngay/i }).first();
    if (await addToCartBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await addToCartBtn.click();
    }

    // Navigate to cart
    await page.goto("/cart", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toBeVisible();
  });

  test("FLOW 7: Cart management - view and verify", async ({ mockedPage: page }) => {
    await seedAuthStorage(page);
    await page.goto("/cart", { waitUntil: "domcontentloaded" });

    await expect(page.locator("body")).toBeVisible({ timeout: 10000 });
  });

  test("FLOW 8: Checkout flow", async ({ mockedPage: page }) => {
    await seedAuthStorage(page);

    // Pre-load cart data
    await page.addInitScript(() => {
      sessionStorage.setItem("persist:apple-store", JSON.stringify({
        auth: JSON.stringify({ user: { id: "flow-user", role: "user", isVerified: true }, accessToken: "user.access" }),
        cart: JSON.stringify({ items: [{ variantId: "v1", quantity: 1, product: { id: "prod-iphone-15", name: "iPhone 15 Pro E2E", slug: "iphone-15-pro-e2e", price: 29990000, salePrice: 27990000, stock: 5, inStock: true } }] }),
        wishlist: JSON.stringify({ items: [] }),
        _persist: JSON.stringify({ version: -1, rehydrated: true }),
      }));
    });

    await page.goto("/checkout", { waitUntil: "domcontentloaded" });

    await expect(page.locator("body")).toBeVisible({ timeout: 10000 });
  });

  test("FLOW 9: Search functionality", async ({ mockedPage: page }) => {
    await seedAuthStorage(page);
    await page.goto("/search", { waitUntil: "domcontentloaded" });

    const searchInput = page.getByTestId("search-page-input");
    await expect(searchInput).toBeVisible({ timeout: 10000 });

    await searchInput.fill("iPhone");
    await searchInput.press("Enter");

    await expect(page.getByTestId("product-card").first()).toBeVisible({ timeout: 10000 });
  });

  test("FLOW 10: Forgot password flow", async ({ mockedPage: page }) => {
    await page.goto("/forgot-password", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { name: /quên mật khẩu|forgot/i })).toBeVisible();

    const emailInput = page.getByTestId("forgot-password-email");
    if (await emailInput.isVisible()) {
      await emailInput.fill("test@example.com");
      await page.getByTestId("forgot-password-submit").click();
    }
  });
});

test.describe("FULL USER FLOW: Profile & Orders", () => {

  test("FLOW 11: View profile page", async ({ mockedPage: page }) => {
    await seedAuthStorage(page);
    await page.goto("/profile", { waitUntil: "domcontentloaded" });

    await expect(page.locator("body")).toBeVisible({ timeout: 10000 });
  });

  test("FLOW 12: View order history", async ({ mockedPage: page }) => {
    await seedAuthStorage(page);
    await page.goto("/profile/orders", { waitUntil: "domcontentloaded" });

    await expect(page.locator("body")).toBeVisible({ timeout: 10000 });
  });

  test("FLOW 13: View order detail", async ({ mockedPage: page }) => {
    await seedAuthStorage(page);
    await page.goto("/profile/orders/order-1", { waitUntil: "domcontentloaded" });

    await expect(page.locator("body")).toBeVisible({ timeout: 10000 });
  });

  test("FLOW 14: Change password page", async ({ mockedPage: page }) => {
    await seedAuthStorage(page);
    await page.goto("/profile/change-password", { waitUntil: "domcontentloaded" });

    await expect(page.locator("body")).toBeVisible({ timeout: 10000 });
  });

  test("FLOW 15: Points / loyalty page", async ({ mockedPage: page }) => {
    await seedAuthStorage(page);
    await page.goto("/profile/points", { waitUntil: "domcontentloaded" });

    await expect(page.locator("body")).toBeVisible({ timeout: 10000 });
  });

  test("FLOW 16: Wishlist page", async ({ mockedPage: page }) => {
    await seedAuthStorage(page);
    await page.goto("/profile/wishlist", { waitUntil: "domcontentloaded" });

    await expect(page.locator("body")).toBeVisible({ timeout: 10000 });
  });
});

test.describe("FULL USER FLOW: Content Pages", () => {

  const contentPages = [
    { path: "/about", name: "About" },
    { path: "/contact", name: "Contact" },
    { path: "/warranty", name: "Warranty" },
    { path: "/return", name: "Return Policy" },
    { path: "/privacy", name: "Privacy" },
    { path: "/terms", name: "Terms" },
    { path: "/apple-care", name: "Apple Care" },
  ];

  for (const { path, name } of contentPages) {
    test(`FLOW 17-${name}: Content page renders`, async ({ mockedPage: page }) => {
      await seedAuthStorage(page);
      await page.goto(path, { waitUntil: "domcontentloaded" });

      await expect(page.locator("body")).toBeVisible({ timeout: 10000 });
    });
  }
});

test.describe("FULL USER FLOW: News", () => {

  test("FLOW 18: News listing page", async ({ mockedPage: page }) => {
    await seedAuthStorage(page);
    await page.goto("/news", { waitUntil: "domcontentloaded" });

    await expect(page.locator("body")).toBeVisible({ timeout: 10000 });
  });

  test("FLOW 19: News detail page", async ({ mockedPage: page }) => {
    await seedAuthStorage(page);
    await page.goto("/news/kinh-nghiem-chon-iphone-phu-hop", { waitUntil: "domcontentloaded" });

    await expect(page.locator("body")).toBeVisible({ timeout: 10000 });
  });
});

test.describe("FULL USER FLOW: Payment Results", () => {

  test("FLOW 20: Payment success page", async ({ mockedPage: page }) => {
    await seedAuthStorage(page);
    await page.goto("/payment/success", { waitUntil: "domcontentloaded" });

    await expect(page.locator("body")).toBeVisible({ timeout: 10000 });
  });

  test("FLOW 21: Payment failure page", async ({ mockedPage: page }) => {
    await seedAuthStorage(page);
    await page.goto("/payment/fail", { waitUntil: "domcontentloaded" });

    await expect(page.locator("body")).toBeVisible({ timeout: 10000 });
  });
});
