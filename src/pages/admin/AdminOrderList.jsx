import AdminOrderTable from "@/features/admin/components/orders/AdminOrderTable";

export default function AdminOrderList() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-foreground">
                    {"Quản lý đơn hàng"}
                </h1>
            </div>
            <AdminOrderTable />
        </div>
    );
}
