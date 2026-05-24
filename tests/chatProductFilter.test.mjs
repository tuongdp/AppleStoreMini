import test from "node:test";
import assert from "node:assert/strict";

import {
  buildFocusedChatReply,
  filterChatProductsByMessage,
} from "../src/features/ai/chatProductFilter.js";

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

test("applies budget and caps broad iPhone recommendations", () => {
  const products = [
    { name: "iPhone 15", slug: "iphone-15", price: 17900000 },
    { name: "iPhone 16", slug: "iphone-16", price: 20690000 },
    { name: "iPhone 17", slug: "iphone-17", price: 24490000 },
    { name: "iPhone 15 Pro Max", slug: "iphone-15-pro-max", price: 37490000 },
    { name: "iPhone 13", slug: "iphone-13", price: 11990000 },
    { name: "iPhone 14", slug: "iphone-14", price: 13990000 },
  ];

  const filtered = filterChatProductsByMessage("iphone dưới 25 triệu", products);

  assert.deepEqual(filtered.map((product) => product.slug), [
    "iphone-13",
    "iphone-14",
    "iphone-15",
    "iphone-16",
  ]);
});

test("keeps accessories when user asks for accessories", () => {
  const products = [
    { name: "iPhone 15", slug: "iphone-15" },
    { name: "Ốp lưng MagSafe iPhone 15", slug: "op-lung-iphone-15" },
    { name: "Cáp sạc Type C", slug: "cap-sac-type-c" },
  ];

  const filtered = filterChatProductsByMessage("ốp lưng iphone 15", products);

  assert.deepEqual(filtered.map((product) => product.slug), ["op-lung-iphone-15"]);
});

test("filters MacBook recommendations by family and budget", () => {
  const products = [
    { name: "MacBook Air M2", slug: "macbook-air-m2", price: 23990000 },
    { name: "MacBook Pro M3", slug: "macbook-pro-m3", price: 39990000 },
    { name: "iPad Air M2", slug: "ipad-air-m2", price: 16990000 },
  ];

  const filtered = filterChatProductsByMessage("macbook dưới 30 triệu để học", products);

  assert.deepEqual(filtered.map((product) => product.slug), ["macbook-air-m2"]);
});

test("builds focused reply for exact model instead of keeping unrelated backend text", () => {
  const reply = buildFocusedChatReply(
    "iphone 15",
    "iPhone 17 có giá 24.490.000đ. Bạn muốn biết thêm thông tin gì về iPhone 17?",
    [{ name: "iPhone 15", slug: "iphone-15", price: 17900000, stock: 6 }],
  );

  assert.match(reply, /iPhone 15/);
  assert.match(reply, /17\.900\.000/);
  assert.doesNotMatch(reply, /iPhone 17/);
});
