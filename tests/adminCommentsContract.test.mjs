import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");

describe("admin comments contract", () => {
  it("supports both content and comment fields from review payloads", () => {
    const source = read("src/features/admin/components/comments/AdminCommentList.jsx");

    assert.match(source, /reviewContent\s*=\s*\(review\)\s*=>\s*review\?\.content \|\| review\?\.comment/);
    assert.match(source, /reviewContent\(review\) \|\| "Không có nhận xét"/);
  });

  it("uses refetch loading state and accessible search", () => {
    const source = read("src/features/admin/components/comments/AdminCommentList.jsx");

    assert.match(source, /isLoading,\s*isFetching/);
    assert.match(source, /isLoading \|\| isFetching/);
    assert.match(source, /aria-label="Tìm bình luận sản phẩm"/);
    assert.match(source, /name="admin-review-search"/);
  });

  it("uses icon-only pagination and labelled row actions", () => {
    const source = read("src/features/admin/components/comments/AdminCommentList.jsx");

    assert.match(source, /aria-label="Trang trước"/);
    assert.match(source, /aria-label="Trang sau"/);
    assert.match(source, /<ChevronLeft[^>]+aria-hidden="true"/);
    assert.match(source, /<ChevronRight[^>]+aria-hidden="true"/);
    assert.match(source, /aria-label="Xem chi tiết và phản hồi"/);
    assert.match(source, /aria-label="Xóa bình luận"/);
  });

  it("mocks sentiment and review actions before the review detail route", () => {
    const source = read("tests/utils/route-mocks.ts");
    const sentimentIndex = source.indexOf('path === "/admin/reviews/sentiment"');
    const visibilityIndex = source.indexOf('/^\\/admin\\/reviews\\/[^/]+\\/visibility$/.test(path)');
    const replyIndex = source.indexOf('/^\\/admin\\/reviews\\/[^/]+\\/reply$/.test(path)');
    const detailIndex = source.indexOf('/^\\/admin\\/reviews\\/[^/]+$/.test(path)');

    assert.ok(sentimentIndex > -1);
    assert.ok(visibilityIndex > -1);
    assert.ok(replyIndex > -1);
    assert.ok(detailIndex > sentimentIndex);
    assert.ok(detailIndex > visibilityIndex);
    assert.ok(detailIndex > replyIndex);
  });
});
