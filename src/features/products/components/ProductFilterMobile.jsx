import { useTranslation } from "@/i18n/useTranslation";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import ProductFilter from "./ProductFilter";

export default function ProductFilterMobile({
    filters,
    onUpdate,
    activeFilterCount,
}) {
    const { t } = useTranslation("product");

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="relative rounded-full lg:hidden"
                >
                    <SlidersHorizontal className="mr-1.5 h-4 w-4" />
                    {t("filter.title")}
                    {activeFilterCount > 0 && (
                        <span className="ml-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[10px] font-medium text-background">
                            {activeFilterCount}
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
                <SheetHeader className="mb-4">
                    <SheetTitle className="text-left">
                        {t("filter.title")}
                    </SheetTitle>
                </SheetHeader>
                <ProductFilter filters={filters} onUpdate={onUpdate} />
            </SheetContent>
        </Sheet>
    );
}
