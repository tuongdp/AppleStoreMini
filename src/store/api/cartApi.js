import { baseApi } from "./baseApi";
import { setCartFromServer } from "@/store/cartSlice";

export const cartApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // GET /cart → BE trả { items: [...] }
        getServerCart: builder.query({
            query: () => "/cart",
            providesTags: ["Cart"],
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    // Sync server cart → Redux local state
                    dispatch(setCartFromServer(data.data));
                } catch { /* noop */ }
            },
        }),

        // POST /cart/sync — BE nhận { items: [{ productId, quantity, selectedColor, selectedStorage }] }
        syncCart: builder.mutation({
            query: (items) => ({
                url: "/cart/sync",
                method: "POST",
                body: { items },
            }),
            invalidatesTags: ["Cart"],
        }),

        // POST /cart — BE nhận { productId, quantity, selectedColor, selectedStorage }
        addToCart: builder.mutation({
            query: (data) => ({
                url: "/cart",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Cart"],
        }),

        // PUT /cart — BE nhận { productId, quantity, selectedColor, selectedStorage }
        updateCartItem: builder.mutation({
            query: (data) => ({
                url: "/cart",
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Cart"],
        }),

        // DELETE /cart — BE nhận { productId, selectedColor, selectedStorage }
        // ⚠️ axios DELETE với body — cần đảm bảo BE đọc req.body (đã OK theo cart.controller)
        removeFromCart: builder.mutation({
            query: (data) => ({
                url: "/cart",
                method: "DELETE",
                body: data,
            }),
            invalidatesTags: ["Cart"],
        }),

        // DELETE /cart/clear
        clearServerCart: builder.mutation({
            query: () => ({
                url: "/cart/clear",
                method: "DELETE",
            }),
            invalidatesTags: ["Cart"],
        }),
    }),
});

export const {
    useGetServerCartQuery,
    useSyncCartMutation,
    useAddToCartMutation,
    useUpdateCartItemMutation,
    useRemoveFromCartMutation,
    useClearServerCartMutation,
} = cartApi;
