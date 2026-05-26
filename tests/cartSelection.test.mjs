import assert from "node:assert/strict";
import test from "node:test";
import cartReducer, {
  addToCart,
  removeCheckedOutItems,
  selectCartSelectedItems,
  selectCartSelectedTotal,
  selectCartStockIssues,
  setCartFromServer,
  toggleCartItemSelected,
} from "../src/store/cartSlice.js";

const baseState = { cart: { items: [] } };

test("cart items are selected by default and selected totals ignore unchecked items", () => {
  let state = cartReducer(baseState.cart, addToCart({
    variantId: "v1",
    quantity: 2,
    product: { id: "p1", name: "iPhone", price: 100, stock: 5, inStock: true },
  }));
  state = cartReducer(state, addToCart({
    variantId: "v2",
    quantity: 1,
    product: { id: "p2", name: "Mac", price: 300, stock: 5, inStock: true },
  }));

  assert.deepEqual(selectCartSelectedItems({ cart: state }).map((item) => item.variantId), ["v1", "v2"]);
  assert.equal(selectCartSelectedTotal({ cart: state }), 500);

  state = cartReducer(state, toggleCartItemSelected({ variantId: "v2", selected: false }));

  assert.deepEqual(selectCartSelectedItems({ cart: state }).map((item) => item.variantId), ["v1"]);
  assert.equal(selectCartSelectedTotal({ cart: state }), 200);
});

test("cart can remove only checked out items and keep unchecked items", () => {
  const state = {
    items: [
      { variantId: "v1", quantity: 1, selected: true, product: { price: 100 } },
      { variantId: "v2", quantity: 1, selected: false, product: { price: 200 } },
    ],
  };

  const next = cartReducer(state, removeCheckedOutItems(["v1"]));

  assert.deepEqual(next.items.map((item) => item.variantId), ["v2"]);
});

test("server cart items are selected by default and expose stock issues", () => {
  const state = cartReducer(baseState.cart, setCartFromServer({
    items: [{
      quantity: 4,
      variantId: "v1",
      variant: {
        id: "v1",
        stock: 2,
        inStock: true,
        price: 100,
        product: { id: "p1", name: "iPhone" },
      },
    }],
  }));

  assert.equal(state.items[0].selected, true);
  assert.deepEqual(selectCartStockIssues({ cart: state }), [{
    variantId: "v1",
    requested: 4,
    available: 2,
    productName: "iPhone",
  }]);
});
