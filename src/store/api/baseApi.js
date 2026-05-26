import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Mutex } from "async-mutex";
import { setCredentials, logout } from "@/store/authSlice";

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

  if (result.error && result.error.status === 401) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();

      try {
        const refreshToken = api.getState().auth.refreshToken;
        if (!refreshToken) {
          api.dispatch(logout());
          api.dispatch(baseApi.util.resetApiState());
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
          api.dispatch(logout());
          api.dispatch(baseApi.util.resetApiState());
        }
      } catch {
        api.dispatch(logout());
        api.dispatch(baseApi.util.resetApiState());
      } finally {
        release();
      }
    } else {
      await mutex.waitForUnlock();
      result = await baseQuery(args, api, extraOptions);
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
    "Wishlist",
    "Coupons",
    "Coupon",
    "Categories",
    "News",
    "NewsItem",
    "Banners",
    "Series",
    "GlobalOptions",
    "GlobalOption",
    "Points",
    "Returns",
  ],
  endpoints: () => ({}),
});
