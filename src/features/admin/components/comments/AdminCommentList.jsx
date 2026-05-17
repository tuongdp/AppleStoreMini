import { useState } from "react";
import { Eye, EyeOff, MessageSquareReply, Search, Star, Trash2 } from "lucide-react";
import {
    useAdminDeleteReviewMutation,
    useGetAdminReviewQuery,
    useGetAllReviewsQuery,
    useReplyReviewMutation,
    useToggleReviewVisibilityMutation,
} from "@/store/api/productReviewApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { toast } from "sonner";
import { cn, formatDateTime, formatPrice, parseJsonField } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import { PAGINATION } from "@/lib/constants";
import { Link, useSearchParams } from "react-router-dom";

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
                <Star key={star} className={cn("h-3.5 w-3.5", star <= rating ? "fill-amber-400 text-amber-400" : "fill-muted text-muted")} />
            ))}
        </div>
    );
}

const firstImage = (...sources) => {
    for (const source of sources) {
        const parsed = parseJsonField(source);
        if (Array.isArray(parsed) && parsed[0]) {
            return parsed[0];
        }
        if (typeof source === "string" && source.trim()) {
            return source;
        }
    }
    return "";
};

const variantText = (item) => {
    const variant = item?.variant || {};
    return [
        item?.color || variant.color,
        item?.storage || variant.storage,
        item?.ram || variant.ram,
        variant.edition,
    ].filter(Boolean).join(" / ");
};

function ReviewDetailDialog({ reviewId, open, onOpenChange }) {
    const [replyById, setReplyById] = useState({});
    const { data: review, isFetching } = useGetAdminReviewQuery(reviewId, { skip: !reviewId || !open });
    const [replyReview, { isLoading: isReplying }] = useReplyReviewMutation();
    const reply = replyById[reviewId] ?? review?.adminReply ?? "";

    const handleReply = async () => {
        try {
            await replyReview({ reviewId, content: reply }).unwrap();
            toast.success("Đã phản hồi bình luận");
        } catch {
            toast.error("Có lỗi xảy ra");
        }
    };

    const images = parseJsonField(review?.images) || [];
    const productImage = parseJsonField(review?.product?.images)?.[0];
    const purchasedItem = review?.purchasedItem;
    const purchasedImage = firstImage(
        purchasedItem?.image,
        purchasedItem?.variant?.images,
        purchasedItem?.variant?.product?.images,
        review?.product?.images,
    );
    const purchasedVariantText = variantText(purchasedItem);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Chi tiết bình luận sản phẩm</DialogTitle>
                    <DialogDescription>Xem nội dung đánh giá và phản hồi khách hàng.</DialogDescription>
                </DialogHeader>

                {isFetching ? (
                    <div className="space-y-3">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-28 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                ) : review ? (
                    <div className="space-y-5">
                        <div className="flex items-start justify-between gap-3 rounded-lg border p-3">
                            <div className="flex min-w-0 items-center gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={review.user?.avatar} alt={review.user?.fullName} />
                                    <AvatarFallback>{review.user?.fullName?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <p className="font-medium">{review.user?.fullName}</p>
                                    <p className="truncate text-xs text-muted-foreground">{review.user?.email}</p>
                                </div>
                            </div>
                            <Badge variant={review.isVisible !== false ? "secondary" : "outline"}>
                                {review.isVisible !== false ? "Hiển thị" : "Đã ẩn"}
                            </Badge>
                        </div>

                        <div className="flex items-center gap-3 rounded-lg border p-3">
                            {productImage && <img src={productImage} alt={review.product?.name} className="h-12 w-12 rounded-md object-contain" />}
                            <div className="min-w-0">
                                <Link to={`/products/${review.product?.slug}`} className="font-medium text-blue-600 hover:underline">
                                    {review.product?.name}
                                </Link>
                                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                    <StarDisplay rating={review.rating} />
                                    <span>{formatDateTime(review.createdAt)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 rounded-lg border p-3">
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-sm font-medium">Sản phẩm khách mua</p>
                                {purchasedItem?.order?.code && (
                                    <Badge variant="outline">#{purchasedItem.order.code}</Badge>
                                )}
                            </div>
                            {purchasedItem ? (
                                <div className="flex gap-3">
                                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted p-1">
                                        {purchasedImage && (
                                            <img src={purchasedImage} alt={purchasedItem.name} className="h-full w-full object-contain" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1 space-y-1 text-sm">
                                        <p className="font-medium text-foreground">{purchasedItem.name}</p>
                                        {purchasedVariantText && (
                                            <p className="text-muted-foreground">Variant: {purchasedVariantText}</p>
                                        )}
                                        <div className="grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                                            <span>Variant ID: {purchasedItem.variantId}</span>
                                            <span>Số lượng: {purchasedItem.quantity}</span>
                                            <span>Giá mua: {formatPrice(purchasedItem.price)}</span>
                                            {purchasedItem.order?.createdAt && <span>Ngày mua: {formatDateTime(purchasedItem.order.createdAt)}</span>}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                                    Chưa xác định được biến thể đã mua cho đánh giá này.
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-medium">Nội dung bình luận</p>
                            <p className="rounded-lg bg-muted/50 p-3 text-sm">{review.content || "Không có nhận xét"}</p>
                        </div>

                        {images.length > 0 && (
                            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                                {images.map((src, index) => (
                                    <img key={`${src}-${index}`} src={src} alt={`review-${index + 1}`} className="aspect-square rounded-md border object-cover" />
                                ))}
                            </div>
                        )}

                        {review.repliedAt && (
                            <p className="text-xs text-muted-foreground">
                                Phản hồi gần nhất bởi {review.repliedByName || "nhân viên"} lúc {formatDateTime(review.repliedAt)}
                            </p>
                        )}

                        <div className="space-y-2">
                            <p className="text-sm font-medium">Phản hồi của cửa hàng</p>
                            <Textarea
                                value={reply}
                                onChange={(e) => setReplyById((current) => ({ ...current, [reviewId]: e.target.value }))}
                                rows={4}
                                placeholder="Nhập phản hồi..."
                            />
                        </div>
                    </div>
                ) : null}

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Đóng</Button>
                    <Button onClick={handleReply} disabled={isReplying || !reply.trim()}>
                        {isReplying ? "Đang gửi..." : "Gửi phản hồi"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function AdminCommentList() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
    const [deleteId, setDeleteId] = useState(null);
    const [detailId, setDetailId] = useState(null);
    const debouncedSearch = useDebounce(searchInput, 400);

    const filters = {
        page: Number(searchParams.get("page")) || 1,
        limit: PAGINATION.DEFAULT_LIMIT,
        rating: searchParams.get("rating") || undefined,
        search: debouncedSearch || undefined,
    };

    const { data, isLoading } = useGetAllReviewsQuery(filters);
    const [deleteReview, { isLoading: isDeleting }] = useAdminDeleteReviewMutation();
    const [toggleVisibility, { isLoading: isToggling }] = useToggleReviewVisibilityMutation();
    const reviews = data?.reviews ?? [];
    const pagination = data?.pagination ?? {};

    const updateParam = (key, value) => {
        const params = new URLSearchParams(searchParams);
        if (value && value !== "all") params.set(key, value);
        else params.delete(key);
        if (key !== "page") params.set("page", "1");
        setSearchParams(params);
    };

    const handleDelete = async () => {
        try {
            await deleteReview(deleteId).unwrap();
            toast.success("Đã xóa bình luận");
        } catch {
            toast.error("Có lỗi xảy ra");
        } finally {
            setDeleteId(null);
        }
    };

    const handleToggleVisibility = async (review) => {
        try {
            await toggleVisibility(review.id).unwrap();
            toast.success(review.isVisible !== false ? "Đã ẩn đánh giá" : "Đã hiện đánh giá");
        } catch {
            toast.error("Có lỗi xảy ra");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative max-w-xs min-w-[200px] flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Tìm sản phẩm hoặc người dùng..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="rounded-full pl-9" />
                </div>
                <Select value={searchParams.get("rating") || "all"} onValueChange={(val) => updateParam("rating", val)}>
                    <SelectTrigger className="w-36 rounded-full"><SelectValue placeholder="Lọc sao" /></SelectTrigger>
                    <SelectContent>{RATING_OPTIONS.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                </Select>
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead>Người dùng</TableHead>
                            <TableHead>Sản phẩm</TableHead>
                            <TableHead>Đánh giá</TableHead>
                            <TableHead>Nội dung</TableHead>
                            <TableHead>Phản hồi</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead>Ngày tạo</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            [...Array(6)].map((_, i) => (
                                <TableRow key={i}>{[...Array(8)].map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}</TableRow>
                            ))
                        ) : reviews.length === 0 ? (
                            <TableRow><TableCell colSpan={8} className="py-12 text-center text-muted-foreground">Không có dữ liệu</TableCell></TableRow>
                        ) : (
                            reviews.map((review) => {
                                const img = parseJsonField(review.product?.images)?.[0] || review.product?.image;
                                return (
                                    <TableRow key={review.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-7 w-7">
                                                    <AvatarImage src={review.user?.avatar} alt={review.user?.fullName} />
                                                    <AvatarFallback className="text-xs">{review.user?.fullName?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-medium">{review.user?.fullName}</p>
                                                    <p className="truncate text-xs text-muted-foreground">{review.user?.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {img && <img src={img} alt={review.product?.name} className="h-8 w-8 rounded-lg object-contain" />}
                                                <p className="max-w-[140px] truncate text-sm">{review.product?.name}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell><StarDisplay rating={review.rating} /></TableCell>
                                        <TableCell><p className="max-w-[200px] truncate text-sm text-muted-foreground">{review.content || "Không có nhận xét"}</p></TableCell>
                                        <TableCell>{review.adminReply ? <Badge variant="secondary">Đã phản hồi</Badge> : <Badge variant="outline">Chưa phản hồi</Badge>}</TableCell>
                                        <TableCell><Badge className={review.isVisible !== false ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-muted text-muted-foreground hover:bg-muted"}>{review.isVisible !== false ? "Hiển thị" : "Đã ẩn"}</Badge></TableCell>
                                        <TableCell><span className="text-sm text-muted-foreground">{formatDateTime(review.createdAt)}</span></TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDetailId(review.id)} title="Xem chi tiết và phản hồi">
                                                    <MessageSquareReply className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isToggling} onClick={() => handleToggleVisibility(review)} title={review.isVisible !== false ? "Ẩn bình luận" : "Hiện bình luận"}>
                                                    {review.isVisible !== false ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteId(review.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
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

            <ReviewDetailDialog reviewId={detailId} open={!!detailId} onOpenChange={(open) => !open && setDetailId(null)} />
            <ConfirmDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)} title="Xóa bình luận" description="Bạn có chắc muốn xóa bình luận này? Hành động này không thể hoàn tác." onConfirm={handleDelete} isLoading={isDeleting} />
        </div>
    );
}
