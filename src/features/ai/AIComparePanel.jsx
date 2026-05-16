import { useState, useMemo, useCallback } from "react";
import { Sparkles, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import SearchableSelect from "@/components/shared/SearchableSelect";
import { useAiCompareMutation } from "@/store/api/aiApi";
import { toast } from "sonner";

function parseComparisonReply(reply) {
  if (!reply) return { intro: "", advantages: "", disadvantages: "", verdict: "" };

  const intro = reply
    .replace(/<advantages>[\s\S]*?<\/advantages>/g, "")
    .replace(/<disadvantages>[\s\S]*?<\/disadvantages>/g, "")
    .replace(/<verdict>[\s\S]*?<\/verdict>/g, "")
    .replace(/\*\*/g, "")
    .trim();

  const advMatch = reply.match(/<advantages>([\s\S]*?)<\/advantages>/);
  const disMatch = reply.match(/<disadvantages>([\s\S]*?)<\/disadvantages>/);
  const verMatch = reply.match(/<verdict>([\s\S]*?)<\/verdict>/);

  return {
    intro,
    advantages: advMatch ? advMatch[1].trim() : "",
    disadvantages: disMatch ? disMatch[1].trim() : "",
    verdict: verMatch ? verMatch[1].trim() : "",
  };
}

export default function AIComparePanel({ currentProduct, products }) {
  const [compareSlug, setCompareSlug] = useState("");
  const [result, setResult] = useState(null);

  const [compare, { isLoading }] = useAiCompareMutation();
  const allProducts = useMemo(() => products || [], [products]);

  const currentCategory = (currentProduct?.category?.slug || currentProduct?.category || "").toLowerCase();

  const compareOptions = useMemo(() => {
    const filtered = allProducts.filter(
      (p) =>
        p.slug !== currentProduct?.slug &&
        ((p.category?.slug || p.category || "").toLowerCase() === currentCategory),
    );

    filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

    return filtered.map((p) => ({
      value: p.slug,
      label: p.name,
      prefix: (
        <span className="mr-1.5 shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          {p.category?.name || p.category || "Khác"}
        </span>
      ),
    }));
  }, [allProducts, currentProduct?.slug, currentCategory]);

  const handleCompare = useCallback(async () => {
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
  }, [compareSlug, allProducts, currentProduct, compare]);

  const parsedReply = useMemo(() => {
    if (!result?.reply || result?.comparison) return null;
    return parseComparisonReply(result.reply);
  }, [result]);

  return (
    <Card className="my-8 overflow-visible">
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
          <div className="flex-1">
            <p className="mb-2 text-sm font-medium">Sản phẩm hiện tại</p>
            <Input value={currentProduct?.name || ""} disabled className="h-9 bg-muted" />
          </div>
          <div className="flex items-center justify-center py-1 sm:py-0">
            <span className="text-xs font-semibold text-muted-foreground">VS</span>
          </div>
          <div className="flex-1">
            <p className="mb-2 text-sm font-medium">Sản phẩm so sánh</p>
            <SearchableSelect
              options={compareOptions}
              value={compareSlug}
              onChange={setCompareSlug}
              placeholder="Tìm và chọn sản phẩm..."
            />
          </div>
          <Button
            onClick={handleCompare}
            disabled={isLoading || !compareSlug}
            className="h-9 shrink-0 rounded-full"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            {isLoading ? "Đang so sánh..." : "So sánh"}
          </Button>
        </div>

        {isLoading && (
          <div className="space-y-3">
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-20 animate-pulse rounded-xl bg-muted" />
          </div>
        )}

        {result && !isLoading && !result.comparison && parsedReply && (
          <div className="space-y-4">
            {parsedReply.intro && (
              <div className="rounded-xl bg-muted/50 p-4">
                <p className="text-sm whitespace-pre-wrap text-foreground">{parsedReply.intro}</p>
              </div>
            )}
            {parsedReply.advantages && (
              <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/30">
                <p className="mb-2 flex items-center gap-1 text-sm font-medium text-green-700 dark:text-green-400">
                  <CheckCircle2 className="h-4 w-4" /> Ưu điểm
                </p>
                <p className="whitespace-pre-wrap text-sm text-green-700 dark:text-green-400">
                  {parsedReply.advantages}
                </p>
              </div>
            )}
            {parsedReply.disadvantages && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30">
                <p className="mb-2 flex items-center gap-1 text-sm font-medium text-red-700 dark:text-red-400">
                  <XCircle className="h-4 w-4" /> Nhược điểm
                </p>
                <p className="whitespace-pre-wrap text-sm text-red-700 dark:text-red-400">
                  {parsedReply.disadvantages}
                </p>
              </div>
            )}
            {parsedReply.verdict && (
              <div className="rounded-xl border border-apple-blue/30 bg-apple-blue/5 p-4">
                <p className="mb-1 text-sm font-medium text-apple-blue">Kết luận</p>
                <p className="whitespace-pre-wrap text-sm text-foreground">
                  {parsedReply.verdict}
                </p>
              </div>
            )}
          </div>
        )}

        {result?.comparison && !isLoading && (
          <div className="space-y-4">
            {result.comparison.advantages && (
              <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/30">
                <p className="mb-2 flex items-center gap-1 text-sm font-medium text-green-700 dark:text-green-400">
                  <CheckCircle2 className="h-4 w-4" /> Ưu điểm
                </p>
                <p className="whitespace-pre-wrap text-sm text-green-700 dark:text-green-400">
                  {result.comparison.advantages}
                </p>
              </div>
            )}
            {result.comparison.disadvantages && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30">
                <p className="mb-2 flex items-center gap-1 text-sm font-medium text-red-700 dark:text-red-400">
                  <XCircle className="h-4 w-4" /> Nhược điểm
                </p>
                <p className="whitespace-pre-wrap text-sm text-red-700 dark:text-red-400">
                  {result.comparison.disadvantages}
                </p>
              </div>
            )}
            {result.comparison.verdict && (
              <div className="rounded-xl border border-apple-blue/30 bg-apple-blue/5 p-4">
                <p className="mb-1 text-sm font-medium text-apple-blue">Kết luận</p>
                <p className="whitespace-pre-wrap text-sm text-foreground">
                  {result.comparison.verdict}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
