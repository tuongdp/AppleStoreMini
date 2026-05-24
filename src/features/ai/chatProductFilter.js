const MAX_CHAT_PRODUCTS = 4;

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function productText(product) {
  return normalizeText(`${product?.name || ""} ${product?.category || ""} ${product?.slug || ""}`);
}

function productName(product) {
  return normalizeText(product?.name);
}

function extractBudget(message) {
  const text = normalizeText(message);
  const millionMatch = text.match(/\b(\d+(?:[.,]\d+)?)\s*(trieu|tr|m)\b/);
  if (millionMatch) return Math.round(Number(millionMatch[1].replace(",", ".")) * 1000000);

  const rawNumberMatch = text.match(/\b(\d{7,})\b/);
  return rawNumberMatch ? Number(rawNumberMatch[1]) : null;
}

function extractFamily(message) {
  const text = normalizeText(message);
  if (/\biphone\b/.test(text)) return "iphone";
  if (/\b(ipad)\b/.test(text)) return "ipad";
  if (/\b(macbook|mac)\b/.test(text)) return "macbook";
  if (/\b(airpods)\b/.test(text)) return "airpods";
  if (/\b(apple watch|watch)\b/.test(text)) return "watch";
  return "";
}

function extractExactModelQuery(message) {
  const text = normalizeText(message);
  const match = text.match(/\b(iphone|ipad|macbook|airpods|apple watch|watch)\s+(\d+[a-z]?|air|pro|ultra|se|m\d)(?:\s+(pro max|pro|plus|air|max|mini|ultra|se|m\d))*\b/);
  if (!match) return "";

  const start = match.index;
  const candidate = text.slice(start).split(/\b(?:duoi|tren|tam|gia|ngan sach|cho|de|can|nen|mua)\b/)[0].trim();
  return candidate.replace(/^watch\b/, "apple watch");
}

function hasAccessoryIntent(message) {
  return /\b(op lung|cap|cap sac|adapter|cu sac|sac|magsafe|case|day deo|phu kien)\b/.test(normalizeText(message));
}

function isAccessory(product) {
  return /\b(op lung|cap sac|adapter|cu sac|sac|earpods|case|magsafe|day deo|phu kien)\b/.test(productText(product));
}

function matchesFamily(product, family) {
  const text = productText(product);
  if (!family) return true;
  if (family === "watch") return /\b(apple watch|watch)\b/.test(text);
  return text.startsWith(`${family} `) || text.includes(` ${family} `);
}

function getPrice(product) {
  return Number(product?.price ?? product?.salePrice ?? product?.flashSale?.salePrice ?? 0);
}

function formatPrice(value) {
  const price = getPrice({ price: value });
  return price ? `${price.toLocaleString("vi-VN")}đ` : "liên hệ";
}

function scoreProduct(product, { exactModel, family, accessoryIntent, budget }) {
  let score = 0;

  const name = productName(product);
  if (exactModel && name === exactModel) score += 100;
  else if (exactModel && name.startsWith(`${exactModel} `)) score += 60;

  if (family && matchesFamily(product, family)) score += 20;
  if (accessoryIntent && isAccessory(product)) score += 40;
  if (!accessoryIntent && isAccessory(product)) score -= 40;

  const price = getPrice(product);
  if (budget && price > 0 && price <= budget) score += 10;
  if (budget && price > budget) score -= 100;
  if (Number(product?.stock ?? 1) > 0 || product?.inStock) score += 2;

  return score;
}

export function filterChatProductsByMessage(message, products) {
  if (!Array.isArray(products) || !products.length) return [];

  const intent = {
    exactModel: extractExactModelQuery(message),
    family: extractFamily(message),
    accessoryIntent: hasAccessoryIntent(message),
    budget: extractBudget(message),
  };

  let candidates = products;

  if (intent.exactModel && !intent.accessoryIntent) {
    const exactMatches = candidates.filter((product) => productName(product) === intent.exactModel);
    if (exactMatches.length) return exactMatches;
    candidates = candidates.filter((product) => productName(product).startsWith(`${intent.exactModel} `));
  }

  if (intent.family) {
    candidates = candidates.filter((product) => matchesFamily(product, intent.family));
  }

  if (intent.accessoryIntent) {
    candidates = candidates.filter(isAccessory);
  } else {
    candidates = candidates.filter((product) => !isAccessory(product));
  }

  if (intent.budget) {
    candidates = candidates.filter((product) => {
      const price = getPrice(product);
      return !price || price <= intent.budget;
    });
  }

  return candidates
    .map((product) => ({ product, score: scoreProduct(product, intent) }))
    .filter((item) => item.score > -20)
    .sort((a, b) => b.score - a.score || getPrice(a.product) - getPrice(b.product))
    .slice(0, MAX_CHAT_PRODUCTS)
    .map((item) => item.product);
}

export function buildFocusedChatReply(message, originalReply, products) {
  const exactModel = extractExactModelQuery(message);
  if (!exactModel || !Array.isArray(products) || products.length !== 1) {
    return originalReply;
  }

  const product = products[0];
  if (productName(product) !== exactModel) return originalReply;

  const stock = Number(product?.stock ?? 0);
  const stockText = stock > 0 ? `Hiện còn ${stock} sản phẩm.` : "";

  return [
    `Mình tìm thấy đúng sản phẩm bạn hỏi: ${product.name}.`,
    `Giá hiện tại: ${formatPrice(product.price)}.`,
    stockText,
    "Bạn có thể bấm vào sản phẩm bên dưới để xem chi tiết cấu hình, màu sắc và tùy chọn dung lượng.",
  ].filter(Boolean).join(" ");
}
