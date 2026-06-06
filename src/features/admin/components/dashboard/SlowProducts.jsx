import { Link } from "react-router-dom";
import { useGetSlowProductsQuery } from "@/store/api/ordersApi";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, formatNumber, cn } from "@/lib/utils";
import { toast } from "sonner";
import ExportButton from "@/components/ui/export-button";
import { useExport } from "@/hooks/useExport";
import { ROUTES } from "@/lib/constants";
import placeholderImg from "@/assets/images/placeholder/product-placeholder.jpg";

const getFirstImage = (images) => {
    if (!images) return placeholderImg;
    if (Array.isArray(images)) return images[0] || placeholderImg;
    try { return JSON.parse(images)[0] || placeholderImg; } catch { return placeholderImg; }
};

const daysInStockColor = (days) => {
    if (days < 30) return "text-green-600 dark:text-green-400";
    if (days <= 60) return "text-amber-600 dark:text-amber-400";
    return "text-red-500 dark:text-red-400";
};

const daysInStockLabel = (days) => {
    if (days < 30) return `${days} ngày`;
    if (days <= 60) return `${days} ngày`;
    return `${days} ngày`;
};

export default function SlowProducts() {
    const { data = [], isLoading } = useGetSlowProductsQuery({ days: 30, limit: 5 });

    const { exportExcel, exportPDF, isExporting } = useExport();

    const slowProdColumns = [
        { key: "index", label: "#" },
        { key: "name", label: "Tên sản phẩm" },
        { key: "totalStock", label: "Tồn kho" },
        { key: "soldCount", label: "Đã bán 30 ngày" },
        { key: "daysInStock", label: "Tồn kho (ngày)" },
    ];

    const getSlowProdExportRows = () => data.map((p, i) => ({
        index: i + 1,
        name: p.name,
        totalStock: p.totalStock ?? 0,
        soldCount: p.soldCount ?? 0,
        daysInStock: p.daysInStock ?? 0,
    }));

    const handleExportSlowProdExcel = () => {
        const rows = getSlowProdExportRows();
        if (rows.length === 0) { toast.error("Không có dữ liệu để xuất"); return; }
        exportExcel({ sheets: [{ name: "SPCham", columns: slowProdColumns, rows }], filename: `SPCham_${new Date().toISOString().slice(0, 10)}` });
    };

    const handleExportSlowProdPDF = () => {
        const rows = getSlowProdExportRows();
        if (rows.length === 0) { toast.error("Không có dữ liệu để xuất"); return; }
        exportPDF({ title: "Sản phẩm bán chậm (30 ngày)", columns: slowProdColumns, rows, filename: `SPCham_${new Date().toISOString().slice(0, 10)}` });
    };

    if (isLoading) {
        return (
            <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-5 w-5 rounded" />
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="flex-1 space-y-1.5">
                            <Skeleton className="h-4 w-36" />
                            <Skeleton className="h-3 w-20" />
                        </div>
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-16" />
                    </div>
                ))}
            </div>
        );
    }

    if (data.length === 0) {
        return <p className="text-sm text-muted-foreground text-center py-8">Tất cả sản phẩm đều có bán</p>;
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{data.length} sản phẩm</span>
                <ExportButton onExportExcel={handleExportSlowProdExcel} onExportPDF={handleExportSlowProdPDF} loading={isExporting} />
            </div>
            <div className="space-y-1">
            {data.map((product, index) => (
                <Link key={product.id} to={ROUTES.ADMIN_PRODUCT_EDIT(product.id)}
                    className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-muted/50">
                    <span className="flex h-5 w-5 items-center justify-center rounded text-xs font-medium bg-muted text-muted-foreground shrink-0">
                        {index + 1}
                    </span>
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted/30 p-1">
                        <img src={getFirstImage(product.images)} alt={product.name} className="h-full w-full object-contain" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.categorySlug} · Tồn: {formatNumber(product.totalStock)}</p>
                    </div>
                    <div className="text-right shrink-0">
                        <span className={cn("text-sm font-medium", product.soldCount === 0 ? "text-red-500" : "text-muted-foreground")}>
                            {product.soldCount === 0 ? "0 bán" : `${formatNumber(product.soldCount)} bán`}
                        </span>
                        <p className="text-xs text-muted-foreground">{formatPrice(product.price)}</p>
                    </div>
                    <div className="text-right shrink-0 w-20">
                        <span className={cn("text-xs font-medium", daysInStockColor(product.daysInStock || 0))}>
                            {daysInStockLabel(product.daysInStock || 0)}
                        </span>
                    </div>
                </Link>
            ))}
            </div>
        </div>
    );
}
