import assert from "node:assert/strict";
import test from "node:test";

import {
  findVariantForOption,
  getSelectedVariant,
  isOptionSelectable,
} from "../src/features/products/utils/productVariantSelection.js";

const variants = [
  {
    id: "silver-256-8",
    color: "Silver",
    storage: "256GB",
    ram: "8GB",
    edition: "",
    inStock: true,
    stock: 5,
  },
  {
    id: "silver-512-16",
    color: "Silver",
    storage: "512GB",
    ram: "16GB",
    edition: "",
    inStock: true,
    stock: 3,
  },
  {
    id: "black-256-16",
    color: "Black",
    storage: "256GB",
    ram: "16GB",
    edition: "",
    inStock: true,
    stock: 4,
  },
  {
    id: "black-512-16-out",
    color: "Black",
    storage: "512GB",
    ram: "16GB",
    edition: "",
    inStock: true,
    stock: 0,
  },
];

test("color remains selectable when the currently selected storage does not exist for that color", () => {
  const currentSelection = {
    color: "Silver",
    storage: "512GB",
    ram: "16GB",
    edition: "",
  };

  assert.equal(isOptionSelectable(variants, "color", "Black", currentSelection), true);
});

test("option availability ignores out-of-stock variants", () => {
  const currentSelection = {
    color: "Black",
    storage: "",
    ram: "",
    edition: "",
  };

  assert.equal(isOptionSelectable(variants, "storage", "512GB", currentSelection), false);
});

test("selecting a color resolves to an in-stock coherent variant", () => {
  const currentSelection = {
    color: "Silver",
    storage: "512GB",
    ram: "16GB",
    edition: "",
  };

  const selected = findVariantForOption(variants, "color", "Black", currentSelection);

  assert.equal(selected.id, "black-256-16");
});

test("partial URL selections resolve to an in-stock matching variant", () => {
  const selected = getSelectedVariant(variants, {
    color: "Silver",
    storage: "512GB",
    ram: "",
    edition: "",
  });

  assert.equal(selected.id, "silver-512-16");
});
