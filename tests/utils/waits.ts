import type { Page } from "@playwright/test";

export async function waitForAppReady(page: Page) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForLoadState("networkidle").catch(() => undefined);
}

export async function waitForNoBlockingLoaders(page: Page) {
  await page.locator('[data-testid*="loading"], .animate-spin').first().waitFor({ state: "hidden", timeout: 10_000 }).catch(() => undefined);
}
