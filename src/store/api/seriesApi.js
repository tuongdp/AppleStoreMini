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

        createSeries: builder.mutation({
            query: (body) => ({ url: "/admin/series", method: "POST", body }),
            invalidatesTags: ["Series"],
            transformResponse: normalizeSeriesResponse,
        }),

        updateSeries: builder.mutation({
            query: ({ id, ...body }) => ({ url: `/admin/series/${id}`, method: "PUT", body }),
            invalidatesTags: ["Series"],
            transformResponse: normalizeSeriesResponse,
        }),

        deleteSeries: builder.mutation({
            query: (id) => ({ url: `/admin/series/${id}`, method: "DELETE" }),
            invalidatesTags: ["Series"],
        }),
    }),
});

export const {
    useGetSeriesQuery,
    useGetAdminSeriesQuery,
    useCreateSeriesMutation,
    useUpdateSeriesMutation,
    useDeleteSeriesMutation,
} = seriesApi;
