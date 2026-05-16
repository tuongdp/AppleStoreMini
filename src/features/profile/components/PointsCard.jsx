import { useState } from "react";
import { Coins, ChevronDown, ChevronUp } from "lucide-react";
import { useGetPointsHistoryQuery } from "@/store/api/pointsApi";
import { formatDateTime, formatNumber } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function PointsCard({ points }) {
    const [showHistory, setShowHistory] = useState(false);
    const { data, isLoading } = useGetPointsHistoryQuery(undefined, {
        skip: !showHistory,
    });

    const transactions = data?.transactions || [];

    return (
        <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/30">
                        <Coins className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Số dư điểm</p>
                        <p className="text-xl font-semibold text-foreground">
                            {formatNumber(points ?? 0)} điểm
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setShowHistory((v) => !v)}
                    className="flex items-center gap-1 text-sm text-apple-blue hover:opacity-70"
                >
                    Lịch sử
                    {showHistory ? (
                        <ChevronUp className="h-4 w-4" />
                    ) : (
                        <ChevronDown className="h-4 w-4" />
                    )}
                </button>
            </div>

            {showHistory && (
                <div className="mt-4 border-t border-border pt-4">
                    {isLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-12 w-full rounded-lg" />
                            ))}
                        </div>
                    ) : transactions.length === 0 ? (
                        <p className="py-4 text-center text-sm text-muted-foreground">
                            Chưa có giao dịch nào
                        </p>
                    ) : (
                        <div className="max-h-60 space-y-2 overflow-y-auto">
                            {transactions.map((tx) => {
                                const isEarn = tx.points > 0;
                                return (
                                    <div
                                        key={tx.id}
                                        className="flex items-center justify-between rounded-lg bg-muted/30 p-3"
                                    >
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
                                            {isEarn ? "+" : "-"}
                                            {formatNumber(Math.abs(tx.points))}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
