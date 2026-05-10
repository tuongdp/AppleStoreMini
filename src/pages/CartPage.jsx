import { useTranslation } from "@/i18n/useTranslation";
import { useSelector } from "react-redux";
import Breadcrumb from "@/components/shared/Breadcrumb";
import CartTable from "@/features/cart/components/CartTable";
import CartSummaryCard from "@/features/cart/components/CartSummaryCard";
import CartEmpty from "@/features/cart/components/CartEmpty";
import { selectCartItems, selectCartCount } from "@/store/cartSlice";

export default function CartPage() {
    const { t } = useTranslation("cart");
    const items = useSelector(selectCartItems);
    const count = useSelector(selectCartCount);

    return (
        <div className="section-padding py-8 md:py-12">
            {/* Breadcrumb */}
            <Breadcrumb items={[{ label: t("title") }]} className="mb-6" />

            {/* Header */}
            <h1 className="mb-8 text-3xl font-semibold text-foreground">
                {t("title")}
                {count > 0 && (
                    <span className="ml-3 text-lg font-normal text-muted-foreground">
                        ({count} {t("itemCount")})
                    </span>
                )}
            </h1>

            {items.length === 0 ? (
                <CartEmpty />
            ) : (
                <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
                    <CartTable />
                    <CartSummaryCard />
                </div>
            )}
        </div>
    );
}
