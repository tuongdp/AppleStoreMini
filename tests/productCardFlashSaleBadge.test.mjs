import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("product card shows flash sale discount percent badge", () => {
  const source = readFileSync("src/components/shared/ProductCard.jsx", "utf8");

  assert.match(source, /calcDiscount/);
  assert.match(source, /flashSaleDiscount/);
  assert.match(source, /-\{flashSaleDiscount\}%/);
  assert.match(source, /formatPrice\(effectivePrice\)[\s\S]*-\{flashSaleDiscount\}%/);
  assert.doesNotMatch(source, /FLASH SALE[\s\S]{0,260}-\{flashSaleDiscount\}%/);
});
