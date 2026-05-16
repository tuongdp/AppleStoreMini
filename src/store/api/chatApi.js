import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const baseQuery = fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers, { getState }) => {
        const token = getState().auth?.accessToken;
        if (token) headers.set("Authorization", `Bearer ${token}`);
        return headers;
    },
});

export const chatApi = createApi({
    reducerPath: "chatApi",
    baseQuery,
    tagTypes: ["Conversations", "Messages"],
    endpoints: (builder) => ({
        sendMessage: builder.mutation({
            query: (body) => ({ url: "/chat/realtime/message", method: "POST", body }),
        }),
        getConversations: builder.query({
            query: (params) => ({ url: "/admin/chat/conversations", params }),
            providesTags: ["Conversations"],
            transformResponse: (response) => ({ conversations: response.data?.conversations || [], unreadCount: response.data?.unreadCount || 0 }),
        }),
        getChatMessages: builder.query({
            query: (id) => `/admin/chat/conversations/${id}/messages`,
            providesTags: ["Messages"],
            transformResponse: (response) => response.data,
        }),
        adminReply: builder.mutation({
            query: ({ id, message }) => ({ url: `/admin/chat/conversations/${id}/reply`, method: "POST", body: { message } }),
            invalidatesTags: ["Messages"],
        }),
        closeConversation: builder.mutation({
            query: (id) => ({ url: `/admin/chat/conversations/${id}/close`, method: "PATCH" }),
            invalidatesTags: ["Conversations"],
        }),
    }),
});

export const { useSendMessageMutation, useGetConversationsQuery, useGetChatMessagesQuery, useAdminReplyMutation, useCloseConversationMutation } = chatApi;
