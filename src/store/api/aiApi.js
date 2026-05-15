import { baseApi } from "./baseApi";

export const aiApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    aiRecommend: builder.mutation({
      query: (body) => ({ url: "/chat/recommend", method: "POST", body }),
    }),
    aiCompare: builder.mutation({
      query: (body) => ({ url: "/chat/compare", method: "POST", body }),
    }),
    aiSearch: builder.mutation({
      query: (body) => ({ url: "/chat/search", method: "POST", body }),
    }),
    aiReviewSummary: builder.mutation({
      query: (body) => ({ url: "/chat/review-summary", method: "POST", body }),
    }),
    aiGenerateDescription: builder.mutation({
      query: (body) => ({ url: "/chat/generate-description", method: "POST", body }),
    }),
  }),
});

export const {
  useAiRecommendMutation,
  useAiCompareMutation,
  useAiSearchMutation,
  useAiReviewSummaryMutation,
  useAiGenerateDescriptionMutation,
} = aiApi;
