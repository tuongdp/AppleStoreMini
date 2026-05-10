import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    items: [],
};

export const getEffectivePrice = (product, variant) => {
    const target = variant || product;
    if (!target) return 0;

    const flashSale = target.flashSale?.salePrice;
    const flashOriginal = target.flashSale?.originalPrice || target.price;
    if (flashSale && flashSale > 0 && flashSale < flashOriginal) {
        return flashSale;
    }

    const sale = target.salePrice;
    const original = target.price ?? 0;
    if (sale && sale > 0 && sale < original) {
        return sale;
    }

    return original;
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
            const product = item.product || item.variant?.product;
            const price = getEffectivePrice(product, item.variant);
            return total + price * item.quantity;
        },
        0,
    );

export const selectCartCount = (state) =>
    state.cart.items.reduce((total, item) => total + item.quantity, 0);

export const selectCartIsEmpty = (state) => state.cart.items.length === 0;

export const selectCartSavings = (state) =>
    state.cart.items.reduce((total, item) => {
        const product = item.product || item.variant?.product;
        const variant = item.variant;
        const target = variant || product;
        if (!target) return total;

        const flashOriginal = target.flashSale?.originalPrice || target.price;
        const flashSale = target.flashSale?.salePrice;
        const salePrice = target.salePrice;
        const original = target.price ?? 0;

        const effectiveOriginal = flashSale && flashSale > 0 && flashSale < flashOriginal
            ? flashOriginal
            : original;

        const effectiveSale = flashSale && flashSale > 0 && flashSale < flashOriginal
            ? flashSale
            : (salePrice && salePrice > 0 && salePrice < original ? salePrice : null);

        if (effectiveSale && effectiveSale < effectiveOriginal) {
            return total + (effectiveOriginal - effectiveSale) * item.quantity;
        }
        return total;
    }, 0);
