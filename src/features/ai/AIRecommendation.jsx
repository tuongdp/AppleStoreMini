import { useState } from "react";
import { Lightbulb, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAiRecommendMutation } from "@/store/api/aiApi";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import ResponsiveImage from "@/components/shared/ResponsiveImage";
import { productPlaceholder } from "@/assets/images";

const PERSONAS = [
  { value: "student", label: "Sinh viên" },
  { value: "designer", label: "Designer" },
  { value: "developer", label: "Developer" },
  { value: "creator", label: "Content Creator" },
  { value: "gaming", label: "Gaming" },
  { value: "business", label: "Doanh nhân" },
  { value: "general", label: "Phổ thông" },
];

export default function AIRecommendation() {
  const [persona, setPersona] = useState("");
  const [budget, setBudget] = useState("");
  const [usage, setUsage] = useState("");
  const [result, setResult] = useState(null);

  const [recommend, { isLoading }] = useAiRecommendMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!persona && !usage.trim()) {
      toast.error("Vui lòng chọn đối tượng hoặc mô tả nhu cầu");
      return;
    }
    try {
      const res = await recommend({
        persona: persona || undefined,
        budget: budget ? Number(budget) : undefined,
        usage: usage.trim() || undefined,
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
          <Lightbulb className="h-5 w-5 text-apple-blue" />
          AI Tư vấn sản phẩm
        </CardTitle>
        <CardDescription>
          Mô tả nhu cầu của bạn, AI sẽ gợi ý sản phẩm phù hợp nhất
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Đối tượng</Label>
              <Select value={persona} onValueChange={setPersona}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn đối tượng" />
                </SelectTrigger>
                <SelectContent>
                  {PERSONAS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ngân sách (VNĐ)</Label>
              <Input
                type="number"
                placeholder="VD: 25000000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Mô tả nhu cầu</Label>
            <Textarea
              placeholder="VD: Cần máy để lập trình web, edit video nhẹ, pin trâu..."
              value={usage}
              onChange={(e) => setUsage(e.target.value)}
              rows={3}
            />
          </div>
          <Button type="submit" disabled={isLoading} className="rounded-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang tư vấn...
              </>
            ) : (
              <>
                <Lightbulb className="mr-2 h-4 w-4" />
                Tư vấn ngay
              </>
            )}
          </Button>
        </form>

        {isLoading && (
          <div className="mt-6 space-y-3">
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-20 animate-pulse rounded-xl bg-muted" />
          </div>
        )}

        {result && !isLoading && (
          <div className="mt-6 space-y-4">
            {result.reply && (
              <div className="rounded-xl bg-muted/50 p-4">
                <p className="text-sm text-foreground whitespace-pre-wrap">{result.reply}</p>
              </div>
            )}
            {result.products && result.products.length > 0 && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {result.products.map((p) => (
                  <Link
                    key={p.slug}
                    to={`/products/${p.slug}`}
                    className="rounded-xl border border-border p-4 transition-colors hover:border-apple-blue/50 hover:bg-muted/50"
                  >
                    {p.image && (
                      <ResponsiveImage
                        src={p.image}
                        fallbackSrc={productPlaceholder}
                        alt={p.name}
                        width={240}
                        height={128}
                        className="mb-3 h-32 w-full rounded-lg object-contain"
                      />
                    )}
                    <h4 className="text-sm font-medium text-foreground">{p.name}</h4>
                    <p className="mt-1 text-sm font-semibold text-apple-blue">
                      {p.price ? formatPrice(p.price) : "Liên hệ"}
                    </p>
                    {p.reason && (
                      <p className="mt-1 text-xs text-muted-foreground">{p.reason}</p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
