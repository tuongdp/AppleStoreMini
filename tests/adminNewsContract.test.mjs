import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");

describe("admin news contract", () => {
  it("keeps admin news list accessible during filtering and actions", () => {
    const source = read("src/features/admin/components/news/AdminNewsList.jsx");

    assert.match(source, /const \{ data, isLoading, isFetching \} = useGetAllNewsQuery\(filters\)/);
    assert.match(source, /name="admin-news-search"/);
    assert.match(source, /autoComplete="off"/);
    assert.match(source, /aria-label="Lọc trạng thái bài viết"/);
    assert.match(source, /aria-label="Lọc danh mục bài viết"/);
    assert.match(source, /aria-label="Sắp xếp bài viết"/);
    assert.match(source, /isLoading \|\| isFetching/);
    assert.match(source, /<Plus[^>]+aria-hidden="true"/);
    assert.match(source, /<EyeOff[^>]+aria-hidden="true"/);
    assert.match(source, /<Eye[^>]+aria-hidden="true"/);
    assert.match(source, /<Edit[^>]+aria-hidden="true"/);
    assert.match(source, /<Trash2[^>]+aria-hidden="true"/);
  });

  it("keeps admin news form controls accessible and optional category safe", () => {
    const source = read("src/features/admin/components/news/AdminNewsForm.jsx");

    assert.match(source, /value: "_none"/);
    assert.match(source, /value=\{field\.value \|\| "_none"\}/);
    assert.match(source, /value === "_none" \? "" : value/);
    assert.match(source, /aria-label="Tải ảnh thumbnail lên"/);
    assert.match(source, /aria-label="Xuất bản bài viết"/);
    assert.match(source, /aria-label="Chọn danh mục bài viết"/);
    assert.match(source, /<Loader2[^>]+aria-hidden="true"/);
    assert.match(source, /<Upload[^>]+aria-hidden="true"/);
  });

  it("mocks admin news stats, create, toggle, and slug detail routes in order", () => {
    const source = read("tests/utils/route-mocks.ts");
    const listIndex = source.indexOf('path === "/admin/news"');
    const postIndex = source.indexOf('method === "POST"', listIndex);
    const statsIndex = source.indexOf('path === "/admin/news/stats"');
    const toggleIndex = source.indexOf('/^\\/admin\\/news\\/[^/]+\\/toggle$/.test(path)');
    const detailIndex = source.indexOf('/^\\/admin\\/news\\/[^/]+$/.test(path)');

    assert.ok(listIndex > -1);
    assert.ok(postIndex > listIndex);
    assert.ok(statsIndex > postIndex);
    assert.ok(toggleIndex > statsIndex);
    assert.ok(detailIndex > toggleIndex);
    assert.match(source, /news\.id === key \|\| news\._id === key \|\| news\.slug === key/);
  });
});
