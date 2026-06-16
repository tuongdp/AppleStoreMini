import AdminUserTable from "@/features/admin/components/users/AdminUserTable";

export default function AdminUserList() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-foreground">
                    {"Danh sách khách hàng"}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Quản lý thông tin, đơn hàng và trạng thái tài khoản khách hàng.
                </p>
            </div>
            <AdminUserTable />
        </div>
    );
}
