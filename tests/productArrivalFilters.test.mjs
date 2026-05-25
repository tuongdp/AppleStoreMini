import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("home view-all links target product arrival filters", () => {
  const source = readFileSync("src/pages/HomePage.jsx", "utf8");

  assert.match(source, /arrivalType=NEW_RELEASE/);
  assert.match(source, /arrivalType=RESTOCK/);
});

test("product list reads and displays product arrival filters", () => {
  const source = readFileSync("src/pages/ProductListPage.jsx", "utf8");

  assert.match(source, /searchParams\.get\("arrivalType"\)/);
  assert.match(source, /PRODUCT_ARRIVAL_FILTERS/);
  assert.match(source, /updateFilter\("arrivalType"/);
});
