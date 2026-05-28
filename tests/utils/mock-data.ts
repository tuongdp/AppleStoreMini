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

export const globalOptions = {
  colors: ["Titan tự nhiên", "Titan xanh", "Titan đen", "Bạc", "Xám"],
  storages: ["128GB", "256GB", "512GB", "1TB"],
  rams: ["8GB", "16GB", "24GB"],
  editions: ["", "Wi-Fi", "Wi-Fi + Cellular", "GPS", "GPS + Cellular"],
};

export const appSettings = {
  shopName: "Apple Store Mini",
  shopEmail: "contact@applestore.vn",
  shopPhone: "1900 1234",
  shopAddress: "123 Nguyễn Huệ, Quận 1, TP.HCM",
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
