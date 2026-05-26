import { createSelector, createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    rememberMe: false,
};
const EMPTY_PERMISSIONS = [];
export const PERMISSION_ACTIONS = ["view", "create", "update", "delete"];

const PERMISSION_ALIASES = {
    banner: "banners",
    banners: "banners",
    category: "categories",
    categories: "categories",
    comment: "comments",
    comments: "comments",
    coupon: "coupons",
    coupons: "coupons",
    dashboard: "dashboard",
    flashsale: "flashSales",
    flashsales: "flashSales",
    flash_sale: "flashSales",
    flash_sales: "flashSales",
    news: "news",
    option: "options",
    options: "options",
    order: "orders",
    orders: "orders",
    product: "products",
    products: "products",
    return: "returns",
    returns: "returns",
    return_request: "returns",
    return_requests: "returns",
    user: "users",
    users: "users",
};

const getPermissionValue = (permission) => {
    if (!permission) return "";
    if (typeof permission === "string") return permission;
    if (typeof permission === "object") {
        return permission.key || permission.code || permission.name || permission.permission || "";
    }
    return "";
};

const normalizePermissionKey = (permission) => {
    const rawPermission = getPermissionValue(permission).trim();
    if (!rawPermission) return "";

    const normalized = rawPermission
        .replace(/-/g, "_")
        .replace(/\s+/g, "_")
        .toLowerCase();

    return PERMISSION_ALIASES[normalized] || rawPermission;
};

export const normalizePermissions = (permissions) => {
    const rawPermissions =
        typeof permissions === "string"
            ? (() => {
                  try {
                      const parsed = JSON.parse(permissions);
                      return Array.isArray(parsed) ? parsed : [permissions];
                  } catch {
                      return permissions.split(",").map((item) => item.trim());
                  }
              })()
            : permissions;

    if (!Array.isArray(rawPermissions)) return EMPTY_PERMISSIONS;

    const normalized = [];
    rawPermissions.forEach((permission) => {
        const rawPermission = getPermissionValue(permission).trim();
        if (!rawPermission) return;

        const [moduleValue, actionValue] = rawPermission.split(":");
        const module = normalizePermissionKey(moduleValue);
        if (!module) return;

        if (!actionValue) {
            PERMISSION_ACTIONS.forEach((action) => normalized.push(`${module}:${action}`));
            return;
        }

        const action = actionValue.trim().toLowerCase();
        if (PERMISSION_ACTIONS.includes(action)) {
            normalized.push(`${module}:${action}`);
        }
    });

    return [...new Set(normalized)];
};

export const hasPermissionAction = (permissions, permission, action = "view") =>
    normalizePermissions(permissions).includes(`${normalizePermissionKey(permission)}:${action}`);

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
const selectRawUserPermissions = (state) => state.auth.user?.permissions;
export const selectHasAdminAccess = (state) => {
    const user = state.auth.user;
    if (!user || user.isBlocked) return false;
    return user.role === "admin" || user.role === "staff";
};
export const selectUserPermissions = createSelector([selectRawUserPermissions], normalizePermissions);

export const selectHasPermission = (permission, action = "view") => (state) => {
    const user = state.auth.user;
    if (!user || user.isBlocked) return false;
    if (user.role === "admin") return true;
    if (user.role === "staff") {
        return hasPermissionAction(user.permissions, permission, action);
    }
    return false;
};
export const selectAccessToken = (state) => state.auth.accessToken;

export default authSlice.reducer;
