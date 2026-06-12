import { test, expect } from "../fixtures/test";
import { waitForAppReady } from "../utils/waits";

test.describe("pwa and service worker", () => {
  test.use({ serviceWorkers: "allow" });

  test("serves offline fallback page", async ({ page }) => {
    const response = await page.request.get("/offline.html");
    expect(response.ok()).toBeTruthy();
    await expect(await response.text()).toContain("offline");
  });

  test("registers service worker in browser context", async ({ page, browserName }) => {
    test.skip(browserName === "firefox", "service workers are verified in Chromium/WebKit projects");
    await page.goto("/");
    const registered = await page.evaluate(async () => {
      if (!("serviceWorker" in navigator)) return false;
      const registration = await navigator.serviceWorker.register("/sw.js");
      return Boolean(registration);
    });
    expect(registered).toBeTruthy();
  });

  test("shows application after offline then online transition", async ({ mockedPage: page, context }) => {
    await page.goto("/");
    await waitForAppReady(page);
    await context.setOffline(true);
    await expect(page.locator("body")).toBeVisible();
    await context.setOffline(false);
    await page.reload();
    await waitForAppReady(page);
    await expect(page.locator("body")).toBeVisible();
  });
});
