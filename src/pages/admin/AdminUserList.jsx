import AdminUserTable from "@/features/admin/components/users/AdminUserTable";

export default function AdminUserList() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-foreground">
                    {"Quản lý người dùng"}
                </h1>
            </div>
            <AdminUserTable />
        </div>
    );
}
