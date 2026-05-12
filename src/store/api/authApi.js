import { baseApi } from "./baseApi";
import { setCredentials } from "../authSlice";

export const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (credentials) => ({
                url: "/auth/login",
                method: "POST",
                body: credentials,
            }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setCredentials(data.data));
                } catch { /* noop */ }
            },
        }),

        register: builder.mutation({
            query: (data) => ({
                url: "/auth/register",
                method: "POST",
                body: data,
            }),
        }),

        logout: builder.mutation({
            query: () => ({
                url: "/auth/logout",
                method: "POST",
            }),
            // Không dispatch logout ở đây
            // useAuth sẽ xử lý toàn bộ
        }),

        getMe: builder.query({
            query: () => "/auth/me",
            providesTags: ["Profile"],
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setCredentials({ user: data.data }));
                } catch { /* noop */ }
            },
        }),

        forgotPassword: builder.mutation({
            query: (data) => ({
                url: "/auth/forgot-password",
                method: "POST",
                body: data,
            }),
        }),

        resetPassword: builder.mutation({
            query: (data) => ({
                url: "/auth/reset-password",
                method: "POST",
                body: data,
            }),
        }),

        changePassword: builder.mutation({
            query: (data) => ({
                url: "/auth/change-password",
                method: "POST",
                body: data,
            }),
        }),

        sendChangePasswordCode: builder.mutation({
            query: () => ({
                url: "/auth/send-change-password-code",
                method: "POST",
            }),
        }),

        verifyEmail: builder.mutation({
            query: (data) => ({
                url: "/auth/verify-email",
                method: "POST",
                body: data,
            }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    if (data.data) dispatch(setCredentials(data.data));
                } catch { /* noop */ }
            },
        }),

        sendVerification: builder.mutation({
            query: (data) => ({
                url: "/auth/send-verification",
                method: "POST",
                body: data,
            }),
        }),

        googleLogin: builder.mutation({
            query: (body) => ({
                url: "/auth/google",
                method: "POST",
                body,
            }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setCredentials(data.data));
                } catch { /* noop */ }
            },
        }),
    }),
});

export const {
    useLoginMutation,
    useRegisterMutation,
    useLogoutMutation,
    useGetMeQuery,
    useForgotPasswordMutation,
    useResetPasswordMutation,
    useChangePasswordMutation,
    useSendChangePasswordCodeMutation,
    useVerifyEmailMutation,
    useSendVerificationMutation,
    useGoogleLoginMutation,
} = authApi;
