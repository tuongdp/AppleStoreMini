import { baseApi } from "./baseApi";
import { updateUser } from "../authSlice";

export const usersApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // GET /users/profile
        getProfile: builder.query({
            query: () => "/users/profile",
            providesTags: ["Profile"],
            transformResponse: (response) => response.data,
        }),

        // PUT /users/profile
        updateProfile: builder.mutation({
            query: (data) => ({
                url: "/users/profile",
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Profile"],
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    // data đã qua transformResponse → là user object trực tiếp
                    dispatch(updateUser(data));
                } catch { /* noop */ }
            },
            transformResponse: (response) => response.data,
        }),

        // POST /users/avatar — multipart/form-data
        uploadAvatar: builder.mutation({
            query: (formData) => ({
                url: "/users/avatar",
                method: "POST",
                body: formData,
                formData: true,
            }),
            invalidatesTags: ["Profile"],
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    // data đã qua transformResponse → { avatar } object
                    dispatch(updateUser({ avatar: data.avatar }));
                } catch { /* noop */ }
            },
            transformResponse: (response) => response.data,
        }),

        // ── Admin ──────────────────────────────────────

        // GET /admin/users?page=&limit=&search=&role=
        // BE trả: { data: users[], pagination }
        getAllUsers: builder.query({
            query: (params) => ({ url: "/admin/users", params }),
            providesTags: ["Users"],
            transformResponse: (response) => ({
                users: response.data,
                pagination: response.pagination,
            }),
        }),

        // GET /admin/users/:id
        getUserById: builder.query({
            query: (id) => `/admin/users/${id}`,
            providesTags: (_, __, id) => [{ type: "User", id }],
            transformResponse: (response) => response.data,
        }),

        // PATCH /admin/users/:id/role — BE nhận { role } uppercase
        updateUserRole: builder.mutation({
            query: ({ id, role }) => ({
                url: `/admin/users/${id}/role`,
                method: "PATCH",
                // ✅ BE enum uppercase — đảm bảo gửi đúng
                body: { role: role.toUpperCase() },
            }),
            invalidatesTags: ["Users"],
            transformResponse: (response) => response.data,
        }),

        // PATCH /admin/users/:id/toggle
        toggleUserStatus: builder.mutation({
            query: (id) => ({
                url: `/admin/users/${id}/toggle`,
                method: "PATCH",
            }),
            invalidatesTags: ["Users"],
            transformResponse: (response) => response.data,
        }),

        // DELETE /admin/users/:id
        deleteUser: builder.mutation({
            query: (id) => ({
                url: `/admin/users/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Users"],
        }),
    }),
});

export const {
    useGetProfileQuery,
    useUpdateProfileMutation,
    useUploadAvatarMutation,
    useGetAllUsersQuery,
    useGetUserByIdQuery,
    useUpdateUserRoleMutation,
    useToggleUserStatusMutation,
    useDeleteUserMutation,
} = usersApi;
