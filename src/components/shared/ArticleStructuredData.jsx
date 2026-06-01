export default function ArticleStructuredData({ article }) {
  if (!article) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt || article.title,
    image: article.thumbnail || "",
    datePublished: article.publishedAt || article.createdAt,
    dateModified: article.updatedAt,
    author: {
      "@type": "Person",
      name: article.author || "Apple Store",
    },
    publisher: {
      "@type": "Organization",
      name: "Apple Store",
      logo: {
        "@type": "ImageObject",
        url: "https://www.apple-store-mini.io.vn/favicon.svg",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://www.apple-store-mini.io.vn/news/${article.slug}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
