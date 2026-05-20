import { baseApi } from "./baseApi";

export const chatApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        sendMessage: builder.mutation({
            query: (body) => ({
                url: "/chat",
                method: "POST",
                body,
            }),
            transformResponse: (response) => response.data ?? response,
        }),
    }),
});

export const { useSendMessageMutation } = chatApi;
