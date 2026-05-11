import { useState } from "react";
import { Search, Trash2 } from "lucide-react";
import { useGetAllNewsCommentsQuery, useAdminDeleteNewsCommentMutation } from "@/store/api/newsApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { toast } from "sonner";
import { formatDateTime } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import { PAGINATION } from "@/lib/constants";
import { useSearchParams, Link } from "react-router-dom";

export default function AdminNewsCommentList() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
    const [deleteId, setDeleteId] = useState(null);
    const debouncedSearch = useDebounce(searchInput, 400);

    const filters = {
        page: Number(searchParams.get("page")) || 1,
        limit: PAGINATION.DEFAULT_LIMIT,
        search: debouncedSearch || undefined,
    };

    const { data, isLoading } = useGetAllNewsCommentsQuery(filters);
    const [deleteComment, { isLoading: isDeleting }] = useAdminDeleteNewsCommentMutation();
    const comments = data?.comments ?? [];
    const pagination = data?.pagination ?? {};

    const updateParam = (key, value) => {
        const params = new URLSearchParams(searchParams);
        if (value) params.set(key, value); else params.delete(key);
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

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative max-w-xs min-w-[200px] flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Tìm nội dung bình luận..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="rounded-full pl-9" />
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead>Người dùng</TableHead>
                            <TableHead>Bài viết</TableHead>
                            <TableHead>Nội dung</TableHead>
                            <TableHead>Ngày tạo</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            [...Array(6)].map((_, i) => (
                                <TableRow key={i}>{[...Array(5)].map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}</TableRow>
                            ))
                        ) : comments.length === 0 ? (
                            <TableRow><TableCell colSpan={5} className="py-12 text-center text-muted-foreground">Không có dữ liệu</TableCell></TableRow>
                        ) : (
                            comments.map((comment) => (
                                <TableRow key={comment.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-7 w-7">
                                                <AvatarImage src={comment.user?.avatar} alt={comment.user?.fullName} />
                                                <AvatarFallback className="text-xs">{comment.user?.fullName?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium">{comment.user?.fullName}</p>
                                                <p className="truncate text-xs text-muted-foreground">{comment.user?.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Link to={`/news/${comment.news?.slug}`} className="max-w-[160px] truncate text-sm text-blue-600 hover:underline block">{comment.news?.title}</Link>
                                    </TableCell>
                                    <TableCell><p className="max-w-[250px] truncate text-sm">{comment.content}</p></TableCell>
                                    <TableCell><span className="text-sm text-muted-foreground">{formatDateTime(comment.createdAt)}</span></TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteId(comment.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Hàng mỗi trang {PAGINATION.DEFAULT_LIMIT}</p>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="rounded-full" disabled={filters.page <= 1} onClick={() => updateParam("page", filters.page - 1)}>Trước</Button>
                        <span className="text-sm text-muted-foreground">{filters.page} trong {pagination.totalPages}</span>
                        <Button variant="outline" size="sm" className="rounded-full" disabled={filters.page >= pagination.totalPages} onClick={() => updateParam("page", filters.page + 1)}>Sau</Button>
                    </div>
                </div>
            )}

            <ConfirmDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)} title="Xóa bình luận" description="Bạn có chắc muốn xóa bình luận này?" onConfirm={handleDelete} isLoading={isDeleting} />
        </div>
    );
}
