import { baseApi } from "./baseApi";

export const newsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // GET /news?page=&limit=&category=
        getNews: builder.query({
            query: (params) => ({ url: "/news", params }),
            providesTags: ["News"],
            transformResponse: (response) => ({
                news: response.data,
                pagination: response.pagination,
            }),
        }),

        // GET /news/:slug
        getNewsBySlug: builder.query({
            query: (slug) => `/news/${slug}`,
            providesTags: (_, __, slug) => [{ type: "NewsItem", id: slug }],
            transformResponse: (response) => response.data,
        }),

        // POST /news/:newsId/rate
        rateNews: builder.mutation({
            query: ({ newsId, rating }) => ({
                url: `/news/${newsId}/rate`,
                method: "POST",
                body: { rating },
            }),
            invalidatesTags: (_, __, { slug }) => [
                { type: "NewsItem", id: slug },
            ],
            transformResponse: (response) => response.data,
        }),

        // GET /admin/news?page=&limit=
        getAllNews: builder.query({
            query: (params) => ({ url: "/admin/news", params }),
            providesTags: ["News"],
            transformResponse: (response) => ({
                news: response.data,
                pagination: response.pagination,
            }),
        }),

        // POST /admin/news
        createNews: builder.mutation({
            query: (data) => ({
                url: "/admin/news",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["News"],
            transformResponse: (response) => response.data,
        }),

        // PUT /admin/news/:id
        updateNews: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/admin/news/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["News", "NewsItem"],
            transformResponse: (response) => response.data,
        }),

        // DELETE /admin/news/:id
        deleteNews: builder.mutation({
            query: (id) => ({ url: `/admin/news/${id}`, method: "DELETE" }),
            invalidatesTags: ["News"],
        }),

        // PATCH /admin/news/:id/toggle
        toggleNewsStatus: builder.mutation({
            query: (id) => ({
                url: `/admin/news/${id}/toggle`,
                method: "PATCH",
            }),
            invalidatesTags: ["News"],
            transformResponse: (response) => response.data,
        }),

        // ── News Comments ──────────────────────────────
        getNewsComments: builder.query({
            query: ({ newsId, params }) => ({ url: `/news/${newsId}/comments`, params }),
            providesTags: (_, __, { newsId }) => [{ type: "NewsComments", id: newsId }],
            transformResponse: (response) => ({
                comments: response.data,
                pagination: response.pagination,
            }),
        }),

        createNewsComment: builder.mutation({
            query: ({ newsId, ...data }) => ({ url: `/news/${newsId}/comments`, method: "POST", body: data }),
            invalidatesTags: (_, __, { newsId }) => [{ type: "NewsComments", id: newsId }],
            transformResponse: (response) => response.data,
        }),

        deleteNewsComment: builder.mutation({
            query: ({ newsId, commentId }) => ({ url: `/news/${newsId}/comments/${commentId}`, method: "DELETE" }),
            invalidatesTags: (_, __, { newsId }) => [{ type: "NewsComments", id: newsId }],
        }),

        adminDeleteNewsComment: builder.mutation({
            query: (commentId) => ({ url: `/admin/news/comments/${commentId}`, method: "DELETE" }),
            invalidatesTags: ["NewsComments"],
        }),

        getAllNewsComments: builder.query({
            query: (params) => ({ url: "/admin/news/comments", params }),
            providesTags: ["NewsComments"],
            transformResponse: (response) => ({ comments: response.data, pagination: response.pagination }),
        }),
    }),
});

export const {
    useGetNewsQuery,
    useGetNewsBySlugQuery,
    useRateNewsMutation,
    useGetAllNewsQuery,
    useCreateNewsMutation,
    useUpdateNewsMutation,
    useDeleteNewsMutation,
    useToggleNewsStatusMutation,
    useGetNewsCommentsQuery,
    useCreateNewsCommentMutation,
    useDeleteNewsCommentMutation,
    useAdminDeleteNewsCommentMutation,
    useGetAllNewsCommentsQuery,
} = newsApi;
