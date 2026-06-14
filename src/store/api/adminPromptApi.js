import { baseApi } from "./baseApi";

const normalizePrompts = (response) => response?.data || response || {};

export const adminPromptApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAdminPrompts: builder.query({
            query: () => "/admin/ai/prompts",
            transformResponse: normalizePrompts,
            providesTags: ["AdminPrompts"],
        }),
        updateAdminPrompt: builder.mutation({
            query: ({ featureKey, ...body }) => ({
                url: `/admin/ai/prompts/${featureKey}`,
                method: "PUT",
                body,
            }),
            transformResponse: normalizePrompts,
            invalidatesTags: ["AdminPrompts", "AIHealth"],
        }),
    }),
});

export const {
    useGetAdminPromptsQuery,
    useUpdateAdminPromptMutation,
} = adminPromptApi;
