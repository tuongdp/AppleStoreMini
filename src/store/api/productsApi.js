import { baseApi } from "./baseApi";
import { parseProduct } from "./helpers";
export const productsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // GET /products?page=&limit=&category=&sort=&search=&inStock=&featured=&onSale=&minPrice=&maxPrice=
        // BE trả: { data: products[], pagination: {...} }
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
        // BE dùng query.category → where.categorySlug = query.category
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

        // POST /admin/products
        // BE nhận: { name, slug, description, price, salePrice?, category/categorySlug,
        //            images?, colors?, storage?, featured?, inStock?, stock?, ... }
        createProduct: builder.mutation({
            query: (data) => ({
                url: "/admin/products",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Products"],
            transformResponse: (response) => response.data,
        }),

        // PUT /admin/products/:id
        updateProduct: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/admin/products/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Products", "Product"],
            transformResponse: (response) => response.data,
        }),

        // DELETE /admin/products/:id
        deleteProduct: builder.mutation({
            query: (id) => ({
                url: `/admin/products/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Products"],
        }),

        // POST /admin/products/:id/images — multipart/form-data
        uploadProductImages: builder.mutation({
            query: ({ id, formData }) => ({
                url: `/admin/products/${id}/images`,
                method: "POST",
                body: formData,
                // Không set Content-Type — browser tự set boundary cho multipart
                formData: true,
            }),
            invalidatesTags: (_, __, { id }) => [{ type: "Product", id }],
            transformResponse: (response) => response.data,
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
} = productsApi;
