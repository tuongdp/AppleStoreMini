export const testUsers = {
  customer: {
    id: "user-e2e-1",
    fullName: "E2E Customer",
    email: "e2e.customer@example.com",
    role: "user",
    isVerified: true,
  },
  admin: {
    id: "admin-e2e-1",
    fullName: "E2E Admin",
    email: "e2e.admin@example.com",
    role: "admin",
    isVerified: true,
  },
};

export const adminUsersList = [
  { id: "user-1", fullName: "Nguyễn Văn A", email: "nguyenvana@example.com", role: "user", isActive: true, isVerified: true, points: 500, createdAt: "2024-01-15T00:00:00Z" },
  { id: "user-2", fullName: "Trần Thị B", email: "tranthib@example.com", role: "user", isActive: true, isVerified: true, points: 1200, createdAt: "2024-03-20T00:00:00Z" },
  { id: "staff-1", fullName: "Staff One", email: "staff@example.com", role: "staff", isActive: true, isVerified: true, permissions: ["products", "orders"], createdAt: "2024-06-01T00:00:00Z" },
];

export const testCategories = [
  { id: "cat-iphone", name: "iPhone", slug: "iphone", image: "/assets/test/iphone.png", isActive: true },
  { id: "cat-mac", name: "Mac", slug: "mac", image: "/assets/test/mac.png", isActive: true },
  { id: "cat-ipad", name: "iPad", slug: "ipad", image: "/assets/test/ipad.png", isActive: true },
  { id: "cat-watch", name: "Watch", slug: "watch", image: "/assets/test/watch.png", isActive: true },
];

export const testSeries = [
  { id: "series-iphone-15", name: "iPhone 15 Series", slug: "iphone-15", categoryId: "cat-iphone", isActive: true },
  { id: "series-macbook-air", name: "MacBook Air", slug: "macbook-air", categoryId: "cat-mac", isActive: true },
];

export const testCoupons = [
  { id: "coupon-1", code: "SUMMER2024", discountType: "PERCENT", discountValue: 10, minOrderValue: 5000000, maxDiscount: 500000, usageLimit: 100, usedCount: 10, isActive: true, startDate: "2024-06-01", endDate: "2024-12-31" },
  { id: "coupon-2", code: "WELCOME50", discountType: "FIXED", discountValue: 50000, minOrderValue: 1000000, maxDiscount: 50000, usageLimit: 50, usedCount: 5, isActive: true, startDate: "2024-01-01", endDate: "2024-12-31" },
];

export const testBanners = [
  { id: "banner-1", title: "iPhone 15 Pro", subtitle: "Titan. Thật mạnh mẽ.", image: "/assets/test/banner-iphone.jpg", link: "/products?category=iphone", isActive: true, order: 1 },
  { id: "banner-2", title: "MacBook Air M3", subtitle: "Siêu mỏng. Siêu mạnh.", image: "/assets/test/banner-mac.jpg", link: "/products?category=mac", isActive: true, order: 2 },
];

export const testProducts = [
  {
    id: "prod-iphone-15",
    _id: "prod-iphone-15",
    name: "iPhone 15 Pro E2E",
    slug: "iphone-15-pro-e2e",
    category: "iphone",
    categoryId: "cat-iphone",
    price: 29990000,
    salePrice: 27990000,
    stock: 12,
    inStock: true,
    description: "iPhone 15 Pro với chip A17 Pro",
    images: JSON.stringify(["/assets/test/iphone.png"]),
    variants: [
      { id: "v1", color: "Titan tự nhiên", storage: "128GB", ram: "8GB", edition: "", price: 29990000, salePrice: 27990000, stock: 12, inStock: true, images: ["/assets/test/iphone.png"] },
      { id: "v2", color: "Titan xanh", storage: "256GB", ram: "8GB", edition: "", price: 32990000, salePrice: 30990000, stock: 5, inStock: true, images: ["/assets/test/iphone.png"] },
      { id: "v3", color: "Titan tự nhiên", storage: "512GB", ram: "8GB", edition: "", price: 37990000, salePrice: 35990000, stock: 0, inStock: false, images: ["/assets/test/iphone.png"] },
    ],
  },
  {
    id: "prod-macbook-air",
    _id: "prod-macbook-air",
    name: "MacBook Air M3 E2E",
    slug: "macbook-air-m3-e2e",
    category: "mac",
    categoryId: "cat-mac",
    price: 32990000,
    stock: 8,
    inStock: true,
    description: "MacBook Air với chip M3",
    images: JSON.stringify(["/assets/test/macbook.png"]),
    variants: [
      { id: "v4", color: "Bạc", storage: "256GB", ram: "8GB", edition: "", price: 32990000, salePrice: 32990000, stock: 8, inStock: true, images: ["/assets/test/macbook.png"] },
    ],
  },
  {
    id: "prod-ipad-pro",
    _id: "prod-ipad-pro",
    name: "iPad Pro M4 E2E",
    slug: "ipad-pro-m4-e2e",
    category: "ipad",
    categoryId: "cat-ipad",
    price: 24990000,
    stock: 10,
    inStock: true,
    description: "iPad Pro với chip M4",
    images: JSON.stringify(["/assets/test/ipad.png"]),
    variants: [
      { id: "v5", color: "Bạc", storage: "256GB", ram: "8GB", edition: "Wi-Fi", price: 24990000, salePrice: 24990000, stock: 10, inStock: true, images: ["/assets/test/ipad.png"] },
    ],
  },
];

export const testNews = [
  {
    id: "news-iphone-buying-guide",
    _id: "news-iphone-buying-guide",
    title: "Kinh nghiệm chọn iPhone phù hợp",
    slug: "kinh-nghiem-chon-iphone-phu-hop",
    thumbnail: "/assets/test/news-iphone.jpg",
    excerpt: "Gợi ý nhanh để chọn iPhone theo nhu cầu sử dụng hằng ngày.",
    content: "<p>Nội dung chi tiết...</p>",
    category: "Tư vấn",
    isPublished: true,
    createdAt: "2024-05-01T00:00:00Z",
  },
  {
    id: "news-macbook-tips",
    _id: "news-macbook-tips",
    title: "Mẹo sử dụng MacBook hiệu quả",
    slug: "meo-su-dung-macbook-hieu-qua",
    thumbnail: "/assets/test/news-mac.jpg",
    excerpt: "Những mẹo nhỏ giúp bạn tận dụng tối đa MacBook.",
    content: "<p>Nội dung chi tiết...</p>",
    category: "Thủ thuật",
    isPublished: true,
    createdAt: "2024-06-15T00:00:00Z",
  },
];

export const testOrders = [
  {
    id: "order-1",
    code: "ORD-E2E-0001",
    userId: "user-1",
    user: { fullName: "Nguyễn Văn A", email: "nguyenvana@example.com" },
    status: "PENDING",
    paymentMethod: "COD",
    isPaid: false,
    totalAmount: 27990000,
    shippingAddress: "123 Đường ABC, Quận 1, TP.HCM",
    shippingPhone: "0900000000",
    items: [
      { id: "oi-1", productName: "iPhone 15 Pro E2E", variantName: "Titan tự nhiên / 128GB", quantity: 1, price: 27990000 },
    ],
    createdAt: "2024-06-01T10:00:00Z",
  },
  {
    id: "order-2",
    code: "ORD-E2E-0002",
    userId: "user-2",
    user: { fullName: "Trần Thị B", email: "tranthib@example.com" },
    status: "DELIVERED",
    paymentMethod: "VNPAY",
    isPaid: true,
    totalAmount: 32990000,
    shippingAddress: "456 Đường XYZ, Quận 3, TP.HCM",
    shippingPhone: "0900111222",
    items: [
      { id: "oi-2", productName: "MacBook Air M3 E2E", variantName: "Bạc / 256GB", quantity: 1, price: 32990000 },
    ],
    createdAt: "2024-05-15T08:00:00Z",
  },
];

export const testReviews = [
  { id: "review-1", productId: "prod-iphone-15", userId: "user-1", user: { fullName: "Nguyễn Văn A" }, rating: 5, comment: "Sản phẩm tuyệt vời!", isApproved: true, createdAt: "2024-06-10T00:00:00Z" },
];

export const testReturnRequests = [
  { id: "return-1", orderId: "order-2", orderCode: "ORD-E2E-0002", userId: "user-2", user: { fullName: "Trần Thị B" }, reason: "Sản phẩm bị lỗi", status: "PENDING", createdAt: "2024-05-20T00:00:00Z" },
];

export const dashboardStats = {
  totalUsers: 150,
  totalOrders: 320,
  totalRevenue: 1250000000,
  totalProducts: 45,
  pendingOrders: 12,
  pendingReturns: 3,
  orderStatusDistribution: [
    { status: "PENDING", count: 12 },
    { status: "CONFIRMED", count: 50 },
    { status: "SHIPPING", count: 30 },
    { status: "DELIVERED", count: 220 },
    { status: "CANCELLED", count: 8 },
  ],
};

export const dashboardOperations = {
  revenue: { today: 27990000, week: 180000000, month: 620000000 },
  orders: {
    today: 6,
    total: 320,
    pending: 4,
    confirmed: 3,
    processing: 5,
    shipping: 8,
    delivered: 220,
    cancelled: 8,
    refunded: 2,
    deliveryRate: 92.5,
    problemRate: 3.1,
  },
  inventory: { lowStockVariants: 2, outOfStockVariants: 1 },
  customers: { newToday: 3, unverified: 4 },
  marketing: { activeCoupons: 2, expiredActiveCoupons: 0 },
  online: { activeUsers: 12, carts: 5 },
  tasks: [
    { key: "pendingOrders", label: "Đơn chờ xác nhận", count: 4, href: "/admin/orders?status=PENDING", tone: "danger" },
    { key: "reviews", label: "Đánh giá chưa phản hồi", count: 2, href: "/admin/comments", tone: "warning" },
    { key: "returnRequests", label: "Yêu cầu trả hàng", count: 1, href: "/admin/returns", tone: "warning" },
  ],
  alerts: [
    { key: "low-stock", title: "Tồn kho thấp", message: "Một số phiên bản iPhone sắp hết hàng.", severity: "MEDIUM", href: "/admin/products" },
  ],
};

export const dashboardRevenue = {
  chart: [
    { label: "01/06", revenue: 27990000, orders: 1 },
    { label: "02/06", revenue: 32990000, orders: 1 },
    { label: "03/06", revenue: 24990000, orders: 1 },
  ],
  totalRevenue: 85970000,
  totalOrders: 3,
  avgOrderValue: 28656667,
  revenueChange: 12.4,
  orderChange: 8.2,
  avgOrderChange: 4.1,
};

export const dashboardCategoryRevenue = [
  { categoryId: "cat-iphone", label: "iPhone", value: 56000000, change: 12 },
  { categoryId: "cat-mac", label: "Mac", value: 32990000, change: 5 },
  { categoryId: "cat-ipad", label: "iPad", value: 24990000, change: -3 },
];

export const dashboardTopProducts = [
  { ...testProducts[0], soldCount: 12, revenue: 335880000, inStock: true },
  { ...testProducts[1], soldCount: 6, revenue: 197940000, inStock: true },
  { ...testProducts[2], soldCount: 4, revenue: 99960000, inStock: true },
];

export const dashboardSlowProducts = [
  { ...testProducts[2], soldCount: 0, totalStock: 10, daysInStock: 75, categorySlug: "ipad" },
  { ...testProducts[1], soldCount: 1, totalStock: 8, daysInStock: 45, categorySlug: "mac" },
];

export const dashboardLowStock = [
  { ...testProducts[0].variants[1], productId: testProducts[0].id, product: { name: testProducts[0].name, slug: testProducts[0].slug }, recentSales: 7 },
  { ...testProducts[0].variants[2], productId: testProducts[0].id, product: { name: testProducts[0].name, slug: testProducts[0].slug }, recentSales: 2 },
];

export const dashboardTopCustomers = [
  { id: "user-1", fullName: "Nguyễn Văn A", email: "nguyenvana@example.com", totalSpent: 86970000, orderCount: 3, lastOrderDate: "2024-06-01T10:00:00Z" },
  { id: "user-2", fullName: "Trần Thị B", email: "tranthib@example.com", totalSpent: 32990000, orderCount: 1, lastOrderDate: "2024-05-15T08:00:00Z" },
];

export const globalOptions = {
  colors: ["Titan tự nhiên", "Titan xanh", "Titan đen", "Bạc", "Xám"],
  storages: ["128GB", "256GB", "512GB", "1TB"],
  rams: ["8GB", "16GB", "24GB"],
  editions: ["", "Wi-Fi", "Wi-Fi + Cellular", "GPS", "GPS + Cellular"],
  refreshRates: ["60Hz", "120Hz"],
  ssds: ["256GB", "512GB", "1TB"],
};

export const globalOptionsList = [
  { id: "opt-color-titan", type: "COLOR", value: "Titan tự nhiên", hex: "#8f8a81", isActive: true },
  { id: "opt-color-blue", type: "COLOR", value: "Titan xanh", hex: "#3f4e65", isActive: true },
  { id: "opt-storage-128", type: "STORAGE", value: "128GB", isActive: true },
  { id: "opt-storage-256", type: "STORAGE", value: "256GB", isActive: true },
  { id: "opt-ram-8", type: "RAM", value: "8GB", isActive: true },
  { id: "opt-edition-wifi", type: "EDITION", value: "Wi-Fi", isActive: true },
  { id: "opt-refresh-120", type: "REFRESH_RATE", value: "120Hz", isActive: true },
  { id: "opt-ssd-512", type: "SSD", value: "512GB", isActive: true },
];

export const appSettings = {
  shopName: "Apple Store Mini",
  shopEmail: "contact@applestore.vn",
  shopPhone: "1900 1234",
  shopAddress: "123 Nguyễn Huệ, Quận 1, TP.HCM",
  shop: {
    name: "Apple Store Mini",
    email: "contact@applestore.vn",
    phone: "1900 1234",
    address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
    logo: "",
    taxCode: "0312345678",
    facebook: "https://facebook.com/applestoremini",
    zalo: "https://zalo.me/19001234",
    tiktok: "https://tiktok.com/@applestoremini",
    youtube: "https://youtube.com/@applestoremini",
  },
  shipping: { defaultFee: 30000, freeShippingMinOrder: 5000000 },
  returnPolicy: { windowDays: 7 },
  reviewReward: { points: 20000, type: "FIXED" },
  warranty: { durationMonths: 12 },
  payment: { codEnabled: true, vnpayEnabled: true },
  seo: { title: "Apple Store Mini", description: "Apple Store Mini chính hãng" },
};

export const apiEnvelope = <T>(data: T, message = "ok") => ({ statusCode: 200, data, message, success: true });
export const apiPaginated = <T>(data: T[], page = 1, limit = 12) => ({
  ...apiEnvelope(data),
  pagination: { page, limit, total: data.length, totalPages: Math.ceil(data.length / limit) },
});

export function makeOrder(overrides = {}) {
  return {
    id: "order-e2e-1",
    code: "ORD-E2E-0001",
    status: "PENDING",
    paymentMethod: "COD",
    isPaid: false,
    totalAmount: 27990000,
    shippingAddress: "123 Đường ABC, Quận 1, TP.HCM",
    items: [{ productName: "iPhone 15 Pro E2E", quantity: 1, price: 27990000 }],
    ...overrides,
  };
}
