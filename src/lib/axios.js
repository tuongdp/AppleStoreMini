import axios from "axios";
import { logout, setCredentials } from "@/store/authSlice";

let store;

export const injectStore = (_store) => {
    store = _store;
};

const BASE_URL = import.meta.env.VITE_API_URL;

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// ── Request interceptor — gắn accessToken ──
axiosInstance.interceptors.request.use(
    (config) => {
        const token = store?.getState()?.auth?.accessToken;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

// ── Queue xử lý request khi đang refresh token ──
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

// ── Response interceptor — auto refresh khi 401 ──
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Network error (timeout, mất mạng...)
        if (!error.response) {
            console.error("Network error:", error.message);
            return Promise.reject(error);
        }

        // Không retry các request auth để tránh vòng lặp vô tận
        const isAuthEndpoint =
            originalRequest.url?.includes("/auth/login") ||
            originalRequest.url?.includes("/auth/refresh-token");

        if (
            error.response.status === 401 &&
            !originalRequest._retry &&
            !isAuthEndpoint
        ) {
            // Nếu đang refresh, đưa request vào queue chờ
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return axiosInstance(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Refresh token qua httpOnly cookie
                const response = await axiosInstance.post(
                    "/auth/refresh-token",
                    null,
                    // Đánh dấu request này là auth endpoint để interceptor bỏ qua
                    { url: "/auth/refresh-token" },
                );

                const newToken =
                    response.data?.data?.accessToken ??
                    response.data?.accessToken;

                if (!newToken) throw new Error("No access token in response");

                store.dispatch(setCredentials({ accessToken: newToken }));
                processQueue(null, newToken);

                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                store.dispatch(logout());

                // Redirect về login nếu không phải đang ở trang auth
                if (!window.location.pathname.startsWith("/login")) {
                    window.location.href = "/login";
                }

                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    },
);

export default axiosInstance;
