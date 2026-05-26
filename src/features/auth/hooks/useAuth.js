import { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
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
    setCredentials,
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

    const getSyncCartItems = useCallback(() =>
        cartItems
            .map((item) => ({
                variantId: item.variantId || item.product?.variantId || item.variant?.id,
                quantity: item.quantity,
            }))
            .filter((item) => item.variantId), [cartItems]);

    const login = async (credentials, redirectTo = ROUTES.HOME) => {
        try {
            const auth = await loginMutation(credentials).unwrap();
            dispatch(setCredentials({ ...auth, rememberMe: credentials.rememberMe }));

            if (cartItems.length > 0) {
                try {
                    await syncCart(getSyncCartItems()).unwrap();
                } catch {
                    // Sync fail không ảnh hưởng login
                }
            }

            navigate(redirectTo);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error?.data?.message || "Email hoặc mật khẩu không chính xác",
            };
        }
    };

    const [registerSuccess, setRegisterSuccess] = useState(false);
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const hasGoogleClientId = Boolean(googleClientId);
    const [isGoogleReady, setIsGoogleReady] = useState(Boolean(window.google?.accounts?.oauth2));

    const handleGoogleResponse = useCallback(
        async (response) => {
            try {
                await googleLoginMutation(response).unwrap();

                if (cartItems.length > 0) {
                    try {
                        await syncCart(getSyncCartItems()).unwrap();
                    } catch {
                        // Sync fail không ảnh hưởng login
                    }
                }

                navigate(ROUTES.HOME);
            } catch (error) {
                toast.error(error?.data?.message || "Đăng nhập Google thất bại");
                // Lỗi đã được xử lý trong mutation
            }
        },
        [googleLoginMutation, syncCart, navigate, getSyncCartItems, cartItems.length],
    );

    useEffect(() => {
        if (!googleClientId) return;
        if (window.google?.accounts?.oauth2) {
            setIsGoogleReady(true);
            return;
        }

        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => setIsGoogleReady(Boolean(window.google?.accounts?.oauth2));
        script.onerror = () => toast.error("Không tải được Google Sign-In. Vui lòng kiểm tra kết nối hoặc cấu hình CSP.");
        document.body.appendChild(script);

        return () => {
            const el = document.querySelector(
                'script[src="https://accounts.google.com/gsi/client"]',
            );
            if (el) el.remove();
        };
    }, [googleClientId]);

    const loginWithGoogle = useCallback(() => {
        if (!googleClientId) {
            toast.error("Chưa cấu hình Google Client ID cho website");
            return;
        }
        if (!window.google?.accounts?.oauth2) {
            toast.error("Google Sign-In chưa sẵn sàng, vui lòng thử lại sau vài giây");
            return;
        }

        const client = window.google.accounts.oauth2.initCodeClient({
            client_id: googleClientId,
            scope: "email profile openid",
            ux_mode: "popup",
            callback: (response) => {
                if (response.error) {
                    toast.error(response.error_description || "Google từ chối yêu cầu đăng nhập");
                    return;
                }
                if (response.code) {
                    handleGoogleResponse({ code: response.code });
                }
            },
        });

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
            localStorage.removeItem("rememberMe");
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
        isGoogleReady,
        hasGoogleClientId,

        login,
        register,
        logout: logoutUser,
        sendVerification,
        loginWithGoogle,
    };
}
