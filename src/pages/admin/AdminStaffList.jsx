import AdminStaffTable from "@/features/admin/components/users/AdminStaffTable";

export default function AdminStaffList() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-foreground">
                    {"Quản lý nhân viên"}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Thêm, sửa, xoá nhân viên và phân quyền truy cập.
                </p>
            </div>
            <AdminStaffTable />
        </div>
    );
}
