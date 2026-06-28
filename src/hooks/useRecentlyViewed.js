const STORAGE_KEY = "app-recently-viewed";
const MAX_ITEMS = 10;

export function useRecentlyViewed() {
    const getItems = () => {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        } catch {
            return [];
        }
    };

    const addItem = (product) => {
        if (!product?.id || !product?.slug) return;
        const items = getItems().filter((p) => p.id !== product.id);
        items.unshift({
            id: product.id,
            name: product.name,
            slug: product.slug,
            image: product.image || null,
            price: product.price,
            salePrice: product.salePrice ?? null,
            rating: product.rating || 0,
            reviewCount: product.reviewCount || 0,
            soldCount: product.soldCount || 0,
            variantId: product.variantId || product.id,
            stock: product.stock ?? null,
            color: product.color || "",
            storage: product.storage || "",
            viewCount: product.viewCount || 0,
            viewedAt: Date.now(),
        });
        if (items.length > MAX_ITEMS) items.length = MAX_ITEMS;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        } catch { /* storage full, ignore */ }
    };

    return { getItems, addItem };
}
