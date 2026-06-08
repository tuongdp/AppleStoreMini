import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

test("admin product list uses admin product endpoints", () => {
  const api = read("src/store/api/productsApi.js");
  const table = read("src/features/admin/components/products/AdminProductTable.jsx");
  const editPage = read("src/pages/admin/AdminProductEdit.jsx");

  assert.match(api, /getAdminProducts:\s*builder\.query/);
  assert.match(api, /url:\s*"\/admin\/products"/);
  assert.match(api, /getAdminProductById:\s*builder\.query/);
  assert.match(api, /`\/admin\/products\/\$\{id\}`/);
  assert.match(table, /useGetAdminProductsQuery\(filters\)/);
  assert.doesNotMatch(table, /useGetProductsQuery\(filters\)/);
  assert.match(editPage, /useGetAdminProductByIdQuery\(id\)/);
});

test("admin product variants preserve refresh rate and ssd fields", () => {
  const source = read("src/features/admin/components/products/AdminProductForm.jsx");

  assert.match(source, /refreshRate:\s*v\.refreshRate \|\| ""/);
  assert.match(source, /ssd:\s*v\.ssd \|\| ""/);
  assert.match(source, /const \{ color = "", storage = "", ram = "", edition = "", refreshRate = "", ssd = ""/);
  assert.match(source, /refreshRate:\s*refreshRate\.trim\(\)/);
  assert.match(source, /ssd:\s*ssd\.trim\(\)/);
  assert.match(source, /onSave\(\{ color, storage, ram, edition, refreshRate, ssd,/);
});

test("admin product table keeps compact accessible pagination controls", () => {
  const source = read("src/features/admin/components/products/AdminProductTable.jsx");

  assert.match(source, /aria-label="Trang trước"/);
  assert.match(source, /aria-label="Trang sau"/);
  assert.match(source, /<ChevronLeft className="h-4 w-4" aria-hidden="true" \/>/);
  assert.match(source, /<ChevronRight className="h-4 w-4" aria-hidden="true" \/>/);
});

test("admin product table does not expose fake product actions", () => {
  const source = read("src/features/admin/components/products/AdminProductTable.jsx");

  assert.doesNotMatch(source, /đang phát triển/);
  assert.doesNotMatch(source, /Sao chép sản phẩm/);
  assert.match(source, /useUpdateProductMutation/);
  assert.match(source, /const nextIsActive = product\.isActive === false/);
  assert.match(source, /updateProduct\(\{ id: productId, isActive: nextIsActive \}\)\.unwrap\(\)/);
});

test("admin product table labels sales status from isActive instead of stock", () => {
  const source = read("src/features/admin/components/products/AdminProductTable.jsx");

  assert.match(source, /status: p\.isActive !== false \? "Đang bán" : "Ẩn sản phẩm"/);
  assert.match(source, /product\.isActive !== false \? "Đang bán" : "Ẩn sản phẩm"/);
  assert.doesNotMatch(source, /status: p\.inStock \? "Đang bán" : "Ngừng bán"/);
});
