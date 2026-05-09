import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    items: [],
};

const getEffectivePrice = (product) => {
    if (!product) return 0;
    const sale = product.salePrice;
    const original = product.price ?? 0;
    return sale && sale > 0 && sale < original ? sale : original;
};

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addToCart: (state, action) => {
            const newItem = action.payload;
            const newVariantId = newItem.variantId || newItem.product?.variantId;

            const existingItem = state.items.find(
                (item) => (item.variantId || item.product?.variantId) === newVariantId,
            );

            if (existingItem) {
                existingItem.quantity += newItem.quantity ?? 1;
            } else {
                state.items.push({
                    ...newItem,
                    variantId: newVariantId,
                    quantity: newItem.quantity ?? 1,
                });
            }
        },

        removeFromCart: (state, action) => {
            const { variantId } = action.payload;
            state.items = state.items.filter(
                (item) => (item.variantId || item.product?.variantId) !== variantId,
            );
        },

        updateQuantity: (state, action) => {
            const { variantId, quantity } = action.payload;

            if (quantity <= 0) {
                state.items = state.items.filter(
                    (item) => (item.variantId || item.product?.variantId) !== variantId,
                );
                return;
            }

            const item = state.items.find(
                (item) => (item.variantId || item.product?.variantId) === variantId,
            );

            if (item) item.quantity = quantity;
        },

        setCartFromServer: (state, action) => {
            const serverCart = action.payload;
            state.items = (serverCart?.items || []).map((item) => ({
                variant: item.variant,
                variantId: item.variant?.id || item.variantId,
                product: item.variant?.product || item.product,
                quantity: item.quantity,
            }));
        },

        clearCart: (state) => {
            state.items = [];
        },
    },
});

export const {
    addToCart,
    removeFromCart,
    updateQuantity,
    setCartFromServer,
    clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;

export const selectCartItems = (state) => state.cart.items;

export const selectCartTotal = (state) =>
    state.cart.items.reduce(
        (total, item) => {
            const p = item.product || item.variant?.product;
            const price = item.variant
                ? (item.variant.salePrice || item.variant.price)
                : (p?.salePrice || p?.price);
            return total + (price || 0) * item.quantity;
        },
        0,
    );

export const selectCartCount = (state) =>
    state.cart.items.reduce((total, item) => total + item.quantity, 0);

export const selectCartIsEmpty = (state) => state.cart.items.length === 0;

export const selectCartSavings = (state) =>
    state.cart.items.reduce((total, item) => {
        const p = item.product || item.variant?.product;
        const v = item.variant;
        const original = v?.price || p?.price || 0;
        const sale = v?.salePrice || p?.salePrice;
        if (sale && sale > 0 && sale < original) {
            return total + (original - sale) * item.quantity;
        }
        return total;
    }, 0);
