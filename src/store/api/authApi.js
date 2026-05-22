import { baseApi } from "./baseApi";
import { setCredentials } from "../authSlice";

const unwrapAuthPayload = (response) => response?.data ?? response;

export const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (credentials) => ({
                url: "/auth/login",
                method: "POST",
                body: credentials,
            }),
            transformResponse: unwrapAuthPayload,
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setCredentials(data));
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

        checkEmail: builder.query({
            query: (email) => ({
                url: "/auth/check-email",
                params: { email },
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
            transformResponse: unwrapAuthPayload,
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setCredentials({ user: data, rememberMe: arg?.rememberMe }));
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
            transformResponse: unwrapAuthPayload,
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    if (data) dispatch(setCredentials(data));
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
            transformResponse: unwrapAuthPayload,
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setCredentials(data));
                } catch { /* noop */ }
            },
        }),
    }),
});

export const {
    useLoginMutation,
    useRegisterMutation,
    useLazyCheckEmailQuery,
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
