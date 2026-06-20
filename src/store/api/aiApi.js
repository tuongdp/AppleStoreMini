import { baseApi } from "./baseApi";

export const aiApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    aiSearch: builder.mutation({
      query: (body) => ({ url: "/chat/search", method: "POST", body }),
      transformResponse: (response) => response.data,
    }),
    personalizedRecommend: builder.mutation({
      query: () => ({ url: "/chat/personalized", method: "POST", body: {} }),
      transformResponse: (response) => response.data,
    }),
  }),
});

export const {
  useAiSearchMutation,
  usePersonalizedRecommendMutation,
} = aiApi;
