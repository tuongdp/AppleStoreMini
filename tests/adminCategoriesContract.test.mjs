import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");

describe("admin categories contract", () => {
  it("normalizes category aliases from backend payloads", () => {
    const source = read("src/features/admin/components/categories/AdminCategoryList.jsx");

    assert.match(source, /function getCategoryId/);
    assert.match(source, /category\?\._id \|\| category\?\.id/);
    assert.match(source, /function getCategoryImage/);
    assert.match(source, /category\?\.image \|\| category\?\.icon \|\| category\?\.thumbnail/);
    assert.match(source, /category\?\._count\?\.products/);
    assert.match(source, /category\?\.productsCount/);
  });

  it("handles paginated admin category responses and refetch loading", () => {
    const source = read("src/features/admin/components/categories/AdminCategoryList.jsx");

    assert.match(source, /const \{ data, isLoading, isFetching \} = useGetAdminCategoriesQuery\(\)/);
    assert.match(source, /Array\.isArray\(data\) \? data : data\?\.data \|\| \[\]/);
    assert.match(source, /isLoading \|\| isFetching/);
    assert.match(source, /isFetching \? "Đang tải\.\.\."/);
  });

  it("uses accessible controls and hides decorative icons", () => {
    const source = read("src/features/admin/components/categories/AdminCategoryList.jsx");

    assert.match(source, /aria-label="URL ảnh slider danh mục"/);
    assert.match(source, /name="category-slider-url"/);
    assert.match(source, /aria-label=\{category\.isActive !== false \? `Ẩn danh mục/);
    assert.match(source, /aria-label=\{`Sửa danh mục/);
    assert.match(source, /aria-label=\{`Xóa danh mục/);
    assert.match(source, /<Plus[^>]+aria-hidden="true"/);
    assert.match(source, /<ImageUp[^>]+aria-hidden="true"/);
    assert.match(source, /<ImagePlus[^>]+aria-hidden="true"/);
    assert.match(source, /<Pencil[^>]+aria-hidden="true"/);
    assert.match(source, /<Trash2[^>]+aria-hidden="true"/);
  });

  it("mocks create and toggle category routes before detail routes", () => {
    const source = read("tests/utils/route-mocks.ts");
    const listIndex = source.indexOf('path === "/admin/categories"');
    const postIndex = source.indexOf('method === "POST"', listIndex);
    const toggleIndex = source.indexOf('/^\\/admin\\/categories\\/[^/]+\\/toggle$/.test(path)');
    const detailIndex = source.indexOf('/^\\/admin\\/categories\\/[^/]+$/.test(path)');

    assert.ok(listIndex > -1);
    assert.ok(postIndex > listIndex);
    assert.ok(toggleIndex > postIndex);
    assert.ok(detailIndex > toggleIndex);
  });
});
