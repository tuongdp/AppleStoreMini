import { Link } from "react-router-dom";
import { ArrowUpRight, Lightbulb, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetDashboardAiInsightsQuery } from "@/store/api/ordersApi";
import { cn } from "@/lib/utils";

const severityClass = {
    HIGH: "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400",
    MEDIUM: "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
    LOW: "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
};

const severityLabel = {
    HIGH: "Cao",
    MEDIUM: "Vừa",
    LOW: "Thấp",
};

export default function AdminAiInsights() {
    const { data, isLoading, isFetching } = useGetDashboardAiInsightsQuery(undefined, {
        pollingInterval: 60000,
    });
    const insights = data?.insights || [];

    return (
        <Card className="border-border">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                        <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
                        Gợi ý vận hành AI
                    </CardTitle>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {data?.summary || "AI đọc dữ liệu dashboard và đề xuất việc admin nên ưu tiên."}
                    </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                    <Badge variant={data?.aiOnline ? "default" : "secondary"}>
                        {data?.aiOnline ? "AI online" : "Dự phòng"}
                    </Badge>
                    {data?.modelName && <Badge variant="outline">{data.modelName}</Badge>}
                </div>
            </CardHeader>
            <CardContent>
                {isLoading || isFetching ? (
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <Skeleton key={index} className="h-32 rounded-lg" />
                        ))}
                    </div>
                ) : insights.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border py-8 text-center">
                        <Lightbulb className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
                        <p className="mt-2 text-sm font-medium text-foreground">Chưa có gợi ý vận hành mới</p>
                    </div>
                ) : (
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        {insights.map((item, index) => (
                            <Link
                                key={`${item.title}-${index}`}
                                to={item.href || "/admin/dashboard"}
                                className="flex min-h-32 flex-col justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted"
                            >
                                <div className="space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <span className={cn("rounded-md px-2 py-1 text-[11px] font-medium", severityClass[item.severity] || severityClass.MEDIUM)}>
                                            {severityLabel[item.severity] || "Vừa"}
                                        </span>
                                        <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                                    </div>
                                    <div>
                                        <p className="line-clamp-2 text-sm font-medium text-foreground">{item.title}</p>
                                        <p className="mt-1 line-clamp-3 text-xs leading-5 text-muted-foreground">{item.description}</p>
                                    </div>
                                </div>
                                <span className="mt-3 text-xs font-medium text-primary">{item.actionLabel || "Xem chi tiết"}</span>
                            </Link>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
