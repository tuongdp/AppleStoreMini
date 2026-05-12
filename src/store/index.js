import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from "redux-persist";
// ✅ Đổi import này
// import storage from "redux-persist/lib/storage/index.js";
import { combineReducers } from "@reduxjs/toolkit";

import authReducer from "./authSlice";
import cartReducer from "./cartSlice";
import wishlistReducer from "./wishlistSlice";
import uiReducer from "./uiSlice";
import { baseApi } from "./api/baseApi";

// Thay thế toàn bộ import storage bằng đoạn này
const storage = {
    getItem: (key) => {
        return Promise.resolve(localStorage.getItem(key));
    },
    setItem: (key, value) => {
        localStorage.setItem(key, value);
        return Promise.resolve();
    },
    removeItem: (key) => {
        localStorage.removeItem(key);
        return Promise.resolve();
    },
};

const rootReducer = combineReducers({
    auth: authReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    ui: uiReducer,
    [baseApi.reducerPath]: baseApi.reducer,
});

const persistConfig = {
    key: "apple-store",
    storage,
    whitelist: ["cart", "wishlist"],
    blacklist: [baseApi.reducerPath, "ui"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [
                    FLUSH,
                    REHYDRATE,
                    PAUSE,
                    PERSIST,
                    PURGE,
                    REGISTER,
                ],
            },
        }).concat(baseApi.middleware),
});

export const persistor = persistStore(store);

setupListeners(store.dispatch);
