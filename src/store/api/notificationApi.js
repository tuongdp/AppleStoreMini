import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getToken = () => localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");

const baseQuery = fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers) => {
        const token = getToken();
        if (token) headers.set("Authorization", `Bearer ${token}`);
        return headers;
    },
});

export const notificationApi = createApi({
    reducerPath: "notificationApi",
    baseQuery,
    tagTypes: ["Notifications"],
    endpoints: (builder) => ({
        getNotifications: builder.query({
            query: (params) => ({ url: "/admin/notifications", params }),
            providesTags: ["Notifications"],
            transformResponse: (response) => ({
                notifications: response.data?.notifications ?? [],
                unreadCount: response.data?.unreadCount ?? 0,
                pagination: response.pagination,
            }),
        }),
        markRead: builder.mutation({
            query: (id) => ({ url: `/admin/notifications/${id}/read`, method: "PATCH" }),
            invalidatesTags: ["Notifications"],
        }),
        markResolved: builder.mutation({
            query: (id) => ({ url: `/admin/notifications/${id}/resolve`, method: "PATCH" }),
            invalidatesTags: ["Notifications"],
        }),
        dismissNotification: builder.mutation({
            query: (id) => ({ url: `/admin/notifications/${id}/dismiss`, method: "PATCH" }),
            invalidatesTags: ["Notifications"],
        }),
        runAnalysis: builder.mutation({
            query: () => ({ url: "/admin/notifications/analyze", method: "POST" }),
            invalidatesTags: ["Notifications"],
        }),
    }),
});

export const {
    useGetNotificationsQuery,
    useMarkReadMutation,
    useMarkResolvedMutation,
    useDismissNotificationMutation,
    useRunAnalysisMutation,
} = notificationApi;
