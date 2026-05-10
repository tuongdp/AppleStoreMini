import AdminCouponList from "@/features/admin/components/coupons/AdminCouponList";

export default function AdminCouponPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-foreground">
                    {"Quản lý khuyến mãi"}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    {"Tạo và quản lý mã giảm giá cho khách hàng"}
                </p>
            </div>
            <AdminCouponList />
        </div>
    );
}
