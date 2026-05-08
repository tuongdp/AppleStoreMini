import { baseApi } from "./baseApi";

export const flashSalesApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getActiveFlashSale: builder.query({
            query: () => "/flash-sales/active",
            providesTags: ["FlashSales"],
            transformResponse: (response) => response.data,
        }),

        getAllFlashSales: builder.query({
            query: () => "/admin/flash-sales",
            providesTags: ["FlashSales"],
            transformResponse: (response) => response.data,
        }),

        getFlashSaleById: builder.query({
            query: (id) => `/admin/flash-sales/${id}`,
            providesTags: (_, __, id) => [{ type: "FlashSales", id }],
            transformResponse: (response) => response.data,
        }),

        createFlashSale: builder.mutation({
            query: (data) => ({
                url: "/admin/flash-sales",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["FlashSales"],
            transformResponse: (response) => response.data,
        }),

        updateFlashSale: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/admin/flash-sales/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["FlashSales"],
            transformResponse: (response) => response.data,
        }),

        deleteFlashSale: builder.mutation({
            query: (id) => ({
                url: `/admin/flash-sales/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["FlashSales"],
        }),

        toggleFlashSaleStatus: builder.mutation({
            query: (id) => ({
                url: `/admin/flash-sales/${id}/toggle`,
                method: "PATCH",
            }),
            invalidatesTags: ["FlashSales"],
            transformResponse: (response) => response.data,
        }),

        addFlashSaleItem: builder.mutation({
            query: ({ flashSaleId, ...data }) => ({
                url: `/admin/flash-sales/${flashSaleId}/items`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["FlashSales"],
            transformResponse: (response) => response.data,
        }),

        updateFlashSaleItem: builder.mutation({
            query: ({ itemId, ...data }) => ({
                url: `/admin/flash-sales/items/${itemId}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["FlashSales"],
            transformResponse: (response) => response.data,
        }),

        removeFlashSaleItem: builder.mutation({
            query: (itemId) => ({
                url: `/admin/flash-sales/items/${itemId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["FlashSales"],
        }),
    }),
});

export const {
    useGetActiveFlashSaleQuery,
    useGetAllFlashSalesQuery,
    useGetFlashSaleByIdQuery,
    useCreateFlashSaleMutation,
    useUpdateFlashSaleMutation,
    useDeleteFlashSaleMutation,
    useToggleFlashSaleStatusMutation,
    useAddFlashSaleItemMutation,
    useUpdateFlashSaleItemMutation,
    useRemoveFlashSaleItemMutation,
} = flashSalesApi;
