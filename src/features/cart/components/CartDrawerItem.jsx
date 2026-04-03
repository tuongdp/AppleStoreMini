import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import QuantityInput from "@/components/shared/QuantityInput";
import PriceDisplay from "@/components/shared/PriceDisplay";
import { removeFromCart, updateQuantity } from "@/store/cartSlice";
import { ROUTES } from "@/lib/constants";
import { Link } from "react-router-dom";

// ✅ images có thể là JSON string (MySQL) hoặc array (đã parse)
const getFirstImage = (images) => {
  if (!images) return null;
  if (Array.isArray(images)) return images[0];
  try {
    return JSON.parse(images)[0];
  } catch {
    return null;
  }
};

export default function CartDrawerItem({ item }) {
  const { t } = useTranslation("cart");
  const dispatch = useDispatch();

  // ✅ MySQL integer id thuần
  const productId = item.product.id;

  const handleRemove = () => {
    dispatch(
      removeFromCart({
        productId,
        selectedColor: item.selectedColor,
        selectedStorage: item.selectedStorage,
      }),
    );
  };

  const handleUpdateQty = (quantity) => {
    dispatch(
      updateQuantity({
        productId,
        selectedColor: item.selectedColor,
        selectedStorage: item.selectedStorage,
        quantity,
      }),
    );
  };

  const effectivePrice =
    item.product.salePrice && item.product.salePrice < item.product.price
      ? item.product.salePrice
      : item.product.price;

  const firstImage = getFirstImage(item.product.images);

  return (
    <div className="flex gap-4">
      <Link
        to={ROUTES.PRODUCT_DETAIL(item.product.slug)}
        className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted/30 p-2 transition-opacity hover:opacity-80"
      >
        <img
          src={firstImage}
          alt={item.product.name}
          className="h-full w-full object-contain"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              to={ROUTES.PRODUCT_DETAIL(item.product.slug)}
              className="truncate text-sm font-medium text-foreground hover:text-apple-blue"
            >
              {item.product.name}
            </Link>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {item.selectedColor && <span>{item.selectedColor}</span>}
              {item.selectedColor && item.selectedStorage && <span> · </span>}
              {item.selectedStorage && <span>{item.selectedStorage}</span>}
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
            onClick={handleRemove}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <PriceDisplay
            price={effectivePrice}
            originalPrice={item.product.originalPrice}
            size="sm"
          />
          <QuantityInput
            value={item.quantity}
            min={1}
            max={item.product.stock || 99}
            size="sm"
            onChange={handleUpdateQty}
          />
        </div>
      </div>
    </div>
  );
}
