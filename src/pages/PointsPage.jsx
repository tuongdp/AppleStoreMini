import { useState } from "react";
import { Coins, Gift, Copy, Check, ChevronRight, ArrowLeft, History, Sparkles } from "lucide-react";
import { useGetMyPointsQuery, useGetRedeemPackagesQuery, useGetPointsHistoryQuery, useRedeemPointsMutation } from "@/store/api/pointsApi";
import { formatDateTime, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function PointsPage() {
    const [showHistory, setShowHistory] = useState(false);
    const [selectedPkg, setSelectedPkg] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [result, setResult] = useState(null);
    const [copied, setCopied] = useState(false);

    const { data: pointsData, isLoading: pointsLoading } = useGetMyPointsQuery();
    const { data: packages, isLoading: packagesLoading } = useGetRedeemPackagesQuery();
    const { data: historyData, isLoading: historyLoading } = useGetPointsHistoryQuery(undefined, { skip: !showHistory });

    const [redeem, { isLoading: redeeming }] = useRedeemPointsMutation();

    const points = pointsData?.points ?? 0;
    const transactions = historyData?.transactions || [];
    const fixedPkgs = (packages || []).filter((p) => p.type === "FIXED");
    const pctPkgs = (packages || []).filter((p) => p.type === "PERCENT");

    const handleRedeem = async () => {
        if (!selectedPkg) return;
        try {
            const res = await redeem({ packageId: selectedPkg.id }).unwrap();
            setResult(res);
            setConfirmOpen(false);
            setSelectedPkg(null);
            toast.success("Đổi điểm thành công!");
        } catch (err) {
            toast.error(err?.data?.message || "Đang xử lý...");
        }
    };

    const copyCode = async (code) => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            toast.success("Đã sao chép");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Có lỗi xảy ra");
        }
    };

    if (pointsLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold text-foreground">{"Điểm thưởng"}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{"Tích điểm và đổi quà"}</p>
            </div>

            {/* Balance card */}
            <div className="rounded-xl text-white" style={{ background: "linear-gradient(to bottom right, #f59e0b, #ea580c)" }}>
                <div className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-white/80">{"Số dư điểm"}</p>
                            <p className="mt-1 text-4xl font-bold">{points.toLocaleString()}</p>
                            <p className="mt-1 text-sm text-white/70">{"Điểm"}</p>
                        </div>
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                            <Coins className="h-8 w-8" />
                        </div>
                    </div>
                    <div className="mt-4 rounded-xl bg-white/10 px-4 py-2.5 text-xs text-white/80">
                        <Sparkles className="mr-1 inline h-3.5 w-3.5" />
                        {"earnRate"}
                    </div>
                </div>
            </div>

            {/* Redeem section */}
            <div>
                <h2 className="mb-4 text-lg font-semibold text-foreground">{"Đổi điểm lấy voucher"}</h2>
                <p className="mb-4 text-sm text-muted-foreground">{"Chọn gói quy đổi phù hợp"}</p>

                {packagesLoading ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-28 rounded-2xl" />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Fixed packages */}
                        {fixedPkgs.length > 0 && (
                            <div>
                                <Badge variant="secondary" className="mb-3">
                                    {"Voucher giảm tiền mặt"}
                                </Badge>
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                    {fixedPkgs.map((pkg) => (
                                        <PackageCard
                                            key={pkg.id}
                                            pkg={pkg}
                                            points={points}
                                            onRedeem={() => {
                                                setSelectedPkg(pkg);
                                                setConfirmOpen(true);
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Percent packages */}
                        {pctPkgs.length > 0 && (
                            <div>
                                <Badge variant="secondary" className="mb-3">
                                    {"Voucher giảm %"}
                                </Badge>
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                    {pctPkgs.map((pkg) => (
                                        <PackageCard
                                            key={pkg.id}
                                            pkg={pkg}
                                            points={points}
                                            onRedeem={() => {
                                                setSelectedPkg(pkg);
                                                setConfirmOpen(true);
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Result dialog */}
            <Dialog open={!!result} onOpenChange={(o) => { if (!o) setResult(null); }}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                            <Gift className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <DialogTitle className="text-center">{"Đổi điểm thành công!"}</DialogTitle>
                        <DialogDescription className="text-center">
                            {"Mã giảm giá của bạn là:"}
                        </DialogDescription>
                    </DialogHeader>
                    {result && (
                        <div className="space-y-3">
                            <div className="rounded-xl bg-muted p-4 text-center">
                                <p className="text-xs text-muted-foreground mb-1">{result.label}</p>
                                <p className="text-lg font-bold tracking-wider text-foreground">{result.code}</p>
                            </div>
                            <Button
                                className="w-full rounded-full"
                                variant="outline"
                                onClick={() => copyCode(result.code)}
                            >
                                {copied ? (
                                    <><Check className="mr-2 h-4 w-4 text-green-500" />{"Đã sao chép"}</>
                                ) : (
                                    <><Copy className="mr-2 h-4 w-4" />{"Sao chép mã"}</>
                                )}
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Confirm dialog */}
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>{"Xác nhận đổi điểm"}</DialogTitle>
                        <DialogDescription>
                            {selectedPkg && "confirmDesc"}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setConfirmOpen(false)} className="rounded-full">
                            {"Huỷ"}
                        </Button>
                        <Button onClick={handleRedeem} disabled={redeeming} className="rounded-full">
                            {redeeming ? "Đang xử lý..." : "Xác nhận"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* History toggle */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">{"Lịch sử giao dịch"}</h2>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHistory((v) => !v)}
                    className="text-apple-blue"
                >
                    <History className="mr-1 h-4 w-4" />
                    {"Lịch sử"}
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
                            <p className="p-6 text-center text-sm text-muted-foreground">{"Chưa có giao dịch nào"}</p>
                        ) : (
                            <div className="divide-y divide-border">
                                {transactions.map((tx) => {
                                    const isEarn = tx.points > 0;
                                    return (
                                        <div key={tx.id} className="flex items-center justify-between px-4 py-3.5">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-foreground truncate">
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
                                                {isEarn ? "+" : ""}{tx.points}
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

function PackageCard({ pkg, points, onRedeem }) {
    const canAfford = points >= pkg.points;
    const isPercent = pkg.type === "PERCENT";

    return (
        <Card
            className={`transition-all duration-200 ${
                canAfford
                    ? "cursor-pointer hover:border-amber-500 hover:shadow-md"
                    : "opacity-50"
            }`}
            onClick={canAfford ? onRedeem : undefined}
        >
            <CardHeader className="p-4 pb-2">
                <CardTitle className="flex items-center justify-between">
                    <span className="text-base">{pkg.label}</span>
                    <Badge variant={isPercent ? "secondary" : "default"}>
                        {isPercent ? "%" : "đ"}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Coins className="h-3.5 w-3.5 text-amber-500" />
                        <span className="font-semibold text-foreground">
                            {formatPrice(pkg.points)}
                        </span>
                    </div>
                    <Button
                        size="sm"
                        className="rounded-full"
                        disabled={!canAfford}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (canAfford) onRedeem();
                        }}
                    >
                        {"Đổi ngay"}
                    </Button>
                </div>
                {!canAfford && (
                    <p className="mt-2 text-xs text-red-500">{"Bạn không đủ điểm để đổi gói này"}</p>
                )}
            </CardContent>
        </Card>
    );
}
