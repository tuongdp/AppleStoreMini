import { baseApi } from "./baseApi";

export const emailMarketingApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // ── Subscribers (public) ──
        subscribe: builder.mutation({
            query: (body) => ({
                url: "/subscribe",
                method: "POST",
                body,
            }),
            transformResponse: (response) => response.data,
        }),

        unsubscribe: builder.mutation({
            query: (body) => ({
                url: "/unsubscribe",
                method: "POST",
                body,
            }),
            transformResponse: (response) => response.data,
        }),

        // ── Admin: Subscribers ──
        getSubscribers: builder.query({
            query: (params) => ({ url: "/admin/subscribers", params }),
            providesTags: ["Subscribers"],
            transformResponse: (response) => ({
                subscribers: response.data,
                pagination: response.pagination,
            }),
        }),

        getSubscriberStats: builder.query({
            query: () => "/admin/subscribers/stats",
            providesTags: ["Subscribers"],
            transformResponse: (response) => response.data,
        }),

        deleteSubscriber: builder.mutation({
            query: (id) => ({
                url: `/admin/subscribers/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Subscribers"],
        }),

        // ── Admin: Email Campaigns ──
        getCampaigns: builder.query({
            query: (params) => ({ url: "/admin/email-campaigns", params }),
            providesTags: ["Campaigns"],
            transformResponse: (response) => ({
                campaigns: response.data,
                pagination: response.pagination,
            }),
        }),

        getCampaignById: builder.query({
            query: (id) => `/admin/email-campaigns/${id}`,
            providesTags: (_, __, id) => [{ type: "Campaign", id }],
            transformResponse: (response) => response.data,
        }),

        createCampaign: builder.mutation({
            query: (body) => ({
                url: "/admin/email-campaigns",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Campaigns"],
            transformResponse: (response) => response.data,
        }),

        updateCampaign: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/admin/email-campaigns/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: ["Campaigns", "Campaign"],
            transformResponse: (response) => response.data,
        }),

        deleteCampaign: builder.mutation({
            query: (id) => ({
                url: `/admin/email-campaigns/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Campaigns"],
        }),

        sendCampaign: builder.mutation({
            query: (id) => ({
                url: `/admin/email-campaigns/${id}/send`,
                method: "POST",
            }),
            invalidatesTags: ["Campaigns", "Campaign", "EmailLogs"],
            transformResponse: (response) => response.data,
        }),

        getCampaignStats: builder.query({
            query: (id) => `/admin/email-campaigns/${id}/stats`,
            providesTags: (_, __, id) => [{ type: "Campaign", id }],
            transformResponse: (response) => response.data,
        }),

        // ── Admin: Auto Generate ──
        autoGenerateCampaign: builder.mutation({
            query: (strategy) => ({
                url: `/admin/email-campaigns/auto-generate?strategy=${strategy || "both"}`,
                method: "GET",
            }),
            invalidatesTags: ["Campaigns"],
            transformResponse: (response) => response.data,
        }),

        // ── Admin: Email Logs ──
        getEmailLogs: builder.query({
            query: (params) => ({ url: "/admin/email-logs", params }),
            providesTags: ["EmailLogs"],
            transformResponse: (response) => ({
                logs: response.data,
                pagination: response.pagination,
            }),
        }),
    }),
});

export const {
    useSubscribeMutation,
    useUnsubscribeMutation,
    useGetSubscribersQuery,
    useGetSubscriberStatsQuery,
    useDeleteSubscriberMutation,
    useGetCampaignsQuery,
    useGetCampaignByIdQuery,
    useCreateCampaignMutation,
    useUpdateCampaignMutation,
    useDeleteCampaignMutation,
    useSendCampaignMutation,
    useGetCampaignStatsQuery,
    useGetEmailLogsQuery,
    useAutoGenerateCampaignMutation,
} = emailMarketingApi;
