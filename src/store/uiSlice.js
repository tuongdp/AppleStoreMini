import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    cartDrawerOpen: false,
    authModalOpen: false,
    mobileMenuOpen: false,
    searchOpen: false,
    pageLoading: false,
};

const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        toggleCartDrawer: (state, action) => {
            state.cartDrawerOpen = action.payload ?? !state.cartDrawerOpen;
        },
        toggleAuthModal: (state, action) => {
            state.authModalOpen = action.payload ?? !state.authModalOpen;
        },
        toggleMobileMenu: (state, action) => {
            state.mobileMenuOpen = action.payload ?? !state.mobileMenuOpen;
        },
        toggleSearch: (state, action) => {
            state.searchOpen = action.payload ?? !state.searchOpen;
        },
        setPageLoading: (state, action) => {
            state.pageLoading = action.payload;
        },
        closeAll: (state) => {
            // Đóng tất cả drawer/modal cùng lúc — dùng khi chuyển route
            state.cartDrawerOpen = false;
            state.authModalOpen = false;
            state.mobileMenuOpen = false;
            state.searchOpen = false;
        },
    },
});

export const {
    toggleCartDrawer,
    toggleAuthModal,
    toggleMobileMenu,
    toggleSearch,
    setPageLoading,
    closeAll,
} = uiSlice.actions;
export default uiSlice.reducer;

// Selectors
export const selectCartDrawerOpen = (state) => Boolean(state.ui?.cartDrawerOpen);
export const selectAuthModalOpen = (state) => Boolean(state.ui?.authModalOpen);
export const selectMobileMenuOpen = (state) => Boolean(state.ui?.mobileMenuOpen);
export const selectSearchOpen = (state) => Boolean(state.ui?.searchOpen);
export const selectPageLoading = (state) => Boolean(state.ui?.pageLoading);
