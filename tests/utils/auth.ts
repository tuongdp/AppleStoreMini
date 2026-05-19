import type { Page } from "@playwright/test";
import { testEnv } from "./env";

export async function loginViaUi(page: Page, email = testEnv.userEmail, password = testEnv.userPassword) {
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.getByTestId("login-email").fill(email);
  await page.getByTestId("login-password").fill(password);
  await page.getByTestId("login-submit").click();
  await page.waitForURL(/\/$|\/admin\/dashboard|\/products|\/profile/, { timeout: 15_000 });
}

export async function seedAuthStorage(page: Page, role: "user" | "admin" = "user") {
  await page.addInitScript((selectedRole) => {
    const payload = JSON.stringify({
      auth: JSON.stringify({
        user: { id: "storage-user", email: selectedRole === "admin" ? "admin@example.com" : "user@example.com", role: selectedRole, isVerified: true },
        accessToken: `${selectedRole}.access`,
        refreshToken: `${selectedRole}.refresh`,
      }),
      cart: JSON.stringify({ items: [] }),
      wishlist: JSON.stringify({ items: [] }),
      _persist: JSON.stringify({ version: -1, rehydrated: true }),
    });
    sessionStorage.setItem("persist:apple-store", payload);
    localStorage.setItem("persist:apple-store", payload);
  }, role);
}
