import { baseApi } from "./baseApi";

const LEGACY_OPTION_TYPES = {
    colors: "COLOR",
    storages: "STORAGE",
    rams: "RAM",
    editions: "EDITION",
    refreshRates: "REFRESH_RATE",
    ssds: "SSD",
};

const normalizeOption = (option, fallbackType) => {
    if (typeof option === "string") {
        return {
            id: `${fallbackType}-${option}`,
            type: fallbackType,
            value: option,
            isActive: true,
        };
    }

    return {
        id: option?._id || option?.id || `${option?.type || fallbackType}-${option?.value}`,
        type: option?.type || fallbackType,
        value: option?.value || option?.label || "",
        hex: option?.hex || option?.color || null,
        isActive: option?.isActive !== false,
        ...option,
    };
};

const normalizeOptions = (response) => {
    const data = response?.data || [];
    if (Array.isArray(data)) return data.map((option) => normalizeOption(option));

    return Object.entries(LEGACY_OPTION_TYPES).flatMap(([key, type]) =>
        (data[key] || []).map((option) => normalizeOption(option, type)),
    );
};

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
            transformResponse: (response, _, type) => {
                const options = normalizeOptions(response);
                return type ? options.filter((option) => option.type === type) : options;
            },
        }),

        createGlobalOption: builder.mutation({
            query: (data) => ({
                url: "/admin/global-options",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["GlobalOptions"],
            transformResponse: (response) => normalizeOption(response?.data),
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
            transformResponse: (response) => normalizeOption(response?.data),
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
