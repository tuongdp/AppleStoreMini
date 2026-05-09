import { baseApi } from "./baseApi";
import { parseProduct } from "./helpers";

export const productsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // GET /products?page=&limit=&category=&sort=&search=&inStock=&featured=&onSale=&minPrice=&maxPrice=
        getProducts: builder.query({
            query: (params) => ({ url: "/products", params }),
            providesTags: ["Products"],
            transformResponse: (response) => ({
                products: response.data,
                pagination: response.pagination,
            }),
        }),

        // GET /products/slug/:slug
        getProductBySlug: builder.query({
            query: (slug) => `/products/slug/${slug}`,
            providesTags: (_, __, slug) => [{ type: "Product", id: slug }],
            transformResponse: (response) => parseProduct(response.data),
        }),

        // GET /products/:id — dùng cho AdminProductEdit
        getProductById: builder.query({
            query: (id) => `/products/${id}`,
            providesTags: (_, __, id) => [{ type: "Product", id }],
            transformResponse: (response) => parseProduct(response.data),
        }),

        // GET /products/featured?limit=8
        getFeaturedProducts: builder.query({
            query: (limit = 8) => ({
                url: "/products/featured",
                params: { limit },
            }),
            providesTags: ["Products"],
            transformResponse: (response) => response.data.map(parseProduct),
        }),

        // GET /products/new?limit=8
        getNewProducts: builder.query({
            query: (limit = 8) => ({ url: "/products/new", params: { limit } }),
            providesTags: ["Products"],
            transformResponse: (response) => response.data.map(parseProduct),
        }),

        // GET /products?category=:slug&limit=4
        getProductsByCategory: builder.query({
            query: ({ category, limit = 4 }) => ({
                url: "/products",
                params: { category, limit },
            }),
            providesTags: ["Products"],
            transformResponse: (response) => response.data ?? response,
        }),

        // GET /products/slug/:slug/related?limit=4
        getRelatedProducts: builder.query({
            query: ({ slug, limit = 4 }) => ({
                url: `/products/slug/${slug}/related`,
                params: { limit },
            }),
            transformResponse: (response) => response.data.map(parseProduct),
        }),

        // GET /products/search?q=:keyword
        searchProducts: builder.query({
            query: (keyword) => ({
                url: "/products/search",
                params: { q: keyword },
            }),
            transformResponse: (response) => response.data.map(parseProduct),
        }),

        // ── Admin ──────────────────────────────────────

        createProduct: builder.mutation({
            query: (data) => ({
                url: "/admin/products",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Products"],
            transformResponse: (response) => response.data,
        }),

        updateProduct: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/admin/products/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Products", "Product"],
            transformResponse: (response) => response.data,
        }),

        deleteProduct: builder.mutation({
            query: (id) => ({
                url: `/admin/products/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Products"],
        }),

        uploadProductImages: builder.mutation({
            query: ({ id, formData }) => ({
                url: `/admin/products/${id}/images`,
                method: "POST",
                body: formData,
                formData: true,
            }),
            invalidatesTags: (_, __, { id }) => [{ type: "Product", id }],
            transformResponse: (response) => response.data,
        }),

        // ── Admin Categories ───────────────────────────
        getAdminCategories: builder.query({
            query: () => "/admin/categories",
            providesTags: ["Categories"],
            transformResponse: (response) => response.data,
        }),

        // ── Admin Variants ─────────────────────────────
        createVariant: builder.mutation({
            query: ({ productId, ...data }) => ({
                url: `/admin/products/${productId}/variants`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Product"],
            transformResponse: (response) => response.data,
        }),

        updateVariant: builder.mutation({
            query: ({ variantId, ...data }) => ({
                url: `/admin/variants/${variantId}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Product"],
            transformResponse: (response) => response.data,
        }),

        deleteVariant: builder.mutation({
            query: (variantId) => ({
                url: `/admin/variants/${variantId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Product"],
        }),

        checkVariantOrders: builder.query({
            query: (variantId) => `/admin/variants/${variantId}/check-orders`,
            transformResponse: (response) => response.data,
        }),

        uploadEditorImage: builder.mutation({
            query: (formData) => ({
                url: "/admin/upload-image",
                method: "POST",
                body: formData,
                formData: true,
            }),
            transformResponse: (response) => response.data,
        }),

        // ── Options ────────────────────────────────────
        getOptions: builder.query({
            query: ({ productId, type }) => ({
                url: `/admin/products/${productId}/options`,
                params: type ? { type } : undefined,
            }),
            providesTags: (_, __, { productId }) => [{ type: "Options", id: productId }],
            transformResponse: (response) => response.data,
        }),

        createOption: builder.mutation({
            query: ({ productId, ...data }) => ({
                url: `/admin/products/${productId}/options`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: (_, __, { productId }) => [{ type: "Options", id: productId }],
            transformResponse: (response) => response.data,
        }),

        updateOption: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/admin/options/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Options"],
            transformResponse: (response) => response.data,
        }),

        deleteOption: builder.mutation({
            query: (id) => ({ url: `/admin/options/${id}`, method: "DELETE" }),
            invalidatesTags: ["Options"],
        }),
    }),
});

export const {
    useGetProductsQuery,
    useGetProductBySlugQuery,
    useGetProductByIdQuery,
    useGetFeaturedProductsQuery,
    useGetNewProductsQuery,
    useGetProductsByCategoryQuery,
    useGetRelatedProductsQuery,
    useSearchProductsQuery,
    useCreateProductMutation,
    useUpdateProductMutation,
    useDeleteProductMutation,
    useUploadProductImagesMutation,
    useGetAdminCategoriesQuery,
    useCreateVariantMutation,
    useUpdateVariantMutation,
    useDeleteVariantMutation,
    useCheckVariantOrdersQuery,
    useLazyCheckVariantOrdersQuery,
    useUploadEditorImageMutation,
    useGetOptionsQuery,
    useCreateOptionMutation,
    useUpdateOptionMutation,
    useDeleteOptionMutation,
} = productsApi;
