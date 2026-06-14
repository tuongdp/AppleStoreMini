import { useGetSentimentStatsQuery } from "@/store/api/productReviewApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";
import useAiFeatureAvailable from "@/features/ai/useAiFeatureAvailable";
import { Sparkles } from "lucide-react";

export default function SentimentDashboard() {
    const { data, isLoading } = useGetSentimentStatsQuery();
    const { available: aiSentimentAvailable } = useAiFeatureAvailable("sentiment");
    const products = data?.products;
    const sortedProducts = useMemo(
        () => [...(products || [])].sort((a, b) => (b.positive + b.negative + b.neutral) - (a.positive + a.negative + a.neutral)),
        [products]
    );

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-64" />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {[...Array(3)].map((_, i) => (<Skeleton key={i} className="h-28 rounded-2xl" />))}
                </div>
                <Skeleton className="h-96 rounded-2xl" />
            </div>
        );
    }

    const overview = data?.overview || {};
    const productRows = products || [];

    const totalWithSentiment = productRows.reduce((sum, p) => sum + p.positive + p.negative + p.neutral, 0);
    const allPositive = productRows.reduce((sum, p) => sum + p.positive, 0);
    const allNegative = productRows.reduce((sum, p) => sum + p.negative, 0);
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Phân tích cảm xúc đánh giá</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Tổng hợp sentiment từ đánh giá của khách hàng
                    </p>
                </div>
                <Badge variant={aiSentimentAvailable ? "default" : "secondary"} className="gap-1.5 h-6">
                    <Sparkles className="h-3 w-3" />
                    {aiSentimentAvailable ? "AI phân tích" : "Phân tích cơ bản"}
                </Badge>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Tổng đánh giá</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{totalWithSentiment || overview.total || 0}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Tích cực</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-green-600">
                            {totalWithSentiment > 0 ? Math.round((allPositive / totalWithSentiment) * 100) : 0}%
                        </p>
                        <p className="text-xs text-muted-foreground">{allPositive} đánh giá</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Tiêu cực</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-red-600">
                            {totalWithSentiment > 0 ? Math.round((allNegative / totalWithSentiment) * 100) : 0}%
                        </p>
                        <p className="text-xs text-muted-foreground">{allNegative} đánh giá</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Điểm TB</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{overview.averageScore || 0}</p>
                        <p className="text-xs text-muted-foreground">thang 0-1</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Chi tiết theo sản phẩm</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Sản phẩm</TableHead>
                                <TableHead className="text-center">Tích cực</TableHead>
                                <TableHead className="text-center">Tiêu cực</TableHead>
                                <TableHead className="text-center">Trung lập</TableHead>
                                <TableHead className="text-center">Điểm TB</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {productRows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                        Chưa có dữ liệu sentiment
                                    </TableCell>
                                </TableRow>
                            ) : (
                                sortedProducts
                                    .map((product) => (
                                        <TableRow key={product.productId}>
                                            <TableCell className="font-medium max-w-[300px] truncate">
                                                {product.name}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="text-green-600 font-medium">{product.positive}</span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="text-red-600 font-medium">{product.negative}</span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="text-gray-600 font-medium">{product.neutral}</span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">{product.averageScore}</span>
                                            </TableCell>
                                        </TableRow>
                                    ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
