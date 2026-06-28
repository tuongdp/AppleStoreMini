import { useMemo } from "react";
import ProductSlider from "@/components/shared/ProductSlider";
import SectionTitle from "@/components/shared/SectionTitle";

const STORAGE_KEY = "app-recently-viewed";

export default function RecentlyViewed() {
    const items = useMemo(() => {
        try {
            const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
            if (!Array.isArray(raw) || raw.length === 0) return [];
            // Migrate old data: remove items missing new fields
            const cleaned = raw.filter((item) => typeof item.price === "number");
            if (cleaned.length !== raw.length) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
            }
            return cleaned;
        } catch {
            return [];
        }
    }, []);

    if (!items.length) return null;

    const products = items.map((item) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        price: item.price,
        salePrice: item.salePrice ?? null,
        image: item.image,
        images: item.image ? [item.image] : [],
        rating: item.rating || 0,
        reviewCount: item.reviewCount || 0,
        soldCount: item.soldCount || 0,
        variantId: item.variantId || item.id,
        stock: item.stock ?? null,
        color: item.color || "",
        storage: item.storage || "",
        viewCount: item.viewCount || 0,
    }));

    return (
        <section className="section-padding">
            <div className="mb-4">
                <SectionTitle title="Đã xem gần đây" viewAllHref="/products" />
            </div>
            <ProductSlider products={products} sliderId="recently-viewed" />
        </section>
    );
}
