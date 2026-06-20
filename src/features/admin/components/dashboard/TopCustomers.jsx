import { useGetTopCustomersQuery } from "@/store/api/ordersApi";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import ExportButton from "@/components/ui/export-button";
import { useExport } from "@/hooks/useExport";

function relativeTime(dateStr) {
    if (!dateStr) return null;
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diffMs = now - then;
    const mins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMs / 3600000);
    const days = Math.floor(diffMs / 86400000);
    if (mins < 60) return `${mins} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 30) return `${days} ngày trước`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} tháng trước`;
    return `${Math.floor(months / 12)} năm trước`;
}

export default function TopCustomers() {
    const { data = [], isLoading } = useGetTopCustomersQuery({ limit: 5 });

    const { exportExcel, exportPDF, isExporting } = useExport();

    const custColumns = [
        { key: "index", label: "#" },
        { key: "fullName", label: "Họ tên" },
        { key: "email", label: "Email" },
        { key: "totalSpent", label: "Tổng chi tiêu", format: "currency" },
        { key: "orderCount", label: "Số đơn" },
        { key: "lastOrder", label: "Mua gần nhất" },
    ];

    const getCustExportRows = () => data.map((c, i) => ({
        index: i + 1,
        fullName: c.fullName || "Khách vãng lai",
        email: c.email || "—",
        totalSpent: c.totalSpent || 0,
        orderCount: c.orderCount || 0,
        lastOrder: c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString("vi-VN") : "—",
    }));

    const handleExportCustExcel = () => {
        const rows = getCustExportRows();
        if (rows.length === 0) { toast.error("Không có dữ liệu để xuất"); return; }
        exportExcel({ sheets: [{ name: "TopKH", columns: custColumns, rows }], filename: `TopKH_${new Date().toISOString().slice(0, 10)}` });
    };

    const handleExportCustPDF = () => {
        const rows = getCustExportRows();
        if (rows.length === 0) { toast.error("Không có dữ liệu để xuất"); return; }
        exportPDF({ title: "Khách hàng chi tiêu cao", columns: custColumns, rows, filename: `TopKH_${new Date().toISOString().slice(0, 10)}` });
    };

    if (isLoading) {
        return (
            <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-7 w-7 rounded-full" />
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <div className="flex-1 space-y-1.5">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-40" />
                        </div>
                        <Skeleton className="h-4 w-24" />
                    </div>
                ))}
            </div>
        );
    }

    if (data.length === 0) {
        return <p className="text-sm text-muted-foreground text-center py-8">Chưa có dữ liệu</p>;
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{data.length} khách hàng</span>
                <ExportButton onExportExcel={handleExportCustExcel} onExportPDF={handleExportCustPDF} loading={isExporting} />
            </div>
            <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center gap-3 px-1 text-xs font-medium text-muted-foreground">
                    <span className="w-14 shrink-0">Xếp hạng</span>
                    <span className="min-w-0 flex-1">Khách hàng</span>
                    <span className="w-28 shrink-0 text-right">Tổng chi tiêu</span>
                    <span className="w-20 shrink-0 text-right">Số đơn</span>
                </div>
            {data.map((cust, index) => {
                const initials = (cust.fullName || "V")
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                return (
                    <div className="flex items-center gap-3">
                        <span className={cn("flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shrink-0",
                            index === 0 && "bg-amber-100 text-amber-700",
                            index === 1 && "bg-slate-100 text-slate-600",
                            index === 2 && "bg-orange-100 text-orange-700",
                            index > 2 && "bg-muted text-muted-foreground")}>
                            {index + 1}
                        </span>
                        <div className={cn("flex h-9 w-9 items-center justify-center rounded-full text-xs font-medium shrink-0",
                            index === 0 ? "bg-amber-500 text-white" : "bg-muted text-muted-foreground")}>
                            {cust.fullName ? initials : "?"}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">
                                {cust.fullName || "Khách vãng lai"}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                                {cust.email || (cust.fullName ? "" : "Không đăng nhập")}
                            </p>
                        </div>
                        <div className="w-28 shrink-0 text-right">
                            <p className="text-sm font-semibold text-foreground">{formatPrice(cust.totalSpent)}</p>
                            {cust.lastOrderDate && <p className="text-xs text-muted-foreground">{relativeTime(cust.lastOrderDate)}</p>}
                        </div>
                        <div className="w-20 shrink-0 text-right">
                            <p className="text-sm font-medium text-foreground">{cust.orderCount ?? 0}</p>
                            <p className="text-xs text-muted-foreground">đơn</p>
                        </div>
                    </div>
                );
            })}
            </div>
        </div>
    );
}
