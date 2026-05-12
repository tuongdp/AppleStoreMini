import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            const { user, accessToken, refreshToken } = action.payload;
            if (user) state.user = user;
            if (accessToken) state.accessToken = accessToken;
            if (refreshToken) state.refreshToken = refreshToken;
            state.isAuthenticated = !!state.accessToken;
        },
        logout: (state) => {
            state.user = null;
            state.accessToken = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
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
export const selectUserPermissions = (state) => state.auth.user?.permissions || [];

export const selectHasPermission = (permission) => (state) => {
    const user = state.auth.user;
    if (!user || user.isBlocked) return false;
    if (user.role === "admin") return true;
    if (user.role === "staff") {
        return Array.isArray(user.permissions) && user.permissions.includes(permission);
    }
    return false;
};
export const selectAccessToken = (state) => state.auth.accessToken;

export default authSlice.reducer;
