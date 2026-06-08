import { baseApi } from "./baseApi";

export const aiApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    aiHealth: builder.query({
      query: () => ({ url: "/chat/health" }),
      transformResponse: (response) => response.data ?? response,
      providesTags: ["AIHealth"],
    }),
    aiRecommend: builder.mutation({
      query: (body) => ({ url: "/chat/recommend", method: "POST", body }),
      transformResponse: (response) => response.data,
    }),
    aiCompare: builder.mutation({
      query: (body) => ({ url: "/chat/compare", method: "POST", body }),
      transformResponse: (response) => response.data,
    }),
    aiSearch: builder.mutation({
      query: (body) => ({ url: "/chat/search", method: "POST", body }),
      transformResponse: (response) => response.data,
    }),
    aiReviewSummary: builder.mutation({
      query: (body) => ({ url: "/chat/review-summary", method: "POST", body }),
      transformResponse: (response) => response.data,
    }),
    aiGenerateDescription: builder.mutation({
      query: (body) => ({ url: "/chat/generate-description", method: "POST", body }),
      transformResponse: (response) => response.data,
    }),
    personalizedRecommend: builder.mutation({
      query: () => ({ url: "/chat/personalized", method: "POST", body: {} }),
      transformResponse: (response) => response.data,
    }),
  }),
});

export const {
  useAiHealthQuery,
  useAiRecommendMutation,
  useAiCompareMutation,
  useAiSearchMutation,
  useAiReviewSummaryMutation,
  useAiGenerateDescriptionMutation,
  usePersonalizedRecommendMutation,
} = aiApi;
