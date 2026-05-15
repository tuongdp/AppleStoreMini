import { useState } from "react";
import { Sparkles, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAiCompareMutation } from "@/store/api/aiApi";
import { toast } from "sonner";

export default function AIComparePanel({ currentProduct, products }) {
  const [compareSlug, setCompareSlug] = useState("");
  const [result, setResult] = useState(null);

  const [compare, { isLoading }] = useAiCompareMutation();

  const allProducts = products || [];

  const handleCompare = async () => {
    const targetProduct = allProducts.find((p) => p.slug === compareSlug);
    if (!targetProduct) {
      toast.error("Không tìm thấy sản phẩm để so sánh");
      return;
    }
    if (compareSlug === currentProduct?.slug) {
      toast.error("Vui lòng chọn sản phẩm khác để so sánh");
      return;
    }
    try {
      const res = await compare({
        products: [
          { name: currentProduct?.name || "", specs: JSON.stringify(currentProduct?.specifications || {}) },
          { name: targetProduct.name || "", specs: JSON.stringify(targetProduct.specifications || {}) },
        ],
      }).unwrap();
      setResult(res);
    } catch {
      toast.error("Không thể kết nối AI, vui lòng thử lại");
    }
  };

  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-apple-blue" />
          AI So sánh sản phẩm
        </CardTitle>
        <CardDescription>
          Chọn sản phẩm để AI phân tích ưu nhược điểm và đưa ra gợi ý
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <p className="text-sm font-medium">Sản phẩm hiện tại</p>
            <Input value={currentProduct?.name || ""} disabled className="bg-muted" />
          </div>
          <div className="hidden sm:block self-end pb-0.5 text-muted-foreground">
            VS
          </div>
          <div className="flex-1 space-y-2">
            <p className="text-sm font-medium">Sản phẩm so sánh</p>
            <Input
              placeholder="Nhập tên sản phẩm..."
              value={compareSlug}
              onChange={(e) => setCompareSlug(e.target.value)}
              list="compare-products"
            />
            <datalist id="compare-products">
              {allProducts
                .filter((p) => p.slug !== currentProduct?.slug)
                .map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name}
                  </option>
                ))}
            </datalist>
          </div>
          <Button onClick={handleCompare} disabled={isLoading || !compareSlug} className="rounded-full shrink-0">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            {isLoading ? "Đang so sánh..." : "So sánh"}
          </Button>
        </div>

        {isLoading && (
          <div className="space-y-3">
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-20 animate-pulse rounded-xl bg-muted" />
          </div>
        )}

        {result && !isLoading && (
          <div className="space-y-4">
            {result.reply && (
              <div className="rounded-xl bg-muted/50 p-4">
                <p className="text-sm text-foreground whitespace-pre-wrap">{result.reply}</p>
              </div>
            )}
            {result.comparison && (
              <div className="space-y-4">
                {result.comparison.advantages && (
                  <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/30">
                    <p className="mb-2 flex items-center gap-1 text-sm font-medium text-green-700 dark:text-green-400">
                      <CheckCircle2 className="h-4 w-4" /> Ưu điểm
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-400 whitespace-pre-wrap">
                      {result.comparison.advantages}
                    </p>
                  </div>
                )}
                {result.comparison.disadvantages && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30">
                    <p className="mb-2 flex items-center gap-1 text-sm font-medium text-red-700 dark:text-red-400">
                      <XCircle className="h-4 w-4" /> Nhược điểm
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-400 whitespace-pre-wrap">
                      {result.comparison.disadvantages}
                    </p>
                  </div>
                )}
                {result.comparison.verdict && (
                  <div className="rounded-xl border border-apple-blue/30 bg-apple-blue/5 p-4">
                    <p className="mb-1 text-sm font-medium text-apple-blue">Kết luận</p>
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {result.comparison.verdict}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
