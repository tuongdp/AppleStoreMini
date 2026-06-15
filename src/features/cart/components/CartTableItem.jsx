import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import QuantityInput from "@/components/shared/QuantityInput";
import PriceDisplay from "@/components/shared/PriceDisplay";
import { removeFromCart, updateQuantity, getEffectivePrice, toggleCartItemSelected } from "@/store/cartSlice";
import { selectIsAuthenticated } from "@/store/authSlice";
import { useRemoveFromCartMutation, useUpdateCartItemMutation } from "@/store/api/cartApi";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import ResponsiveImage from "@/components/shared/ResponsiveImage";
import { productPlaceholder } from "@/assets/images";
import { useRef, useCallback } from "react";

const getFirstImage = (images) => {
  if (!images) return null;
  if (Array.isArray(images)) return images[0];
  try { return JSON.parse(images)[0]; } catch { return null; }
};

export default function CartTableItem({ item, isLast }) {
  const variantId = item.variantId || item.product?.variantId;
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [removeFromServerCart] = useRemoveFromCartMutation();
  const [updateServerCartItem] = useUpdateCartItemMutation();

  const product = item.product || item.variant?.product;
  const variant = item.variant;
  const color = variant?.color || product?.color || "";
  const storage = variant?.storage || product?.storage || "";
  const ram = variant?.ram || product?.ram || "";
  const edition = variant?.edition || product?.edition || "";
  const refreshRate = variant?.refreshRate || product?.refreshRate || "";
  const ssd = variant?.ssd || product?.ssd || "";
  const isSelected = item.selected !== false;
  const availableStock = Number(variant?.inStock === false || product?.inStock === false ? 0 : (variant?.stock ?? product?.stock ?? 99));
  const effectiveMax = Math.max(1, availableStock);
  const hasStockIssue = item.quantity > availableStock;

  const timerRef = useRef(null);

  const handleRemove = async () => {
    dispatch(removeFromCart({ variantId }));
    if (isAuthenticated && variantId) {
      try {
        await removeFromServerCart({ variantId }).unwrap();
      } catch { /* noop */ }
    }
  };

  const handleUpdateQty = useCallback((quantity) => {
    dispatch(updateQuantity({ variantId, quantity }));
    if (isAuthenticated && variantId) {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        updateServerCartItem({ variantId, quantity });
      }, 300);
    }
  }, [dispatch, variantId, isAuthenticated, updateServerCartItem]);

  const handleExceedMax = useCallback(() => {
    toast.warning(`Chỉ còn ${availableStock} sản phẩm trong kho`);
  }, [availableStock]);

  const handleToggleSelected = (checked) => {
    dispatch(toggleCartItemSelected({ variantId, selected: Boolean(checked) }));
  };

  const effectivePrice = getEffectivePrice(product, variant);

  const firstImage = getFirstImage(product?.images || variant?.images);

  return (
    <div data-testid="cart-line-item" data-variant-id={variantId}>
      <div className="grid grid-cols-12 gap-4">
        {/* Image + Info */}
        <div className="col-span-12 flex gap-3 md:col-span-6">
          <Checkbox
            checked={isSelected}
            onCheckedChange={handleToggleSelected}
            className="mt-10"
            aria-label={`Chọn ${product?.name || "sản phẩm"} để thanh toán`}
            data-testid="cart-item-select"
          />
          <Link
            to={ROUTES.PRODUCT_DETAIL(product?.slug)}
            className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted/30 p-2 transition-opacity hover:opacity-80"
          >
            <ResponsiveImage
              src={firstImage}
              fallbackSrc={productPlaceholder}
              alt={product?.name}
              width={96}
              height={96}
              className="h-full w-full object-contain"
            />
          </Link>
          <div className="min-w-0 flex flex-col justify-center">
            <Link
              to={ROUTES.PRODUCT_DETAIL(product?.slug)}
              className="line-clamp-2 text-sm font-medium text-foreground hover:text-apple-blue"
            >
              {product?.name}
            </Link>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {[color && `${"Màu"}: ${color}`, storage && `${"Dung lượng"}: ${storage}`, ram && `${"RAM"}: ${ram}`, edition && `${"Phiên bản"}: ${edition}`, refreshRate && `${"Tần số quét"}: ${refreshRate}`, ssd && `${"SSD"}: ${ssd}`].filter(Boolean).join(" · ")}
            </p>
            <button
              onClick={handleRemove}
              className="mt-2 flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive md:hidden"
              aria-label={`Xoá ${product?.name || "sản phẩm"} khỏi giỏ hàng`}
              data-testid="cart-remove-mobile"
            >
              <Trash2 className="h-3 w-3" aria-hidden="true" />
              {"Xoá"}
            </button>
            {hasStockIssue && (
              <p className="mt-2 text-xs font-medium text-destructive" data-testid="cart-stock-warning">
                {`Sản phẩm không đủ số lượng. Hiện cửa hàng còn ${availableStock} sản phẩm.`}
              </p>
            )}
          </div>
        </div>

        {/* Unit price — desktop */}
        <div className="col-span-2 hidden items-center justify-center md:flex">
          <PriceDisplay
            price={product?.price || variant?.price}
            salePrice={effectivePrice}
            size="sm"
          />
        </div>

        {/* Quantity */}
        <div className="col-span-7 flex flex-col items-center md:col-span-2 md:justify-center">
          <QuantityInput
            value={item.quantity}
            min={1}
            max={effectiveMax}
            size="sm"
            onChange={handleUpdateQty}
            onExceedMax={handleExceedMax}
          />
          {(availableStock <= 5 || hasStockIssue) && (
            <p className={cn("mt-1 text-center text-xs", hasStockIssue ? "font-medium text-destructive" : "text-muted-foreground")}>
              {hasStockIssue
                ? `Không đủ — còn ${availableStock}`
                : `Còn ${availableStock}`}
            </p>
          )}
        </div>

        {/* Total */}
        <div className="col-span-5 flex items-center justify-end gap-3 md:col-span-2">
          <PriceDisplay price={effectivePrice * item.quantity} size="sm" />
          <button
            onClick={handleRemove}
            className="hidden text-muted-foreground transition-colors hover:text-destructive md:block"
            aria-label={`Xoá ${product?.name || "sản phẩm"} khỏi giỏ hàng`}
            data-testid="cart-remove"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {!isLast && <Separator className="mt-6" />}
    </div>
  );
}
