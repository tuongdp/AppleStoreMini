import { baseApi } from "./baseApi";

const normalizeSeriesResponse = (response) => response.data ?? response;

export const seriesApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getSeries: builder.query({
            query: (params) => ({ url: "/series", params }),
            providesTags: ["Series"],
            transformResponse: normalizeSeriesResponse,
        }),

        getAdminSeries: builder.query({
            query: (params) => ({ url: "/admin/series", params }),
            providesTags: ["Series"],
            transformResponse: normalizeSeriesResponse,
        }),
    }),
});

export const {
    useGetSeriesQuery,
    useGetAdminSeriesQuery,
} = seriesApi;
