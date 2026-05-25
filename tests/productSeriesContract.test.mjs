import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("series api exposes public and admin series queries", () => {
  const source = readFileSync("src/store/api/seriesApi.js", "utf8");

  assert.match(source, /url:\s*"\/series"/);
  assert.match(source, /url:\s*"\/admin\/series"/);
  assert.match(source, /useGetSeriesQuery/);
  assert.match(source, /useGetAdminSeriesQuery/);
  assert.match(source, /useCreateSeriesMutation/);
  assert.match(source, /useUpdateSeriesMutation/);
  assert.match(source, /useDeleteSeriesMutation/);
});

test("admin exposes a series management page", () => {
  const routes = readFileSync("src/routes.jsx", "utf8");
  const layout = readFileSync("src/components/layout/AdminLayout.jsx", "utf8");
  const page = readFileSync("src/pages/admin/AdminSeriesPage.jsx", "utf8");
  const list = readFileSync("src/features/admin/components/series/AdminSeriesList.jsx", "utf8");

  assert.match(routes, /AdminSeriesPage/);
  assert.match(routes, /path:\s*"series"/);
  assert.match(routes, /permission="products"><AdminSeriesPage/);
  assert.match(layout, /href:\s*"\/admin\/series"/);
  assert.match(layout, /Series sản phẩm/);
  assert.match(page, /AdminSeriesList/);
  assert.match(list, /useCreateSeriesMutation/);
  assert.match(list, /useUpdateSeriesMutation/);
  assert.match(list, /useDeleteSeriesMutation/);
  assert.match(list, /search:\s*search\.trim\(\)/);
  assert.match(list, /category:\s*categoryFilter/);
  assert.match(list, /SERIES_PAGE_SIZE/);
  assert.match(list, /pagination\.totalPages/);
});

test("admin product form submits selected series ids from a checkbox grid", () => {
  const source = readFileSync("src/features/admin/components/products/AdminProductForm.jsx", "utf8");
  const validations = readFileSync("src/lib/validations.js", "utf8");

  assert.match(validations, /seriesIds:\s*z\.array\(z\.string\(\)\)\.default\(\[\]\)/);
  assert.match(source, /useGetAdminSeriesQuery/);
  assert.match(source, /limit:\s*100/);
  assert.match(source, /name="seriesIds"/);
  assert.match(source, /<Checkbox/);
  assert.match(source, /seriesIds:\s*values\.seriesIds \|\| \[\]/);
});

test("product list prefers db series but keeps slug fallback", () => {
  const source = readFileSync("src/pages/ProductListPage.jsx", "utf8");

  assert.match(source, /useGetSeriesQuery/);
  assert.match(source, /buildSeriesFiltersFromSeries/);
  assert.match(source, /function ScrollNav\(\{ label, children, wrap = false \}\)/);
  assert.match(source, /<ScrollNav label="Lọc" wrap>/);
  assert.match(source, /\["series", series\.source === "series"/);
  assert.match(source, /\["slug", series\.source === "slug"/);
});
