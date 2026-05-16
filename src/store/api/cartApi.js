import { baseApi } from "./baseApi";
import { clearCart, setCartFromServer } from "@/store/cartSlice";

const applyCartFromResponse = async (queryFulfilled, dispatch) => {
    const { data } = await queryFulfilled;
    dispatch(setCartFromServer(data.data));
};

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
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    await applyCartFromResponse(queryFulfilled, dispatch);
                } catch { /* noop */ }
            },
        }),

        addToCart: builder.mutation({
            query: (data) => ({
                url: "/cart",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Cart"],
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    await applyCartFromResponse(queryFulfilled, dispatch);
                } catch { /* noop */ }
            },
        }),

        updateCartItem: builder.mutation({
            query: (data) => ({
                url: "/cart",
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Cart"],
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    await applyCartFromResponse(queryFulfilled, dispatch);
                } catch { /* noop */ }
            },
        }),

        removeFromCart: builder.mutation({
            query: (data) => ({
                url: "/cart",
                method: "DELETE",
                body: data,
            }),
            invalidatesTags: ["Cart"],
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    await applyCartFromResponse(queryFulfilled, dispatch);
                } catch { /* noop */ }
            },
        }),

        clearServerCart: builder.mutation({
            query: () => ({
                url: "/cart/clear",
                method: "DELETE",
            }),
            invalidatesTags: ["Cart"],
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    dispatch(clearCart());
                } catch { /* noop */ }
            },
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
