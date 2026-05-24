const numberFormatter = new Intl.NumberFormat("vi-VN");

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const getVariantPrice = (variant = {}) => {
  const price = toNumber(variant.price);
  const salePrice = toNumber(variant.salePrice);
  return salePrice > 0 && salePrice < price ? salePrice : price;
};

const getProductPrice = (product = {}) => {
  const variantPrices = (product.variants || [])
    .map(getVariantPrice)
    .filter((price) => price > 0);
  if (variantPrices.length) return Math.min(...variantPrices);
  return getVariantPrice(product);
};

const formatPriceText = (price) => (
  price > 0 ? `${numberFormatter.format(price)} VND` : "Chua co gia"
);

const formatVariantLabel = (variant = {}) =>
  [variant.storage, variant.ram, variant.edition, variant.color].filter(Boolean).join(" ");

export function buildCompareProductInput(product = {}) {
  const variants = product.variants || [];
  const inStockCount = variants.filter((variant) => variant.inStock || toNumber(variant.stock) > 0).length;
  const variantLabels = [...new Set(variants.map(formatVariantLabel).filter(Boolean))].slice(0, 8);
  const price = getProductPrice(product);

  return {
    name: product.name || "",
    storeContext: [
      `Danh muc: ${product.category?.name || product.category?.slug || product.category || "Khong ro"}`,
      `Gia hien tai: ${formatPriceText(price)}`,
      `Tinh trang: ${!variants.length || inStockCount > 0 ? "Con hang" : "Het hang"}`,
      variantLabels.length ? `Phien ban: ${variantLabels.join(", ")}` : "",
    ].filter(Boolean).join("\n"),
  };
}

export function parseComparisonReply(reply) {
  if (!reply) return { intro: "", advantages: "", disadvantages: "", verdict: "" };

  const intro = reply
    .replace(/<advantages>[\s\S]*?<\/advantages>/g, "")
    .replace(/<disadvantages>[\s\S]*?<\/disadvantages>/g, "")
    .replace(/<verdict>[\s\S]*?<\/verdict>/g, "")
    .replace(/\*\*/g, "")
    .trim();

  const advMatch = reply.match(/<advantages>([\s\S]*?)<\/advantages>/);
  const disMatch = reply.match(/<disadvantages>([\s\S]*?)<\/disadvantages>/);
  const verMatch = reply.match(/<verdict>([\s\S]*?)<\/verdict>/);

  return {
    intro,
    advantages: advMatch ? advMatch[1].trim() : "",
    disadvantages: disMatch ? disMatch[1].trim() : "",
    verdict: verMatch ? verMatch[1].trim() : "",
  };
}
