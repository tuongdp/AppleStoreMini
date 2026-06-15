import { baseApi } from "./baseApi";

export const addressApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getWardsByProvince: builder.query({
            query: (provinceCode) => `/address/wards?provinceCode=${provinceCode}`,
            transformResponse: (response) => response.data,
        }),
    }),
});

export const { useGetWardsByProvinceQuery } = addressApi;
