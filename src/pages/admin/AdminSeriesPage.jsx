import AdminSeriesList from "@/features/admin/components/series/AdminSeriesList";

export default function AdminSeriesPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-foreground">Quản lý series</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Tạo nhóm lọc sản phẩm theo từng dòng như iPhone 17 Series, MacBook Air hoặc iPad Pro
                </p>
            </div>
            <AdminSeriesList />
        </div>
    );
}
