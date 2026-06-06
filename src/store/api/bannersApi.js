import { baseApi } from "./baseApi";

export const bannersApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // GET /banners — public
        getBanners: builder.query({
            query: () => "/banners",
            providesTags: ["Banners"],
            transformResponse: (response) => response.data,
        }),

        // GET /admin/banners
        getAllBanners: builder.query({
            query: () => "/admin/banners",
            providesTags: ["Banners"],
            transformResponse: (response) => response.data,
        }),

        // POST /admin/banners — multipart/form-data
        createBanner: builder.mutation({
            query: (formData) => ({
                url: "/admin/banners",
                method: "POST",
                body: formData,
                formData: true,
            }),
            invalidatesTags: ["Banners"],
            transformResponse: (response) => response.data,
        }),

        // PUT /admin/banners/:id — multipart/form-data
        updateBanner: builder.mutation({
            query: ({ id, body, ...rest }) => {
                const payload = body || rest;
                return {
                    url: `/admin/banners/${id}`,
                    method: "PUT",
                    body: payload,
                    formData: payload instanceof FormData,
                };
            },
            invalidatesTags: ["Banners"],
            transformResponse: (response) => response.data,
        }),

        // DELETE /admin/banners/:id
        deleteBanner: builder.mutation({
            query: (id) => ({
                url: `/admin/banners/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Banners"],
        }),

        // PATCH /admin/banners/:id/toggle
        toggleBannerStatus: builder.mutation({
            query: (id) => ({
                url: `/admin/banners/${id}/toggle`,
                method: "PATCH",
            }),
            invalidatesTags: ["Banners"],
            transformResponse: (response) => response.data,
        }),

        // PATCH /admin/banners/orders
        updateBannerOrders: builder.mutation({
            query: (orders) => ({
                url: "/admin/banners/orders",
                method: "PATCH",
                body: { orders },
            }),
            invalidatesTags: ["Banners"],
        }),
    }),
});

export const {
    useGetBannersQuery,
    useGetAllBannersQuery,
    useCreateBannerMutation,
    useUpdateBannerMutation,
    useDeleteBannerMutation,
    useToggleBannerStatusMutation,
    useUpdateBannerOrdersMutation,
} = bannersApi;
