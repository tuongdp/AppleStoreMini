import { baseApi } from "./baseApi";

export const couponsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // POST /coupons/apply — { code, orderTotal }
        // BE trả: { discountAmount, code, description }
        applyCoupon: builder.mutation({
            query: ({ code, orderTotal }) => ({
                url: "/coupons/apply",
                method: "POST",
                body: { code, orderTotal },
            }),
            transformResponse: (response) => response.data,
        }),

        // GET /admin/coupons?page=&limit=&search=&isActive=
        getAllCoupons: builder.query({
            query: (params) => ({ url: "/admin/coupons", params }),
            providesTags: ["Coupons"],
            transformResponse: (response) => ({
                coupons: response.data,
                pagination: response.pagination,
            }),
        }),

        // GET /admin/coupons/:id
        getCouponById: builder.query({
            query: (id) => `/admin/coupons/${id}`,
            providesTags: (_, __, id) => [{ type: "Coupon", id }],
            transformResponse: (response) => response.data,
        }),

        // POST /admin/coupons
        createCoupon: builder.mutation({
            query: (data) => ({
                url: "/admin/coupons",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Coupons"],
            transformResponse: (response) => response.data,
        }),

        // PUT /admin/coupons/:id
        updateCoupon: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/admin/coupons/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Coupons", "Coupon"],
            transformResponse: (response) => response.data,
        }),

        // DELETE /admin/coupons/:id
        deleteCoupon: builder.mutation({
            query: (id) => ({
                url: `/admin/coupons/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Coupons"],
        }),

        // PATCH /admin/coupons/:id/toggle
        toggleCouponStatus: builder.mutation({
            query: (id) => ({
                url: `/admin/coupons/${id}/toggle`,
                method: "PATCH",
            }),
            invalidatesTags: ["Coupons"],
            transformResponse: (response) => response.data,
        }),
    }),
});

export const {
    useApplyCouponMutation,
    useGetAllCouponsQuery,
    useGetCouponByIdQuery,
    useCreateCouponMutation,
    useUpdateCouponMutation,
    useDeleteCouponMutation,
    useToggleCouponStatusMutation,
} = couponsApi;
