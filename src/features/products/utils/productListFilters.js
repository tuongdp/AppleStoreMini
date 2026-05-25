const BRAND_LABELS = {
  iphone: "iPhone",
  ipad: "iPad",
  mac: "Mac",
  macbook: "MacBook",
  imac: "iMac",
  "apple-watch": "Apple Watch",
  watch: "Apple Watch",
  airpods: "AirPods",
};

const SERIES_STOP_WORDS = new Set([
  "pro",
  "max",
  "plus",
  "mini",
  "gb",
  "tb",
  "m1",
  "m2",
  "m3",
  "m4",
  "m5",
]);

function titleCaseWord(word) {
  if (!word) return "";
  const normalized = String(word).toLowerCase();
  return BRAND_LABELS[normalized] || normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function parseMaybeJsonArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      try {
        return parseMaybeJsonArray(JSON.parse(trimmed));
      } catch {
        return [];
      }
    }
    return [trimmed];
  }
  if (typeof value === "object") return [value];
  return [];
}

export function getCategorySliderImages(category) {
  const source = category?.sliderImages ?? category?.slider ?? category?.slides ?? category?.bannerImages;
  return parseMaybeJsonArray(source)
    .map((item) => (typeof item === "string" ? item : item?.image || item?.url || item?.src))
    .filter(Boolean);
}

export function getSeriesSlug(productSlug, categorySlug) {
  if (!productSlug || !categorySlug || !productSlug.startsWith(categorySlug)) return "";
  let categoryParts = categorySlug.split("-").filter(Boolean);
  const parts = productSlug.split("-").filter(Boolean);
  if (categorySlug === "mac" && ["macbook", "imac"].includes(parts[0])) {
    categoryParts = [parts[0]];
  }
  const nextPart = parts[categoryParts.length];
  if (!nextPart) return "";
  return [...categoryParts, nextPart].join("-");
}

export function seriesSlugToLabel(seriesSlug, categorySlug) {
  const seriesParts = String(seriesSlug || "").split("-").filter(Boolean);
  let categoryParts = String(categorySlug || "").split("-").filter(Boolean);
  if (categorySlug === "mac" && ["macbook", "imac"].includes(seriesParts[0])) {
    categoryParts = [seriesParts[0]];
  }
  const familyParts = seriesParts.slice(categoryParts.length);
  const brandKey = categoryParts.join("-");
  const brand = BRAND_LABELS[brandKey] || BRAND_LABELS[categorySlug] || categoryParts.map(titleCaseWord).join(" ");
  const family = familyParts.map(titleCaseWord).join(" ");
  return [brand, family, "Series"].filter(Boolean).join(" ");
}

export function buildSeriesFilters(products, categorySlug) {
  if (!categorySlug) return [];
  const counts = new Map();

  products.forEach((product) => {
    const seriesSlug = getSeriesSlug(product?.slug, categorySlug);
    if (!seriesSlug) return;
    const seriesTail = seriesSlug.split("-").at(-1);
    if (SERIES_STOP_WORDS.has(seriesTail)) return;
    counts.set(seriesSlug, (counts.get(seriesSlug) || 0) + 1);
  });

  return [...counts.entries()]
    .map(([slug, count]) => ({
      slug,
      label: seriesSlugToLabel(slug, categorySlug),
      count,
    }))
    .sort((a, b) => b.count - a.count);
}
