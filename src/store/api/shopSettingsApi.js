import { baseApi } from "./baseApi";

const normalizeSettings = (response) => {
    const data = response?.data || {};
    const shop = data.shop || {
        name: data.shopName || data.name || "",
        logo: data.logo || "",
        taxCode: data.taxCode || "",
        address: data.shopAddress || data.address || "",
        phone: data.shopPhone || data.phone || "",
        email: data.shopEmail || data.email || "",
        facebook: data.facebook || "",
        zalo: data.zalo || "",
        tiktok: data.tiktok || "",
        youtube: data.youtube || "",
    };

    return { ...data, shop };
};

export const shopSettingsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getSettings: builder.query({
            query: () => "/admin/dashboard/settings",
            transformResponse: normalizeSettings,
            providesTags: ["ShopSettings"],
        }),
        updateSettings: builder.mutation({
            query: (body) => ({ url: "/admin/dashboard/settings", method: "PUT", body }),
            invalidatesTags: ["ShopSettings"],
            transformResponse: normalizeSettings,
        }),
    }),
});

export const {
    useGetSettingsQuery,
    useUpdateSettingsMutation,
} = shopSettingsApi;
