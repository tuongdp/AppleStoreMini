import { useDispatch, useSelector } from "react-redux";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { toggleCartDrawer } from "@/store/uiSlice";
import { selectCartCount } from "@/store/cartSlice";

export default function NavbarCartButton() {
    const dispatch = useDispatch();
    const cartCount = useSelector(selectCartCount);

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-full"
                    aria-label="Giỏ hàng"
                    onClick={() => dispatch(toggleCartDrawer(true))}
                >
                    <ShoppingCart className="h-5 w-5" />
                    {cartCount > 0 && (
                        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[10px] font-medium text-background">
                            {cartCount > 99 ? "99+" : cartCount}
                        </span>
                    )}
                    <span className="sr-only">{"Giỏ hàng"}</span>
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                {"Giỏ hàng"}
            </TooltipContent>
        </Tooltip>
    );
}
