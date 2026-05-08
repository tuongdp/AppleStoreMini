import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import PriceDisplay from "@/components/shared/PriceDisplay";
import { ROUTES } from "@/lib/constants";

export default function OrderItemRow({ item, isLast }) {


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
                        src={item.product?.images?.[0] || item.product?.image}
                        alt={item.product?.name}
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
                        {item.product?.name}
                    </Link>

                    {/* Variant */}
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        {item.selectedColor && (
                            <span>{item.selectedColor}</span>
                        )}
                        {item.selectedColor && item.selectedStorage && (
                            <span> · </span>
                        )}
                        {item.selectedStorage && (
                            <span>{item.selectedStorage}</span>
                        )}
                    </p>

                    {/* Price + Qty + Total */}
                    <div className="mt-1.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <PriceDisplay
                                price={item.price || item.product?.price}
                                size="sm"
                            />
                            <span className="text-xs text-muted-foreground">
                                × {item.quantity}
                            </span>
                        </div>
                        <PriceDisplay
                            price={
                                (item.price || item.product?.price) *
                                item.quantity
                            }
                            size="sm"
                        />
                    </div>
                </div>
            </div>

            {!isLast && <Separator className="mt-4" />}
        </div>
    );
}
