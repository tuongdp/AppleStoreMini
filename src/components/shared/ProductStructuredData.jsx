export default function ProductStructuredData({ product, variant }) {
  if (!product) return null;

  const price = variant?.salePrice ?? variant?.price ?? 0;
  const availability = variant?.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";

  const images = Array.isArray(product.images) ? product.images : [];
  try {
    if (variant?.images) {
      images.push(...(typeof variant.images === "string" ? JSON.parse(variant.images) : variant.images));
    }
  } catch {}

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description?.replace(/<[^>]*>/g, "").substring(0, 300) || product.name,
    image: images.length > 0 ? images : [product.image || ""],
    sku: variant?.id || product.id,
    brand: { "@type": "Brand", name: "Apple" },
    offers: {
      "@type": "Offer",
      price: String(price),
      priceCurrency: "VND",
      availability,
      url: `https://www.apple-store-mini.io.vn/products/${product.slug}`,
    },
    ...(product.rating > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: String(product.rating),
            reviewCount: product.reviewCount || 0,
          },
        }
      : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
