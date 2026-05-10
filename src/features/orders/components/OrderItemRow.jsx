import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import PriceDisplay from "@/components/shared/PriceDisplay";
import { ROUTES } from "@/lib/constants";
import { parseJsonField } from "@/lib/utils";

export default function OrderItemRow({ item, isLast }) {
    const images = parseJsonField(item.product?.images) || parseJsonField(item.images);
    const firstImage = images?.[0] || item.product?.image || item.image;
    const productName = item.product?.name || item.name;
    const color = item.color || item.selectedColor || item.variant?.color || "";
    const storage = item.storage || item.selectedStorage || item.variant?.storage || "";
    const ram = item.ram || item.selectedRam || item.variant?.ram || "";
    const edition = item.edition || item.selectedEdition || item.variant?.edition || "";

    return (
        <div>
            <div className="flex gap-4">
                {/* Image */}
                <Link
                    to={
                        item.product?.slug
                            ? ROUTES.PRODUCT_DETAIL(item.product.slug)
                            : "#"
                    }
                    className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted/30 p-1.5 transition-opacity hover:opacity-80"
                >
                    <img
                        src={firstImage}
                        alt={productName}
                        className="h-full w-full object-contain"
                    />
                </Link>

                {/* Info */}
                <div className="min-w-0 flex-1">
                    <Link
                        to={
                            item.product?.slug
                                ? ROUTES.PRODUCT_DETAIL(item.product.slug)
                                : "#"
                        }
                        className="truncate text-sm font-medium text-foreground hover:text-apple-blue"
                    >
                        {item.product?.name || item.name}
                    </Link>

                    {/* Variant */}
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        {[color, storage, ram, edition].filter(Boolean).join(" · ")}
                    </p>

                    {/* Price + Qty + Total */}
                    <div className="mt-1.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <PriceDisplay
                                price={item.price || item.product?.price || 0}
                                size="sm"
                            />
                            <span className="text-xs text-muted-foreground">
                                × {item.quantity}
                            </span>
                        </div>
                        <PriceDisplay
                            price={(item.price || item.product?.price || 0) * item.quantity}
                            size="sm"
                        />
                    </div>
                </div>
            </div>

            {!isLast && <Separator className="mt-4" />}
        </div>
    );
}
