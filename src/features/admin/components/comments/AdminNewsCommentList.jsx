import { useState } from "react";
import { MessageSquareReply, Search, Trash2 } from "lucide-react";
import {
    useAdminDeleteNewsCommentMutation,
    useGetAdminNewsCommentQuery,
    useGetAllNewsCommentsQuery,
    useReplyNewsCommentMutation,
} from "@/store/api/newsApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { toast } from "sonner";
import { formatDateTime } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import { PAGINATION } from "@/lib/constants";
import { Link, useSearchParams } from "react-router-dom";

function NewsCommentDetailDialog({ commentId, open, onOpenChange }) {
    const [replyById, setReplyById] = useState({});
    const { data: comment, isFetching } = useGetAdminNewsCommentQuery(commentId, { skip: !commentId || !open });
    const [replyComment, { isLoading: isReplying }] = useReplyNewsCommentMutation();
    const reply = replyById[commentId] || "";

    const handleReply = async () => {
        try {
            await replyComment({ commentId, content: reply }).unwrap();
            setReplyById((current) => ({ ...current, [commentId]: "" }));
            toast.success("Đã phản hồi bình luận");
        } catch {
            toast.error("Có lỗi xảy ra");
        }
    };

    const threadRoot = comment?.parent || comment;
    const replies = comment?.parent ? [comment] : comment?.replies || [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Chi tiết bình luận tin tức</DialogTitle>
                    <DialogDescription>Xem nội dung bình luận và phản hồi khách hàng.</DialogDescription>
                </DialogHeader>

                {isFetching ? (
                    <div className="space-y-3">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                ) : comment ? (
                    <div className="space-y-5">
                        <div className="space-y-1 rounded-lg border p-3">
                            <p className="text-xs text-muted-foreground">Bài viết</p>
                            <Link to={`/news/${comment.news?.slug}`} className="font-medium text-blue-600 hover:underline">
                                {comment.news?.title}
                            </Link>
                        </div>

                        <div className="rounded-lg border p-3">
                            <div className="mb-3 flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={threadRoot.user?.avatar} alt={threadRoot.user?.fullName} />
                                    <AvatarFallback>{threadRoot.user?.fullName?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium">{threadRoot.user?.fullName}</p>
                                    <p className="text-xs text-muted-foreground">{formatDateTime(threadRoot.createdAt)}</p>
                                </div>
                            </div>
                            <p className="whitespace-pre-wrap text-sm">{threadRoot.content}</p>
                        </div>

                        {replies.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Phản hồi</p>
                                {replies.map((item) => (
                                    <div key={item.id} className="rounded-lg border bg-muted/30 p-3">
                                        <div className="mb-2 flex items-center justify-between gap-2">
                                            <div className="flex min-w-0 items-center gap-2">
                                                <Avatar className="h-7 w-7">
                                                    <AvatarImage src={item.user?.avatar} alt={item.user?.fullName} />
                                                    <AvatarFallback>{item.user?.fullName?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-medium">{item.user?.fullName}</p>
                                                    <p className="text-xs text-muted-foreground">{formatDateTime(item.createdAt)}</p>
                                                </div>
                                            </div>
                                            {["ADMIN", "STAFF", "admin", "staff"].includes(item.user?.role) && <Badge variant="secondary">Nhân viên</Badge>}
                                        </div>
                                        <p className="whitespace-pre-wrap text-sm">{item.content}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="space-y-2">
                            <p className="text-sm font-medium">Trả lời bình luận</p>
                            <Textarea
                                value={reply}
                                onChange={(e) => setReplyById((current) => ({ ...current, [commentId]: e.target.value }))}
                                rows={4}
                                placeholder="Nhập phản hồi..."
                            />
                        </div>
                    </div>
                ) : null}

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Đóng</Button>
                    <Button onClick={handleReply} disabled={isReplying || !reply.trim()}>{isReplying ? "Đang gửi..." : "Gửi phản hồi"}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function AdminNewsCommentList() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
    const [deleteId, setDeleteId] = useState(null);
    const [detailId, setDetailId] = useState(null);
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
        if (value) params.set(key, value);
        else params.delete(key);
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
                            <TableHead>Loại</TableHead>
                            <TableHead>Ngày tạo</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            [...Array(6)].map((_, i) => (
                                <TableRow key={i}>{[...Array(6)].map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}</TableRow>
                            ))
                        ) : comments.length === 0 ? (
                            <TableRow><TableCell colSpan={6} className="py-12 text-center text-muted-foreground">Không có dữ liệu</TableCell></TableRow>
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
                                    <TableCell><Link to={`/news/${comment.news?.slug}`} className="block max-w-[160px] truncate text-sm text-blue-600 hover:underline">{comment.news?.title}</Link></TableCell>
                                    <TableCell><p className="max-w-[250px] truncate text-sm">{comment.content}</p></TableCell>
                                    <TableCell>{comment.parentId ? <Badge variant="secondary">Phản hồi</Badge> : <Badge variant="outline">Bình luận</Badge>}</TableCell>
                                    <TableCell><span className="text-sm text-muted-foreground">{formatDateTime(comment.createdAt)}</span></TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDetailId(comment.id)} title="Xem chi tiết và phản hồi">
                                            <MessageSquareReply className="h-4 w-4" />
                                        </Button>
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

            <NewsCommentDetailDialog commentId={detailId} open={!!detailId} onOpenChange={(open) => !open && setDetailId(null)} />
            <ConfirmDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)} title="Xóa bình luận" description="Bạn có chắc muốn xóa bình luận này?" onConfirm={handleDelete} isLoading={isDeleting} />
        </div>
    );
}
