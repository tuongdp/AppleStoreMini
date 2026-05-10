import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useTranslation } from "@/i18n/useTranslation";
import { Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import QuantityInput from "@/components/shared/QuantityInput";
import PriceDisplay from "@/components/shared/PriceDisplay";
import { removeFromCart, updateQuantity, getEffectivePrice } from "@/store/cartSlice";
import { ROUTES } from "@/lib/constants";

const getFirstImage = (images) => {
  if (!images) return null;
  if (Array.isArray(images)) return images[0];
  try { return JSON.parse(images)[0]; } catch { return null; }
};

export default function CartTableItem({ item, isLast }) {
  const variantId = item.variantId || item.product?.variantId;
  const { t } = useTranslation("cart");
  const dispatch = useDispatch();

  const product = item.product || item.variant?.product;
  const variant = item.variant;
  const color = variant?.color || product?.color || "";
  const storage = variant?.storage || product?.storage || "";
  const ram = variant?.ram || product?.ram || "";
  const edition = variant?.edition || product?.edition || "";

  const handleRemove = () => {
    dispatch(removeFromCart({ variantId }));
  };

  const handleUpdateQty = (quantity) => {
    dispatch(updateQuantity({ variantId, quantity }));
  };

  const effectivePrice = getEffectivePrice(product, variant);

  const firstImage = getFirstImage(product?.images);

  return (
    <div>
      <div className="grid grid-cols-12 gap-4">
        {/* Image + Info */}
        <div className="col-span-12 flex gap-4 md:col-span-6">
          <Link
            to={ROUTES.PRODUCT_DETAIL(product?.slug)}
            className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted/30 p-2 transition-opacity hover:opacity-80"
          >
            <img
              src={firstImage}
              alt={product?.name}
              className="h-full w-full object-contain"
            />
          </Link>
          <div className="min-w-0 flex-1">
            <Link
              to={ROUTES.PRODUCT_DETAIL(product?.slug)}
              className="line-clamp-2 text-sm font-medium text-foreground hover:text-apple-blue"
            >
              {product?.name}
            </Link>
            <p className="mt-1 text-xs text-muted-foreground">
              {[color && `${t("item.color")}: ${color}`, storage && `${t("item.storage")}: ${storage}`, ram && `${t("item.ram")}: ${ram}`, edition && `${t("item.edition")}: ${edition}`].filter(Boolean).join(" · ")}
            </p>
            <button
              onClick={handleRemove}
              className="mt-2 flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive md:hidden"
            >
              <Trash2 className="h-3 w-3" />
              {t("item.remove")}
            </button>
          </div>
        </div>

        {/* Unit price — desktop */}
        <div className="col-span-2 hidden items-center justify-center md:flex">
          <PriceDisplay
            price={product?.price}
            salePrice={effectivePrice}
            size="sm"
          />
        </div>

        {/* Quantity */}
        <div className="col-span-7 flex items-center md:col-span-2 md:justify-center">
          <QuantityInput
            value={item.quantity}
            min={1}
            max={variant?.stock || product?.stock || 99}
            size="sm"
            onChange={handleUpdateQty}
          />
        </div>

        {/* Total */}
        <div className="col-span-5 flex items-center justify-end gap-3 md:col-span-2">
          <PriceDisplay price={effectivePrice * item.quantity} size="sm" />
          <button
            onClick={handleRemove}
            className="hidden text-muted-foreground transition-colors hover:text-destructive md:block"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!isLast && <Separator className="mt-6" />}
    </div>
  );
}
