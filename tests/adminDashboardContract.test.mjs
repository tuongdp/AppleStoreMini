import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

test("admin layout marks private admin routes noindex", () => {
  const source = read("src/components/layout/AdminLayout.jsx");

  assert.match(source, /import SeoHead from "@\/components\/shared\/SeoHead"/);
  assert.match(source, /<SeoHead title=\{pageTitle\} url=\{location\.pathname\} noindex \/>/);
});

test("dashboard low stock panel keeps its own loading state", () => {
  const source = read("src/pages/admin/AdminDashboard.jsx");

  assert.match(source, /isLoading: isLowStockLoading/);
  assert.match(source, /isLowStockLoading \?/);
});

test("dashboard e2e mocks every endpoint used by dashboard widgets", () => {
  const source = read("tests/utils/route-mocks.ts");

  [
    "/admin/dashboard/operations",
    "/admin/dashboard/revenue",
    "/admin/dashboard/category-revenue",
    "/admin/dashboard/top-products",
    "/admin/dashboard/slow-products",
    "/admin/dashboard/low-stock",
    "/admin/dashboard/order-status-distribution",
    "/admin/dashboard/top-customers",
  ].forEach((endpoint) => {
    assert.match(source, new RegExp(endpoint.replaceAll("/", "\\/")));
  });
});

test("dashboard insights use lucide icons instead of inline emoji", () => {
  const categoryChart = read("src/features/admin/components/dashboard/CategoryPieChart.jsx");
  const slowProducts = read("src/features/admin/components/dashboard/SlowProducts.jsx");

  assert.match(categoryChart, /Lightbulb/);
  assert.match(categoryChart, /AlertTriangle/);
  assert.doesNotMatch(categoryChart, /💡|📈|⚠️|⚠/u);
  assert.doesNotMatch(slowProducts, /⚠️|⚠/u);
});
