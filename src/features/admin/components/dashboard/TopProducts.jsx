import { useState } from "react";
import { Link } from "react-router-dom";
import { useGetTopProductsQuery } from "@/store/api/ordersApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatPrice, formatNumber, cn } from "@/lib/utils";
import { toast } from "sonner";
import ExportButton from "@/components/ui/export-button";
import { useExport } from "@/hooks/useExport";
import { ROUTES } from "@/lib/constants";
import placeholderImg from "@/assets/images/placeholder/product-placeholder.jpg";

const PERIODS = [
    { value: "week", label: "Tuần" },
    { value: "month", label: "Tháng" },
    { value: "year", label: "Năm" },
];

const periodButtonClass = (active) =>
    cn(
        "h-7 rounded-full text-xs",
        active
            ? "bg-foreground text-background hover:bg-foreground hover:text-background"
            : "text-muted-foreground",
    );

const getFirstImage = (images) => {
    if (!images) return placeholderImg;
    if (Array.isArray(images)) return images[0] || placeholderImg;
    try {
        return JSON.parse(images)[0] || placeholderImg;
    } catch {
        return placeholderImg;
    }
};

export default function TopProducts() {
    const [period, setPeriod] = useState("month");
    const { data = [], isLoading } = useGetTopProductsQuery({ period, limit: 5 });

    const { exportExcel, exportPDF, isExporting } = useExport();

    const topProdColumns = [
        { key: "index", label: "#" },
        { key: "name", label: "Tên sản phẩm" },
        { key: "price", label: "Giá", format: "currency" },
        { key: "soldCount", label: "Đã bán" },
        { key: "inStock", label: "Còn hàng" },
    ];

    const getTopProdExportRows = () => data.map((p, i) => ({
        index: i + 1,
        name: p.name,
        price: p.price || 0,
        soldCount: p.soldCount || 0,
        inStock: p.inStock ? "Có" : "Hết",
    }));

    const handleExportTopProdExcel = () => {
        const rows = getTopProdExportRows();
        if (rows.length === 0) { toast.error("Không có dữ liệu để xuất"); return; }
        exportExcel({ sheets: [{ name: "TopSP", columns: topProdColumns, rows }], filename: `TopSP_${new Date().toISOString().slice(0, 10)}` });
    };

    const handleExportTopProdPDF = () => {
        const rows = getTopProdExportRows();
        if (rows.length === 0) { toast.error("Không có dữ liệu để xuất"); return; }
        exportPDF({ title: "Sản phẩm bán chạy", columns: topProdColumns, rows, filename: `TopSP_${new Date().toISOString().slice(0, 10)}` });
    };

    if (isLoading) {
        return (
            <div className="space-y-3">
                <div className="flex gap-2">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-7 w-14 rounded-full" />)}
                </div>
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-5 w-5 rounded" />
                        <Skeleton className="h-12 w-12 rounded-xl" />
                        <div className="flex-1 space-y-1.5">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-16" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-1.5">
                <div className="flex gap-1.5">
                {PERIODS.map((p) => (
                    <Button key={p.value} variant="ghost" size="sm" onClick={() => setPeriod(p.value)}
                        className={periodButtonClass(period === p.value)}>
                        {p.label}
                    </Button>
                ))}
                </div>
                <ExportButton onExportExcel={handleExportTopProdExcel} onExportPDF={handleExportTopProdPDF} loading={isExporting} />
            </div>

            {data.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Không có dữ liệu</p>
            ) : (
                <div className="space-y-1">
                    <div className="mb-2 grid grid-cols-12 gap-3 px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        <div className="col-span-1">#</div>
                        <div className="col-span-5">Tên sản phẩm</div>
                        <div className="col-span-2 text-center">Đã bán</div>
                        <div className="col-span-2 text-center">Trạng thái</div>
                        <div className="col-span-2 text-right">Giá bán</div>
                    </div>
                    {data.map((product, index) => (
                        <Link key={product.id} to={ROUTES.ADMIN_PRODUCT_EDIT(product.id)}
                            className="grid grid-cols-12 items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-muted/50">
                            <div className="col-span-1">
                                <span className={cn("flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                                    index === 0 && "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
                                    index === 1 && "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
                                    index === 2 && "bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400",
                                    index > 2 && "bg-muted text-muted-foreground")}>
                                    {index + 1}
                                </span>
                            </div>
                            <div className="col-span-5 flex items-center gap-3">
                                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted/30 p-1">
                                    <img src={getFirstImage(product.images)} alt={product.name} className="h-full w-full object-contain" />
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-foreground">{product.name}</p>
                                    <p className="text-xs text-muted-foreground">{product.categorySlug}</p>
                                </div>
                            </div>
                            <div className="col-span-2 text-center">
                                <span className="text-sm font-medium text-foreground">{formatNumber(product.soldCount)}</span>
                            </div>
                            <div className="col-span-2 flex justify-center">
                                <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium",
                                    product.inStock ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400")}>
                                    {product.inStock ? "Còn hàng" : "Ngừng bán"}
                                </span>
                            </div>
                            <div className="col-span-2 text-right">
                                <span className="text-sm font-medium text-foreground">{formatPrice(product.price)}</span>
                            </div>
                        </Link>
                ))}
            </div>
            )}
        </div>
    );
}
