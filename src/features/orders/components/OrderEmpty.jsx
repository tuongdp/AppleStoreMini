import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

export default function OrderEmpty() {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            {/* Icon */}
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <ShoppingBag className="h-9 w-9 text-muted-foreground" />
            </div>

            {/* Text */}
            <h3 className="mb-2 text-base font-medium text-foreground">
                {"Chưa có đơn hàng nào"}
            </h3>
            <p className="mb-8 max-w-xs text-sm text-muted-foreground">
                {"Hãy mua sắm và đơn hàng sẽ xuất hiện ở đây"}
            </p>

            {/* CTA */}
            <Button className="rounded-full px-8" asChild>
                <Link to={ROUTES.PRODUCTS}>
                    {"Tiếp tục mua sắm"}
                </Link>
            </Button>
        </div>
    );
}
