import { expect, test } from "@playwright/test";
import { mkdirSync, statSync } from "node:fs";
import path from "node:path";
import { testEnv } from "../utils/env";

test.describe.configure({ mode: "serial" });

const downloadDir = path.join(process.cwd(), "test-results", "export-files-smoke");

async function saveAndAssertDownload(downloadPromise: Promise<import("@playwright/test").Download>, expectedExt: ".pdf" | ".xlsx") {
  const download = await downloadPromise;
  const filename = download.suggestedFilename();
  expect(filename.toLowerCase()).toMatch(new RegExp(`${expectedExt.replace(".", "\\.")}$`));

  mkdirSync(downloadDir, { recursive: true });
  const target = path.join(downloadDir, filename);
  await download.saveAs(target);
  expect(statSync(target).size).toBeGreaterThan(expectedExt === ".pdf" ? 2_000 : 1_000);

  return { filename, target };
}

test("local export smoke: reports, order PDF, VAT invoice, and warranty PDF download", async ({ page, request }) => {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  await page.goto("/admin/login", { waitUntil: "domcontentloaded" });
  await page.locator('input[type="email"]').fill(testEnv.adminEmail);
  await page.locator('input[type="password"]').fill(testEnv.adminPassword);
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/admin\/dashboard/);

  const loginResponse = await request.post(`${testEnv.apiUrl}auth/login`, {
    data: {
      email: testEnv.adminEmail,
      password: testEnv.adminPassword,
    },
  });
  expect(loginResponse.ok()).toBeTruthy();
  const loginBody = await loginResponse.json();
  const adminToken = loginBody?.data?.accessToken;
  expect(adminToken).toBeTruthy();

  await page.goto("/admin/orders", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /Quản lý đơn hàng/i })).toBeVisible();

  const firstOrderLink = page.getByRole("link", { name: /Xem chi tiết đơn hàng/i }).first();
  await expect(firstOrderLink).toBeVisible();
  const orderCodeText = await firstOrderLink.getAttribute("aria-label");
  const orderCode = orderCodeText?.match(/([A-Z0-9-]{4,})$/i)?.[1];
  expect(orderCode).toBeTruthy();

  await page.getByRole("button", { name: /Xuất file/i }).click();
  const ordersExcel = saveAndAssertDownload(page.waitForEvent("download"), ".xlsx");
  await page.getByRole("menuitem", { name: /Excel/i }).click();
  await ordersExcel;

  await page.getByRole("button", { name: /Xuất file/i }).click();
  const ordersPdf = saveAndAssertDownload(page.waitForEvent("download"), ".pdf");
  await page.getByRole("menuitem", { name: /PDF/i }).click();
  await ordersPdf;

  await firstOrderLink.click();
  await expect(page).toHaveURL(/\/admin\/orders\/.+/);
  await expect(page.getByRole("button", { name: /Xuất hóa đơn GTGT/i })).toBeVisible();

  await page.getByRole("button", { name: /Xuất file/i }).click();
  const orderPdf = saveAndAssertDownload(page.waitForEvent("download"), ".pdf");
  await page.getByRole("menuitem", { name: /PDF/i }).click();
  await orderPdf;

  await page.getByRole("button", { name: /Xuất hóa đơn GTGT/i }).click();
  await page.getByLabel(/Tên công ty/i).fill("Công ty TNHH Demo Tốt Nghiệp");
  await page.getByLabel(/Mã số thuế/i).fill("0312345678");
  await page.getByLabel(/Địa chỉ/i).fill("1 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh");
  const vatPdf = saveAndAssertDownload(page.waitForEvent("download"), ".pdf");
  await page.getByRole("button", { name: /^Xuất hóa đơn$/i }).click();
  await vatPdf;

  const deliveredOrdersResponse = await request.get(`${testEnv.apiUrl}admin/orders`, {
    headers: { Authorization: `Bearer ${adminToken}` },
    params: { status: "delivered", limit: 20 },
  });
  expect(deliveredOrdersResponse.ok()).toBeTruthy();
  const deliveredOrdersBody = await deliveredOrdersResponse.json();
  const deliveredOrderCode = deliveredOrdersBody?.data?.[0]?.code;
  expect(deliveredOrderCode).toBeTruthy();

  const warrantyResponse = await request.get(`${testEnv.apiUrl}orders/${deliveredOrderCode}/warranty`);
  expect(warrantyResponse.ok()).toBeTruthy();
  expect(warrantyResponse.headers()["content-type"]).toContain("application/pdf");
  expect((await warrantyResponse.body()).length).toBeGreaterThan(2_000);

  expect(consoleErrors.filter((text) => /Export PDF failed|PDF export failed|TypeError|ReferenceError/i.test(text))).toEqual([]);
});
