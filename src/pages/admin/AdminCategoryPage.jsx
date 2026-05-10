import AdminCategoryList from "@/features/admin/components/categories/AdminCategoryList";

export default function AdminCategoryPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-foreground">
                    {"Quản lý danh mục"}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    {"Quản lý danh mục sản phẩm — thêm, sửa, ẩn hoặc xóa danh mục"}
                </p>
            </div>
            <AdminCategoryList />
        </div>
    );
}
