// ── Routes ────────────────────────────────────────────
export const ROUTES = {
    HOME: "/",
    PRODUCTS: "/products",
    PRODUCT_DETAIL: (slug) => `/products/${slug}`,
    CART: "/cart",
    CHECKOUT: "/checkout",
    SEARCH: "/search",

    // Auth
    LOGIN: "/login",
    REGISTER: "/register",
    FORGOT_PASSWORD: "/forgot-password",
    RESET_PASSWORD: "/reset-password",

    // Profile
    PROFILE: "/profile",
    WISHLIST: "/profile/wishlist",
    ORDERS: "/profile/orders",
    ORDER_DETAIL: (id) => `/profile/orders/${id}`,
    ADDRESSES: "/profile/addresses",
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
};

// ── Categories ────────────────────────────────────────
export const CATEGORIES = [
    { label: "iPhone", value: "iphone", href: "/products?category=iphone" },
    { label: "iPad", value: "ipad", href: "/products?category=ipad" },
    { label: "Mac", value: "mac", href: "/products?category=mac" },
    { label: "Apple Watch", value: "apple-watch", href: "/products?category=apple-watch" },
    { label: "AirPods", value: "airpods", href: "/products?category=airpods" },
];

// ── Banner Slides (dùng cho BannerSlider ở HomePage) ──
export const BANNER_SLIDES = [
    {
        id: 1,
        title: "iPhone 16 Pro",
        subtitle: "Titanium. Mạnh mẽ. Nhẹ hơn. Pro hơn.",
        description:
            "Camera 48MP thế hệ mới. Chip A18 Pro. Thời lượng pin cả ngày.",
        cta: "Mua ngay",
        ctaLink: "/products?category=iphone",
        image: "/images/hero/hero-iphone.jpg",
        bgFrom: "#1d1d1f",
        bgTo: "#2d2d2f",
        textColor: "light", // "light" | "dark"
    },
    {
        id: 2,
        title: "MacBook Pro",
        subtitle: "Chip M4. Hiệu năng đỉnh cao.",
        description: "Màn hình Liquid Retina XDR 16 inch. Pin lên đến 22 giờ.",
        cta: "Khám phá",
        ctaLink: "/products?category=mac",
        image: "/images/hero/hero-mac.jpg",
        bgFrom: "#f5f5f7",
        bgTo: "#e8e8ed",
        textColor: "dark",
    },
    {
        id: 3,
        title: "iPad Pro",
        subtitle: "Siêu mỏng. Siêu mạnh.",
        description:
            "Chip M4. Màn hình Ultra Retina XDR OLED. Mỏng nhất từ trước đến nay.",
        cta: "Tìm hiểu thêm",
        ctaLink: "/products?category=ipad",
        image: "/images/hero/hero-ipad.jpg",
        bgFrom: "#1c4ed8",
        bgTo: "#1e40af",
        textColor: "light",
    },
    {
        id: 4,
        title: "Apple Watch Series 10",
        subtitle: "Lớn hơn. Mỏng hơn. Theo dõi sức khỏe.",
        description:
            "Màn hình lớn hơn bao giờ hết. Phát hiện ngưng thở khi ngủ.",
        cta: "Mua ngay",
        ctaLink: "/products?category=watch",
        image: "/images/hero/hero-watch.jpg",
        bgFrom: "#0f172a",
        bgTo: "#1e293b",
        textColor: "light",
    },
];

// ── Sort options ──────────────────────────────────────
export const SORT_OPTIONS = [
    { label: "Nổi bật", value: "featured" },
    { label: "Mới nhất", value: "newest" },
    { label: "Giá thấp đến cao", value: "price_asc" },
    { label: "Giá cao đến thấp", value: "price_desc" },
    { label: "Bán chạy nhất", value: "best_seller" },
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

// ── Payment methods ───────────────────────────────────
export const PAYMENT_METHODS = {
    COD: "cod",
    MOMO: "momo",
};

// ── User roles ────────────────────────────────────────
export const USER_ROLES = {
    ADMIN: "admin",
    USER: "user",
};

// ── Pagination ────────────────────────────────────────
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 12,
    LIMIT_OPTIONS: [12, 24, 36, 48],
};

// ── Storage options ───────────────────────────────────
export const STORAGE_OPTIONS = [
    "64GB",
    "128GB",
    "256GB",
    "512GB",
    "1TB",
    "2TB",
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
    WISHLIST: "apple-store-wishlist",
    THEME: "apple-store-theme",
    LANGUAGE: "apple-store-language",
};

// ── Image ─────────────────────────────────────────────
export const IMAGE = {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    MAX_COUNT: 10,
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

// ── Review ────────────────────────────────────────────
export const REVIEW_SORT_OPTIONS = [
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
