import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");

describe("cart drawer and page UI contract", () => {
  it("hides decorative cart icons from assistive tech", () => {
    const drawer = read("src/features/cart/components/CartDrawer.jsx");
    const drawerItem = read("src/features/cart/components/CartDrawerItem.jsx");
    const table = read("src/features/cart/components/CartTable.jsx");
    const tableItem = read("src/features/cart/components/CartTableItem.jsx");
    const empty = read("src/features/cart/components/CartEmpty.jsx");
    const navbar = read("src/components/layout/root/NavbarCartButton.jsx");
    const quantity = read("src/components/shared/QuantityInput.jsx");

    assert.match(drawer, /<ShoppingBag[^>]+aria-hidden="true"/);
    assert.match(drawerItem, /<Trash2[^>]+aria-hidden="true"/);
    assert.match(table, /<Trash2[^>]+aria-hidden="true"/);
    assert.match(tableItem, /<Trash2[^>]+aria-hidden="true"/);
    assert.match(empty, /<ShoppingCart[^>]+aria-hidden="true"/);
    assert.match(navbar, /<ShoppingCart[^>]+aria-hidden="true"/);
    assert.match(quantity, /<Minus[^>]+aria-hidden="true"/);
    assert.match(quantity, /<Plus[^>]+aria-hidden="true"/);
  });

  it("explains disabled checkout when no cart items are selected", () => {
    const drawerSummary = read("src/features/cart/components/CartDrawerSummary.jsx");
    const pageSummary = read("src/features/cart/components/CartSummaryCard.jsx");

    assert.match(drawerSummary, /const disabledReason = selectedItems\.length === 0/);
    assert.match(drawerSummary, /Vui lòng chọn ít nhất một sản phẩm để thanh toán/);
    assert.match(drawerSummary, /role="status"/);
    assert.match(pageSummary, /const disabledReason = selectedItems\.length === 0/);
    assert.match(pageSummary, /Vui lòng chọn ít nhất một sản phẩm để thanh toán/);
    assert.match(pageSummary, /role="status"/);
  });

  it("mocks cart sync, clear, update, and remove endpoints with server shape", () => {
    const mocks = read("tests/utils/route-mocks.ts");

    assert.match(mocks, /const makeCartPayload = \(\) =>/);
    assert.match(mocks, /path === "\/cart\/sync"/);
    assert.match(mocks, /path === "\/cart\/clear"/);
    assert.match(mocks, /method === "DELETE"/);
    assert.match(mocks, /variant: \{ id: "v1", stock: 5, inStock: true/);
  });
});
