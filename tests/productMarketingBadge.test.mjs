import assert from "node:assert/strict";
import test from "node:test";

import {
  getProductMarketingBadge,
  PRODUCT_MARKETING_BADGE_TYPES,
} from "../src/features/products/utils/productMarketingBadge.js";

const NOW = new Date("2026-05-25T00:00:00.000Z");

test("shows new release badge while the marketing label is active", () => {
  const badge = getProductMarketingBadge(
    {
      arrivalType: PRODUCT_MARKETING_BADGE_TYPES.NEW_RELEASE,
      arrivalDate: "2026-05-01T00:00:00.000Z",
    },
    NOW,
  );

  assert.deepEqual(badge, {
    label: "Mới ra mắt",
    tone: "new-release",
    title: "Sản phẩm mới được Apple công bố",
  });
});

test("shows restock badge while the marketing label is active", () => {
  const badge = getProductMarketingBadge(
    {
      arrivalType: PRODUCT_MARKETING_BADGE_TYPES.RESTOCK,
      arrivalDate: "2026-05-20T00:00:00.000Z",
    },
    NOW,
  );

  assert.deepEqual(badge, {
    label: "Mới nhập về",
    tone: "restock",
    title: "Hàng chính hãng mới 100%, vừa được nhập lại",
  });
});

test("hides marketing badge after 30 days", () => {
  const badge = getProductMarketingBadge(
    {
      arrivalType: PRODUCT_MARKETING_BADGE_TYPES.NEW_RELEASE,
      arrivalDate: "2026-04-20T00:00:00.000Z",
    },
    NOW,
  );

  assert.equal(badge, null);
});

test("does not infer marketing badge from product creation date", () => {
  const badge = getProductMarketingBadge(
    {
      createdAt: "2026-05-24T00:00:00.000Z",
    },
    NOW,
  );

  assert.equal(badge, null);
});
