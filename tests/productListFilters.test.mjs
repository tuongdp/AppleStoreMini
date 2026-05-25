import assert from "node:assert/strict";
import test from "node:test";

import {
  buildSeriesFilters,
  buildSeriesFiltersFromSeries,
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

test("series filters prefer database series ordering and labels", () => {
  const series = [
    { id: "s17", name: "iPhone 17 Series", slug: "iphone-17", order: 2, isActive: true },
    { id: "sair", name: "iPhone Air Series", slug: "iphone-air", order: 1, isActive: true },
    { id: "hidden", name: "Hidden Series", slug: "hidden", order: 0, isActive: false },
  ];

  assert.deepEqual(buildSeriesFiltersFromSeries(series), [
    { id: "sair", slug: "iphone-air", label: "iPhone Air Series" },
    { id: "s17", slug: "iphone-17", label: "iPhone 17 Series" },
  ]);
});
