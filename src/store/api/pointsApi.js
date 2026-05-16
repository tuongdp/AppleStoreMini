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

    }),
});

export const {
    useGetMyPointsQuery,
    useGetPointsHistoryQuery,
} = pointsApi;
