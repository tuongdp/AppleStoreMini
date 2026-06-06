import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

test("admin return list uses refetch loading and accurate approval copy", () => {
  const source = read("src/pages/admin/AdminReturnList.jsx");

  assert.match(source, /isLoading, isFetching/);
  assert.match(source, /disabled=\{isLoading \|\| isFetching\}/);
  assert.match(source, /Đã duyệt yêu cầu trả hàng/);
  assert.match(source, /Duyệt yêu cầu/);
  assert.doesNotMatch(source, /Duyệt & Hoàn tiền/);
});

test("admin return list uses accessible icon pagination", () => {
  const source = read("src/pages/admin/AdminReturnList.jsx");

  assert.match(source, /aria-label="Trang trước"/);
  assert.match(source, /aria-label="Trang sau"/);
  assert.match(source, /<ChevronLeft className="h-4 w-4" aria-hidden="true" \/>/);
  assert.match(source, /<ChevronRight className="h-4 w-4" aria-hidden="true" \/>/);
});

test("admin return detail accepts transformed or raw ApiResponse data", () => {
  const source = read("src/pages/admin/AdminReturnDetail.jsx");

  assert.match(source, /const returnReq = data\?\.data \?\? data/);
  assert.match(source, /RETURN_REQUEST_STATUS\.PENDING/);
  assert.match(source, /RETURN_REQUEST_STATUS\.RETURNING/);
  assert.match(source, /RETURN_REQUEST_STATUS\.RECEIVED/);
  assert.match(source, /RETURN_REQUEST_STATUS\.APPROVED/);
  assert.match(source, /RETURN_REQUEST_STATUS\.REJECTED/);
});

test("admin return action mocks are matched before return detail mock", () => {
  const source = read("tests/utils/route-mocks.ts");
  const detailIndex = source.indexOf('/^\\/admin\\/returns\\/[^/]+$/.test(path)');

  ["/approve", "/reject", "/receive", "/refund"].forEach((suffix) => {
    const index = source.indexOf(`/^\\/admin\\/returns\\/[^/]+\\${suffix}$/.test(path)`);
    assert.ok(index > -1, `${suffix} mock route is present`);
    assert.ok(index < detailIndex, `${suffix} mock route must be checked before detail mock`);
  });
});
