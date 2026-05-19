import type { Page } from "@playwright/test";
import { apiEnvelope, makeOrder, testProducts, testUsers } from "./mock-data";

const json = (body: unknown, status = 200) => ({
  status,
  contentType: "application/json",
  body: JSON.stringify(body),
});

export async function mockApi(page: Page) {
  let serverCartQuantity = 1;

  await page.route(/^https?:\/\/(localhost|127\.0\.0\.1):5000\/api\/.*$/, async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname.replace(/^\/api/, "");

    if (route.request().method() === "OPTIONS") {
      await route.fulfill(json({}, 204));
      return;
    }

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

    if (path === "/products/search") {
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
      await route.fulfill(json({ ...apiEnvelope(testProducts), pagination: { page: 1, limit: 12, total: testProducts.length, totalPages: 1 } }));
      return;
    }

    if (path === "/orders") {
      await route.fulfill(json(apiEnvelope(makeOrder())));
      return;
    }

    if (path === "/cart") {
      const body = route.request().postDataJSON?.() || {};
      if (body.quantity) serverCartQuantity = body.quantity;
      await route.fulfill(json(apiEnvelope({
        items: [{
          quantity: serverCartQuantity,
          variantId: "v1",
          variant: {
            id: "v1",
            stock: 5,
            product: testProducts[0],
          },
        }],
      })));
      return;
    }

    await route.fulfill(json(apiEnvelope([])));
  });

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

  await page.route(/.*\/api\/products\/slug\/[^/]+\/related(\?.*)?$/, async (route) => {
    await route.fulfill(json(apiEnvelope(testProducts)));
  });

  await page.route(/.*\/api\/products\/slug\/[^/]+$/, async (route) => {
    await route.fulfill(json(apiEnvelope(testProducts[0])));
  });

  await page.route(/.*\/api\/products(\?.*)?$/, async (route) => {
    await route.fulfill(json({ ...apiEnvelope(testProducts), pagination: { page: 1, limit: 12, total: testProducts.length, totalPages: 1 } }));
  });

  await page.route(/.*\/api\/orders$/, async (route) => {
    await route.fulfill(json(apiEnvelope(makeOrder())));
  });

}
