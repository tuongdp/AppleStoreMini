import { useDispatch, useSelector } from "react-redux";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import QuantityInput from "@/components/shared/QuantityInput";
import PriceDisplay from "@/components/shared/PriceDisplay";
import { removeFromCart, updateQuantity, getEffectivePrice, toggleCartItemSelected } from "@/store/cartSlice";
import { selectIsAuthenticated } from "@/store/authSlice";
import { useRemoveFromCartMutation, useUpdateCartItemMutation } from "@/store/api/cartApi";
import { ROUTES } from "@/lib/constants";
import { Link } from "react-router-dom";
import ResponsiveImage from "@/components/shared/ResponsiveImage";
import { productPlaceholder } from "@/assets/images";

const getFirstImage = (images) => {
  if (!images) return null;
  if (Array.isArray(images)) return images[0];
  try { return JSON.parse(images)[0]; } catch { return null; }
};

export default function CartDrawerItem({ item }) {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [removeFromServerCart] = useRemoveFromCartMutation();
  const [updateServerCartItem] = useUpdateCartItemMutation();
  const variantId = item.variantId || item.product?.variantId;

  const product = item.product || item.variant?.product;
  const variant = item.variant;
  const color = variant?.color || product?.color || "";
  const storage = variant?.storage || product?.storage || "";
  const ram = variant?.ram || product?.ram || "";
  const edition = variant?.edition || product?.edition || "";

  const isSelected = item.selected !== false;

  const handleRemove = async () => {
    dispatch(removeFromCart({ variantId }));
    if (isAuthenticated && variantId) {
      try {
        await removeFromServerCart({ variantId }).unwrap();
      } catch { /* noop */ }
    }
  };

  const handleUpdateQty = async (quantity) => {
    dispatch(updateQuantity({ variantId, quantity }));
    if (isAuthenticated && variantId) {
      try {
        await updateServerCartItem({ variantId, quantity }).unwrap();
      } catch { /* noop */ }
    }
  };

  const handleToggleSelected = (checked) => {
    dispatch(toggleCartItemSelected({ variantId, selected: Boolean(checked) }));
  };

  const effectivePrice = getEffectivePrice(product, variant);

  const firstImage = getFirstImage(product?.images || variant?.images);

  return (
    <div className="flex gap-4">
      <Checkbox
        checked={isSelected}
        onCheckedChange={handleToggleSelected}
        className="mt-1 shrink-0"
        aria-label={`Chọn ${product?.name || "sản phẩm"} để thanh toán`}
      />
      <Link
        to={ROUTES.PRODUCT_DETAIL(product?.slug)}
        className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted/30 p-2 transition-opacity hover:opacity-80"
      >
        <ResponsiveImage
          src={firstImage}
          fallbackSrc={productPlaceholder}
          alt={product?.name}
          width={80}
          height={80}
          className="h-full w-full object-contain"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              to={ROUTES.PRODUCT_DETAIL(product?.slug)}
              className="block truncate text-sm font-medium text-foreground hover:text-apple-blue"
            >
              {product?.name}
            </Link>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {[color, storage, ram, edition].filter(Boolean).join(" · ")}
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
            onClick={handleRemove}
            aria-label={`Xoá ${product?.name || "sản phẩm"} khỏi giỏ hàng`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <PriceDisplay
            price={product?.price}
            salePrice={effectivePrice}
            size="sm"
          />
          <QuantityInput
            value={item.quantity}
            min={1}
            max={variant?.stock || product?.stock || 99}
            size="sm"
            onChange={handleUpdateQty}
          />
        </div>
      </div>
    </div>
  );
}
