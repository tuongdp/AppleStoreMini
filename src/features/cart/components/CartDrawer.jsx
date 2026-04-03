import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { ShoppingBag } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import CartDrawerItem from "./CartDrawerItem";
import CartDrawerSummary from "./CartDrawerSummary";
import CartEmpty from "./CartEmpty";
import { selectCartItems, selectCartCount } from "@/store/cartSlice";
import { toggleCartDrawer, selectCartDrawerOpen } from "@/store/uiSlice";

export default function CartDrawer() {
  const { t } = useTranslation("cart");
  const dispatch = useDispatch();
  const isOpen = useSelector(selectCartDrawerOpen);
  const items = useSelector(selectCartItems);
  const count = useSelector(selectCartCount);

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => dispatch(toggleCartDrawer(open))}
    >
      <SheetContent className="flex w-full flex-col p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-6 py-4">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            {t("drawer.title")}
            {count > 0 && (
              <span className="ml-1 rounded-full bg-foreground px-2 py-0.5 text-xs text-background">
                {count}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <CartEmpty />
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => (
                <div
                  // ✅ MySQL integer id — không có _id
                  key={`${item.product.id}-${item.selectedColor}-${item.selectedStorage}`}
                >
                  <CartDrawerItem item={item} />
                  {index < items.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && <CartDrawerSummary />}
      </SheetContent>
    </Sheet>
  );
}
