import { baseApi } from "./baseApi";

const normalizeAiSettings = (response) => response?.data || response || {};

export const adminAiApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAdminAiSettings: builder.query({
            query: () => "/admin/ai/settings",
            transformResponse: normalizeAiSettings,
            providesTags: ["AdminAI"],
        }),
        updateAdminAiSettings: builder.mutation({
            query: (body) => ({ url: "/admin/ai/settings", method: "PUT", body }),
            transformResponse: normalizeAiSettings,
            invalidatesTags: ["AdminAI", "AIHealth"],
        }),
        testAdminAiConnection: builder.mutation({
            query: () => ({ url: "/admin/ai/test", method: "POST" }),
            transformResponse: normalizeAiSettings,
        }),
        getAdminAiLogs: builder.query({
            query: ({ feature, status, limit = 50 } = {}) => {
                const params = new URLSearchParams();
                if (feature) params.set("feature", feature);
                if (status) params.set("status", status);
                params.set("limit", String(limit));
                return `/admin/ai/logs?${params.toString()}`;
            },
            transformResponse: (response) => response?.data || [],
            providesTags: ["AdminAILogs"],
        }),
    }),
});

export const {
    useGetAdminAiSettingsQuery,
    useGetAdminAiLogsQuery,
    useUpdateAdminAiSettingsMutation,
    useTestAdminAiConnectionMutation,
} = adminAiApi;
