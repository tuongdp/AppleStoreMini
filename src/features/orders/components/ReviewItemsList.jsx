import { useState } from "react";
import { Link } from "react-router-dom";
import { Star, MessageSquare } from "lucide-react";
import { useGetReviewItemsQuery } from "@/store/api/ordersApi";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ResponsiveImage from "@/components/shared/ResponsiveImage";
import { formatPrice, parseJsonField } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

const FILTER_TABS = [
    { value: "all", label: "Tất cả" },
    { value: "false", label: "Chưa đánh giá" },
    { value: "true", label: "Đã đánh giá" },
];

const PER_PAGE = 5;

export default function ReviewItemsList() {
    const [filter, setFilter] = useState("all");
    const [page, setPage] = useState(1);

    const params = { page, limit: PER_PAGE };
    if (filter !== "all") params.reviewed = filter;

    const { data, isLoading } = useGetReviewItemsQuery(params);
    const items = data?.items ?? [];
    const pagination = data?.pagination ?? {};

    return (
        <div className="space-y-4">
            <Tabs value={filter} onValueChange={(v) => { setFilter(v); setPage(1); }}>
                <TabsList className="h-auto w-full gap-1 bg-muted/40 p-1">
                    {FILTER_TABS.map((tab) => (
                        <TabsTrigger key={tab.value} value={tab.value} className="flex-1 rounded-md px-2 py-2 text-xs sm:text-sm">
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            {isLoading ? (
                <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-24 rounded-xl" />
                    ))}
                </div>
            ) : items.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                    {filter === "true" ? "Bạn chưa đánh giá sản phẩm nào" : "Không có sản phẩm nào cần đánh giá"}
                </p>
            ) : (
                <div className="space-y-3">
                    {items.map((item) => {
                        const v = item.variant || {};
                        const p = v.product || {};
                        const img = parseJsonField(v.images)?.[0] || null;

                        return (
                            <div key={item.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                                <Link to={ROUTES.PRODUCT_DETAIL(p.slug)} className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                                    {img ? (
                                        <ResponsiveImage src={img} alt={p.name} className="h-full w-full object-contain" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                            <MessageSquare className="h-5 w-5" />
                                        </div>
                                    )}
                                </Link>
                                <div className="min-w-0 flex-1">
                                    <Link to={ROUTES.PRODUCT_DETAIL(p.slug)} className="line-clamp-1 text-sm font-medium hover:text-apple-blue">
                                        {p.name}
                                    </Link>
                                    <p className="text-xs text-muted-foreground">
                                        {[v.color, v.storage].filter(Boolean).join(" · ") || "—"}
                                    </p>
                                    <div className="mt-1 flex items-center gap-2">
                                        <span className="text-sm font-semibold">{formatPrice(item.price)}</span>
                                        <span className="text-xs text-muted-foreground">x{item.quantity}</span>
                                        {item.isReviewed && (
                                            <Badge variant="secondary" className="text-[10px]">
                                                <Star className="mr-0.5 h-2.5 w-2.5 fill-current" />
                                                Đã đánh giá
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                {!item.isReviewed && (
                                    <Button asChild size="sm" variant="outline" className="shrink-0 rounded-full text-xs">
                                        <Link to={`${ROUTES.PRODUCT_DETAIL(p.slug)}?review=1`}>Đánh giá</Link>
                                    </Button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                    <Button variant="outline" size="sm" className="rounded-full" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                        Trước
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        {page} / {pagination.totalPages}
                    </span>
                    <Button variant="outline" size="sm" className="rounded-full" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>
                        Sau
                    </Button>
                </div>
            )}
        </div>
    );
}
