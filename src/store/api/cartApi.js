import { baseApi } from "./baseApi";
import { setCartFromServer } from "@/store/cartSlice";

export const cartApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getServerCart: builder.query({
            query: () => "/cart",
            providesTags: ["Cart"],
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setCartFromServer(data.data));
                } catch { /* noop */ }
            },
        }),

        syncCart: builder.mutation({
            query: (items) => ({
                url: "/cart/sync",
                method: "POST",
                body: { items },
            }),
            invalidatesTags: ["Cart"],
        }),

        addToCart: builder.mutation({
            query: (data) => ({
                url: "/cart",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Cart"],
        }),

        updateCartItem: builder.mutation({
            query: (data) => ({
                url: "/cart",
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Cart"],
        }),

        removeFromCart: builder.mutation({
            query: (data) => ({
                url: "/cart",
                method: "DELETE",
                body: data,
            }),
            invalidatesTags: ["Cart"],
        }),

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
