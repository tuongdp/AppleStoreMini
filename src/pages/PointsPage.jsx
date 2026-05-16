import { useState } from "react";
import { Coins, ChevronRight, History, Sparkles } from "lucide-react";
import { useGetMyPointsQuery, useGetPointsHistoryQuery } from "@/store/api/pointsApi";
import { formatDateTime, formatNumber, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function PointsPage() {
    const [showHistory, setShowHistory] = useState(true);

    const { data: pointsData, isLoading: pointsLoading } = useGetMyPointsQuery();
    const { data: historyData, isLoading: historyLoading } = useGetPointsHistoryQuery(undefined, { skip: !showHistory });

    const points = pointsData?.points ?? 0;
    const transactions = historyData?.transactions || [];

    if (pointsLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-32 w-full rounded-xl" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-foreground">Điểm thưởng</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Điểm được dùng như tiền để trừ trực tiếp khi thanh toán.
                </p>
            </div>

            <div className="rounded-xl text-white" style={{ background: "linear-gradient(to bottom right, #f59e0b, #ea580c)" }}>
                <div className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-white/80">Số dư điểm</p>
                            <p className="mt-1 text-4xl font-bold">{formatNumber(points)}</p>
                            <p className="mt-1 text-sm text-white/70">Tương đương {formatPrice(points)}</p>
                        </div>
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                            <Coins className="h-8 w-8" />
                        </div>
                    </div>
                    <div className="mt-4 rounded-xl bg-white/10 px-4 py-2.5 text-xs text-white/80">
                        <Sparkles className="mr-1 inline h-3.5 w-3.5" />
                        Nhận điểm thưởng cho mỗi đánh giá sản phẩm hợp lệ.
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Lịch sử giao dịch</h2>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHistory((v) => !v)}
                    className="text-apple-blue"
                >
                    <History className="mr-1 h-4 w-4" />
                    Lịch sử
                    <ChevronRight className={`ml-1 h-4 w-4 transition-transform ${showHistory ? "rotate-90" : ""}`} />
                </Button>
            </div>

            {showHistory && (
                <Card>
                    <CardContent className="p-0">
                        {historyLoading ? (
                            <div className="space-y-3 p-4">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-14 w-full rounded-lg" />
                                ))}
                            </div>
                        ) : transactions.length === 0 ? (
                            <p className="p-6 text-center text-sm text-muted-foreground">Chưa có giao dịch nào</p>
                        ) : (
                            <div className="divide-y divide-border">
                                {transactions.map((tx) => {
                                    const isEarn = tx.points > 0;
                                    return (
                                        <div key={tx.id} className="flex items-center justify-between px-4 py-3.5">
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-foreground">
                                                    {tx.description}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDateTime(tx.createdAt)}
                                                </p>
                                            </div>
                                            <span
                                                className={`ml-3 shrink-0 text-sm font-semibold ${
                                                    isEarn
                                                        ? "text-green-600 dark:text-green-400"
                                                        : "text-red-600 dark:text-red-400"
                                                }`}
                                            >
                                                {isEarn ? "+" : "-"}{formatNumber(Math.abs(tx.points))}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
