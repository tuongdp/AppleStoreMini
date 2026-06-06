import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("product detail category navigation uses category slug for product list filters", () => {
  const source = readFileSync("src/pages/ProductDetailPage.jsx", "utf8");

  assert.match(source, /const categorySlug = product\.category\?\.slug \|\| product\.categorySlug \|\| ""/);
  assert.match(source, /category=\{categorySlug\}/);
  assert.doesNotMatch(source, /category=\{categoryDisplay\}/);
});

test("related products link encodes the category slug", () => {
  const source = readFileSync("src/features/products/components/RelatedProducts.jsx", "utf8");

  assert.match(source, /encodeURIComponent\(category\)/);
  assert.match(source, /viewAllHref=\{viewAllHref\}/);
});

test("product list page exposes filter-aware seo and icon pagination", () => {
  const source = readFileSync("src/pages/ProductListPage.jsx", "utf8");

  assert.match(source, /const canonicalPath = `\$\{ROUTES\.PRODUCTS\}/);
  assert.match(source, /title=\{pageTitle\}/);
  assert.match(source, /url=\{canonicalPath\}/);
  assert.match(source, /ChevronLeft/);
  assert.match(source, /ChevronRight/);
});
