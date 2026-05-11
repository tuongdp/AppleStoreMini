import * as z from "zod";

const v = (key) => {
  const texts = {
    "email.required": "Vui lòng nhập email",
    "email.invalid": "Email không hợp lệ",
    "password.minLength": "Mật khẩu tối thiểu 8 ký tự",
    "password.maxLength": "Mật khẩu tối đa 32 ký tự",
    "password.currentRequired": "Vui lòng nhập mật khẩu hiện tại",
    "password.confirmRequired": "Vui lòng xác nhận mật khẩu",
    "password.confirmNewRequired": "Vui lòng xác nhận mật khẩu mới",
    "password.notMatch": "Mật khẩu không khớp",
    "password.sameAsOld": "Mật khẩu mới không được trùng với mật khẩu cũ",
    "fullName.minLength": "Họ tên tối thiểu 2 ký tự",
    "fullName.maxLength": "Họ tên tối đa 50 ký tự",
    "phone.required": "Vui lòng nhập số điện thoại",
    "phone.invalid": "Số điện thoại không hợp lệ",
    "terms.required": "Vui lòng đồng ý với điều khoản sử dụng",
    "address.fullNameRequired": "Vui lòng nhập họ tên người nhận",
    "address.addressMinLength": "Địa chỉ tối thiểu 10 ký tự",
    "checkout.paymentRequired": "Vui lòng chọn phương thức thanh toán",
    "product.nameMinLength": "Tên sản phẩm tối thiểu 3 ký tự",
    "product.slugRequired": "Vui lòng nhập slug",
    "product.slugInvalid": "Slug chỉ chứa chữ thường, số và dấu gạch ngang",
    "product.categoryRequired": "Vui lòng chọn danh mục",
    "product.descriptionMinLength": "Mô tả tối thiểu 10 ký tự",
    "comment.ratingRequired": "Vui lòng chọn số sao",
    "comment.commentMinLength": "Bình luận tối thiểu 10 ký tự",
    "comment.commentMaxLength": "Bình luận tối đa 500 ký tự",
    "cancelReason.required": "Vui lòng nhập lý do hủy đơn (tối thiểu 10 ký tự)",
  };
  return texts[key] || key;
};

// ── Auth ──────────────────────────────────────────────
export const loginSchema = z.object({
    email: z
        .string()
        .min(1, { message: v("email.required") })
        .email({ message: v("email.invalid") }),
    password: z
        .string()
        .min(8, { message: v("password.minLength") }),
});

export const registerSchema = z
    .object({
        fullName: z
            .string()
            .min(2, { message: v("fullName.minLength") })
            .max(50, { message: v("fullName.maxLength") }),
        email: z
            .string()
            .min(1, { message: v("email.required") })
            .email({ message: v("email.invalid") }),
        phone: z
            .string()
            .min(1, { message: v("phone.required") })
            .regex(/^(0[3|5|7|8|9])+([0-9]{8})$/, {
                message: v("phone.invalid"),
            }),
        password: z
            .string()
            .min(8, { message: v("password.minLength") })
            .max(32, { message: v("password.maxLength") }),
        confirmPassword: z
            .string()
            .min(1, { message: v("password.confirmRequired") }),
        agreeTerms: z.boolean().refine((val) => val === true, {
            message: v("terms.required"),
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: v("password.notMatch"),
        path: ["confirmPassword"],
    });

export const forgotPasswordSchema = z.object({
    email: z
        .string()
        .min(1, { message: v("email.required") })
        .email({ message: v("email.invalid") }),
});

export const resetPasswordSchema = z
    .object({
        password: z
            .string()
            .min(8, { message: v("password.minLength") })
            .max(32, { message: v("password.maxLength") }),
        confirmPassword: z
            .string()
            .min(1, { message: v("password.confirmRequired") }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: v("password.notMatch"),
        path: ["confirmPassword"],
    });

export const changePasswordSchema = z
    .object({
        currentPassword: z
            .string()
            .min(1, { message: v("password.currentRequired") }),
        newPassword: z
            .string()
            .min(8, { message: v("password.minLength") })
            .max(32, { message: v("password.maxLength") }),
        confirmPassword: z
            .string()
            .min(1, { message: v("password.confirmNewRequired") }),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: v("password.notMatch"),
        path: ["confirmPassword"],
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
        message: v("password.sameAsOld"),
        path: ["newPassword"],
    });

// ── Profile ───────────────────────────────────────────
export const profileSchema = z.object({
    fullName: z
        .string()
        .min(2, { message: v("fullName.minLength") })
        .max(50, { message: v("fullName.maxLength") }),
    phone: z
        .string()
        .min(1, { message: v("phone.required") })
        .regex(/^(0[3|5|7|8|9])+([0-9]{8})$/, {
            message: v("phone.invalid"),
        }),
    birthday: z.string().optional(),
    gender: z.enum(["male", "female", "other"]).optional(),
    address: z.string().optional(),
});

// ── Address ───────────────────────────────────────────
export const addressSchema = z.object({
    fullName: z.string().min(2, { message: v("address.fullNameRequired") }),
    phone: z
        .string()
        .min(1, { message: v("phone.required") })
        .regex(/^(0[3|5|7|8|9])+([0-9]{8})$/, {
            message: v("phone.invalid"),
        }),
    address: z.string().min(10, { message: v("address.addressMinLength") }),
    note: z.string().max(200).optional(),
});

// ── Checkout ──────────────────────────────────────────
export const checkoutSchema = z.object({
    fullName: z.string().min(2, { message: v("address.fullNameRequired") }),
    phone: z
        .string()
        .min(1, { message: v("phone.required") })
        .regex(/^(0[3|5|7|8|9])+([0-9]{8})$/, {
            message: v("phone.invalid"),
        }),
    address: z.string().min(10, { message: v("address.addressMinLength") }),
    paymentMethod: z.enum(
        ["cod", "momo"],
        { required_error: v("checkout.paymentRequired") },
    ),
    note: z.string().max(200).optional(),
});

// ── Product ───────────────────────────────────────────
export const productSchema = z.object({
    name: z
        .string()
        .min(3, { message: v("product.nameMinLength") }),
    slug: z
        .string()
        .min(1, { message: v("product.slugRequired") })
        .regex(/^[a-z0-9-]+$/, {
            message: v("product.slugInvalid"),
        }),
    category: z.string().min(1, { message: v("product.categoryRequired") }),
    description: z
        .string()
        .min(10, { message: v("product.descriptionMinLength") })
        .or(z.literal("")),
    isActive: z.boolean().default(true),
});

// ── Comment ───────────────────────────────────────────
export const commentSchema = z.object({
    rating: z.coerce
        .number()
        .min(1, { message: v("comment.ratingRequired") })
        .max(5),
    comment: z
        .string()
        .min(10, { message: v("comment.commentMinLength") })
        .max(500, { message: v("comment.commentMaxLength") }),
});

// ── Cancel order ──────────────────────────────────────
export const cancelOrderSchema = z.object({
    reason: z.string().min(10, { message: v("cancelReason.required") }),
});
