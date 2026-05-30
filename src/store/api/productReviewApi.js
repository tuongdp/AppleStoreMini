import { baseApi } from "./baseApi";

export const productReviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getReviews: builder.query({
      query: ({ productId, params }) => ({ url: `/reviews/${productId}`, params }),
      providesTags: (_, __, { productId }) => [{ type: "Reviews", id: productId }],
      transformResponse: (response) => response.data,
    }),

    createReview: builder.mutation({
      query: ({ productId, ...data }) => ({ url: `/reviews/${productId}`, method: "POST", body: data }),
      invalidatesTags: (_, __, { productId }) => [{ type: "Reviews", id: productId }, "Products", "Orders", "Points"],
      transformResponse: (response) => response.data,
    }),

    uploadReviewMedia: builder.mutation({
      query: (formData) => ({ url: "/reviews/media/upload", method: "POST", body: formData }),
      transformResponse: (response) => response.data,
    }),

    updateReview: builder.mutation({
      query: ({ productId, reviewId, ...data }) => ({ url: `/reviews/${productId}/${reviewId}`, method: "PUT", body: data }),
      invalidatesTags: (_, __, { productId }) => [{ type: "Reviews", id: productId }],
      transformResponse: (response) => response.data,
    }),

    deleteReview: builder.mutation({
      query: ({ productId, reviewId }) => ({ url: `/reviews/${productId}/${reviewId}`, method: "DELETE" }),
      invalidatesTags: (_, __, { productId }) => [{ type: "Reviews", id: productId }, "Products"],
    }),

    likeReview: builder.mutation({
      query: ({ productId, reviewId }) => ({ url: `/reviews/${productId}/${reviewId}/like`, method: "POST" }),
      invalidatesTags: (_, __, { productId }) => [{ type: "Reviews", id: productId }],
      transformResponse: (response) => response.data,
    }),

    checkPurchased: builder.query({
      query: (productId) => `/reviews/${productId}/check-purchased`,
      transformResponse: (response) => response.data,
    }),

    // Admin
    getAllReviews: builder.query({
      query: (params) => ({ url: "/admin/reviews", params }),
      providesTags: ["Reviews"],
      transformResponse: (response) => ({ reviews: response.data, pagination: response.pagination }),
    }),

    getAdminReview: builder.query({
      query: (reviewId) => `/admin/reviews/${reviewId}`,
      providesTags: (_, __, reviewId) => [{ type: "Reviews", id: reviewId }],
      transformResponse: (response) => response.data,
    }),

    toggleReviewVisibility: builder.mutation({
      query: (reviewId) => ({ url: `/admin/reviews/${reviewId}/visibility`, method: "PATCH" }),
      invalidatesTags: ["Reviews"],
      transformResponse: (response) => response.data,
    }),

    replyReview: builder.mutation({
      query: ({ reviewId, content }) => ({ url: `/admin/reviews/${reviewId}/reply`, method: "POST", body: { content } }),
      invalidatesTags: (_, __, { reviewId }) => ["Reviews", { type: "Reviews", id: reviewId }],
      transformResponse: (response) => response.data,
    }),

    adminDeleteReview: builder.mutation({
      query: (reviewId) => ({ url: `/admin/reviews/${reviewId}`, method: "DELETE" }),
      invalidatesTags: ["Reviews"],
    }),

    getSentimentStats: builder.query({
      query: () => "/admin/reviews/sentiment",
      transformResponse: (response) => response.data,
    }),
  }),
});

export const {
  useGetReviewsQuery, useCreateReviewMutation, useUploadReviewMediaMutation, useUpdateReviewMutation, useDeleteReviewMutation,
  useLikeReviewMutation, useCheckPurchasedQuery, useGetAllReviewsQuery,
  useGetAdminReviewQuery, useToggleReviewVisibilityMutation, useReplyReviewMutation, useAdminDeleteReviewMutation,
  useGetSentimentStatsQuery,
} = productReviewApi;
