import { createSlice, createSelector } from "@reduxjs/toolkit";

const initialState = {
    items: [],
};

const getItemVariantId = (item) => item.variantId || item.product?.variantId || item.variant?.id;

export const isCartItemSelected = (item) => item.selected !== false;

const getAvailableStock = (item) => {
    const variant = item.variant;
    const product = item.product || variant?.product;
    if (variant?.inStock === false || product?.inStock === false) return 0;
    return Number(variant?.stock ?? product?.stock ?? 99);
};

export const getEffectivePrice = (product, variant) => {
    const target = variant || product;
    if (!target) return 0;

    const original = target.price ?? 0;
    const sale = target.salePrice;

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
            const newVariantId = getItemVariantId(newItem);

            const existingItem = state.items.find(
                (item) => getItemVariantId(item) === newVariantId,
            );

            if (existingItem) {
                existingItem.quantity += newItem.quantity ?? 1;
                existingItem.selected = existingItem.selected !== false;
            } else {
                state.items.push({
                    ...newItem,
                    variantId: newVariantId,
                    quantity: newItem.quantity ?? 1,
                    selected: newItem.selected ?? true,
                });
            }
        },

        removeFromCart: (state, action) => {
            const { variantId } = action.payload;
            state.items = state.items.filter(
                (item) => getItemVariantId(item) !== variantId,
            );
        },

        updateQuantity: (state, action) => {
            const { variantId, quantity } = action.payload;

            if (quantity <= 0) {
                state.items = state.items.filter(
                    (item) => getItemVariantId(item) !== variantId,
                );
                return;
            }

            const item = state.items.find(
                (item) => getItemVariantId(item) === variantId,
            );

            if (item) item.quantity = quantity;
        },

        toggleCartItemSelected: (state, action) => {
            const { variantId, selected } = action.payload;
            const item = state.items.find((cartItem) => getItemVariantId(cartItem) === variantId);
            if (item) item.selected = selected ?? !isCartItemSelected(item);
        },

        selectAllCartItems: (state, action) => {
            const selected = action.payload ?? true;
            state.items.forEach((item) => {
                item.selected = selected;
            });
        },

        removeCheckedOutItems: (state, action) => {
            const checkedOutVariantIds = new Set(action.payload || []);
            state.items = state.items.filter((item) => !checkedOutVariantIds.has(getItemVariantId(item)));
        },

        setCartFromServer: (state, action) => {
            const serverCart = action.payload;
            state.items = (serverCart?.items || []).map((item) => ({
                variant: item.variant,
                variantId: item.variant?.id || item.variantId,
                product: {
                    ...(item.variant?.product || item.product || {}),
                    images: item.variant?.images || item.product?.images || item.variant?.product?.images,
                },
                quantity: item.quantity,
                selected: state.items.find((existing) => getItemVariantId(existing) === (item.variant?.id || item.variantId))?.selected ?? true,
            }));
        },

        clearCart: (state) => {
            state.items = [];
        },
    },
    extraReducers: (builder) => {
        builder.addCase("auth/logout", (state) => {
            state.items = [];
        });
    },
});

export const {
    addToCart,
    removeFromCart,
    updateQuantity,
    toggleCartItemSelected,
    selectAllCartItems,
    removeCheckedOutItems,
    setCartFromServer,
    clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;

export const selectCartItems = (state) => state.cart.items;

export const selectCartSelectedItems = createSelector(
    [selectCartItems],
    (items) => items.filter(isCartItemSelected),
);

export const selectCartTotal = createSelector(
    [selectCartItems],
    (items) =>
        items.reduce(
            (total, item) => {
                const product = item.product || item.variant?.product;
                const price = getEffectivePrice(product, item.variant);
                return total + price * item.quantity;
            },
            0,
        ),
);

export const selectCartSelectedTotal = createSelector(
    [selectCartSelectedItems],
    (items) =>
        items.reduce(
            (total, item) => {
                const product = item.product || item.variant?.product;
                const price = getEffectivePrice(product, item.variant);
                return total + price * item.quantity;
            },
            0,
        ),
);

export const selectCartCount = createSelector(
    [selectCartItems],
    (items) => items.reduce((total, item) => total + item.quantity, 0),
);

export const selectCartIsEmpty = createSelector(
    [selectCartItems],
    (items) => items.length === 0,
);

export const selectCartSelectedCount = createSelector(
    [selectCartSelectedItems],
    (items) => items.reduce((total, item) => total + item.quantity, 0),
);

export const selectCartStockIssues = createSelector(
    [selectCartItems],
    (items) =>
        items
            .map((item) => {
                const variantId = getItemVariantId(item);
                const product = item.product || item.variant?.product;
                const available = getAvailableStock(item);
                if (item.quantity <= available) return null;
                return {
                    variantId,
                    requested: item.quantity,
                    available,
                    productName: product?.name || item.name || "",
                };
            })
            .filter(Boolean),
);

export const selectCartSelectedStockIssues = createSelector(
    [selectCartStockIssues, selectCartSelectedItems],
    (issues, selectedItems) => {
        const selectedVariantIds = new Set(selectedItems.map(getItemVariantId));
        return issues.filter((issue) => selectedVariantIds.has(issue.variantId));
    },
);

export const selectCartSavings = createSelector(
    [selectCartItems],
    (items) =>
        items.reduce((total, item) => {
            const product = item.product || item.variant?.product;
            const variant = item.variant;
            const target = variant || product;
            if (!target) return total;

            const salePrice = target.salePrice;
            const original = target.price ?? 0;

            if (salePrice && salePrice > 0 && salePrice < original) {
                return total + (original - salePrice) * item.quantity;
            }
            return total;
        }, 0),
);
