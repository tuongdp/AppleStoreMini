import { baseApi } from "./baseApi";

const getAiHeaders = () => {
  try {
    const key = localStorage.getItem("ai_api_key");
    return key ? { "x-api-key": key } : {};
  } catch {
    return {};
  }
};

export const aiApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    aiRecommend: builder.mutation({
      query: (body) => ({ url: "/chat/recommend", method: "POST", body, headers: getAiHeaders() }),
    }),
    aiCompare: builder.mutation({
      query: (body) => ({ url: "/chat/compare", method: "POST", body, headers: getAiHeaders() }),
    }),
    aiSearch: builder.mutation({
      query: (body) => ({ url: "/chat/search", method: "POST", body, headers: getAiHeaders() }),
    }),
    aiReviewSummary: builder.mutation({
      query: (body) => ({ url: "/chat/review-summary", method: "POST", body, headers: getAiHeaders() }),
    }),
    aiGenerateDescription: builder.mutation({
      query: (body) => ({ url: "/chat/generate-description", method: "POST", body, headers: getAiHeaders() }),
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
