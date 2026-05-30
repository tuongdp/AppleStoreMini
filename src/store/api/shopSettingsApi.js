import { baseApi } from "./baseApi";

export const shopSettingsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getSettings: builder.query({
            query: () => "/admin/dashboard/settings",
            transformResponse: (response) => response.data,
            providesTags: ["ShopSettings"],
        }),
        updateSettings: builder.mutation({
            query: (body) => ({ url: "/admin/dashboard/settings", method: "PUT", body }),
            invalidatesTags: ["ShopSettings"],
            transformResponse: (response) => response.data,
        }),
    }),
});

export const { useGetSettingsQuery, useUpdateSettingsMutation } = shopSettingsApi;
