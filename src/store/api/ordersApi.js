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

        // POST /orders
        // BE nhận: { items, addressId?, address?, paymentMethod, note?, couponCode? }
        // items: [{ productId, quantity, selectedColor?, selectedStorage? }]
        // paymentMethod: BE sẽ .toUpperCase() → "COD" | "BANK_TRANSFER" | "MOMO"
        createOrder: builder.mutation({
            query: (data) => ({
                url: "/orders",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Orders", "Cart"],
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
        // BE trả: { chart, totalRevenue, totalOrders, revenueChange }
        getRevenueStats: builder.query({
            query: (params) => ({
                url: "/admin/dashboard/revenue",
                params,
            }),
            transformResponse: (response) => response.data,
        }),
    }),
});

export const {
    useGetOrdersQuery,
    useGetOrderByIdQuery,
    useCreateOrderMutation,
    useCreatePaymentMutation,
    useCancelOrderMutation,
    useConfirmDeliveredMutation,
    useGetAllOrdersQuery,
    useGetAdminOrderByIdQuery,
    useUpdateOrderStatusMutation,
    useGetRevenueStatsQuery,
} = ordersApi;
