import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import {
    useGetNewsBySlugQuery,
    useUpdateNewsMutation,
} from "@/store/api/newsApi";
import AdminNewsForm from "@/features/admin/components/news/AdminNewsForm";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function AdminNewsEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data, isLoading, isError } = useGetNewsBySlugQuery(id);
    const [updateNews, { isLoading: isUpdating }] = useUpdateNewsMutation();
    const news = data?.data;

    const handleSubmit = async (values) => {
        try {
            await updateNews({ id, ...values }).unwrap();
            toast.success("Đã cập nhật bài viết");
        } catch (error) {
            toast.error(error?.data?.message || "Có lỗi xảy ra");
        }
    };

    if (isLoading)
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-7 w-48" />
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-4 lg:col-span-2">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton
                                key={i}
                                className="h-12 w-full rounded-lg"
                            />
                        ))}
                        <Skeleton className="h-64 w-full rounded-xl" />
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-48 w-full rounded-2xl" />
                    </div>
                </div>
            </div>
        );

    if (isError || !news)
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="mb-4 text-muted-foreground">
                    {"Không tìm thấy bài viết"}
                </p>
                <Button variant="outline" className="rounded-full" asChild>
                    <Link to="/admin/news">{"Quay lại"}</Link>
                </Button>
            </div>
        );

    return (
        <div className="space-y-6">
            <Button variant="ghost" size="sm" className="rounded-full" asChild>
                <Link to="/admin/news">
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    {"Quản lý tin tức"}
                </Link>
            </Button>
            <div>
                <h1 className="text-2xl font-semibold text-foreground">
                    {"Chỉnh sửa bài viết"}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    {news.title}
                </p>
            </div>
            <AdminNewsForm
                news={news}
                onSubmit={handleSubmit}
                isLoading={isUpdating}
            />
        </div>
    );
}
