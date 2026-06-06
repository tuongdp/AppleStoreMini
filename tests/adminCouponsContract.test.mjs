import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");

describe("admin coupons contract", () => {
  it("supports backend coupon field aliases in list and export", () => {
    const source = read("src/features/admin/components/coupons/AdminCouponList.jsx");

    assert.match(source, /getMinOrderAmount\s*=\s*\(coupon\)\s*=>\s*coupon\.minOrderAmount \?\? coupon\.minOrderValue/);
    assert.match(source, /getMaxUsage\s*=\s*\(coupon\)\s*=>\s*coupon\.maxUsage \?\? coupon\.usageLimit/);
    assert.match(source, /getExpiresAt\s*=\s*\(coupon\)\s*=>\s*coupon\.expiresAt \?\? coupon\.endDate/);
    assert.match(source, /getMaxDiscountAmount\s*=\s*\(coupon\)\s*=>\s*coupon\.maxDiscountAmount \?\? coupon\.maxDiscount/);
  });

  it("uses refetch loading state and decorative icons correctly", () => {
    const source = read("src/features/admin/components/coupons/AdminCouponList.jsx");

    assert.match(source, /isLoading,\s*isFetching/);
    assert.match(source, /disabled=\{isLoading \|\| isFetching\}/);
    assert.match(source, /isLoading \|\| isFetching/);
    assert.match(source, /<Plus[^>]+aria-hidden="true"/);
    assert.match(source, /<ToggleRight[^>]+aria-hidden="true"/);
    assert.match(source, /<Pencil[^>]+aria-hidden="true"/);
    assert.match(source, /<Trash2[^>]+aria-hidden="true"/);
  });

  it("submits uppercase discountType and reads edit aliases", () => {
    const source = read("src/features/admin/components/coupons/AdminCouponForm.jsx");

    assert.match(source, /discountType:\s*values\.discountType\.toUpperCase\(\)/);
    assert.match(source, /coupon\.minOrderAmount \?\? coupon\.minOrderValue/);
    assert.match(source, /coupon\.maxUsage \?\? coupon\.usageLimit/);
    assert.match(source, /coupon\.expiresAt \|\| coupon\.endDate/);
  });

  it("mocks coupon create, toggle, and review reward endpoints", () => {
    const source = read("tests/utils/route-mocks.ts");
    const createIndex = source.indexOf('method === "POST"');
    const toggleIndex = source.indexOf('/^\\/admin\\/coupons\\/[^/]+\\/toggle$/.test(path)');
    const detailIndex = source.indexOf('/^\\/admin\\/coupons\\/[^/]+$/.test(path)');

    assert.match(source, /path === "\/admin\/dashboard\/review-reward"/);
    assert.ok(createIndex > -1);
    assert.ok(toggleIndex > -1);
    assert.ok(detailIndex > toggleIndex);
  });
});
