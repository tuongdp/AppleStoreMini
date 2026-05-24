function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function extractExactModelQuery(message) {
  const normalized = normalizeText(message);
  const match = normalized.match(/\b(iphone|ipad|macbook|airpods|apple watch)\s+(\d+[a-z]?)(?:\s+(pro max|pro|plus|air|max|mini))?\b/);
  if (!match) return "";

  return [match[1], match[2], match[3]].filter(Boolean).join(" ");
}

function isAccessory(product) {
  const text = normalizeText(`${product?.name} ${product?.category || ""}`);
  return /\b(op lung|cap sac|adapter|sac|cu sac|earpods|case|magsafe|day deo)\b/.test(text);
}

export function filterChatProductsByMessage(message, products) {
  if (!Array.isArray(products) || !products.length) return [];

  const exactModel = extractExactModelQuery(message);
  if (exactModel) {
    const exactMatches = products.filter((product) => normalizeText(product?.name) === exactModel);
    if (exactMatches.length) return exactMatches;

    return products.filter((product) => normalizeText(product?.name).startsWith(`${exactModel} `));
  }

  const normalizedMessage = normalizeText(message);
  if (/\biphone\b/.test(normalizedMessage)) {
    return products.filter((product) => normalizeText(product?.name).startsWith("iphone ") && !isAccessory(product));
  }

  return products.filter((product) => !isAccessory(product));
}
