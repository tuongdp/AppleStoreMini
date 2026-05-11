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
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    const handleGoogleResponse = useCallback(
        async (response) => {
            console.log("[GoogleAuth] Received response from Google:", response);
            try {
                const result = await googleLoginMutation(response).unwrap();
                console.log("[GoogleAuth] API login success:", result);

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
                    } catch (syncErr) {
                        console.warn("[GoogleAuth] Cart sync failed (non-critical):", syncErr);
                    }
                }

                navigate(ROUTES.HOME);
            } catch (err) {
                console.error("[GoogleAuth] API login failed:", err);
                console.error("[GoogleAuth] Error details:", {
                    status: err?.status,
                    message: err?.data?.message,
                    data: err?.data,
                });
            }
        },
        [googleLoginMutation, cartItems, syncCart, navigate],
    );

    useEffect(() => {
        if (!googleClientId) {
            console.error("[GoogleAuth] Missing VITE_GOOGLE_CLIENT_ID environment variable.");
            return;
        }
        if (window.google?.accounts?.oauth2) {
            console.log("[GoogleAuth] Google OAuth2 already initialized.");
            return;
        }

        console.log("[GoogleAuth] Loading Google GSI script...");

        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;

        script.onload = () => {
            console.log("[GoogleAuth] Google GSI script loaded successfully.");
            console.log("[GoogleAuth] oauth2 available:", !!window.google?.accounts?.oauth2);
        };

        script.onerror = (err) => {
            console.error("[GoogleAuth] Failed to load Google GSI script:", err);
            console.error("[GoogleAuth] This may be caused by an ad blocker, network issue, or the script being blocked.");
        };

        document.body.appendChild(script);

        return () => {
            const el = document.querySelector(
                'script[src="https://accounts.google.com/gsi/client"]',
            );
            if (el) el.remove();
        };
    }, [googleClientId]);

    const loginWithGoogle = useCallback(() => {
        console.log("[GoogleAuth] loginWithGoogle called.");

        if (!googleClientId) {
            console.error("[GoogleAuth] Cannot login: Missing VITE_GOOGLE_CLIENT_ID.");
            alert("Cấu hình Google login chưa được thiết lập. Vui lòng thử lại sau.");
            return;
        }

        if (!window.google?.accounts?.oauth2) {
            console.error("[GoogleAuth] Google OAuth2 not available. Script may not have loaded yet.");
            console.error("[GoogleAuth] window.google:", window.google);
            alert("Google login chưa sẵn sàng. Vui lòng đợi giây lát và thử lại. Nếu vẫn không được, hãy kiểm tra kết nối mạng hoặc tắt trình chặn quảng cáo.");
            return;
        }

        console.log("[GoogleAuth] Initializing OAuth2 code client with client_id:", googleClientId);

        const client = window.google.accounts.oauth2.initCodeClient({
            client_id: googleClientId,
            scope: "email profile openid",
            ux_mode: "popup",
            callback: (response) => {
                console.log("[GoogleAuth] OAuth2 callback received:", response);
                if (response.code) {
                    handleGoogleResponse({ code: response.code });
                } else {
                    console.error("[GoogleAuth] No authorization code in response:", response);
                }
            },
        });

        console.log("[GoogleAuth] Requesting authorization code...");
        client.requestCode();
    }, [googleClientId, handleGoogleResponse]);

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
