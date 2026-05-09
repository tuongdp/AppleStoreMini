import * as z from "zod";

// ── Auth ──────────────────────────────────────────────
export const loginSchema = z.object({
    email: z
        .string()
        .min(1, { message: "Vui lòng nhập email" })
        .email({ message: "Email không đúng định dạng" }),
    password: z
        .string()
        .min(8, { message: "Mật khẩu phải có ít nhất 8 ký tự" }),
});

export const registerSchema = z
    .object({
        fullName: z
            .string()
            .min(2, { message: "Họ và tên phải có ít nhất 2 ký tự" })
            .max(50, { message: "Họ và tên không được vượt quá 50 ký tự" }),
        email: z
            .string()
            .min(1, { message: "Vui lòng nhập email" })
            .email({ message: "Email không đúng định dạng" }),
        phone: z
            .string()
            .min(1, { message: "Vui lòng nhập số điện thoại" })
            .regex(/^(0[3|5|7|8|9])+([0-9]{8})$/, {
                message: "Số điện thoại không đúng định dạng",
            }),
        password: z
            .string()
            .min(8, { message: "Mật khẩu phải có ít nhất 8 ký tự" })
            .max(32, { message: "Mật khẩu không được vượt quá 32 ký tự" }),
        confirmPassword: z
            .string()
            .min(1, { message: "Vui lòng xác nhận mật khẩu" }),
        agreeTerms: z.boolean().refine((val) => val === true, {
            message: "Vui lòng đồng ý với điều khoản sử dụng",
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Mật khẩu xác nhận không khớp",
        path: ["confirmPassword"],
    });

export const forgotPasswordSchema = z.object({
    email: z
        .string()
        .min(1, { message: "Vui lòng nhập email" })
        .email({ message: "Email không đúng định dạng" }),
});

export const resetPasswordSchema = z
    .object({
        password: z
            .string()
            .min(8, { message: "Mật khẩu phải có ít nhất 8 ký tự" })
            .max(32, { message: "Mật khẩu không được vượt quá 32 ký tự" }),
        confirmPassword: z
            .string()
            .min(1, { message: "Vui lòng xác nhận mật khẩu" }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Mật khẩu xác nhận không khớp",
        path: ["confirmPassword"],
    });

export const changePasswordSchema = z
    .object({
        currentPassword: z
            .string()
            .min(1, { message: "Vui lòng nhập mật khẩu hiện tại" }),
        newPassword: z
            .string()
            .min(8, { message: "Mật khẩu phải có ít nhất 8 ký tự" })
            .max(32, { message: "Mật khẩu không được vượt quá 32 ký tự" }),
        confirmPassword: z
            .string()
            .min(1, { message: "Vui lòng xác nhận mật khẩu mới" }),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Mật khẩu xác nhận không khớp",
        path: ["confirmPassword"],
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
        message: "Mật khẩu mới không được trùng mật khẩu cũ",
        path: ["newPassword"],
    });

// ── Profile ───────────────────────────────────────────
export const profileSchema = z.object({
    fullName: z
        .string()
        .min(2, { message: "Họ và tên phải có ít nhất 2 ký tự" })
        .max(50, { message: "Họ và tên không được vượt quá 50 ký tự" }),
    phone: z
        .string()
        .min(1, { message: "Vui lòng nhập số điện thoại" })
        .regex(/^(0[3|5|7|8|9])+([0-9]{8})$/, {
            message: "Số điện thoại không đúng định dạng",
        }),
    birthday: z.string().optional(),
    gender: z.enum(["male", "female", "other"]).optional(),
    address: z.string().optional(),
});

// ── Address ───────────────────────────────────────────
export const addressSchema = z.object({
    fullName: z.string().min(2, { message: "Vui lòng nhập tên người nhận" }),
    phone: z
        .string()
        .min(1, { message: "Vui lòng nhập số điện thoại" })
        .regex(/^(0[3|5|7|8|9])+([0-9]{8})$/, {
            message: "Số điện thoại không đúng định dạng",
        }),
    address: z.string().min(10, { message: "Vui lòng nhập địa chỉ cụ thể" }),
    note: z.string().max(200).optional(),
});

// ── Checkout ──────────────────────────────────────────
export const checkoutSchema = z.object({
    fullName: z.string().min(2, { message: "Vui lòng nhập tên người nhận" }),
    phone: z
        .string()
        .min(1, { message: "Vui lòng nhập số điện thoại" })
        .regex(/^(0[3|5|7|8|9])+([0-9]{8})$/, {
            message: "Số điện thoại không đúng định dạng",
        }),
    address: z.string().min(10, { message: "Vui lòng nhập địa chỉ cụ thể" }),
    paymentMethod: z.enum(
        ["cod", "momo"],
        { required_error: "Vui lòng chọn phương thức thanh toán" },
    ),
    note: z.string().max(200).optional(),
});

// ── Product ───────────────────────────────────────────
export const productSchema = z.object({
    name: z
        .string()
        .min(3, { message: "Tên sản phẩm phải có ít nhất 3 ký tự" }),
    slug: z
        .string()
        .min(1, { message: "Vui lòng nhập slug" })
        .regex(/^[a-z0-9-]+$/, {
            message: "Slug chỉ được chứa chữ thường, số và dấu gạch ngang",
        }),
    category: z.string().min(1, { message: "Vui lòng chọn danh mục" }),
    description: z
        .string()
        .min(10, { message: "Mô tả phải có ít nhất 10 ký tự" }),
    featured: z.boolean().default(false),
});

// ── Review ────────────────────────────────────────────
export const reviewSchema = z.object({
    rating: z.coerce
        .number()
        .min(1, { message: "Vui lòng chọn số sao đánh giá" })
        .max(5),
    comment: z
        .string()
        .min(10, { message: "Nội dung đánh giá phải có ít nhất 10 ký tự" })
        .max(500, { message: "Nội dung không được vượt quá 500 ký tự" }),
});

// ── Cancel order ──────────────────────────────────────
export const cancelOrderSchema = z.object({
    reason: z.string().min(10, { message: "Vui lòng nhập lý do huỷ đơn hàng" }),
});
