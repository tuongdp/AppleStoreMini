import { useCallback, useMemo, useState } from "react";
import {
  CheckCircle2,
  Lightbulb,
  Loader2,
  Scale,
  ShoppingBag,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import SearchableSelect from "@/components/shared/SearchableSelect";
import { useAiCompareMutation } from "@/store/api/aiApi";
import { toast } from "sonner";
import { buildCompareProductInput, parseComparisonReply } from "@/features/ai/compareUtils";

function ResultSection({ type, children }) {
  const config = {
    strengths: {
      icon: CheckCircle2,
      title: "Điểm đáng chọn",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400",
    },
    tradeoffs: {
      icon: XCircle,
      title: "Điểm cần cân nhắc",
      className: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400",
    },
    verdict: {
      icon: Lightbulb,
      title: "Gợi ý mua",
      className: "border-apple-blue/30 bg-apple-blue/5 text-foreground",
    },
  }[type];
  const Icon = config.icon;

  return (
    <div className={`rounded-lg border p-4 ${config.className}`}>
      <p className="mb-2 flex items-center gap-1 text-sm font-medium">
        <Icon className="h-4 w-4" />
        {config.title}
      </p>
      <p className="whitespace-pre-wrap text-sm">{children}</p>
    </div>
  );
}

export default function AIComparePanel({ currentProduct, products }) {
  const [compareSlug, setCompareSlug] = useState("");
  const [result, setResult] = useState(null);

  const [compare, { isLoading }] = useAiCompareMutation();
  const allProducts = useMemo(() => products || [], [products]);
  const currentCategory = (currentProduct?.category?.slug || currentProduct?.category || "").toLowerCase();
  const targetProduct = useMemo(
    () => allProducts.find((product) => product.slug === compareSlug),
    [allProducts, compareSlug],
  );

  const compareOptions = useMemo(() => {
    const filtered = allProducts.filter(
      (product) =>
        product.slug !== currentProduct?.slug &&
        ((product.category?.slug || product.category || "").toLowerCase() === currentCategory),
    );

    filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

    return filtered.map((product) => ({
      value: product.slug,
      label: product.name,
      prefix: (
        <span className="mr-1.5 shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          {product.category?.name || product.category || "Khác"}
        </span>
      ),
    }));
  }, [allProducts, currentProduct?.slug, currentCategory]);

  const handleCompare = useCallback(async () => {
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
          buildCompareProductInput(currentProduct),
          buildCompareProductInput(targetProduct),
        ],
      }).unwrap();
      setResult(res);
    } catch {
      toast.error("Không thể kết nối AI, vui lòng thử lại");
    }
  }, [compareSlug, currentProduct, targetProduct, compare]);

  const parsedReply = useMemo(() => {
    if (!result?.reply || result?.comparison) return null;
    return parseComparisonReply(result.reply);
  }, [result]);

  const comparison = result?.comparison || parsedReply;

  return (
    <Card className="my-8 overflow-visible border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Scale className="h-5 w-5 text-apple-blue" />
          So sánh sản phẩm
        </CardTitle>
        <CardDescription>
          AI phân tích theo giá, cấu hình, phiên bản và tình trạng hàng thực tế trong cửa hàng.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_1fr_auto] lg:items-end">
          <div className="min-w-0">
            <p className="mb-2 text-sm font-medium">Sản phẩm hiện tại</p>
            <Input value={currentProduct?.name || ""} disabled className="h-9 bg-muted" />
          </div>
          <div className="flex items-center justify-center py-1 lg:pb-2">
            <Badge variant="outline" className="rounded-full">VS</Badge>
          </div>
          <div className="min-w-0">
            <p className="mb-2 text-sm font-medium">Sản phẩm so sánh</p>
            <SearchableSelect
              options={compareOptions}
              value={compareSlug}
              onChange={(value) => {
                setCompareSlug(value);
                setResult(null);
              }}
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
              <Scale className="mr-2 h-4 w-4" />
            )}
            {isLoading ? "Đang so sánh..." : "So sánh"}
          </Button>
        </div>

        {targetProduct && !result && !isLoading && (
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <ShoppingBag className="h-4 w-4 text-apple-blue" />
              <span className="font-medium text-foreground">{currentProduct?.name}</span>
              <span className="text-muted-foreground">với</span>
              <span className="font-medium text-foreground">{targetProduct.name}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Nhấn so sánh để nhận gợi ý mua thực tế, ưu/nhược điểm và trường hợp nên chọn từng máy.
            </p>
          </div>
        )}

        {isLoading && (
          <div className="space-y-3">
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-20 animate-pulse rounded-lg bg-muted" />
          </div>
        )}

        {comparison && !isLoading && (
          <div className="space-y-4">
            {comparison.intro && (
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="whitespace-pre-wrap text-sm text-foreground">{comparison.intro}</p>
              </div>
            )}
            {comparison.advantages && (
              <ResultSection type="strengths">{comparison.advantages}</ResultSection>
            )}
            {comparison.disadvantages && (
              <ResultSection type="tradeoffs">{comparison.disadvantages}</ResultSection>
            )}
            {comparison.verdict && (
              <ResultSection type="verdict">{comparison.verdict}</ResultSection>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
