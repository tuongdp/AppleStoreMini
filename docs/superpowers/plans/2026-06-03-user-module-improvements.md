# User Module Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add last login tracking, admin password reset, and total spent column to admin user module.

**Architecture:** Backend: `lastLoginAt` field on User, set on login; new `resetUserPassword` endpoint. Frontend: 2 new columns in user table, lastLogin display + reset button in user detail.

**Tech Stack:** Prisma, Node.js/Express, React, lucide-react, tailwind

---

### Task 1: Prisma — add lastLoginAt to User

**Files:**
- Modify: `D:\AppleStoreMini_Api\prisma\schema.prisma`

- [ ] **Step 1: Add lastLoginAt field**

After `updatedAt` on the User model (after line 38), add:

```prisma
  lastLoginAt DateTime?
```

- [ ] **Step 2: Sync DB**

```bash
npx prisma db push
```

- [ ] **Step 3: Lint + commit**

```bash
npm run lint
git add prisma/schema.prisma
git commit -m "feat: add lastLoginAt to User model"
```

---

### Task 2: Auth service — set lastLoginAt on login

**Files:**
- Modify: `D:\AppleStoreMini_Api\src\services\auth.service.js`

- [ ] **Step 1: Update login to set lastLoginAt (line 125-128)**

Change:
```js
    await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: hashedRefreshToken },
    });
```
To:
```js
    await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: hashedRefreshToken, lastLoginAt: new Date() },
    });
```

- [ ] **Step 2: Lint + commit**

```bash
npm run lint
git add src/services/auth.service.js
git commit -m "feat: set lastLoginAt on user login"
```

---

### Task 3: User service — resetUserPassword function

**Files:**
- Modify: `D:\AppleStoreMini_Api\src\services\user.service.js`

- [ ] **Step 1: Add bcrypt import if not already present**

Check top of file for `const bcrypt = require("bcryptjs");`. If not present, add after other requires.

- [ ] **Step 2: Add generateSecurePassword helper + resetUserPassword function**

Before the `module.exports` block (before line 295), add:

```js
const generateSecurePassword = (length = 8) => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

const resetUserPassword = async (userId) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ApiError(404, "Không tìm thấy người dùng");

    const newPassword = generateSecurePassword(8);
    const hashed = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
        where: { id: userId },
        data: { password: hashed },
    });

    return { newPassword };
};
```

- [ ] **Step 3: Export the new function**

In `module.exports` (line 295-307), add `resetUserPassword`:

```js
module.exports = {
    // ... existing exports ...
    resetUserPassword,
};
```

- [ ] **Step 4: Lint + commit**

```bash
npm run lint
git add src/services/user.service.js
git commit -m "feat: add resetUserPassword function"
```

---

### Task 4: Admin user controller — resetPassword endpoint

**Files:**
- Modify: `D:\AppleStoreMini_Api\src\controllers\admin\user.controller.js`

- [ ] **Step 1: Add resetPassword controller**

Before the `module.exports` block (before line 42), add:

```js
const resetPassword = catchAsync(async (req, res) => {
    const { newPassword } = await userService.resetUserPassword(req.params.id);
    res.json(new ApiResponse(200, { newPassword }, "Đặt lại mật khẩu thành công"));
});
```

- [ ] **Step 2: Export**

In `module.exports` (lines 42-50), add `resetPassword`:

```js
module.exports = {
    // ... existing exports ...
    resetPassword,
};
```

- [ ] **Step 3: Lint + commit**

```bash
npm run lint
git add src/controllers/admin/user.controller.js
git commit -m "feat: add resetPassword admin controller"
```

---

### Task 5: Route — POST /admin/users/:id/reset-password

**Files:**
- Modify: `D:\AppleStoreMini_Api\src\routes\admin\user.routes.js`

- [ ] **Step 1: Add route**

After line 11 (`router.delete(...)`), add:

```js
router.post("/users/:id/reset-password", hasPermission("users", "update"), adminUserCtrl.resetPassword);
```

- [ ] **Step 2: Lint + commit**

```bash
npm run lint
git add src/routes/admin/user.routes.js
git commit -m "feat: add reset-password admin route"
```

---

### Task 6: Frontend API — resetUserPassword mutation

**Files:**
- Modify: `D:\AppleStoreMini\src\store\api\usersApi.js`

- [ ] **Step 1: Add mutation**

After the `deleteUser` mutation, add:

```js
        resetUserPassword: builder.mutation({
            query: (id) => ({
                url: `/admin/users/${id}/reset-password`,
                method: "POST",
            }),
            transformResponse: (response) => response.data,
        }),
```

- [ ] **Step 2: Export hook**

In the export block at the bottom, add `useResetUserPasswordMutation`:

```js
    useResetUserPasswordMutation,
```

- [ ] **Step 3: Lint + commit**

```bash
npm run lint
git add src/store/api/usersApi.js
git commit -m "feat: add resetUserPassword API mutation"
```

---

### Task 7: AdminUserTable — new columns

**Files:**
- Modify: `D:\AppleStoreMini\src\features\admin\components\users\AdminUserTable.jsx`

- [ ] **Step 1: Add timeAgo import**

After line 3 (`import { useSelector } from "react-redux";`), the utils import needs `timeAgo`. Find the existing `formatPrice, formatDate` import and add `timeAgo`:

The file already imports from `@/lib/utils` at line ~30-37 area. Let me check. Actually, looking at the read output, the import list doesn't show `timeAgo` or `formatPrice`. Let me search...

Actually, `formatNumber`, `formatPhone`, `formatDate` are imported somewhere. Let me just add `timeAgo` and `formatPrice` to the imports. Looking at line 30-37 area, the imports include `formatNumber` from `@/lib/utils`. I need to add `formatPrice` and `timeAgo`.

Actually wait, the format utility functions might be imported directly in the file. Let me check the top imports of AdminUserTable.jsx.

From the read, the file imports:
```
import { formatNumber, formatPhone, formatDate } from "@/lib/utils";
```

I need to add `formatPrice` and `timeAgo` to this import.

- [ ] **Step 1: Update imports**

Find the `@/lib/utils` import and change it to include `formatPrice` and `timeAgo`:

Change:
```js
import { ..., formatNumber, formatDate, formatPhone } from "@/lib/utils";
```
To:
```js
import { ..., formatNumber, formatDate, formatPhone, formatPrice, timeAgo } from "@/lib/utils";
```

- [ ] **Step 2: Add "Tổng chi tiêu" column in table header (after "Số đơn hàng", line 374)**

After:
```jsx
                            <TableHead>{"Số đơn hàng"}</TableHead>
```
Add:
```jsx
                            <TableHead>{"Tổng chi tiêu"}</TableHead>
                            <TableHead>{"Lần hoạt động"}</TableHead>
```

- [ ] **Step 3: Add column cells in table body (after "Số đơn hàng" at lines 501-506)**

After the total orders cell block:
```jsx
                                    {/* Total orders */}
                                    <TableCell>
                                        <span className="text-sm text-muted-foreground">
                                            {formatNumber(user.orderCount ?? 0)}
                                        </span>
                                    </TableCell>
```
Add:
```jsx
                                    {/* Total spent */}
                                    <TableCell>
                                        <span className="text-sm text-muted-foreground">
                                            {user.totalSpent ? formatPrice(user.totalSpent) : "0đ"}
                                        </span>
                                    </TableCell>

                                    {/* Last active */}
                                    <TableCell>
                                        <span className="text-sm text-muted-foreground">
                                            {timeAgo(user.lastLoginAt) || "—"}
                                        </span>
                                    </TableCell>
```

- [ ] **Step 4: Update colSpan in empty/loading skeletons (line 384 and 394)**

Change `colSpan={7}` to `colSpan={9}` in both places:

Line 384:
```jsx
                                    {[...Array(9)].map((_, j) => (
```

Line 394:
```jsx
                                    colSpan={9}
```

- [ ] **Step 5: Update min-w on table (line 366)**

Change `min-w-[900px]` to `min-w-[1100px]`:
```jsx
                <Table className="min-w-[1100px]">
```

- [ ] **Step 6: Lint + commit**

```bash
npm run lint
git add src/features/admin/components/users/AdminUserTable.jsx
git commit -m "feat: add total spent and last active columns to user table"
```

---

### Task 8: AdminUserDetail — lastLogin + reset password button

**Files:**
- Modify: `D:\AppleStoreMini\src\features\admin\components\users\AdminUserDetail.jsx`

- [ ] **Step 1: Add timeAgo import**

The file already imports `timeAgo`? No — let me check. The imports include `formatPrice, formatDate, formatDateTime, formatNumber, formatPhone` from `@/lib/utils`. Add `timeAgo`:

Change:
```js
import {
    formatPrice,
    formatDate,
    formatDateTime,
    formatNumber,
    formatPhone,
} from "@/lib/utils";
```
To:
```js
import {
    formatPrice,
    formatDate,
    formatDateTime,
    formatNumber,
    formatPhone,
    timeAgo,
} from "@/lib/utils";
```

- [ ] **Step 2: Import useResetUserPasswordMutation + KeyRound icon**

Add to the mutation imports:
```js
import {
    useToggleUserStatusMutation,
    useUpdateUserPermissionsMutation,
    useUpdateUserRoleMutation,
    useResetUserPasswordMutation,
} from "@/store/api/usersApi";
```

Add `KeyRound` to lucide import:
```js
    Clock,
    KeyRound,
} from "lucide-react";
```

- [ ] **Step 3: Add "Lần đăng nhập cuối" in header info (after "Tham gia", line 403-406)**

After:
```jsx
                                <span className="inline-flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5" />
                                    Tham gia {formatDate(user.createdAt)}
                                </span>
```
Add:
```jsx
                                {user.lastLoginAt && (
                                    <span className="inline-flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5" />
                                        Đăng nhập {timeAgo(user.lastLoginAt)}
                                    </span>
                                )}
```

- [ ] **Step 4: Add reset password button in "Quản trị tài khoản" section**

After the "Khóa tài khoản" button block (after line 640), but before the `</div>` closing the button grid (before line 641), add:

```jsx
                                <Separator className="my-1" />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="justify-start rounded-lg"
                                    disabled={isResetting}
                                    onClick={handleResetPassword}
                                >
                                    <KeyRound className="mr-2 h-4 w-4" />
                                    Đặt lại mật khẩu
                                </Button>
```

- [ ] **Step 5: Add mutation hook + handler in component body**

Add the hook after other mutation hooks (after line 249):
```jsx
    const [resetPassword, { isLoading: isResetting }] = useResetUserPasswordMutation();
```

Add the handler after other handlers (after line 351):
```jsx
    const handleResetPassword = async () => {
        try {
            const result = await resetPassword(user.id).unwrap();
            toast.success(`Mật khẩu mới: ${result.newPassword}`, { duration: 10000 });
        } catch {
            toast.error("Đặt lại mật khẩu thất bại");
        }
    };
```

- [ ] **Step 6: Lint + build**

```bash
npm run lint
npm run build
```

- [ ] **Step 7: Commit**

```bash
git add src/features/admin/components/users/AdminUserDetail.jsx
git commit -m "feat: add lastLogin display and reset password button to user detail"
```
