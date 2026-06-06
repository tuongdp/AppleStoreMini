import { test, expect } from "../fixtures/test";

test.describe("chat widget", () => {
  test("opens as a single dialog with an internal close control", async ({ mockedPage: page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await page.getByRole("button", { name: "Mở chat" }).click();

    const dialog = page.getByTestId("chat-widget-dialog");
    await expect(dialog).toBeVisible();
    await expect(page.getByRole("button", { name: "Mở chat" })).toHaveCount(0);
    await expect(dialog.getByTestId("chat-widget-close")).toBeVisible();
  });
});
