import AdminNewsList from "@/features/admin/components/news/AdminNewsList";

export default function AdminNewsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-foreground">
                    {"Quản lý tin tức"}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    {"Tạo và quản lý các bài viết tin tức"}
                </p>
            </div>
            <AdminNewsList />
        </div>
    );
}
