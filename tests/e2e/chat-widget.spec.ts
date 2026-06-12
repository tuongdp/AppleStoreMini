import { test, expect } from "../fixtures/test";

test.describe("chat widget", () => {
  test("opens as a single dialog with an internal close control", async ({ mockedPage: page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const copyrightDialog = page.getByRole("dialog").filter({ hasText: /TopZone|app-welcome|website/i });
    if (await copyrightDialog.isVisible().catch(() => false)) {
      await copyrightDialog.getByRole("checkbox").check();
      await copyrightDialog.getByRole("button").last().click();
      await expect(copyrightDialog).toBeHidden();
    }

    await page.locator('button[aria-label*="chat"]').click();

    const dialog = page.getByTestId("chat-widget-dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByTestId("chat-widget-close")).toBeVisible();
  });
});
