import AdminProductTable from "@/features/admin/components/products/AdminProductTable";

export default function AdminProductList() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-foreground">
                    {"Quản lý sản phẩm"}
                </h1>
            </div>
            <AdminProductTable />
        </div>
    );
}
