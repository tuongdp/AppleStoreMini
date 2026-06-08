import { useState } from "react";
import { ClipboardList, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAiReviewSummaryMutation } from "@/store/api/aiApi";
import { toast } from "sonner";
import useAiFeatureAvailable from "@/features/ai/useAiFeatureAvailable";

export default function AIReviewSummary({ productSlug, reviews }) {
  const [result, setResult] = useState(null);
  const [summarize, { isLoading }] = useAiReviewSummaryMutation();
  const { available: aiAvailable } = useAiFeatureAvailable("reviewSummary");

  const hasReviews = reviews && reviews.length > 0;

  const handleSummarize = async () => {
    try {
      const res = await summarize({
        productSlug,
        reviews: reviews.map((r) => ({
          rating: r.rating,
          comment: r.comment || r.content || "",
          createdAt: r.createdAt,
        })),
      }).unwrap();
      setResult(res);
    } catch {
      toast.error("Không thể kết nối AI, vui lòng thử lại");
    }
  };

  if (!hasReviews) return null;
  if (!aiAvailable) return null;

  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-apple-blue" />
          AI Tổng hợp đánh giá
        </CardTitle>
        <CardDescription>
          AI phân tích và tóm tắt cảm nhận của khách hàng về sản phẩm này
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!result && (
          <Button
            onClick={handleSummarize}
            disabled={isLoading}
            variant="outline"
            className="rounded-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang phân tích...
              </>
            ) : (
              <>
                <ClipboardList className="mr-2 h-4 w-4" />
                Phân tích đánh giá
              </>
            )}
          </Button>
        )}

        {isLoading && (
          <div className="space-y-3">
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-16 animate-pulse rounded-xl bg-muted" />
          </div>
        )}

        {result && (
          <div className="space-y-4">
            {result.sentiment && (
              <div className="flex gap-2">
                <div className="flex-1 rounded-lg bg-green-100 p-3 text-center dark:bg-green-950/30">
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    {Math.round(result.sentiment.positive)}%
                  </p>
                  <p className="text-xs text-muted-foreground">Tích cực</p>
                </div>
                <div className="flex-1 rounded-lg bg-muted p-3 text-center">
                  <p className="text-lg font-bold text-muted-foreground">
                    {Math.round(result.sentiment.neutral)}%
                  </p>
                  <p className="text-xs text-muted-foreground">Trung tính</p>
                </div>
                <div className="flex-1 rounded-lg bg-red-100 p-3 text-center dark:bg-red-950/30">
                  <p className="text-lg font-bold text-red-600 dark:text-red-400">
                    {Math.round(result.sentiment.negative)}%
                  </p>
                  <p className="text-xs text-muted-foreground">Tiêu cực</p>
                </div>
              </div>
            )}
            {result.summary && (
              <div className="rounded-xl bg-muted/50 p-4">
                <p className="text-sm text-foreground whitespace-pre-wrap">{result.summary}</p>
              </div>
            )}
            {result.highlights && result.highlights.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium">Điểm nổi bật</p>
                <ul className="space-y-1">
                  {result.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-apple-blue" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
