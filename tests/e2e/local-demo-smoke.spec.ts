import { test, expect } from "@playwright/test";
import { testEnv } from "../utils/env";

test.describe.configure({ mode: "serial" });

test("local demo smoke: product detail query, contact mail, auth, and admin", async ({ page, request }) => {
  const api = request;
  const registerEmail = `phuctuong123456+demo${Date.now()}@gmail.com`;

  await test.step("backend health and AI health are available", async () => {
    const health = await api.get(`${testEnv.apiUrl}health`);
    expect(health.ok()).toBeTruthy();

    const chatHealth = await api.get(`${testEnv.apiUrl}chat/health`);
    expect(chatHealth.ok()).toBeTruthy();
  });

  await test.step("product detail supports encoded Vietnamese query params", async () => {
    await page.goto("/products/iphone-17-pro-max?color=Cam+V%C5%A9+Tr%E1%BB%A5&storage=512GB", {
      waitUntil: "domcontentloaded",
    });
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("body")).not.toContainText(/Cannot read|TypeError|ReferenceError|Internal Server Error/i);
    expect(decodeURIComponent(page.url())).toContain("Cam+Vũ+Trụ");
  });

  await test.step("registration triggers verification mail", async () => {
    const response = await api.post(`${testEnv.apiUrl}auth/register`, {
      data: {
        fullName: "Demo Register",
        email: registerEmail,
        phone: "0900000000",
        password: testEnv.userPassword,
      },
    });
    expect(response.status()).toBe(201);
  });

  await test.step("contact form mail endpoint works", async () => {
    const response = await api.post(`${testEnv.apiUrl}contact`, {
      data: {
        name: "Demo Contact",
        email: registerEmail,
        phone: "0900000000",
        message: "Local demo smoke contact message",
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body?.data?.sent).toBe(true);
  });

  await test.step("email login routes work", async () => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await page.getByTestId("login-email").fill(testEnv.userEmail);
    await page.getByTestId("login-password").fill(testEnv.userPassword);
    await page.getByTestId("login-submit").click();
    await expect(page).toHaveURL(/\/$|\/products|\/profile/);
  });

  await test.step("admin routes work", async () => {
    await page.goto("/admin/login", { waitUntil: "domcontentloaded" });
    await page.locator('input[type="email"]').fill(testEnv.adminEmail);
    await page.locator('input[type="password"]').fill(testEnv.adminPassword);
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/\/admin\/dashboard/);

    for (const path of ["/admin/products", "/admin/orders", "/admin/users", "/admin/reviews/sentiment"]) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await expect(page.locator("body")).toBeVisible();
      await expect(page.locator("body")).not.toContainText(/Cannot read|TypeError|ReferenceError|Internal Server Error/i);
    }
  });
});
