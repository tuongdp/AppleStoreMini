export const parseProduct = (p) => ({
    ...p,
    images:
        typeof p.images === "string" ? JSON.parse(p.images) : (p.images ?? []),
    specifications:
        typeof p.specifications === "string"
            ? JSON.parse(p.specifications)
            : (p.specifications ?? {}),
});
