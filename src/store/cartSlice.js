import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    items: [],
};

// MySQL/Prisma dùng integer id — không có _id như MongoDB
const getProductId = (product) => product?.id;

// Lấy giá hiệu lực: ưu tiên salePrice nếu có và hợp lệ
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
            const newId = getProductId(newItem.product);

            const existingItem = state.items.find(
                (item) =>
                    getProductId(item.product) === newId &&
                    item.selectedColor === newItem.selectedColor &&
                    item.selectedStorage === newItem.selectedStorage,
            );

            if (existingItem) {
                existingItem.quantity += newItem.quantity ?? 1;
            } else {
                state.items.push({
                    ...newItem,
                    quantity: newItem.quantity ?? 1,
                });
            }
        },

        removeFromCart: (state, action) => {
            const { productId, selectedColor, selectedStorage } =
                action.payload;
            state.items = state.items.filter(
                (item) =>
                    !(
                        getProductId(item.product) === productId &&
                        item.selectedColor === selectedColor &&
                        item.selectedStorage === selectedStorage
                    ),
            );
        },

        updateQuantity: (state, action) => {
            const { productId, selectedColor, selectedStorage, quantity } =
                action.payload;

            if (quantity <= 0) {
                state.items = state.items.filter(
                    (item) =>
                        !(
                            getProductId(item.product) === productId &&
                            item.selectedColor === selectedColor &&
                            item.selectedStorage === selectedStorage
                        ),
                );
                return;
            }

            const item = state.items.find(
                (item) =>
                    getProductId(item.product) === productId &&
                    item.selectedColor === selectedColor &&
                    item.selectedStorage === selectedStorage,
            );

            if (item) item.quantity = quantity;
        },

        // Dùng khi load server cart về → replace toàn bộ local items
        setCartFromServer: (state, action) => {
            const serverCart = action.payload;
            // BE trả: { items: [{ product, quantity, selectedColor, selectedStorage }] }
            state.items = (serverCart?.items || []).map((item) => ({
                product: item.product,
                quantity: item.quantity,
                selectedColor: item.selectedColor || "",
                selectedStorage: item.selectedStorage || "",
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

// ── Selectors ─────────────────────────────────────────

export const selectCartItems = (state) => state.cart.items;

export const selectCartTotal = (state) =>
    state.cart.items.reduce(
        (total, item) =>
            total + getEffectivePrice(item.product) * item.quantity,
        0,
    );

export const selectCartCount = (state) =>
    state.cart.items.reduce((total, item) => total + item.quantity, 0);

export const selectCartIsEmpty = (state) => state.cart.items.length === 0;

export const selectCartSavings = (state) =>
    state.cart.items.reduce((total, item) => {
        const product = item.product;
        if (!product) return total;
        const original = product.price ?? 0;
        const sale = product.salePrice;
        if (sale && sale > 0 && sale < original) {
            return total + (original - sale) * item.quantity;
        }
        return total;
    }, 0);
