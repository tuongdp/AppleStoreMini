import { baseApi } from "./baseApi";

const urlMap = {
  product: {
    list: (id) => `/reviews/${id}`,
    create: (id) => `/reviews/${id}`,
    update: (id, cid) => `/reviews/${id}/${cid}`,
    delete: (id, cid) => `/reviews/${id}/${cid}`,
    like: (id, cid) => `/reviews/${id}/${cid}/like`,
    checkPurchased: (id) => `/reviews/${id}/check-purchased`,
  },
  news: {
    list: (id) => `/news/${id}/comments`,
    create: (id) => `/news/${id}/comments`,
    delete: (id, cid) => `/news/${id}/comments/${cid}`,
  },
};

export const commentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // ── User: lấy danh sách ──
    getComments: builder.query({
      query: ({ type, targetId, params }) => ({
        url: urlMap[type].list(targetId),
        params,
      }),
      providesTags: ({ type, targetId }) => [
        { type: "Comments", id: `${type}-${targetId}` },
      ],
      transformResponse: (response) => response.data,
    }),

    // ── User: tạo bình luận / đánh giá ──
    createComment: builder.mutation({
      query: ({ type, targetId, ...data }) => ({
        url: urlMap[type].create(targetId),
        method: "POST",
        body: data,
      }),
      invalidatesTags: ({ type, targetId }) => [
        { type: "Comments", id: `${type}-${targetId}` },
        ...(type === "product" ? ["Products", "Orders"] : []),
      ],
      transformResponse: (response) => response.data,
    }),

    // ── User: sửa bình luận (chỉ product) ──
    updateComment: builder.mutation({
      query: ({ type, targetId, commentId, ...data }) => ({
        url: urlMap[type].update(targetId, commentId),
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ({ type, targetId }) => [
        { type: "Comments", id: `${type}-${targetId}` },
      ],
      transformResponse: (response) => response.data,
    }),

    // ── User: xoá bình luận ──
    deleteComment: builder.mutation({
      query: ({ type, targetId, commentId }) => ({
        url: urlMap[type].delete(targetId, commentId),
        method: "DELETE",
      }),
      invalidatesTags: ({ type, targetId }) => [
        { type: "Comments", id: `${type}-${targetId}` },
        ...(type === "product" ? ["Products"] : []),
      ],
    }),

    // ── User: like bình luận (chỉ product) ──
    likeComment: builder.mutation({
      query: ({ targetId, commentId }) => ({
        url: urlMap.product.like(targetId, commentId),
        method: "POST",
      }),
      invalidatesTags: ({ targetId }) => [
        { type: "Comments", id: `product-${targetId}` },
      ],
      transformResponse: (response) => response.data,
    }),

    // ── User: kiểm tra đã mua hàng (chỉ product) ──
    checkPurchased: builder.query({
      query: (targetId) => urlMap.product.checkPurchased(targetId),
      transformResponse: (response) => response.data,
    }),

    // ── Admin: lấy tất cả bình luận ──
    getAllComments: builder.query({
      query: (params) => ({ url: "/admin/reviews", params }),
      providesTags: ["Comments"],
      transformResponse: (response) => ({
        comments: response.data,
        pagination: response.pagination,
      }),
    }),

    // ── Admin: ẩn / hiện bình luận ──
    toggleCommentVisibility: builder.mutation({
      query: (commentId) => ({
        url: `/admin/reviews/${commentId}/visibility`,
        method: "PATCH",
      }),
      invalidatesTags: ["Comments"],
      transformResponse: (response) => response.data,
    }),

    // ── Admin: xoá bình luận ──
    adminDeleteComment: builder.mutation({
      query: (commentId) => ({
        url: `/admin/reviews/${commentId}`,
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
