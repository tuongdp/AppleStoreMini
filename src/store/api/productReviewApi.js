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
      invalidatesTags: (_, __, { productId }) => [{ type: "Reviews", id: productId }, "Products", "Orders"],
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

    toggleReviewVisibility: builder.mutation({
      query: (reviewId) => ({ url: `/admin/reviews/${reviewId}/visibility`, method: "PATCH" }),
      invalidatesTags: ["Reviews"],
      transformResponse: (response) => response.data,
    }),

    adminDeleteReview: builder.mutation({
      query: (reviewId) => ({ url: `/admin/reviews/${reviewId}`, method: "DELETE" }),
      invalidatesTags: ["Reviews"],
    }),
  }),
});

export const {
  useGetReviewsQuery, useCreateReviewMutation, useUpdateReviewMutation, useDeleteReviewMutation,
  useLikeReviewMutation, useCheckPurchasedQuery, useGetAllReviewsQuery,
  useToggleReviewVisibilityMutation, useAdminDeleteReviewMutation,
} = productReviewApi;
