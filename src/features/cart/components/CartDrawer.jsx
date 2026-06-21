import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ShoppingBag } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import CartDrawerItem from "./CartDrawerItem";
import CartDrawerSummary from "./CartDrawerSummary";
import CartEmpty from "./CartEmpty";
import GuestCartWarning from "./GuestCartWarning";
import { selectCartItems, selectCartCount, selectAllCartItems, isCartItemSelected } from "@/store/cartSlice";
import { selectIsAuthenticated } from "@/store/authSlice";
import { toggleCartDrawer, selectCartDrawerOpen } from "@/store/uiSlice";

const isItemActive = (item) => {
  if (item.variant?.isActive === false) return false;
  if (item.variant?.product?.isActive === false) return false;
  if (item.product?.isActive === false) return false;
  return true;
};

export default function CartDrawer() {
  const dispatch = useDispatch();
  const isOpen = useSelector(selectCartDrawerOpen);
  const rawItems = useSelector(selectCartItems);
  const count = useSelector(selectCartCount);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const items = useMemo(() => rawItems.filter(isItemActive), [rawItems]);

  const allSelected = items.length > 0 && items.every(isCartItemSelected);
  const someSelected = items.some(isCartItemSelected);

  const handleSelectAll = (checked) => {
    dispatch(selectAllCartItems(Boolean(checked)));
  };

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => dispatch(toggleCartDrawer(open))}
    >
      <SheetContent className="flex w-full flex-col p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-6 py-4">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" aria-hidden="true" />
            {"Giỏ hàng của bạn"}
            {count > 0 && (
              <span className="ml-1 rounded-full bg-foreground px-2 py-0.5 text-xs text-background">
                {count}
              </span>
            )}
          </SheetTitle>
          {items.length > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <Checkbox
                checked={someSelected && !allSelected ? "indeterminate" : allSelected}
                onCheckedChange={handleSelectAll}
                aria-label="Chọn tất cả sản phẩm"
              />
              <span className="text-xs text-muted-foreground">
                {"Chọn tất cả"}
              </span>
            </div>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4">
          {items.length === 0 ? (
            <CartEmpty />
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={item.variantId || `${item.product?.id}-${index}`}
                >
                  <CartDrawerItem item={item} />
                  {index < items.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && !isAuthenticated && (
          <GuestCartWarning />
        )}
        {items.length > 0 && <CartDrawerSummary />}
      </SheetContent>
    </Sheet>
  );
}
