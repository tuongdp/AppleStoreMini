import { baseApi } from "./baseApi";

export const ordersApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getOrders: builder.query({
            query: (params) => ({ url: "/orders", params }),
            providesTags: ["Orders"],
            transformResponse: (response) => ({
                orders: response.data,
                pagination: response.pagination,
            }),
        }),

        getOrderById: builder.query({
            query: (id) => `/orders/${id}`,
            providesTags: (_, __, id) => [{ type: "Order", id }],
            transformResponse: (response) => response.data,
        }),

        lookupOrder: builder.query({
            query: ({ code, phone }) => ({
                url: "/orders/lookup",
                params: { code, phone },
            }),
            transformResponse: (response) => response.data,
        }),

        createOrder: builder.mutation({
            query: (data) => ({
                url: "/orders",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Orders", "Cart"],
            transformResponse: (response) => response.data,
        }),

        cancelOrder: builder.mutation({
            query: ({ id, reason }) => ({
                url: `/orders/${id}/cancel`,
                method: "POST",
                body: { reason },
            }),
            invalidatesTags: ["Orders", "Order", "Products"],
        }),

        cancelOrderByAdmin: builder.mutation({
            query: ({ id, reason }) => ({
                url: `/admin/orders/${id}/cancel`,
                method: "POST",
                body: { reason },
            }),
            invalidatesTags: ["Orders", "Order", "Products"],
        }),

        updateOrderShipping: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/orders/${id}`,
                method: "PATCH",
                body,
            }),
            invalidatesTags: ["Orders", "Order"],
            transformResponse: (response) => response.data,
        }),

        createPayment: builder.mutation({
            query: (id) => ({
                url: `/orders/${id}/payment`,
                method: "POST",
            }),
            invalidatesTags: ["Orders", "Order", "Products"],
            transformResponse: (response) => response.data,
        }),

        confirmDelivered: builder.mutation({
            query: (id) => ({
                url: `/orders/${id}/confirm-delivered`,
                method: "POST",
            }),
            invalidatesTags: ["Orders", "Order", "Products"],
        }),

        // ── Admin ──────────────────────────────────────

        getAllOrders: builder.query({
            query: (params) => ({ url: "/admin/orders", params }),
            providesTags: ["Orders"],
            transformResponse: (response) => ({
                orders: response.data,
                pagination: response.pagination,
            }),
        }),

        getAdminOrderById: builder.query({
            query: (id) => `/admin/orders/${id}`,
            providesTags: (_, __, id) => [{ type: "Order", id }],
            transformResponse: (response) => response.data,
        }),

        updateOrderStatus: builder.mutation({
            query: ({ id, status, note }) => ({
                url: `/admin/orders/${id}/status`,
                method: "PATCH",
                body: { status, note },
            }),
            invalidatesTags: ["Orders", "Order", "Products"],
        }),

        getRevenueStats: builder.query({
            query: (params) => ({ url: "/admin/dashboard/revenue", params }),
            transformResponse: (response) => response.data,
        }),

        getDashboardStats: builder.query({
            query: () => "/admin/dashboard/stats",
            transformResponse: (response) => response.data,
        }),

        getDashboardOperations: builder.query({
            query: () => "/admin/dashboard/operations",
            transformResponse: (response) => response.data,
        }),

        getLowStock: builder.query({
            query: () => "/admin/dashboard/low-stock",
            transformResponse: (response) => response.data,
        }),

        getCategoryRevenue: builder.query({
            query: (params) => ({ url: "/admin/dashboard/category-revenue", params }),
            transformResponse: (response) => response.data,
        }),

        getOrderStats: builder.query({
            query: (params) => ({ url: "/admin/dashboard/order-stats", params }),
            transformResponse: (response) => response.data,
        }),

        getTopProducts: builder.query({
            query: (params) => ({ url: "/admin/dashboard/top-products", params }),
            transformResponse: (response) => response.data,
        }),

        getSlowProducts: builder.query({
            query: (params) => ({ url: "/admin/dashboard/slow-products", params }),
            transformResponse: (response) => response.data,
        }),

        getOrderStatusDistribution: builder.query({
            query: () => "/admin/dashboard/order-status-distribution",
            transformResponse: (response) => response.data,
        }),

        getTopCustomers: builder.query({
            query: (params) => ({ url: "/admin/dashboard/top-customers", params }),
            transformResponse: (response) => response.data,
        }),

        getReviewItems: builder.query({
            query: (params) => ({ url: "/orders/review-items", params }),
            providesTags: ["Orders"],
            transformResponse: (response) => ({
                items: response.data,
                pagination: response.pagination,
            }),
        }),
    }),
});

export const {
    useGetOrdersQuery,
    useGetOrderByIdQuery,
    useLazyLookupOrderQuery,
    useLookupOrderQuery,
    useCreateOrderMutation,
    useCreatePaymentMutation,
    useCancelOrderMutation,
    useCancelOrderByAdminMutation,
    useConfirmDeliveredMutation,
    useGetAllOrdersQuery,
    useGetAdminOrderByIdQuery,
    useUpdateOrderStatusMutation,
    useGetRevenueStatsQuery,
    useGetDashboardStatsQuery,
    useGetLowStockQuery,
    useGetCategoryRevenueQuery,
    useGetDashboardOperationsQuery,
    useGetOrderStatsQuery,
    useGetTopProductsQuery,
    useGetSlowProductsQuery,
    useGetOrderStatusDistributionQuery,
    useGetTopCustomersQuery,
    useUpdateOrderShippingMutation,
    useGetReviewItemsQuery,
} = ordersApi;
