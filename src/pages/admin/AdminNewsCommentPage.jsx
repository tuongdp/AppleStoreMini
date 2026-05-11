import AdminNewsCommentList from "@/features/admin/components/comments/AdminNewsCommentList";

export default function AdminNewsCommentPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-foreground">Quản lý bình luận tin tức</h1>
                <p className="mt-1 text-sm text-muted-foreground">Xem và xóa bình luận tin tức từ khách hàng</p>
            </div>
            <AdminNewsCommentList />
        </div>
    );
}
