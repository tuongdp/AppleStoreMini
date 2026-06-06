import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

test("admin order status controls compare normalized statuses", () => {
  const table = read("src/features/admin/components/orders/AdminOrderTable.jsx");
  const update = read("src/features/admin/components/orders/AdminOrderStatusUpdate.jsx");

  assert.match(table, /const normalizeStatus = \(status\) => \(status \|\| ""\)\.toLowerCase\(\)/);
  assert.match(table, /NEXT_STATUS\[normalizeStatus\(order\.status\)\]/);
  assert.match(update, /const normalizedCurrentStatus = normalizeStatus\(currentStatus\)/);
  assert.match(update, /selected === normalizedCurrentStatus/);
  assert.doesNotMatch(update, /selected === currentStatus/);
});

test("admin order list uses accessible icon pagination and refetch loading", () => {
  const source = read("src/features/admin/components/orders/AdminOrderTable.jsx");

  assert.match(source, /isLoading, isFetching/);
  assert.match(source, /disabled=\{isLoading \|\| isFetching\}/);
  assert.match(source, /aria-label="Trang trước"/);
  assert.match(source, /aria-label="Trang sau"/);
  assert.match(source, /<ChevronLeft className="h-4 w-4" aria-hidden="true" \/>/);
  assert.match(source, /<ChevronRight className="h-4 w-4" aria-hidden="true" \/>/);
});

test("admin order detail uses robust ids and payment normalization", () => {
  const source = read("src/features/admin/components/orders/AdminOrderDetail.jsx");

  assert.match(source, /orderId=\{order\.id \|\| order\._id\}/);
  assert.match(source, /const normalizePaymentMethod = \(method\) => \(method \|\| ""\)\.toLowerCase\(\)/);
  assert.match(source, /PAYMENT_MAP\[normalizePaymentMethod\(order\.paymentMethod\)\]/);
  assert.match(source, /order\.user\?\.fullName \|\| order\.shippingFullName \|\| "Khách vãng lai"/);
});

test("admin order status mock is matched before order detail mock", () => {
  const source = read("tests/utils/route-mocks.ts");
  const statusIndex = source.indexOf('/^\\/admin\\/orders\\/[^/]+\\/status$/.test(path)');
  const detailIndex = source.indexOf('/^\\/admin\\/orders\\/[^/]+$/.test(path)');

  assert.ok(statusIndex > -1, "status mock route is present");
  assert.ok(detailIndex > -1, "detail mock route is present");
  assert.ok(statusIndex < detailIndex, "status mock must be checked before detail mock");
});
