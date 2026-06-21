import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import {
    useGetAllCouponsQuery,
    useDeleteCouponMutation,
    useToggleCouponStatusMutation,
} from "@/store/api/couponsApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminCouponForm from "./AdminCouponForm";
import { toast } from "sonner";
import { formatPrice, formatNumber } from "@/lib/utils";
import { PAGINATION } from "@/lib/constants";
import ExportButton from "@/components/ui/export-button";
import { useExport } from "@/hooks/useExport";
import { cn } from "@/lib/utils";

export default function AdminCouponList() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [deleteId, setDeleteId] = useState(null);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const status = searchParams.get("status") || "";
    const page = Number(searchParams.get("page")) || 1;

    const queryParams = {
        page,
        limit: PAGINATION.DEFAULT_LIMIT,
    };
    if (status && status !== "all") queryParams.status = status;

    const { data, isLoading, isFetching } = useGetAllCouponsQuery(queryParams);
    const [deleteCoupon, { isLoading: isDeleting }] = useDeleteCouponMutation();
    const [toggleStatus, { isLoading: isToggling }] =
        useToggleCouponStatusMutation();

    const coupons = data?.coupons || [];
    const pagination = data?.pagination || {};

    const updateParam = (key, value) => {
        const params = new URLSearchParams(searchParams);
        if (value && value !== "all") params.set(key, value);
        else params.delete(key);
        if (key !== "page") params.set("page", "1");
        setSearchParams(params);
    };
    const getDiscountType = (coupon) => String(coupon.discountType || "").toUpperCase();
    const getMaxDiscountAmount = (coupon) => coupon.maxDiscountAmount ?? coupon.maxDiscount;
    const getMinOrderAmount = (coupon) => coupon.minOrderAmount ?? coupon.minOrderValue;
    const getMaxUsage = (coupon) => coupon.maxUsage ?? coupon.usageLimit;

    const handleDelete = async () => {
        try {
            await deleteCoupon(deleteId).unwrap();
            toast.success("Đã xóa mã giảm giá");
        } catch {
            toast.error("Có lỗi xảy ra");
        } finally {
            setDeleteId(null);
        }
    };

    const { exportExcel, exportPDF, isExporting } = useExport();

    const couponColumns = [
        { key: "code", label: "Mã" },
        { key: "description", label: "Mô tả" },
        { key: "discountType", label: "Loại giảm" },
        { key: "discountValue", label: "Giá trị" },
        { key: "minOrderAmount", label: "Đơn tối thiểu", format: "currency" },
        { key: "usedCount", label: "Đã dùng / Tối đa" },
        { key: "isActive", label: "Trạng thái" },
    ];

    const DISCOUNT_TYPE_LABELS = { PERCENT: "%", FIXED: "₫" };

    const getCouponExportRows = () =>
        coupons.map((c) => ({
            code: c.code,
            description: c.description || "—",
            discountType: DISCOUNT_TYPE_LABELS[getDiscountType(c)] || getDiscountType(c),
            discountValue:
                getDiscountType(c) === "PERCENT"
                    ? `${c.discountValue}% (tối đa ${(getMaxDiscountAmount(c) || 0).toLocaleString("vi-VN")}₫)`
                    : `${(c.discountValue || 0).toLocaleString("vi-VN")}₫`,
            minOrderAmount: getMinOrderAmount(c) || 0,
            usedCount: `${c.usedCount || 0} / ${getMaxUsage(c) || "∞"}`,
            isActive: c.isActive ? "Đang kích hoạt" : "Đã tắt",
        }));

    const handleExportCouponsExcel = () => {
        if (coupons.length === 0) {
            toast("Không có dữ liệu để xuất");
            return;
        }
        exportExcel({
            sheets: [
                {
                    name: "Coupon",
                    columns: couponColumns,
                    rows: getCouponExportRows(),
                },
            ],
            filename: `Coupon_${new Date().toISOString().slice(0, 10)}`,
        });
    };

    const handleExportCouponsPDF = () => {
        if (coupons.length === 0) {
            toast("Không có dữ liệu để xuất");
            return;
        }
        exportPDF({
            title: "Danh sách mã giảm giá",
            columns: couponColumns,
            rows: getCouponExportRows(),
            filename: `Coupon_${new Date().toISOString().slice(0, 10)}`,
        });
    };

    const handleToggle = async (coupon) => {
        const id = coupon._id || coupon.id;
        try {
            await toggleStatus(id).unwrap();
            toast.success(
                coupon.isActive ? "Đã tắt mã giảm giá" : "Đã bật mã giảm giá",
            );
        } catch {
            toast.error("Có lỗi xảy ra");
        }
    };

    const handleEdit = (coupon) => {
        setEditingCoupon(coupon);
        setShowForm(true);
    };

    const handleAdd = () => {
        setEditingCoupon(null);
        setShowForm(true);
    };

    const handleFormClose = () => {
        setShowForm(false);
        setEditingCoupon(null);
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Select
                        value={status || "all"}
                        onValueChange={(val) => updateParam("status", val)}
                    >
                        <SelectTrigger className="w-40 rounded-full">
                            <SelectValue placeholder="Tất cả" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả</SelectItem>
                            <SelectItem value="active">Đang hoạt động</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                        {pagination.total || coupons.length} mã giảm giá
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <ExportButton
                        onExportExcel={handleExportCouponsExcel}
                        onExportPDF={handleExportCouponsPDF}
                        loading={isExporting}
                        disabled={isLoading || isFetching}
                    />
                    <Button className="rounded-full" onClick={handleAdd}>
                        <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
                        Thêm mã mới
                    </Button>
                </div>
            </div>

            {/* Form inline */}
            {showForm && (
                <div className="rounded-2xl border border-border bg-card p-5">
                    <h3 className="mb-4 text-sm font-medium text-foreground">
                        {editingCoupon ? "Chỉnh sửa mã" : "Tạo mã mới"}
                    </h3>
                    <AdminCouponForm
                        coupon={editingCoupon}
                        onClose={handleFormClose}
                    />
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead>Mã</TableHead>
                            <TableHead>Loại giảm</TableHead>
                            <TableHead>Giá trị</TableHead>
                            <TableHead>Đã dùng / Tổng</TableHead>
                            <TableHead>Hết hạn</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead className="text-right">
                                {"Thao tác"}
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading || isFetching ? (
                            [...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    {[...Array(7)].map((_, j) => (
                                        <TableCell key={j}>
                                            <Skeleton className="h-5 w-full" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : coupons.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
                                    className="py-12 text-center text-muted-foreground"
                                >
                                    Chưa có mã giảm giá nào
                                </TableCell>
                            </TableRow>
                        ) : (
                            coupons.map((coupon) => {
                                const couponId = coupon._id || coupon.id;
                                const discountType = getDiscountType(coupon);
                                const maxDiscountAmount = getMaxDiscountAmount(coupon);
                                const minOrderAmount = getMinOrderAmount(coupon);
                                const maxUsage = getMaxUsage(coupon);
                                const usedUp = maxUsage && coupon.usedCount >= maxUsage;

                                return (
                                    <TableRow key={couponId}>
                                        {/* Code */}
                                        <TableCell>
                                            <code className="rounded bg-muted px-2 py-0.5 text-sm font-semibold text-foreground">
                                                {coupon.code}
                                            </code>
                                            {coupon.description && (
                                                <p className="mt-0.5 text-xs text-muted-foreground">
                                                    {coupon.description}
                                                </p>
                                            )}
                                        </TableCell>

                                        {/* Type */}
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className="text-xs"
                                            >
                                                {discountType ===
                                                "PERCENT"
                                                    ? "Phần trăm"
                                                    : "Số tiền"}
                                            </Badge>
                                        </TableCell>

                                        {/* Value */}
                                        <TableCell>
                                            <span className="text-sm font-medium text-foreground">
                                                {discountType ===
                                                "PERCENT"
                                                    ? `${formatNumber(coupon.discountValue)}%`
                                                    : formatPrice(
                                                          coupon.discountValue,
                                                      )}
                                            </span>
                                            {maxDiscountAmount &&
                                                discountType ===
                                                    "PERCENT" && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Tối đa{" "}
                                                        {formatPrice(
                                                            maxDiscountAmount,
                                                        )}
                                                    </p>
                                                )}
                                            {minOrderAmount && (
                                                <p className="text-xs text-muted-foreground">
                                                    Đơn tối thiểu{" "}
                                                    {formatPrice(
                                                        minOrderAmount,
                                                    )}
                                                </p>
                                            )}
                                        </TableCell>

                                        {/* Usage */}
                                        <TableCell>
                                            <span
                                                className={cn(
                                                    "text-sm",
                                                    usedUp
                                                        ? "text-red-500"
                                                        : "text-foreground",
                                                )}
                                            >
                                                {formatNumber(coupon.usedCount || 0)}
                                                {maxUsage
                                                    ? ` / ${formatNumber(maxUsage)}`
                                                    : " / ?"}
                                            </span>
                                        </TableCell>

                                        {/* Status */}
                                        <TableCell>
                                            {usedUp ? (
                                                <Badge className="bg-red-100 text-xs text-red-700 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400">
                                                    Hết lượt
                                                </Badge>
                                            ) : (
                                                <Badge
                                                    className={
                                                        coupon.isActive
                                                            ? "bg-green-100 text-xs text-green-700 hover:bg-green-100 dark:bg-green-950/30 dark:text-green-400"
                                                            : "bg-muted text-xs text-muted-foreground hover:bg-muted"
                                                    }
                                                >
                                                    {coupon.isActive
                                                        ? "Đang hoạt động"
                                                        : "Tắt"}
                                                </Badge>
                                            )}
                                        </TableCell>

                                        {/* Actions */}
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                {/* Toggle */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                    disabled={
                                                        isToggling ||
                                                        usedUp
                                                    }
                                                    onClick={() =>
                                                        handleToggle(coupon)
                                                    }
                                                    title={
                                                        coupon.isActive
                                                            ? "Tắt mã"
                                                            : "Bật mã"
                                                    }
                                                    aria-label={coupon.isActive ? `Tắt mã ${coupon.code}` : `Bật mã ${coupon.code}`}
                                                >
                                                    {coupon.isActive ? (
                                                        <ToggleRight className="h-4 w-4 text-green-500" aria-hidden="true" />
                                                    ) : (
                                                        <ToggleLeft className="h-4 w-4" aria-hidden="true" />
                                                    )}
                                                </Button>

                                                {/* Edit */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                    onClick={() =>
                                                        handleEdit(coupon)
                                                    }
                                                    aria-label={`Sửa mã ${coupon.code}`}
                                                >
                                                    <Pencil className="h-4 w-4" aria-hidden="true" />
                                                </Button>

                                                {/* Delete */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                    onClick={() =>
                                                        setDeleteId(couponId)
                                                    }
                                                    aria-label={`Xóa mã ${coupon.code}`}
                                                >
                                                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Hàng mỗi trang {PAGINATION.DEFAULT_LIMIT}</p>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" aria-label="Trang trước" disabled={page <= 1} onClick={() => updateParam("page", page - 1)}>
                            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                        </Button>
                        <span className="text-sm text-muted-foreground">{page} trong {pagination.totalPages}</span>
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" aria-label="Trang sau" disabled={page >= pagination.totalPages} onClick={() => updateParam("page", page + 1)}>
                            <ChevronRight className="h-4 w-4" aria-hidden="true" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Confirm delete */}
            <ConfirmDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                title="Xóa mã giảm giá"
                description="Bạn có chắc muốn xóa mã này? Hành động này không thể hoàn tác."
                onConfirm={handleDelete}
                isLoading={isDeleting}
            />
        </div>
    );
}
