import { baseApi } from "./baseApi";

export const commentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getComments: builder.query({
      query: ({ type, targetId, params }) => ({
        url: "/comments",
        params: { type: type.toUpperCase(), targetId, ...params },
      }),
      providesTags: ({ type, targetId }) => [
        { type: "Comments", id: `${type}-${targetId}` },
      ],
      transformResponse: (response) => response.data,
    }),

    createComment: builder.mutation({
      query: ({ type, targetId, comment, rating, ...rest }) => ({
        url: `/comments/${targetId}`,
        method: "POST",
        body: { type: type.toUpperCase(), content: comment, rating, ...rest },
      }),
      invalidatesTags: ({ type, targetId }) => [
        { type: "Comments", id: `${type}-${targetId}` },
        ...(type === "product" ? ["Products", "Orders"] : []),
      ],
      transformResponse: (response) => response.data,
    }),

    updateComment: builder.mutation({
      query: ({ commentId, comment, rating }) => {
        const body = {};
        if (rating != null) body.rating = rating;
        if (comment != null) body.content = comment;
        return { url: `/comments/${commentId}`, method: "PUT", body };
      },
      invalidatesTags: ["Comments"],
      transformResponse: (response) => response.data,
    }),

    deleteComment: builder.mutation({
      query: ({ commentId }) => ({
        url: `/comments/${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: ({ type, targetId }) => [
        { type: "Comments", id: `${type}-${targetId}` },
        ...(type === "product" ? ["Products"] : []),
      ],
    }),

    likeComment: builder.mutation({
      query: ({ commentId, targetId }) => ({
        url: `/comments/${commentId}/like`,
        method: "POST",
      }),
      invalidatesTags: ({ targetId }) => [
        { type: "Comments", id: `product-${targetId}` },
      ],
      transformResponse: (response) => response.data,
    }),

    checkPurchased: builder.query({
      query: (targetId) => `/comments/check-purchased?targetId=${targetId}`,
      transformResponse: (response) => response.data,
    }),

    getAllComments: builder.query({
      query: (params) => ({ url: "/admin/comments", params }),
      providesTags: ["Comments"],
      transformResponse: (response) => ({
        comments: response.data,
        pagination: response.pagination,
      }),
    }),

    toggleCommentVisibility: builder.mutation({
      query: (commentId) => ({
        url: `/admin/comments/${commentId}/visibility`,
        method: "PATCH",
      }),
      invalidatesTags: ["Comments"],
      transformResponse: (response) => response.data,
    }),

    adminDeleteComment: builder.mutation({
      query: (commentId) => ({
        url: `/admin/comments/${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Comments"],
    }),
  }),
});

export const {
  useGetCommentsQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
  useLikeCommentMutation,
  useCheckPurchasedQuery,
  useGetAllCommentsQuery,
  useToggleCommentVisibilityMutation,
  useAdminDeleteCommentMutation,
} = commentsApi;
