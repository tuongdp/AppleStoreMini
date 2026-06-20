import { baseApi } from "./baseApi";

export const aiApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    personalizedRecommend: builder.mutation({
      query: () => ({ url: "/chat/personalized", method: "POST", body: {} }),
      transformResponse: (response) => response.data,
    }),
    compareProducts: builder.mutation({
      query: (body) => ({ url: "/chat/compare", method: "POST", body }),
      transformResponse: (response) => response.data,
    }),
  }),
});

export const {
  usePersonalizedRecommendMutation,
  useCompareProductsMutation,
} = aiApi;
