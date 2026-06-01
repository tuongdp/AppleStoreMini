export default function StructuredData() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "Apple Store",
        url: "https://www.apple-store-mini.io.vn",
        logo: "https://www.apple-store-mini.io.vn/favicon.svg",
        sameAs: [],
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+84-000-000-000",
          contactType: "customer service",
          availableLanguage: ["Vietnamese"],
        },
      },
      {
        "@type": "WebSite",
        url: "https://www.apple-store-mini.io.vn",
        name: "Apple Store",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: "https://www.apple-store-mini.io.vn/search?q={search_term_string}",
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
