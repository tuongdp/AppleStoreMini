import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import PriceDisplay from "@/components/shared/PriceDisplay";
import { ROUTES } from "@/lib/constants";
import { parseJsonField } from "@/lib/utils";
import ResponsiveImage from "@/components/shared/ResponsiveImage";
import { productPlaceholder } from "@/assets/images";

const getFirstImage = (...sources) => {
    for (const source of sources) {
        const images = parseJsonField(source);
        if (Array.isArray(images) && images[0]) return images[0];
        if (typeof source === "string" && source.trim()) return source;
    }
    return "";
};

export default function OrderItemRow({ item, isLast }) {
    const product = item.product || item.variant?.product;
    const firstImage = getFirstImage(
        item.variant?.images,
        item.images,
        item.image,
        product?.images,
        product?.image,
    );
    const productName = product?.name || item.name;
    const color = item.color || item.selectedColor || item.variant?.color || "";
    const storage = item.storage || item.selectedStorage || item.variant?.storage || "";
    const ram = item.ram || item.selectedRam || item.variant?.ram || "";
    const edition = item.edition || item.selectedEdition || item.variant?.edition || "";
    const refreshRate = item.refreshRate || item.variant?.refreshRate || "";
    const ssd = item.ssd || item.variant?.ssd || "";

    return (
        <div>
            <div className="flex gap-4">
                {/* Image */}
                <Link
                    to={
                        product?.slug
                            ? ROUTES.PRODUCT_DETAIL(product.slug)
                            : "#"
                    }
                    className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted/30 p-1.5 transition-opacity hover:opacity-80"
                >
                    <ResponsiveImage
                        src={firstImage}
                        fallbackSrc={productPlaceholder}
                        alt={productName}
                        width={64}
                        height={64}
                        className="h-full w-full object-contain"
                    />
                </Link>

                {/* Info */}
                <div className="min-w-0 flex-1">
                    <Link
                        to={
                            product?.slug
                                ? ROUTES.PRODUCT_DETAIL(product.slug)
                                : "#"
                        }
                        className="truncate text-sm font-medium text-foreground hover:text-apple-blue"
                    >
                        {productName}
                    </Link>

                    {/* Variant */}
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {[color, storage, ram, edition, refreshRate, ssd].filter(Boolean).join(" · ")}
                    </p>

                    {/* Price + Qty + Total */}
                    <div className="mt-1.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <PriceDisplay
                                price={item.price || product?.price || 0}
                                size="sm"
                            />
                            <span className="text-xs text-muted-foreground">
                                × {item.quantity}
                            </span>
                        </div>
                        <PriceDisplay
                            price={(item.price || product?.price || 0) * item.quantity}
                            size="sm"
                        />
                    </div>
                </div>
            </div>

            {!isLast && <Separator className="mt-4" />}
        </div>
    );
}
