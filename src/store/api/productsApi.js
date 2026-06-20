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
            refetchOnMountOrArgChange: 30,
        }),

        // GET /products/:id — dùng cho AdminProductEdit
        getProductById: builder.query({
            query: (id) => `/products/${id}`,
            providesTags: (_, __, id) => [{ type: "Product", id }],
            transformResponse: (response) => parseProduct(response.data),
        }),

        getAdminProducts: builder.query({
            query: (params) => ({ url: "/admin/products", params }),
            providesTags: ["Products"],
            transformResponse: (response) => ({
                products: response.data,
                pagination: response.pagination,
            }),
        }),

        getAdminProductById: builder.query({
            query: (id) => `/admin/products/${id}`,
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

        getNewReleaseProducts: builder.query({
            query: (limit = 8) => ({
                url: "/products/new-releases",
                params: { limit },
            }),
            providesTags: ["Products"],
            transformResponse: (response) => response.data.map(parseProduct),
        }),

        getRestockedProducts: builder.query({
            query: (limit = 8) => ({
                url: "/products/restocked",
                params: { limit },
            }),
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

        incrementVariantView: builder.mutation({
            query: (variantId) => ({
                url: `/products/variants/${variantId}/view`,
                method: "POST",
            }),
        }),
    }),
});

export const {
    useGetProductsQuery,
    useGetProductBySlugQuery,
    useGetProductByIdQuery,
    useGetAdminProductsQuery,
    useGetAdminProductByIdQuery,
    useGetFeaturedProductsQuery,
    useGetNewProductsQuery,
    useGetNewReleaseProductsQuery,
    useGetRestockedProductsQuery,
    useGetProductsByCategoryQuery,
    useGetRelatedProductsQuery,
    useSearchProductsQuery,
    useCreateProductMutation,
    useUpdateProductMutation,
    useDeleteProductMutation,
    useUploadProductImagesMutation,
    useCreateVariantMutation,
    useUpdateVariantMutation,
    useDeleteVariantMutation,
    useCheckVariantOrdersQuery,
    useLazyCheckVariantOrdersQuery,
    useUploadEditorImageMutation,
    useIncrementVariantViewMutation,
} = productsApi;
