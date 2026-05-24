import test from "node:test";
import assert from "node:assert/strict";

import { filterChatProductsByMessage } from "../src/features/ai/chatProductFilter.js";

test("filters exact iPhone model query to the exact product card", () => {
  const products = [
    { name: "iPhone 13", slug: "iphone-13" },
    { name: "iPhone 15 Plus", slug: "iphone-15-plus" },
    { name: "iPhone 15", slug: "iphone-15" },
    { name: "iPhone 15 Pro Max", slug: "iphone-15-pro-max" },
    { name: "Ốp lưng MagSafe iPhone 15", slug: "op-lung-iphone-15" },
  ];

  const filtered = filterChatProductsByMessage("iphone 15", products);

  assert.deepEqual(filtered.map((product) => product.slug), ["iphone-15"]);
});

test("filters generic iPhone query to iPhone products without accessories", () => {
  const products = [
    { name: "iPhone 15", slug: "iphone-15" },
    { name: "Ốp lưng MagSafe iPhone 15", slug: "op-lung-iphone-15" },
    { name: "Cáp sạc Type C", slug: "cap-sac-type-c" },
  ];

  const filtered = filterChatProductsByMessage("iphone nào dưới 25 triệu", products);

  assert.deepEqual(filtered.map((product) => product.slug), ["iphone-15"]);
});
