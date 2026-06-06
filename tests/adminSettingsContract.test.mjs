import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");

describe("admin shop settings contract", () => {
  it("normalizes flat and nested settings API responses", () => {
    const source = read("src/store/api/shopSettingsApi.js");

    assert.match(source, /const normalizeSettings/);
    assert.match(source, /data\.shop \|\|/);
    assert.match(source, /data\.shopName \|\| data\.name/);
    assert.match(source, /data\.shopEmail \|\| data\.email/);
    assert.match(source, /transformResponse: normalizeSettings/);
    assert.match(source, /\/admin\/dashboard\/settings/);
    assert.match(source, /\/settings\/public/);
  });

  it("merges partial settings with defaults and keeps controls accessible", () => {
    const source = read("src/features/admin/components/shop/AdminShopSettings.jsx");

    assert.match(source, /const \{ data, isLoading, isFetching \} = useGetSettingsQuery\(\)/);
    assert.match(source, /shipping: \{ \.\.\.DEFAULTS\.shipping, \.\.\.data\?\.shipping \}/);
    assert.match(source, /payment: \{ \.\.\.DEFAULTS\.payment, \.\.\.data\?\.payment \}/);
    assert.match(source, /isLoading \|\| isFetching/);
    assert.match(source, /aria-label="Bật tắt thanh toán COD"/);
    assert.match(source, /aria-label="Bật tắt thanh toán VNPay"/);
    assert.match(source, /aria-label="Lưu tất cả cài đặt cửa hàng"/);
  });

  it("mocks dashboard settings and public nested shop settings", () => {
    const mocks = read("tests/utils/route-mocks.ts");
    const data = read("tests/utils/mock-data.ts");

    assert.match(mocks, /path === "\/admin\/dashboard\/settings"/);
    assert.match(mocks, /method === "PUT"/);
    assert.match(mocks, /path === "\/settings\/public"/);
    assert.match(mocks, /shop: appSettings\.shop/);
    assert.match(data, /shopName: "Apple Store Mini"/);
    assert.match(data, /shop: \{/);
    assert.match(data, /shipping: \{ defaultFee: 30000/);
    assert.match(data, /payment: \{ codEnabled: true, vnpayEnabled: true \}/);
  });
});
