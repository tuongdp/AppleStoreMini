// export const parseProduct = (p) => ({
//     ...p,
//     images:
//         typeof p.images === "string" ? JSON.parse(p.images) : (p.images ?? []),
//     specifications:
//         typeof p.specifications === "string"
//             ? JSON.parse(p.specifications)
//             : (p.specifications ?? {}),
// });

const safeJson = (val, fallback) => {
  if (val === null || val === undefined) return fallback;
  if (Array.isArray(val) || typeof val === "object") return val;
  if (typeof val === "string") {
    try {
      return JSON.parse(val);
    } catch {
      return fallback;
    }
  }
  return fallback;
};

export const parseProduct = (p) => ({
  ...p,
  images: safeJson(p.images, []),
  specifications: safeJson(p.specifications, []),
});
