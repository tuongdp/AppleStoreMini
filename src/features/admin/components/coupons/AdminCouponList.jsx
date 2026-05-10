import { useState } from "react";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
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
import AdminCouponForm from "./AdminCouponForm";
import { toast } from "sonner";
import { formatPrice, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function AdminCouponList() {
    const [deleteId, setDeleteId] = useState(null);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const { data, isLoading } = useGetAllCouponsQuery();
    const [deleteCoupon, { isLoading: isDeleting }] = useDeleteCouponMutation();
    const [toggleStatus, { isLoading: isToggling }] =
        useToggleCouponStatusMutation();

    const coupons = data?.coupons || [];

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

    const isExpired = (expiresAt) => {
        if (!expiresAt) return false;
        return new Date(expiresAt) < new Date();
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                    {coupons.length} mã giảm giá
                </p>
                <Button className="rounded-full" onClick={handleAdd}>
                    <Plus className="mr-1.5 h-4 w-4" />
                    Thêm mã mới
                </Button>
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
            <div className="overflow-hidden rounded-xl border border-border bg-card">
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
                        {isLoading ? (
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
                                const expired = isExpired(coupon.expiresAt);
                                const usedUp =
                                    coupon.maxUsage &&
                                    coupon.usedCount >= coupon.maxUsage;

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
                                                {coupon.discountType ===
                                                "percent"
                                                    ? "Phần trăm"
                                                    : "Số tiền"}
                                            </Badge>
                                        </TableCell>

                                        {/* Value */}
                                        <TableCell>
                                            <span className="text-sm font-medium text-foreground">
                                                {coupon.discountType ===
                                                "percent"
                                                    ? `${coupon.discountValue}%`
                                                    : formatPrice(
                                                          coupon.discountValue,
                                                      )}
                                            </span>
                                            {coupon.maxDiscountAmount &&
                                                coupon.discountType ===
                                                    "percent" && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Tối đa{" "}
                                                        {formatPrice(
                                                            coupon.maxDiscountAmount,
                                                        )}
                                                    </p>
                                                )}
                                            {coupon.minOrderAmount && (
                                                <p className="text-xs text-muted-foreground">
                                                    Đơn tối thiểu{" "}
                                                    {formatPrice(
                                                        coupon.minOrderAmount,
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
                                                {coupon.usedCount || 0}
                                                {coupon.maxUsage
                                                    ? ` / ${coupon.maxUsage}`
                                                    : " / ∞"}
                                            </span>
                                        </TableCell>

                                        {/* Expiry */}
                                        <TableCell>
                                            <span
                                                className={cn(
                                                    "text-sm",
                                                    expired
                                                        ? "text-red-500"
                                                        : "text-muted-foreground",
                                                )}
                                            >
                                                {coupon.expiresAt
                                                    ? formatDate(
                                                          coupon.expiresAt,
                                                      )
                                                    : "Không hết hạn"}
                                            </span>
                                        </TableCell>

                                        {/* Status */}
                                        <TableCell>
                                            {expired || usedUp ? (
                                                <Badge className="bg-red-100 text-xs text-red-700 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400">
                                                    {expired
                                                        ? "Hết hạn"
                                                        : "Hết lượt"}
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
                                                        expired ||
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
                                                >
                                                    {coupon.isActive ? (
                                                        <ToggleRight className="h-4 w-4 text-green-500" />
                                                    ) : (
                                                        <ToggleLeft className="h-4 w-4" />
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
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>

                                                {/* Delete */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                    onClick={() =>
                                                        setDeleteId(couponId)
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
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
