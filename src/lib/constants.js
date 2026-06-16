// ── Routes ────────────────────────────────────────────
export const ROUTES = {
    HOME: "/",
    PRODUCTS: "/products",
    PRODUCT_DETAIL: (slug) => `/products/${slug}`,
    CART: "/cart",
    CHECKOUT: "/checkout",
    SEARCH: "/search",
    APPLE_CARE: "/apple-care",

    // Auth
    LOGIN: "/login",
    REGISTER: "/register",
    FORGOT_PASSWORD: "/forgot-password",
    RESET_PASSWORD: "/reset-password",

    // Profile
    PROFILE: "/profile",
    ORDERS: "/profile/orders",
    ORDER_DETAIL: (id) => `/profile/orders/${id}`,
    ORDER_LOOKUP: "/order-lookup",
    CHANGE_PASSWORD: "/profile/change-password",
    POINTS: "/profile/points",

    // Admin
    ADMIN: "/admin",
    ADMIN_LOGIN: "/admin/login",
    ADMIN_DASHBOARD: "/admin/dashboard",
    ADMIN_PRODUCTS: "/admin/products",
    ADMIN_PRODUCT_CREATE: "/admin/products/create",
    ADMIN_PRODUCT_EDIT: (id) => `/admin/products/${id}/edit`,
    ADMIN_ORDERS: "/admin/orders",
    ADMIN_ORDER_DETAIL: (id) => `/admin/orders/${id}`,
    ADMIN_USERS: "/admin/users",
    ADMIN_USER_DETAIL: (id) => `/admin/users/${id}`,
    ADMIN_STAFF: "/admin/staff",
    ADMIN_STAFF_DETAIL: (id) => `/admin/staff/${id}`,
};

// ── Categories ────────────────────────────────────────
import { iphoneImg, ipadImg, macImg, watchImg, airpodsImg, productPlaceholder } from "@/assets/images";

export const CATEGORIES = [
    { label: "iPhone", value: "iphone", href: "/products?category=iphone", image: iphoneImg },
    { label: "iPad", value: "ipad", href: "/products?category=ipad", image: ipadImg },
    { label: "Mac", value: "mac", href: "/products?category=mac", image: macImg },
    { label: "Watch", value: "apple-watch", href: "/products?category=apple-watch", image: watchImg },
    { label: "Tai nghe & Loa", value: "tai-nghe-loa", href: "/products?category=tai-nghe-loa", image: airpodsImg },
    { label: "Phụ kiện", value: "phu-kien", href: "/products?category=phu-kien", image: productPlaceholder },
];

// ── Sort options ──────────────────────────────────────
export const SORT_OPTIONS = [
    { label: "Nổi bật", value: "featured" },
    { label: "Bán chạy nhất", value: "best_seller" },
    { label: "Mới nhất", value: "newest" },
    { label: "Giá thấp đến cao", value: "price_asc" },
    { label: "Giá cao đến thấp", value: "price_desc" },
    { label: "Đánh giá cao nhất", value: "rating" },
];

// ── Order status ──────────────────────────────────────
export const ORDER_STATUS = {
    PENDING: "pending",
    CONFIRMED: "confirmed",
    PROCESSING: "processing",
    SHIPPING: "shipping",
    DELIVERED: "delivered",
    CANCELLED: "cancelled",
    REFUNDING: "refunding",
    REFUNDED: "refunded",
};

export const ORDER_STATUS_COLOR = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    processing: "bg-purple-100 text-purple-800",
    shipping: "bg-orange-100 text-orange-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    refunding: "bg-pink-100 text-pink-800",
    refunded: "bg-gray-100 text-gray-800",
};

// ── Return / Refund ───────────────────────────────────
export const RETURN_REASON = {
    DEFECTIVE: "DEFECTIVE",
    WRONG_ITEM: "WRONG_ITEM",
    DAMAGED: "DAMAGED",
    MISSING: "MISSING",
    OTHER: "OTHER",
};

export const RETURN_REASON_MAP = {
    DEFECTIVE: "Sản phẩm lỗi",
    WRONG_ITEM: "Giao sai sản phẩm",
    DAMAGED: "Hư hỏng khi vận chuyển",
    MISSING: "Thiếu phụ kiện",
    OTHER: "Lý do khác",
};

export const RETURN_REQUEST_STATUS = {
    PENDING: "PENDING",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED",
    RETURNING: "RETURNING",
    RECEIVED: "RECEIVED",
    REFUNDED: "REFUNDED",
};

export const RETURN_REQUEST_STATUS_MAP = {
    PENDING: "Chờ duyệt",
    APPROVED: "Đã duyệt",
    REJECTED: "Từ chối",
    RETURNING: "Đang gửi trả",
    RECEIVED: "Đã nhận hàng",
    REFUNDED: "Đã hoàn tiền",
};

export const RETURN_REQUEST_STATUS_COLOR = {
    PENDING: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-blue-100 text-blue-800",
    REJECTED: "bg-red-100 text-red-800",
    RETURNING: "bg-purple-100 text-purple-800",
    RECEIVED: "bg-indigo-100 text-indigo-800",
    REFUNDED: "bg-green-100 text-green-800",
};

// ── Payment methods ───────────────────────────────────
export const PAYMENT_METHODS = {
    COD: "cod",
    VNPAY: "vnpay",
};

// ── User roles ────────────────────────────────────────
export const USER_ROLES = {
    ADMIN: "admin",
    STAFF: "staff",
    USER: "user",
};

// ── Pagination ────────────────────────────────────────
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 12,
    LIMIT_OPTIONS: [12, 24, 36, 48],
};

// ── Color options ─────────────────────────────────────
export const COLOR_OPTIONS = [
    "Black Titanium",
    "White Titanium",
    "Natural Titanium",
    "Blue Titanium",
    "Pink",
    "Midnight",
    "Starlight",
    "Space Gray",
    "Silver",
    "Gold",
    "Purple",
    "Green",
    "Yellow",
    "Red",
    "Blue",
    "White",
    "Black",
];

// ── Storage options ───────────────────────────────────
export const STORAGE_OPTIONS = [
    "64GB",
    "128GB",
    "256GB",
    "512GB",
    "1TB",
    "2TB",
    "41mm",
    "45mm",
];

// ── Price ranges ──────────────────────────────────────
export const PRICE_RANGES = [
    { label: "Dưới 10 triệu", min: 0, max: 10000000 },
    { label: "10 - 20 triệu", min: 10000000, max: 20000000 },
    { label: "20 - 30 triệu", min: 20000000, max: 30000000 },
    { label: "30 - 50 triệu", min: 30000000, max: 50000000 },
    { label: "Trên 50 triệu", min: 50000000, max: 999999999 },
];

// ── Local storage keys ────────────────────────────────
export const STORAGE_KEYS = {
    ACCESS_TOKEN: "accessToken",
    CART: "apple-store-cart",
    THEME: "apple-store-theme",
    LANGUAGE: "apple-store-language",
};

// ── Image ─────────────────────────────────────────────
export const IMAGE = {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    MAX_COUNT: 20,
    VALID_TYPES: ["image/jpeg", "image/png", "image/webp"],
    PLACEHOLDER: "/placeholder/product-placeholder.jpg",
    AVATAR_PLACEHOLDER: "/placeholder/avatar-placeholder.jpg",
};

// ── Checkout steps ────────────────────────────────────
export const CHECKOUT_STEPS = [
    { step: 1, key: "address", label: "Địa chỉ" },
    { step: 2, key: "payment", label: "Thanh toán" },
    { step: 3, key: "confirm", label: "Xác nhận" },
];

// ── Comment ────────────────────────────────────────────
export const COMMENT_SORT_OPTIONS = [
    { label: "Mới nhất", value: "newest" },
    { label: "Cũ nhất", value: "oldest" },
    { label: "Sao cao nhất", value: "highest" },
    { label: "Sao thấp nhất", value: "lowest" },
];

// ── Shipping ──────────────────────────────────────────
export const SHIPPING = {
    FREE_THRESHOLD: 500000,
    DEFAULT_FEE: 30000,
};
