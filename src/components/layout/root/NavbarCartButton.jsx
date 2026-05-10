import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "@/i18n/useTranslation";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleCartDrawer } from "@/store/uiSlice";
import { selectCartCount } from "@/store/cartSlice";

export default function NavbarCartButton() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const cartCount = useSelector(selectCartCount);

    return (
        <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full"
            onClick={() => dispatch(toggleCartDrawer(true))}
        >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[10px] font-medium text-background">
                    {cartCount > 99 ? "99+" : cartCount}
                </span>
            )}
            <span className="sr-only">{t("nav.cart")}</span>
        </Button>
    );
}
