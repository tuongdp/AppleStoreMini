import { baseApi } from "./baseApi";

export const pointsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getMyPoints: builder.query({
            query: () => "/points",
            providesTags: ["Points"],
            transformResponse: (response) => response.data,
        }),

        getPointsHistory: builder.query({
            query: (params) => ({ url: "/points/history", params }),
            providesTags: ["Points"],
            transformResponse: (response) => ({
                transactions: response.data,
                pagination: response.pagination,
            }),
        }),

        getRedeemPackages: builder.query({
            query: () => "/coupons/redeemable",
            transformResponse: (response) => response.data,
        }),

        redeemPoints: builder.mutation({
            query: (data) => ({
                url: "/points/redeem",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Points"],
            transformResponse: (response) => response.data,
        }),
    }),
});

export const {
    useGetMyPointsQuery,
    useGetPointsHistoryQuery,
    useGetRedeemPackagesQuery,
    useRedeemPointsMutation,
} = pointsApi;
