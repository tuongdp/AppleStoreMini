import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Mutex } from "async-mutex";
import { setCredentials, logout } from "@/store/authSlice";
import { toast } from "sonner";

const BASE_URL = import.meta.env.VITE_API_URL;

const mutex = new Mutex();

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.accessToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  await mutex.waitForUnlock();

  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 403) {
    toast.error("Tài khoản đã bị khóa, vui lòng liên hệ cửa hàng");
    api.dispatch(logout());
    return result;
  }

  if (result.error && result.error.status === 401) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();

      try {
        const { refreshToken, accessToken } = api.getState().auth;
        if (!accessToken && !refreshToken) {
          release();
          return result;
        }
        if (!refreshToken) {
          toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
          api.dispatch(logout());
          release();
          return result;
        }

        const refreshResult = await baseQuery(
          {
            url: "/auth/refresh-token",
            method: "POST",
            body: { refreshToken },
          },
          api,
          extraOptions,
        );

        const newData = refreshResult.data?.data ?? refreshResult.data;

        if (newData?.accessToken) {
          api.dispatch(
            setCredentials({
              accessToken: newData.accessToken,
              refreshToken: newData.refreshToken,
              user: newData.user,
            }),
          );
          result = await baseQuery(args, api, extraOptions);
        } else {
          toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
          api.dispatch(logout());
        }
      } catch {
        toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
        api.dispatch(logout());
      } finally {
        release();
      }
    } else {
      await mutex.waitForUnlock();
      result = await baseQuery(args, api, extraOptions);
    }
  }

  if (result.error && result.error.status === 400 && result.error.data?.message === "Lỗi cơ sở dữ liệu") {
    for (let attempt = 1; attempt <= 2; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 800 * attempt));
      result = await baseQuery(args, api, extraOptions);
      if (!(result.error && result.error.status === 400 && result.error.data?.message === "Lỗi cơ sở dữ liệu")) {
        break;
      }
    }
  }

  if (result.error && result.error.status === "FETCH_ERROR") {
    for (let attempt = 1; attempt <= 2; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      result = await baseQuery(args, api, extraOptions);
      if (result.error?.status !== "FETCH_ERROR") {
        break;
      }
    }
  }

  if (result.error) {
    const status = result.error.status;
    const shouldRetry =
      (typeof status === "number" && status >= 500) ||
      status === "TIMEOUT_ERROR" ||
      status === 429;

    if (shouldRetry) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        result = await baseQuery(args, api, extraOptions);
        const stillError = result.error;
        const stillStatus = stillError?.status;
        const stillShouldRetry =
          (typeof stillStatus === "number" && stillStatus >= 500) ||
          stillStatus === "TIMEOUT_ERROR" ||
          stillStatus === 429;
        if (!stillShouldRetry) {
          break;
        }
      }
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Products",
    "Product",
    "Orders",
    "Order",
    "Users",
    "User",
    "Reviews",
    "Cart",
    "Profile",
    "Addresses",
    "Coupons",
    "Coupon",
    "Categories",
    "News",
    "NewsItem",
    "Banners",
    "Points",
    "Returns",
    "ShopSettings",
  ],
  endpoints: () => ({}),
});
