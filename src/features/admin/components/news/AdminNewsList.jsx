import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Plus, Edit, Trash2, Eye, EyeOff, Search, Star } from "lucide-react";
import {
    useGetAllNewsQuery,
    useDeleteNewsMutation,
    useToggleNewsStatusMutation,
} from "@/store/api/newsApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import { PAGINATION, ROUTES } from "@/lib/constants";

export default function AdminNewsList() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchInput, setSearchInput] = useState(
        searchParams.get("search") || "",
    );
    const [deleteId, setDeleteId] = useState(null);
    const debouncedSearch = useDebounce(searchInput, 400);

    const filters = {
        page: Number(searchParams.get("page")) || 1,
        limit: PAGINATION.DEFAULT_LIMIT,
        search: debouncedSearch || undefined,
    };

    const { data, isLoading } = useGetAllNewsQuery(filters);
    const [deleteNews, { isLoading: isDeleting }] = useDeleteNewsMutation();
    const [toggleStatus, { isLoading: isToggling }] =
        useToggleNewsStatusMutation();

    // ✅ getAllNewsQuery transformResponse → { news, pagination }
    const news = data?.news ?? [];
    const pagination = data?.pagination ?? {};

    const updateParam = (key, value) => {
        const params = new URLSearchParams(searchParams);
        if (value) params.set(key, value);
        else params.delete(key);
        if (key !== "page") params.set("page", "1");
        setSearchParams(params);
    };

    const handleDelete = async () => {
        try {
            await deleteNews(deleteId).unwrap();
            toast.success("Đã xóa bài viết");
        } catch {
            toast.error("Có lỗi xảy ra");
        } finally {
            setDeleteId(null);
        }
    };

    const handleToggle = async (item) => {
        // ✅ MySQL integer id
        try {
            await toggleStatus(item.id).unwrap();
            toast.success(
                item.isPublished ? "Đã ẩn bài viết" : "Đã xuất bản bài viết",
            );
        } catch {
            toast.error("Có lỗi xảy ra");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative max-w-xs min-w-[200px] flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Tìm bài viết..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="rounded-full pl-9"
                    />
                </div>
                <Button className="rounded-full" asChild>
                    <Link to={ROUTES.ADMIN_NEWS_CREATE ?? "/admin/news/create"}>
                        <Plus className="mr-1.5 h-4 w-4" />
                        Thêm bài viết
                    </Link>
                </Button>
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead>Bài viết</TableHead>
                            <TableHead>Danh mục</TableHead>
                            <TableHead>Tác giả</TableHead>
                            <TableHead>Đánh giá</TableHead>
                            <TableHead>Ngày tạo</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            [...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    {[...Array(7)].map((_, j) => (
                                        <TableCell key={j}>
                                            <Skeleton className="h-5 w-full" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : news.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
                                    className="py-12 text-center text-muted-foreground"
                                >
                                    Chưa có bài viết nào
                                </TableCell>
                            </TableRow>
                        ) : (
                            news.map((item) => (
                                // ✅ MySQL integer id
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            {item.thumbnail && (
                                                <div className="h-10 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                                                    <img
                                                        src={item.thumbnail}
                                                        alt={item.title}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <p className="max-w-[240px] truncate text-sm font-medium text-foreground">
                                                    {item.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    /{item.slug}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-muted-foreground">
                                            {item.category || "—"}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-muted-foreground">
                                            {item.author || "—"}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                            <span className="text-sm font-medium">{item.rating?.toFixed(1) || "0.0"}</span>
                                            <span className="text-xs text-muted-foreground">({item.ratingCount || 0})</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-muted-foreground">
                                            {formatDate(item.createdAt)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            className={
                                                item.isPublished
                                                    ? "bg-green-100 text-xs text-green-700 hover:bg-green-100 dark:bg-green-950/30 dark:text-green-400"
                                                    : "bg-muted text-xs text-muted-foreground hover:bg-muted"
                                            }
                                        >
                                            {item.isPublished
                                                ? "Đã xuất bản"
                                                : "Bản nháp"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                disabled={isToggling}
                                                onClick={() =>
                                                    handleToggle(item)
                                                }
                                                title={
                                                    item.isPublished
                                                        ? "Ẩn"
                                                        : "Xuất bản"
                                                }
                                            >
                                                {item.isPublished ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                asChild
                                            >
                                                <Link
                                                    to={`/admin/news/${item.id}/edit`}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                onClick={() =>
                                                    setDeleteId(item.id)
                                                }
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {!isLoading && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        {"Hàng mỗi trang"} {PAGINATION.DEFAULT_LIMIT}
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                            disabled={filters.page <= 1}
                            onClick={() =>
                                updateParam("page", filters.page - 1)
                            }
                        >
                            {"Trước"}
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            {filters.page} {"trong"}{" "}
                            {pagination.totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                            disabled={filters.page >= pagination.totalPages}
                            onClick={() =>
                                updateParam("page", filters.page + 1)
                            }
                        >
                            {"Sau"}
                        </Button>
                    </div>
                </div>
            )}

            <ConfirmDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                title="Xóa bài viết"
                description="Bạn có chắc muốn xóa bài viết này?"
                onConfirm={handleDelete}
                isLoading={isDeleting}
            />
        </div>
    );
}
