# Design: Admin User Module Improvements

**Date:** 2026-06-03
**Scope:** Backend (schema, auth, user service, routes) + Frontend (table, detail)

## Problem

Admin User module lacks:
1. **Last login tracking** — no way to know when a user last logged in
2. **Reset password** — admin can't reset user passwords
3. **Total spent in list** — can't evaluate customer value at a glance

## Solution

Three additions:
1. `lastLoginAt` field on User, updated on login, displayed in list + detail
2. Admin reset password endpoint + UI button
3. Total spent column in user list table

---

## Backend Changes

### Schema

Add to `User` model:
```prisma
lastLoginAt DateTime?
```

Run `npx prisma db push`.

### Auth Service

In `auth.service.js` login function, after finding the user and before generating tokens, update `lastLoginAt`:

```js
await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
});
```

### Reset Password — Service

New function in `user.service.js`:

```js
const resetUserPassword = async (userId) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ApiError(404, "Không tìm thấy người dùng");

    const newPassword = generateSecurePassword(8); // e.g. "aB3xK9mQ"
    const hashed = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
        where: { id: userId },
        data: { password: hashed },
    });

    return { newPassword };
};
```

### Reset Password — Controller

New function in `admin/user.controller.js`:

```js
const resetPassword = catchAsync(async (req, res) => {
    const { newPassword } = await userService.resetUserPassword(req.params.id);
    res.json(new ApiResponse(200, { newPassword }, "Đặt lại mật khẩu thành công"));
});
```

### Route

In `admin/user.routes.js`, add:

```js
router.post("/:id/reset-password", permission("users"), resetPassword);
```

### Call site detail

- `auth.service.js`: update login function line ~125-128
- `user.service.js`: add `resetUserPassword` function + export
- `admin/user.controller.js`: add `resetPassword` + export

---

## Frontend Changes

### Files

| File | Action |
|------|--------|
| `src/store/api/usersApi.js` | Add `resetUserPassword` mutation |
| `src/features/admin/components/users/AdminUserTable.jsx` | +2 columns |
| `src/features/admin/components/users/AdminUserDetail.jsx` | +lastLogin row + reset button |

### API: resetUserPassword mutation

```js
resetUserPassword: builder.mutation({
    query: (id) => ({
        url: `/admin/users/${id}/reset-password`,
        method: "POST",
    }),
    transformResponse: (response) => response.data,
}),
```

### AdminUserTable: new columns

After "Số đơn hàng" column, add:

```jsx
{
    key: "totalSpent",
    label: "Tổng chi tiêu",
    render: (_, user) => user.totalSpent ? formatPrice(user.totalSpent) : "0đ",
},
{
    key: "lastActive",
    label: "Lần hoạt động",
    render: (_, user) => timeAgo(user.lastLoginAt) || "—",
},
```

### AdminUserDetail: lastLogin display

In the user info card, after "Ngày tham gia" row, add:

```jsx
<div className="flex justify-between">
    <span className="text-muted-foreground">Lần đăng nhập cuối</span>
    <span>{user.lastLoginAt ? timeAgo(user.lastLoginAt) : "Chưa đăng nhập"}</span>
</div>
```

### AdminUserDetail: reset password button

Add button in the user actions section. On click → confirm dialog → mutation call → toast with new password.

```jsx
const [resetPassword, { isLoading: isResetting }] = useResetUserPasswordMutation();

const handleResetPassword = async () => {
    try {
        const result = await resetPassword(user.id).unwrap();
        toast.success(`Mật khẩu mới: ${result.newPassword}`);
    } catch {
        toast.error("Đặt lại mật khẩu thất bại");
    }
};
```

## Verification

1. `npm run lint` + `npm run build` in frontend
2. `npm run lint` + `npx prisma db push` in API
3. Manual: login → check `lastLoginAt` saved in DB
4. Manual: open user list → see "Lần hoạt động" and "Tổng chi tiêu" columns
5. Manual: open user detail → see "Lần đăng nhập cuối" + reset password button
