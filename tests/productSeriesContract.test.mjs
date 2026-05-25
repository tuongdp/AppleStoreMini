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
});

test("admin product form submits the selected series id", () => {
  const source = readFileSync("src/features/admin/components/products/AdminProductForm.jsx", "utf8");
  const validations = readFileSync("src/lib/validations.js", "utf8");

  assert.match(validations, /seriesId:\s*z\.string\(\)\.optional/);
  assert.match(source, /useGetAdminSeriesQuery/);
  assert.match(source, /name="seriesId"/);
  assert.match(source, /seriesId:\s*values\.seriesId \|\| null/);
});

test("product list prefers db series but keeps slug fallback", () => {
  const source = readFileSync("src/pages/ProductListPage.jsx", "utf8");

  assert.match(source, /useGetSeriesQuery/);
  assert.match(source, /buildSeriesFiltersFromSeries/);
  assert.match(source, /\["series", series\.source === "series"/);
  assert.match(source, /\["slug", series\.source === "slug"/);
});
