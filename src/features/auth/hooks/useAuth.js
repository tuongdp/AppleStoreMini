import { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
    useLoginMutation,
    useRegisterMutation,
    useLogoutMutation,
    useSendVerificationMutation,
    useGoogleLoginMutation,
} from "@/store/api/authApi";
import {
    selectCurrentUser,
    selectIsAuthenticated,
    selectIsAdmin,
    logout as logoutAction,
} from "@/store/authSlice";
import { clearCart, selectCartItems } from "@/store/cartSlice";
import { useSyncCartMutation } from "@/store/api/cartApi";
import { ROUTES } from "@/lib/constants";

export function useAuth() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const user = useSelector(selectCurrentUser);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const isAdmin = useSelector(selectIsAdmin);
    const isVerified = user?.isVerified ?? true;
    const cartItems = useSelector(selectCartItems);

    const [loginMutation, { isLoading: isLoginLoading }] = useLoginMutation();
    const [registerMutation, { isLoading: isRegisterLoading }] =
        useRegisterMutation();
    const [logoutMutation, { isLoading: isLogoutLoading }] =
        useLogoutMutation();
    const [sendVerificationMutation] = useSendVerificationMutation();
    const [googleLoginMutation, { isLoading: isGoogleLoginLoading }] =
        useGoogleLoginMutation();
    const [syncCart] = useSyncCartMutation();

    const login = async (credentials, redirectTo = ROUTES.HOME) => {
        try {
            // login API sẽ tự dispatch setCredentials từ authApi
            await loginMutation(credentials).unwrap();

            // Sync giỏ hàng local → server
            if (cartItems.length > 0) {
                try {
                    await syncCart(
                        cartItems.map((item) => ({
                            product: item.product._id || item.product.id,
                            quantity: item.quantity,
                            selectedColor: item.selectedColor,
                            selectedStorage: item.selectedStorage,
                        })),
                    ).unwrap();
                } catch {
                    // Sync fail không ảnh hưởng login
                }
            }

            navigate(redirectTo);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error?.data?.message || "Đăng nhập thất bại",
            };
        }
    };

    const [registerSuccess, setRegisterSuccess] = useState(false);
    const [isGoogleInit, setIsGoogleInit] = useState(false);

    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    const handleGoogleResponse = useCallback(
        async (response) => {
            try {
                await googleLoginMutation(response.credential).unwrap();

                if (cartItems.length > 0) {
                    try {
                        await syncCart(
                            cartItems.map((item) => ({
                                product: item.product._id || item.product.id,
                                quantity: item.quantity,
                                selectedColor: item.selectedColor,
                                selectedStorage: item.selectedStorage,
                            })),
                        ).unwrap();
                    } catch {
                        // Sync fail không ảnh hưởng login
                    }
                }

                navigate(ROUTES.HOME);
            } catch {
                // Lỗi đã được xử lý trong mutation
            }
        },
        [googleLoginMutation, cartItems, syncCart, navigate],
    );

    useEffect(() => {
        if (!googleClientId) return;

        if (window.google?.accounts?.id) {
            window.google.accounts.id.initialize({
                client_id: googleClientId,
                callback: handleGoogleResponse,
            });
            setIsGoogleInit(true);
            return;
        }

        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => {
            window.google.accounts.id.initialize({
                client_id: googleClientId,
                callback: handleGoogleResponse,
            });
            setIsGoogleInit(true);
        };
        document.body.appendChild(script);

        return () => {
            const el = document.querySelector(
                'script[src="https://accounts.google.com/gsi/client"]',
            );
            if (el) el.remove();
        };
    }, [googleClientId, handleGoogleResponse]);

    const loginWithGoogle = useCallback(() => {
        if (!isGoogleInit || !window.google?.accounts?.id) return;
        window.google.accounts.id.prompt();
    }, [isGoogleInit]);

    const register = async (data) => {
        try {
            await registerMutation(data).unwrap();
            setRegisterSuccess(true);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error?.data?.message || "Đăng ký thất bại",
            };
        }
    };

    const sendVerification = async (email) => {
        try {
            await sendVerificationMutation({ email }).unwrap();
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error?.data?.message || "Gửi email thất bại",
            };
        }
    };

    const logoutUser = async () => {
        try {
            await logoutMutation().unwrap();
        } catch (error) {
            console.error("Logout server error:", error);
        } finally {
            dispatch(logoutAction());
            dispatch(clearCart());
            navigate(ROUTES.HOME);
        }
    };

    return {
        user,
        isAuthenticated,
        isAdmin,
        isVerified,
        registerSuccess,

        isLoginLoading,
        isRegisterLoading,
        isLogoutLoading,
        isGoogleLoginLoading,

        login,
        register,
        logout: logoutUser,
        sendVerification,
        loginWithGoogle,
    };
}
