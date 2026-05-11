import { useState } from "react";
import { Search, Star, Trash2, Eye, EyeOff } from "lucide-react";
import {
    useGetAllCommentsQuery,
    useAdminDeleteCommentMutation,
    useToggleCommentVisibilityMutation,
} from "@/store/api/commentsApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { toast } from "sonner";
import { formatDateTime, parseJsonField } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import { PAGINATION } from "@/lib/constants";
import { useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";

const RATING_OPTIONS = [
    { value: "all", label: "Tất cả" },
    { value: "5", label: "5 sao" },
    { value: "4", label: "4 sao" },
    { value: "3", label: "3 sao" },
    { value: "2", label: "2 sao" },
    { value: "1", label: "1 sao" },
];

function StarDisplay({ rating }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={cn(
                        "h-3.5 w-3.5",
                        star <= rating
                            ? "fill-amber-400 text-amber-400"
                            : "fill-muted text-muted",
                    )}
                />
            ))}
        </div>
    );
}

export default function AdminCommentList() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchInput, setSearchInput] = useState(
        searchParams.get("search") || "",
    );
    const [deleteId, setDeleteId] = useState(null);

    const debouncedSearch = useDebounce(searchInput, 400);

    const filters = {
        page: Number(searchParams.get("page")) || 1,
        limit: PAGINATION.DEFAULT_LIMIT,
        rating: searchParams.get("rating") || undefined,
        search: debouncedSearch || undefined,
    };

    const { data, isLoading } = useGetAllCommentsQuery(filters);
    const [deleteComment, { isLoading: isDeleting }] = useAdminDeleteCommentMutation();
    const [toggleVisibility, { isLoading: isToggling }] =
        useToggleCommentVisibilityMutation();

    // ✅ commentsApi transformResponse → { comments, pagination }
    const comments = data?.comments ?? [];
    const pagination = data?.pagination ?? {};

    const updateParam = (key, value) => {
        const params = new URLSearchParams(searchParams);
        if (value && value !== "all") {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        if (key !== "page") params.set("page", "1");
        setSearchParams(params);
    };

    const handleDelete = async () => {
        try {
            await deleteComment(deleteId).unwrap();
            toast.success("Đã xóa bình luận");
        } catch {
            toast.error("Có lỗi xảy ra");
        } finally {
            setDeleteId(null);
        }
    };

    const handleToggleVisibility = async (comment) => {
        // ✅ MySQL integer id — không dùng _id
        try {
            await toggleVisibility(comment.id).unwrap();
            toast.success(
                comment.isVisible !== false
                    ? "Đã ẩn bình luận"
                    : "Đã hiện bình luận",
            );
        } catch {
            toast.error("Có lỗi xảy ra");
        }
    };

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative max-w-xs min-w-[200px] flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Tìm sản phẩm hoặc người dùng..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="rounded-full pl-9"
                    />
                </div>
                <Select
                    value={searchParams.get("rating") || "all"}
                    onValueChange={(val) => updateParam("rating", val)}
                >
                    <SelectTrigger className="w-36 rounded-full">
                        <SelectValue placeholder="Lọc sao" />
                    </SelectTrigger>
                    <SelectContent>
                        {RATING_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead>Người dùng</TableHead>
                            <TableHead>Sản phẩm</TableHead>
                            <TableHead>Bình luận</TableHead>
                            <TableHead>Nội dung</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead>Ngày tạo</TableHead>
                            <TableHead className="text-right">
                                {"Thao tác"}
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            [...Array(6)].map((_, i) => (
                                <TableRow key={i}>
                                    {[...Array(7)].map((_, j) => (
                                        <TableCell key={j}>
                                            <Skeleton className="h-5 w-full" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : comments.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
                                    className="py-12 text-center text-muted-foreground"
                                >
                                    {"Không có dữ liệu"}
                                </TableCell>
                            </TableRow>
                        ) : (
                            comments.map((comment) => (
                                // ✅ MySQL integer id thuần
                                <TableRow key={comment.id}>
                                    {/* User */}
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-7 w-7">
                                                <AvatarImage
                                                    src={comment.user?.avatar}
                                                    alt={comment.user?.fullName}
                                                />
                                                <AvatarFallback className="text-xs">
                                                    {comment.user?.fullName
                                                        ?.charAt(0)
                                                        ?.toUpperCase() || "U"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium text-foreground">
                                                    {comment.user?.fullName}
                                                </p>
                                                <p className="truncate text-xs text-muted-foreground">
                                                    {comment.user?.email}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* Product */}
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {(() => {
                                                const img = parseJsonField(comment.product?.images)?.[0] || comment.product?.image;
                                                return img ? (
                                                <div className="h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-muted/30 p-0.5">
                                                    <img
                                                        src={img}
                                                        alt={comment.product?.name}
                                                        className="h-full w-full object-contain"
                                                    />
                                                </div>
                                                ) : null;
                                            })()}
                                            <p className="max-w-[140px] truncate text-sm text-foreground">
                                                {comment.product?.name}
                                            </p>
                                        </div>
                                    </TableCell>

                                    {/* Rating */}
                                    <TableCell>
                                        <StarDisplay rating={comment.rating} />
                                    </TableCell>

                                    {/* Comment */}
                                    <TableCell>
                                        <p className="max-w-[200px] truncate text-sm text-muted-foreground">
                                            {comment.comment || (
                                                <span className="italic">
                                                    Không có nhận xét
                                                </span>
                                            )}
                                        </p>
                                    </TableCell>

                                    {/* Visibility */}
                                    <TableCell>
                                        <Badge
                                            className={
                                                comment.isVisible !== false
                                                    ? "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-950/30 dark:text-green-400"
                                                    : "bg-muted text-muted-foreground hover:bg-muted"
                                            }
                                        >
                                            {comment.isVisible !== false
                                                ? "Hiển thị"
                                                : "Đã ẩn"}
                                        </Badge>
                                    </TableCell>

                                    {/* Date */}
                                    <TableCell>
                                        <span className="text-sm text-muted-foreground">
                                            {formatDateTime(comment.createdAt)}
                                        </span>
                                    </TableCell>

                                    {/* Actions */}
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                disabled={isToggling}
                                                onClick={() =>
                                                    handleToggleVisibility(
                                                        comment,
                                                    )
                                                }
                                                title={
                                                    comment.isVisible !== false
                                                    ? "Ẩn bình luận"
                                                    : "Hiện bình luận"
                                                }
                                            >
                                                {                                                    comment.isVisible !== false ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                onClick={() =>
                                                    setDeleteId(comment.id)
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

            {/* Pagination */}
            {pagination.totalPages > 1 && (
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
                title="Xóa bình luận"
                description="Bạn có chắc muốn xóa bình luận này? Hành động này không thể hoàn tác."
                onConfirm={handleDelete}
                isLoading={isDeleting}
            />
        </div>
    );
}
