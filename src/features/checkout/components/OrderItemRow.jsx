import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import PriceDisplay from "@/components/shared/PriceDisplay";
import { getEffectivePrice } from "@/store/cartSlice";
import { ROUTES } from "@/lib/constants";
import { parseJsonField } from "@/lib/utils";
import ResponsiveImage from "@/components/shared/ResponsiveImage";
import { productPlaceholder } from "@/assets/images";

export default function OrderItemRow({ item, isLast }) {
    const product = item.product || item.variant?.product;
    const variant = item.variant;
    const unitPrice = getEffectivePrice(product, variant);
    const lineTotal = unitPrice * item.quantity;
    const images = parseJsonField(product?.images);
    const firstImage = images?.[0] || product?.image || item.image;
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
                    to={product?.slug ? ROUTES.PRODUCT_DETAIL(product.slug) : "#"}
                    className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted/30 p-1.5 transition-opacity hover:opacity-80"
                >
                    <ResponsiveImage
                        src={firstImage}
                        fallbackSrc={productPlaceholder}
                        alt={product?.name}
                        width={64}
                        height={64}
                        className="h-full w-full object-contain"
                    />
                </Link>

                {/* Info */}
                <div className="min-w-0 flex-1">
                    <Link
                        to={product?.slug ? ROUTES.PRODUCT_DETAIL(product.slug) : "#"}
                        className="truncate text-sm font-medium text-foreground hover:text-apple-blue"
                    >
                        {product?.name || item.name}
                    </Link>

                    {/* Variant */}
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {[color, storage, ram, edition, refreshRate, ssd].filter(Boolean).join(" · ")}
                    </p>

                    {/* Price + Qty */}
                    <div className="mt-1.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <PriceDisplay price={unitPrice} size="sm" />
                            <span className="text-xs text-muted-foreground">
                                × {item.quantity}
                            </span>
                        </div>
                        <PriceDisplay price={lineTotal} size="sm" />
                    </div>
                </div>
            </div>

            {!isLast && <Separator className="mt-4" />}
        </div>
    );
}
