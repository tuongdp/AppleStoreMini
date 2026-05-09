import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import PriceDisplay from "@/components/shared/PriceDisplay";
import { ROUTES } from "@/lib/constants";

export default function OrderItemRow({ item, isLast }) {
    const unitPrice = item.price ?? item.product?.price ?? 0;
    const lineTotal = unitPrice * item.quantity;
    const product = item.product || item.variant?.product;
    const color = item.color || item.selectedColor || item.variant?.color || "";
    const storage = item.storage || item.selectedStorage || item.variant?.storage || "";

    return (
        <div>
            <div className="flex gap-4">
                {/* Image */}
                <Link
                    to={product?.slug ? ROUTES.PRODUCT_DETAIL(product.slug) : "#"}
                    className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted/30 p-1.5 transition-opacity hover:opacity-80"
                >
                    <img
                        src={product?.images?.[0] || item.image || product?.image}
                        alt={product?.name}
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
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        {color && <span>{color}</span>}
                        {color && storage && <span> · </span>}
                        {storage && <span>{storage}</span>}
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
