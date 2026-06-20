import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    rememberMe: false,
};

const PERMISSION_ALIASES = {
    ai: "ai",
    banner: "banners",
    banners: "banners",
    category: "categories",
    categories: "categories",
    comment: "comments",
    comments: "comments",
    coupon: "coupons",
    coupons: "coupons",
    dashboard: "dashboard",
    news: "news",
    order: "orders",
    orders: "orders",
    product: "products",
    products: "products",
    settings: "settings",
    setting: "settings",
    user: "users",
    users: "users",
};

const normalizePermissionKey = (permission) => {
    if (!permission) return "";
    const normalized = String(permission).trim().replace(/-/g, "_").replace(/\s+/g, "_").toLowerCase();
    return PERMISSION_ALIASES[normalized] || normalized;
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            if (!action.payload) return;
            const { user, accessToken, refreshToken, rememberMe } = action.payload;
            if (user) state.user = user;
            if (accessToken) state.accessToken = accessToken;
            if (refreshToken) state.refreshToken = refreshToken;
            if (rememberMe !== undefined) state.rememberMe = rememberMe;
            state.isAuthenticated = !!state.accessToken;
        },
        logout: (state) => {
            state.user = null;
            state.accessToken = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
            state.rememberMe = false;
            localStorage.removeItem("rememberMe");
        },
        updateUser: (state, action) => {
            state.user = { ...state.user, ...action.payload };
        },
    },
});

export const { setCredentials, logout, updateUser } = authSlice.actions;

// ── Selectors ─────────────────────────────────────────
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => !!state.auth.accessToken;
export const selectIsAdmin = (state) => state.auth.user?.role === "admin" && !state.auth.user?.isBlocked;
export const selectUserRole = (state) => state.auth.user?.role;
export const selectHasAdminAccess = (state) => {
    const user = state.auth.user;
    if (!user || user.isBlocked) return false;
    return user.role === "admin" || user.role === "staff";
};

const STAFF_BLOCKED_MODULES = ["users"];

const normalizePermissionModule = (permission) => {
    if (!permission) return "";
    return normalizePermissionKey(permission);
};

export const selectHasPermission = (permission, _action = "view") => (state) => {
    const user = state.auth.user;
    if (!user || user.isBlocked) return false;
    if (user.role === "admin") return true;
    if (user.role === "staff") {
        const module = normalizePermissionModule(permission);
        return !STAFF_BLOCKED_MODULES.includes(module);
    }
    return false;
};
export const selectAccessToken = (state) => state.auth.accessToken;

export default authSlice.reducer;
