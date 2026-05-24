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

export const testProducts = [
  {
    id: "prod-iphone-15",
    _id: "prod-iphone-15",
    name: "iPhone 15 Pro E2E",
    slug: "iphone-15-pro-e2e",
    category: "iphone",
    price: 29990000,
    salePrice: 27990000,
    stock: 12,
    inStock: true,
    images: JSON.stringify(["/assets/test/iphone.png"]),
    variants: [
      {
        id: "v1",
        color: "Titan tự nhiên",
        storage: "128GB",
        ram: "8GB",
        edition: "",
        price: 29990000,
        salePrice: 27990000,
        stock: 12,
        inStock: true,
        images: ["/assets/test/iphone.png"],
      },
    ],
  },
  {
    id: "prod-macbook-air",
    _id: "prod-macbook-air",
    name: "MacBook Air M3 E2E",
    slug: "macbook-air-m3-e2e",
    category: "mac",
    price: 32990000,
    stock: 8,
    inStock: true,
    images: JSON.stringify(["/assets/test/macbook.png"]),
  },
];

export const testFlashSales = [
  {
    id: "flash-e2e-active",
    title: "Tet Flash Sale E2E",
    description: "Limited campaign for e2e",
    startTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    isActive: true,
    items: [
      {
        id: "flash-item-e2e-1",
        flashSaleId: "flash-e2e-active",
        variantId: "v1",
        salePrice: 24990000,
        quantityLimit: 10,
        quantitySold: 2,
        variant: {
          ...testProducts[0].variants[0],
          product: testProducts[0],
        },
      },
    ],
  },
  {
    id: "flash-e2e-upcoming",
    title: "Back To School E2E",
    description: "Upcoming campaign for e2e",
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    items: [],
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
    category: "Tư vấn",
  },
];

export const apiEnvelope = <T>(data: T, message = "ok") => ({ statusCode: 200, data, message, success: true });

export function makeOrder(overrides = {}) {
  return {
    id: "order-e2e-1",
    referenceId: "ORD-E2E-0001",
    status: "PENDING",
    paymentStatus: "PAID",
    total: 27990000,
    items: [{ product: testProducts[0], quantity: 1 }],
    ...overrides,
  };
}
