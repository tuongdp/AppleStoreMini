import { baseApi } from "./baseApi";

export const globalOptionsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getGlobalOptions: builder.query({
            query: (type) => ({
                url: "/admin/global-options",
                params: type ? { type } : undefined,
            }),
            providesTags: (result) =>
                result
                    ? [...result.map(({ id }) => ({ type: "GlobalOption", id })), "GlobalOptions"]
                    : ["GlobalOptions"],
            transformResponse: (response) => response.data,
        }),

        createGlobalOption: builder.mutation({
            query: (data) => ({
                url: "/admin/global-options",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["GlobalOptions"],
            transformResponse: (response) => response.data,
        }),

        updateGlobalOption: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/admin/global-options/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: (_, __, { id }) => [
                { type: "GlobalOption", id },
                "GlobalOptions",
            ],
            transformResponse: (response) => response.data,
        }),

        deleteGlobalOption: builder.mutation({
            query: (id) => ({
                url: `/admin/global-options/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["GlobalOptions"],
        }),
    }),
});

export const {
    useGetGlobalOptionsQuery,
    useCreateGlobalOptionMutation,
    useUpdateGlobalOptionMutation,
    useDeleteGlobalOptionMutation,
} = globalOptionsApi;
