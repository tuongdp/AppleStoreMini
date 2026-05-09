import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import CartTableItem from "./CartTableItem";
import CartEmpty from "./CartEmpty";
import { selectCartItems, clearCart } from "@/store/cartSlice";

export default function CartTable() {
  const { t } = useTranslation("cart");
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);

  if (items.length === 0) return <CartEmpty />;

  return (
    <div className="min-w-0 flex-1">
      <div className="mb-4 flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-destructive"
          onClick={() => dispatch(clearCart())}
        >
          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
          {t("clearCart", { defaultValue: "Xóa giỏ hàng" })}
        </Button>
      </div>

      <div className="mb-3 hidden grid-cols-12 gap-4 text-xs font-medium uppercase tracking-wider text-muted-foreground md:grid">
        <div className="col-span-6">{t("item.product")}</div>
        <div className="col-span-2 text-center">{t("item.price")}</div>
        <div className="col-span-2 text-center">{t("item.quantity")}</div>
        <div className="col-span-2 text-right">{t("item.total")}</div>
      </div>

      <Separator className="mb-4" />

      <div className="space-y-6">
        {items.map((item, index) => {
          const variantId = item.variantId || item.product?.variantId;
          return (
            <CartTableItem
              key={variantId || index}
              item={item}
              index={index}
              isLast={index === items.length - 1}
            />
          );
        })}
      </div>
    </div>
  );
}
