import { baseApi } from "./baseApi";

export const shopSettingsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getShopSettings: builder.query({
            query: () => "/admin/dashboard/shop-settings",
            transformResponse: (response) => response.data,
            providesTags: ["ShopSettings"],
        }),
        updateShopSettings: builder.mutation({
            query: (body) => ({ url: "/admin/dashboard/shop-settings", method: "PUT", body }),
            invalidatesTags: ["ShopSettings"],
            transformResponse: (response) => response.data,
        }),
    }),
});

export const { useGetShopSettingsQuery, useUpdateShopSettingsMutation } = shopSettingsApi;
