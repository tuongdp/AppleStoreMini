import { useEffect, useState } from "react";
import { Coins, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    useGetReviewRewardSettingQuery,
    useUpdateReviewRewardSettingMutation,
} from "@/store/api/ordersApi";
import { formatNumber } from "@/lib/utils";
import AdminCouponList from "@/features/admin/components/coupons/AdminCouponList";

export default function AdminCouponPage() {
    const { data: reviewRewardSetting, isLoading: isRewardLoading } = useGetReviewRewardSettingQuery();
    const [updateReviewReward, { isLoading: isUpdatingReward }] = useUpdateReviewRewardSettingMutation();
    const [rewardPoints, setRewardPoints] = useState("");
    const [rewardType, setRewardType] = useState("FIXED");

    useEffect(() => {
        if (reviewRewardSetting?.points != null) setRewardPoints(String(reviewRewardSetting.points));
        if (reviewRewardSetting?.type) setRewardType(reviewRewardSetting.type);
    }, [reviewRewardSetting?.points, reviewRewardSetting?.type]);

    const handleUpdateReviewReward = async () => {
        const points = Number(rewardPoints);
        if (!Number.isInteger(points) || points < 0) {
            toast.error("Điểm thưởng phải là số nguyên không âm");
            return;
        }
        if (rewardType === "PERCENT" && points > 100) {
            toast.error("Phần trăm không được vượt quá 100%");
            return;
        }

        try {
            await updateReviewReward({ points, type: rewardType }).unwrap();
            toast.success("Đã cập nhật điểm thưởng đánh giá");
        } catch (error) {
            toast.error(error?.data?.message || "Cập nhật điểm thưởng thất bại");
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-foreground">
                    {"Quản lý khuyến mãi"}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    {"Tạo và quản lý mã giảm giá cho khách hàng"}
                </p>
            </div>
            <AdminCouponList />
            <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                        <Coins className="h-4 w-4 text-amber-500" />
                        Chính sách thưởng đánh giá
                    </CardTitle>
                    {isRewardLoading ? <Skeleton className="h-5 w-20" /> : (
                        <Badge variant="secondary">{rewardType === "PERCENT" ? `${formatNumber(Number(reviewRewardSetting?.points ?? 20))}%` : `${formatNumber(Number(reviewRewardSetting?.points ?? 20000))} điểm`}</Badge>
                    )}
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <Select value={rewardType} onValueChange={setRewardType} disabled={isRewardLoading || isUpdatingReward}>
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="FIXED">Số điểm cố định</SelectItem>
                                    <SelectItem value="PERCENT">% giá sản phẩm</SelectItem>
                                </SelectContent>
                            </Select>
                            <div className="flex items-center gap-1">
                                <Input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={rewardPoints}
                                    onChange={(event) => setRewardPoints(event.target.value)}
                                    disabled={isRewardLoading || isUpdatingReward}
                                    className="w-28"
                                />
                                <span className="text-xs text-muted-foreground">{rewardType === "PERCENT" ? "%" : "điểm"}</span>
                            </div>
                        </div>
                        <Button type="button" size="sm" onClick={handleUpdateReviewReward} disabled={isRewardLoading || isUpdatingReward} className="w-fit">
                            {isUpdatingReward ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Lưu
                        </Button>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                        {rewardType === "PERCENT"
                            ? "Điểm thưởng = % × giá đơn hàng. Chỉ áp dụng trong 7 ngày từ khi nhận hàng."
                            : "Điểm cố định cho mỗi đánh giá. Chỉ áp dụng trong 7 ngày từ khi nhận hàng."}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
