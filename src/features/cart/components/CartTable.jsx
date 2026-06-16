import { useDispatch, useSelector } from "react-redux";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import CartTableItem from "./CartTableItem";
import CartEmpty from "./CartEmpty";
import { selectCartItems, clearCart, selectAllCartItems, isCartItemSelected } from "@/store/cartSlice";
import { selectIsAuthenticated } from "@/store/authSlice";
import { useClearServerCartMutation } from "@/store/api/cartApi";

export default function CartTable() {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [clearServerCart] = useClearServerCartMutation();

  const allSelected = items.length > 0 && items.every(isCartItemSelected);
  const someSelected = items.some(isCartItemSelected);

  const handleSelectAll = (checked) => {
    dispatch(selectAllCartItems(Boolean(checked)));
  };

  const handleClearCart = async () => {
    dispatch(clearCart());
    if (isAuthenticated) {
      try {
        await clearServerCart().unwrap();
      } catch { /* noop */ }
    }
  };

  if (items.length === 0) return <CartEmpty />;

  return (
    <div className="min-w-0 flex-1">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={someSelected && !allSelected ? "indeterminate" : allSelected}
            onCheckedChange={handleSelectAll}
            aria-label="Chọn tất cả sản phẩm"
          />
          <span className="text-xs font-medium text-muted-foreground">
            {"Chọn tất cả"}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-destructive"
          onClick={handleClearCart}
        >
          <Trash2 className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
          {"Xóa giỏ hàng"}
        </Button>
      </div>

      <div className="max-h-[60vh] space-y-6 overflow-y-auto pr-2">
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
