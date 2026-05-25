import assert from "node:assert/strict";
import test from "node:test";

import {
  buildSeriesFilters,
  getCategorySliderImages,
  seriesSlugToLabel,
} from "../src/features/products/utils/productListFilters.js";

test("series labels are generated from product slugs", () => {
  assert.equal(seriesSlugToLabel("iphone-17", "iphone"), "iPhone 17 Series");
  assert.equal(seriesSlugToLabel("iphone-air", "iphone"), "iPhone Air Series");
  assert.equal(seriesSlugToLabel("macbook-air", "mac"), "MacBook Air Series");
  assert.equal(seriesSlugToLabel("ipad-pro", "ipad"), "iPad Pro Series");
});

test("series filters are grouped by category slug prefix", () => {
  const products = [
    { slug: "iphone-17-pro-max" },
    { slug: "iphone-17-pro" },
    { slug: "iphone-air-256gb" },
    { slug: "iphone-16" },
    { slug: "macbook-air-m3" },
  ];

  assert.deepEqual(buildSeriesFilters(products, "iphone"), [
    { slug: "iphone-17", label: "iPhone 17 Series", count: 2 },
    { slug: "iphone-air", label: "iPhone Air Series", count: 1 },
    { slug: "iphone-16", label: "iPhone 16 Series", count: 1 },
  ]);
});

test("category slider images are read from supported category fields", () => {
  assert.deepEqual(getCategorySliderImages({ sliderImages: ["a.jpg", "b.jpg"] }), ["a.jpg", "b.jpg"]);
  assert.deepEqual(getCategorySliderImages({ sliderImages: "[\"a.jpg\"]" }), ["a.jpg"]);
  assert.deepEqual(getCategorySliderImages({ slides: [{ image: "a.jpg" }, { image: "b.jpg" }] }), ["a.jpg", "b.jpg"]);
  assert.deepEqual(getCategorySliderImages({ image: "cover.jpg" }), []);
});
