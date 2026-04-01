import { baseApi } from "./baseApi";

export const reviewsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // GET /reviews/:productId?page=&limit=
        // productId là integer (MySQL)
        getReviews: builder.query({
            query: ({ productId, params }) => ({
                url: `/reviews/${productId}`,
                params,
            }),
            providesTags: (_, __, { productId }) => [
                { type: "Reviews", id: productId },
            ],
            transformResponse: (response) => response.data,
        }),

        // POST /reviews/:productId — { rating, comment }
        createReview: builder.mutation({
            query: ({ productId, ...data }) => ({
                url: `/reviews/${productId}`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: (_, __, { productId }) => [
                { type: "Reviews", id: productId },
                "Products",
                "Orders",
            ],
            transformResponse: (response) => response.data,
        }),

        // PUT /reviews/:productId/:reviewId
        updateReview: builder.mutation({
            query: ({ productId, reviewId, ...data }) => ({
                url: `/reviews/${productId}/${reviewId}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: (_, __, { productId }) => [
                { type: "Reviews", id: productId },
            ],
            transformResponse: (response) => response.data,
        }),

        // DELETE /reviews/:productId/:reviewId
        deleteReview: builder.mutation({
            query: ({ productId, reviewId }) => ({
                url: `/reviews/${productId}/${reviewId}`,
                method: "DELETE",
            }),
            invalidatesTags: (_, __, { productId }) => [
                { type: "Reviews", id: productId },
                "Products",
            ],
        }),

        // POST /reviews/:productId/:reviewId/like
        likeReview: builder.mutation({
            query: ({ productId, reviewId }) => ({
                url: `/reviews/${productId}/${reviewId}/like`,
                method: "POST",
            }),
            invalidatesTags: (_, __, { productId }) => [
                { type: "Reviews", id: productId },
            ],
            transformResponse: (response) => response.data,
        }),

        // GET /reviews/:productId/check-purchased
        checkPurchased: builder.query({
            query: (productId) => `/reviews/${productId}/check-purchased`,
            transformResponse: (response) => response.data,
        }),

        // GET /admin/reviews?page=&limit=&productId=&rating=
        getAllReviews: builder.query({
            query: (params) => ({ url: "/admin/reviews", params }),
            providesTags: ["Reviews"],
            transformResponse: (response) => ({
                reviews: response.data,
                pagination: response.pagination,
            }),
        }),

        // PATCH /admin/reviews/:reviewId/visibility
        toggleReviewVisibility: builder.mutation({
            query: (reviewId) => ({
                url: `/admin/reviews/${reviewId}/visibility`,
                method: "PATCH",
            }),
            invalidatesTags: ["Reviews"],
            transformResponse: (response) => response.data,
        }),
    }),
});

export const {
    useGetReviewsQuery,
    useCreateReviewMutation,
    useUpdateReviewMutation,
    useDeleteReviewMutation,
    useLikeReviewMutation,
    useCheckPurchasedQuery,
    useGetAllReviewsQuery,
    useToggleReviewVisibilityMutation,
} = reviewsApi;
