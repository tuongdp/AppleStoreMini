const MARKETING_BADGE_DAYS = 30;
const DAY_IN_MS = 1000 * 60 * 60 * 24;

export const PRODUCT_MARKETING_BADGE_TYPES = {
  NEW_RELEASE: "NEW_RELEASE",
  RESTOCK: "RESTOCK",
};

const PRODUCT_MARKETING_BADGES = {
  [PRODUCT_MARKETING_BADGE_TYPES.NEW_RELEASE]: {
    label: "Mới ra mắt",
    tone: "new-release",
    title: "Sản phẩm mới được Apple công bố",
  },
  [PRODUCT_MARKETING_BADGE_TYPES.RESTOCK]: {
    label: "Mới nhập về",
    tone: "restock",
    title: "Hàng chính hãng mới 100%, vừa được nhập lại",
  },
};

export function getProductMarketingBadge(product, now = new Date()) {
  if (!product?.arrivalType || !product?.arrivalDate) return null;
  if (product.inStock === false || Number(product.stock) <= 0) return null;

  const badge = PRODUCT_MARKETING_BADGES[product.arrivalType];
  if (!badge) return null;

  const arrivalTime = new Date(product.arrivalDate).getTime();
  if (Number.isNaN(arrivalTime)) return null;

  const ageInDays = (now.getTime() - arrivalTime) / DAY_IN_MS;
  if (ageInDays < 0 || ageInDays > MARKETING_BADGE_DAYS) return null;

  return badge;
}

export function getProductMarketingBadgeClassName(tone) {
  if (tone === "new-release") {
    return "border-0 bg-foreground text-background hover:bg-foreground/90";
  }

  if (tone === "restock") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300";
  }

  return "";
}
