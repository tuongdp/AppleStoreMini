export const parseProduct = (p) => ({
    ...p,
    images:
        typeof p.images === "string" ? JSON.parse(p.images) : (p.images ?? []),
    colors:
        typeof p.colors === "string" ? JSON.parse(p.colors) : (p.colors ?? []),
    storage:
        typeof p.storage === "string"
            ? JSON.parse(p.storage)
            : (p.storage ?? []),
    specifications:
        typeof p.specifications === "string"
            ? JSON.parse(p.specifications)
            : (p.specifications ?? {}),
});
