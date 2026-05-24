import assert from "node:assert/strict";
import test from "node:test";

import {
  buildCompareProductInput,
  parseComparisonReply,
} from "../src/features/ai/compareUtils.js";

test("buildCompareProductInput includes practical commerce context", () => {
  const input = buildCompareProductInput({
    name: "iPhone 15",
    category: { name: "iPhone" },
    specifications: { screen: "6.1 inch", chip: "A16" },
    variants: [
      { price: 18900000, salePrice: 17900000, storage: "128GB", color: "Blue", inStock: true, stock: 4 },
      { price: 21900000, storage: "256GB", color: "Black", inStock: false, stock: 0 },
    ],
  });

  assert.equal(input.name, "iPhone 15");
  assert.match(input.specs, /Gia hien tai: 17\.900\.000/);
  assert.match(input.specs, /Tinh trang: Con hang/);
  assert.match(input.specs, /Phien ban: 128GB Blue, 256GB Black/);
  assert.match(input.specs, /Thong so: screen: 6.1 inch; chip: A16/);
});

test("parseComparisonReply keeps structured AI comparison sections", () => {
  const parsed = parseComparisonReply(`
Mo dau ngan.
<advantages>- Man hinh tot hon</advantages>
<disadvantages>- Gia cao hon</disadvantages>
<verdict>Chon iPhone 15 neu can gia tot.</verdict>
`);

  assert.equal(parsed.intro, "Mo dau ngan.");
  assert.equal(parsed.advantages, "- Man hinh tot hon");
  assert.equal(parsed.disadvantages, "- Gia cao hon");
  assert.equal(parsed.verdict, "Chon iPhone 15 neu can gia tot.");
});
