import AdminCommentList from "@/features/admin/components/comments/AdminCommentList";

export default function AdminCommentPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-foreground">
                    {"Quản lý bình luận"}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    {"Duyệt, ẩn hoặc xóa bình luận từ khách hàng"}
                </p>
            </div>
            <AdminCommentList />
        </div>
    );
}
