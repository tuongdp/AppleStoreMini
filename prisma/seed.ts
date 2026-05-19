import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const customerEmail = process.env.TEST_USER_EMAIL || "e2e.customer@example.com";
  const adminEmail = process.env.TEST_ADMIN_EMAIL || "e2e.admin@example.com";

  // This seed is written as an enterprise-safe template because the backend schema
  // is not present in this frontend workspace. Align model/field names with the
  // Express/Prisma backend before running it.
  await prisma.user.upsert({
    where: { email: customerEmail },
    update: {},
    create: {
      email: customerEmail,
      fullName: "E2E Customer",
      role: "USER",
      isVerified: true,
      password: "$2a$10$replaceWithBackendHashForPasswordAt123",
    },
  });

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      fullName: "E2E Admin",
      role: "ADMIN",
      isVerified: true,
      password: "$2a$10$replaceWithBackendHashForAdminAt123",
    },
  });

  const iphoneCategory = await prisma.category.upsert({
    where: { slug: "iphone" },
    update: {},
    create: { name: "iPhone", slug: "iphone", isActive: true },
  });

  await prisma.product.upsert({
    where: { slug: "iphone-15-pro-e2e" },
    update: { stock: 12, inStock: true },
    create: {
      name: "iPhone 15 Pro E2E",
      slug: "iphone-15-pro-e2e",
      categoryId: iphoneCategory.id,
      price: 29990000,
      salePrice: 27990000,
      stock: 12,
      inStock: true,
      images: JSON.stringify(["/assets/test/iphone.png"]),
      description: "Deterministic product for automated regression tests.",
    },
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
