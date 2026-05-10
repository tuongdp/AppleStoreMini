import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ROUTES } from "@/lib/constants";

export default function CartEmpty() {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <ShoppingCart className="h-9 w-9 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-base font-medium text-foreground">
                {"Giỏ hàng trống"}
            </h3>
            <p className="mb-8 max-w-xs text-sm text-muted-foreground">
                {"Hãy thêm sản phẩm vào giỏ hàng của bạn"}
            </p>
            <Button className="rounded-full px-8" asChild>
                <Link to={ROUTES.PRODUCTS}>{"Tiếp tục mua sắm"}</Link>
            </Button>
        </div>
    );
}
