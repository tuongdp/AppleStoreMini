import { baseApi } from "./baseApi";

export const ordersApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // GET /orders?page=&limit=&status=
        // BE trả: { data: orders[], pagination: {...} }
        // order.controller: res.json(new ApiResponse(200, result.data, "...", result.pagination))
        getOrders: builder.query({
            query: (params) => ({ url: "/orders", params }),
            providesTags: ["Orders"],
            // Transform để FE dùng data.data (orders[]) và data.pagination
            transformResponse: (response) => ({
                orders: response.data,
                pagination: response.pagination,
            }),
        }),

        // GET /orders/:id
        getOrderById: builder.query({
            query: (id) => `/orders/${id}`,
            providesTags: (_, __, id) => [{ type: "Order", id }],
            transformResponse: (response) => response.data,
        }),

        // GET /orders/lookup?code= (public, no auth)
        lookupOrder: builder.query({
            query: ({ code }) => ({
                url: "/orders/lookup",
                params: { code },
            }),
            transformResponse: (response) => response.data,
        }),

        // POST /orders
        // BE nhận: { items, addressId?, address?, paymentMethod, note?, couponCode? }
        // items: [{ productId, quantity, selectedColor?, selectedStorage? }]
        // paymentMethod: BE sẽ .toUpperCase() -> "COD" | "VNPAY"
        createOrder: builder.mutation({
            query: (data) => ({
                url: "/orders",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Orders", "Cart", "Points"],
            transformResponse: (response) => response.data,
        }),

        // POST /orders/:id/cancel — BE nhận { reason }
        cancelOrder: builder.mutation({
            query: ({ id, reason }) => ({
                url: `/orders/${id}/cancel`,
                method: "POST",
                body: { reason },
            }),
            invalidatesTags: ["Orders", "Order"],
        }),

        // POST /admin/orders/:id/cancel — admin huỷ + gửi email cho user
        cancelOrderByAdmin: builder.mutation({
            query: ({ id, reason }) => ({
                url: `/admin/orders/${id}/cancel`,
                method: "POST",
                body: { reason },
            }),
            invalidatesTags: ["Orders", "Order"],
        }),

        // ── Return / Refund ───────────────────────────────────
        createReturnRequest: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/orders/${id}/return`,
                method: "POST",
                body,
            }),
            invalidatesTags: (result, error, { id }) => [
                "Orders",
                { type: "Order", id },
                "Returns",
            ],
        }),
        getOrderReturnRequest: builder.query({
            query: (id) => `/orders/${id}/return`,
            providesTags: (result, error, id) => [{ type: "Returns", id: `order-${id}` }],
        }),
        getMyReturns: builder.query({
            query: (params = {}) => ({ url: "/returns", params }),
            providesTags: ["Returns"],
        }),
        getReturnById: builder.query({
            query: (returnId) => `/returns/${returnId}`,
            providesTags: (result, error, returnId) => [{ type: "Returns", id: returnId }],
        }),
        // Admin
        getAllReturns: builder.query({
            query: (params = {}) => ({ url: "/admin/returns", params }),
            providesTags: ["Returns"],
        }),
        getAdminReturnById: builder.query({
            query: (returnId) => `/admin/returns/${returnId}`,
            providesTags: (result, error, returnId) => [{ type: "Returns", id: returnId }],
        }),
        approveReturn: builder.mutation({
            query: (returnId) => ({
                url: `/admin/returns/${returnId}/approve`,
                method: "POST",
            }),
            invalidatesTags: (result, error, returnId) => [
                "Orders",
                { type: "Order" },
                "Returns",
                { type: "Returns", id: returnId },
            ],
        }),
        rejectReturn: builder.mutation({
            query: ({ returnId, adminNote }) => ({
                url: `/admin/returns/${returnId}/reject`,
                method: "POST",
                body: { adminNote },
            }),
            invalidatesTags: (result, error, { returnId }) => [
                "Orders",
                { type: "Order" },
                "Returns",
                { type: "Returns", id: returnId },
            ],
        }),
        updateReturnTracking: builder.mutation({
            query: ({ returnId, trackingNumber }) => ({
                url: `/returns/${returnId}/tracking`,
                method: "POST",
                body: { trackingNumber },
            }),
            invalidatesTags: (result, error, { returnId }) => [
                "Returns",
                { type: "Returns", id: returnId },
                { type: "Returns" },
            ],
        }),
        receiveReturn: builder.mutation({
            query: ({ returnId, condition }) => ({
                url: `/admin/returns/${returnId}/receive`,
                method: "POST",
                body: { condition },
            }),
            invalidatesTags: (result, error, { returnId }) => [
                "Returns",
                { type: "Returns", id: returnId },
            ],
        }),
        refundReturn: builder.mutation({
            query: (returnId) => ({
                url: `/admin/returns/${returnId}/refund`,
                method: "POST",
            }),
            invalidatesTags: (result, error, returnId) => [
                "Orders",
                { type: "Order" },
                "Returns",
                { type: "Returns", id: returnId },
            ],
        }),
        getReturnWindowDays: builder.query({
            query: () => "/settings/return-window",
            transformResponse: (response) => response.data,
        }),

        // POST /orders/:id/confirm-delivered
        // Chỉ dùng được khi status === "SHIPPING"
        createPayment: builder.mutation({
            query: (id) => ({
                url: `/orders/${id}/payment`,
                method: "POST",
            }),
            invalidatesTags: ["Orders", "Order"],
            transformResponse: (response) => response.data,
        }),

        confirmDelivered: builder.mutation({
            query: (id) => ({
                url: `/orders/${id}/confirm-delivered`,
                method: "POST",
            }),
            invalidatesTags: ["Orders", "Order"],
        }),

        // ── Admin ──────────────────────────────────────

        // GET /admin/orders?page=&limit=&status=&search=
        getAllOrders: builder.query({
            query: (params) => ({ url: "/admin/orders", params }),
            providesTags: ["Orders"],
            transformResponse: (response) => ({
                orders: response.data,
                pagination: response.pagination,
            }),
        }),

        // GET /admin/orders/:id
        getAdminOrderById: builder.query({
            query: (id) => `/admin/orders/${id}`,
            providesTags: (_, __, id) => [{ type: "Order", id }],
            transformResponse: (response) => response.data,
        }),

        // PATCH /admin/orders/:id/status — BE nhận { status, note }
        // status sẽ được BE .toUpperCase() → "PENDING"|"CONFIRMED"|"SHIPPING"|"DELIVERED"|"CANCELLED"|"REFUNDED"
        updateOrderStatus: builder.mutation({
            query: ({ id, status, note }) => ({
                url: `/admin/orders/${id}/status`,
                method: "PATCH",
                body: { status, note },
            }),
            invalidatesTags: ["Orders", "Order"],
        }),

        // GET /admin/dashboard/revenue?period=week|month|year
        getRevenueStats: builder.query({
            query: (params) => ({ url: "/admin/dashboard/revenue", params }),
            transformResponse: (response) => response.data,
        }),

        // GET /admin/dashboard/stats (consolidated stats)
        getDashboardStats: builder.query({
            query: () => "/admin/dashboard/stats",
            transformResponse: (response) => response.data,
        }),

        getDashboardOperations: builder.query({
            query: () => "/admin/dashboard/operations",
            transformResponse: (response) => response.data,
        }),

        // GET /admin/dashboard/low-stock
        getLowStock: builder.query({
            query: () => "/admin/dashboard/low-stock",
            transformResponse: (response) => response.data,
        }),

        // GET /admin/dashboard/category-revenue
        getCategoryRevenue: builder.query({
            query: () => "/admin/dashboard/category-revenue",
            transformResponse: (response) => response.data,
        }),

        // GET /admin/dashboard/points
        getPointsStats: builder.query({
            query: () => "/admin/dashboard/points",
            transformResponse: (response) => response.data,
        }),

        // GET /admin/dashboard/review-reward
        getReviewRewardSetting: builder.query({
            query: () => "/admin/dashboard/review-reward",
            providesTags: ["Points"],
            transformResponse: (response) => response.data,
        }),

        // PATCH /admin/dashboard/review-reward
        updateReviewRewardSetting: builder.mutation({
            query: (body) => ({
                url: "/admin/dashboard/review-reward",
                method: "PATCH",
                body,
            }),
            invalidatesTags: ["Points"],
            transformResponse: (response) => response.data,
        }),

        // GET /admin/dashboard/coupon-stats
        getCouponStats: builder.query({
            query: () => "/admin/dashboard/coupon-stats",
            transformResponse: (response) => response.data,
        }),

        // GET /admin/dashboard/order-stats?period=month|year
        getOrderStats: builder.query({
            query: (params) => ({ url: "/admin/dashboard/order-stats", params }),
            transformResponse: (response) => response.data,
        }),

        // GET /admin/dashboard/top-products?period=week|month|year&limit=5
        getTopProducts: builder.query({
            query: (params) => ({ url: "/admin/dashboard/top-products", params }),
            transformResponse: (response) => response.data,
        }),

        // GET /admin/dashboard/slow-products?days=30&limit=5
        getSlowProducts: builder.query({
            query: (params) => ({ url: "/admin/dashboard/slow-products", params }),
            transformResponse: (response) => response.data,
        }),

        // GET /admin/dashboard/order-status-distribution
        getOrderStatusDistribution: builder.query({
            query: () => "/admin/dashboard/order-status-distribution",
            transformResponse: (response) => response.data,
        }),

        // GET /admin/dashboard/top-customers?limit=5
        getTopCustomers: builder.query({
            query: (params) => ({ url: "/admin/dashboard/top-customers", params }),
            transformResponse: (response) => response.data,
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
    useGetLowStockQuery,
    useGetCategoryRevenueQuery,
    useGetPointsStatsQuery,
    useGetReviewRewardSettingQuery,
    useUpdateReviewRewardSettingMutation,
    useGetCouponStatsQuery,
    useGetDashboardStatsQuery,
    useGetDashboardOperationsQuery,
    useGetOrderStatsQuery,
    useGetTopProductsQuery,
    useGetSlowProductsQuery,
    useGetOrderStatusDistributionQuery,
    useGetTopCustomersQuery,
    useCreateReturnRequestMutation,
    useGetOrderReturnRequestQuery,
    useGetMyReturnsQuery,
    useGetReturnByIdQuery,
    useGetAllReturnsQuery,
    useGetAdminReturnByIdQuery,
    useApproveReturnMutation,
    useRejectReturnMutation,
    useUpdateReturnTrackingMutation,
    useReceiveReturnMutation,
    useRefundReturnMutation,
    useGetReturnWindowDaysQuery,
} = ordersApi;
