import { baseApi } from "./baseApi";

export const newsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getNews: builder.query({
            query: (params) => ({ url: "/news", params }),
            providesTags: ["News"],
            transformResponse: (response) => ({
                news: response.data,
                pagination: response.pagination,
            }),
        }),

        getNewsBySlug: builder.query({
            query: (slug) => `/news/${slug}`,
            providesTags: (_, __, slug) => [{ type: "NewsItem", id: slug }],
            transformResponse: (response) => response.data,
        }),

        getAdminNewsBySlug: builder.query({
            query: (slug) => `/admin/news/${slug}`,
            providesTags: (_, __, slug) => [{ type: "NewsItem", id: slug }],
            transformResponse: (response) => response.data,
        }),

        getAllNews: builder.query({
            query: (params) => ({ url: "/admin/news", params }),
            providesTags: ["News"],
            transformResponse: (response) => ({
                news: response.data,
                pagination: response.pagination,
            }),
        }),

        getNewsStats: builder.query({
            query: () => "/admin/news/stats",
            providesTags: ["News"],
            transformResponse: (response) => response.data,
        }),

        createNews: builder.mutation({
            query: (data) => ({
                url: "/admin/news",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["News"],
            transformResponse: (response) => response.data,
        }),

        updateNews: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/admin/news/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["News", "NewsItem"],
            transformResponse: (response) => response.data,
        }),

        deleteNews: builder.mutation({
            query: (id) => ({ url: `/admin/news/${id}`, method: "DELETE" }),
            invalidatesTags: ["News"],
        }),

        toggleNewsStatus: builder.mutation({
            query: (id) => ({
                url: `/admin/news/${id}/toggle`,
                method: "PATCH",
            }),
            invalidatesTags: ["News"],
            transformResponse: (response) => response.data,
        }),
    }),
});

export const {
    useGetNewsQuery,
    useGetNewsBySlugQuery,
    useGetAdminNewsBySlugQuery,
    useGetAllNewsQuery,
    useGetNewsStatsQuery,
    useCreateNewsMutation,
    useUpdateNewsMutation,
    useDeleteNewsMutation,
    useToggleNewsStatusMutation,
} = newsApi;
