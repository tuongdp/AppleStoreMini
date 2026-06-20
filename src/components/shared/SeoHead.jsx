import { useHead } from "@unhead/react";

const SITE_URL = "https://www.apple-store-mini.io.vn";
const DEFAULT_IMAGE = "https://www.apple-store-mini.io.vn/og-image.jpg";

const SITE_NAME = "Apple Store";
const SITE_DESCRIPTION = "Apple Store - Cửa hàng Apple chính hãng, iPhone, iPad, MacBook, Apple Watch, AirPods giá tốt nhất. Giao hàng toàn quốc, bảo hành chính hãng.";

export default function SeoHead({
  title,
  description,
  image = DEFAULT_IMAGE,
  url = SITE_URL,
  type = "website",
  noindex = false,
}) {
  const siteName = SITE_NAME;
  const defaultDescription = SITE_DESCRIPTION;
  const resolvedDescription = description || defaultDescription;
  const fullTitle = title ? `${title} | ${siteName}` : `${siteName} - Cửa hàng Apple chính hãng`;
  const resolvedUrl = url.startsWith("http") ? url : `${SITE_URL}${url}`;
  const resolvedImage = image.startsWith("http") ? image : `${SITE_URL}${image}`;

  useHead({
    title: fullTitle,
    meta: [
      { name: "description", content: resolvedDescription },
      { property: "og:title", content: fullTitle },
      { property: "og:description", content: resolvedDescription },
      { property: "og:image", content: resolvedImage },
      { property: "og:url", content: resolvedUrl },
      { property: "og:type", content: type },
      { property: "og:site_name", content: siteName },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: fullTitle },
      { name: "twitter:description", content: resolvedDescription },
      { name: "twitter:image", content: resolvedImage },
      ...(noindex ? [{ name: "robots", content: "noindex, nofollow" }] : []),
    ],
    link: [
      { rel: "canonical", href: resolvedUrl },
    ],
  });

  return null;
}
