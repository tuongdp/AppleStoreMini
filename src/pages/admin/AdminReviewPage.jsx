import AdminReviewList from "@/features/admin/components/reviews/AdminReviewList";

export default function AdminReviewPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-foreground">
                    {"Quản lý đánh giá"}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    {"Duyệt, ẩn hoặc xóa đánh giá sản phẩm từ khách hàng"}
                </p>
            </div>
            <AdminReviewList />
        </div>
    );
}
