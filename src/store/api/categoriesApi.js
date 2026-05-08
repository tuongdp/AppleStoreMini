import { baseApi } from "./baseApi";

export const categoriesApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // GET /categories — public (active only)
        getCategories: builder.query({
            query: () => "/categories",
            providesTags: ["Categories"],
            transformResponse: (response) => response.data,
        }),

        // GET /admin/categories — all (with productCount)
        getAdminCategories: builder.query({
            query: () => "/admin/categories",
            providesTags: ["Categories"],
            transformResponse: (response) => response.data,
        }),

        // POST /admin/categories
        createCategory: builder.mutation({
            query: (data) => {
                const hasFile = data.image instanceof File;
                const body = hasFile ? new FormData() : data;
                if (hasFile) {
                    Object.entries(data).forEach(([k, v]) => {
                        if (v !== undefined && v !== null) body.append(k, v);
                    });
                }
                return { url: "/admin/categories", method: "POST", body };
            },
            invalidatesTags: ["Categories"],
            transformResponse: (response) => response.data,
        }),

        // PUT /admin/categories/:id
        updateCategory: builder.mutation({
            query: ({ id, ...data }) => {
                const hasFile = data.image instanceof File;
                const body = hasFile ? new FormData() : data;
                if (hasFile) {
                    Object.entries(data).forEach(([k, v]) => {
                        if (v !== undefined && v !== null) body.append(k, v);
                    });
                }
                return { url: `/admin/categories/${id}`, method: "PUT", body };
            },
            invalidatesTags: ["Categories"],
            transformResponse: (response) => response.data,
        }),

        // DELETE /admin/categories/:id
        deleteCategory: builder.mutation({
            query: (id) => ({
                url: `/admin/categories/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Categories"],
        }),

        // PATCH /admin/categories/:id/toggle
        toggleCategoryStatus: builder.mutation({
            query: (id) => ({
                url: `/admin/categories/${id}/toggle`,
                method: "PATCH",
            }),
            invalidatesTags: ["Categories"],
            transformResponse: (response) => response.data,
        }),
    }),
});

export const {
    useGetCategoriesQuery,
    useGetAdminCategoriesQuery,
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation,
    useToggleCategoryStatusMutation,
} = categoriesApi;
