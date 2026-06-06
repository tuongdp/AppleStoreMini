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
        const sessionVal = sessionStorage.getItem(key);
        if (sessionVal) return Promise.resolve(sessionVal);
        const localVal = localStorage.getItem(key);
        return Promise.resolve(localVal);
    },
    setItem: (key, value) => {
        sessionStorage.setItem(key, value);
        if (localStorage.getItem("rememberMe") === "true") {
            localStorage.setItem(key, value);
        }
        return Promise.resolve();
    },
    removeItem: (key) => {
        sessionStorage.removeItem(key);
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
    whitelist: ["auth", "cart", "wishlist"],
    blacklist: [baseApi.reducerPath, "ui"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const getE2EPreloadedState = () => {
    if (typeof window === "undefined") return undefined;
    return window.__E2E_PRELOADED_STATE__;
};

export const store = configureStore({
    reducer: persistedReducer,
    preloadedState: getE2EPreloadedState(),
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            immutableCheck: {
                warnAfter: 128,
            },
            serializableCheck: {
                warnAfter: 128,
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
