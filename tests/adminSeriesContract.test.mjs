import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");

describe("admin series contract", () => {
  it("supports categoryId/categorySlug/category object payloads", () => {
    const source = read("src/features/admin/components/series/AdminSeriesList.jsx");

    assert.match(source, /function getSeriesCategoryValue/);
    assert.match(source, /series\?\.categorySlug/);
    assert.match(source, /series\?\.categoryId/);
    assert.match(source, /getSeriesCategoryName\(item, categories\)/);
    assert.match(source, /getSeriesProductCount\(item\)/);
  });

  it("uses accessible search and icon-only pagination", () => {
    const source = read("src/features/admin/components/series/AdminSeriesList.jsx");

    assert.match(source, /aria-label="Tìm series sản phẩm"/);
    assert.match(source, /name="admin-series-search"/);
    assert.match(source, /aria-label="Trang trước"/);
    assert.match(source, /aria-label="Trang sau"/);
    assert.match(source, /<ChevronLeft[^>]+aria-hidden="true"/);
    assert.match(source, /<ChevronRight[^>]+aria-hidden="true"/);
  });

  it("hides decorative action icons from assistive tech", () => {
    const source = read("src/features/admin/components/series/AdminSeriesList.jsx");

    assert.match(source, /<Plus[^>]+aria-hidden="true"/);
    assert.match(source, /<ToggleRight[^>]+aria-hidden="true"/);
    assert.match(source, /<Pencil[^>]+aria-hidden="true"/);
    assert.match(source, /<Trash2[^>]+aria-hidden="true"/);
  });

  it("mocks create series before detail routes", () => {
    const source = read("tests/utils/route-mocks.ts");
    const listIndex = source.indexOf('path === "/admin/series"');
    const postIndex = source.indexOf('method === "POST"', listIndex);
    const detailIndex = source.indexOf('/^\\/admin\\/series\\/[^/]+$/.test(path)');

    assert.ok(listIndex > -1);
    assert.ok(postIndex > listIndex);
    assert.ok(detailIndex > postIndex);
  });
});
