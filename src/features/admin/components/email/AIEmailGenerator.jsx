import { useState } from "react";
import { Sparkles, Loader2, Copy, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAiGenerateMarketingEmailMutation } from "@/store/api/aiApi";

const AUDIENCE_OPTIONS = [
    { label: "Tất cả", value: "all" },
    { label: "Sinh viên", value: "student" },
    { label: "Chuyên nghiệp", value: "professional" },
    { label: "Doanh nhân", value: "business" },
    { label: "Cao cấp", value: "luxury" },
];

const TONE_OPTIONS = [
    { label: "Chuyên nghiệp", value: "professional" },
    { label: "Thân thiện", value: "friendly" },
    { label: "Cao cấp", value: "luxury" },
    { label: "Trẻ trung", value: "young" },
    { label: "Khẩn cấp", value: "urgent" },
];

export default function AIEmailGenerator({ productName, productPrice, audience, tone, onGenerated }) {
    const [generate, { isLoading }] = useAiGenerateMarketingEmailMutation();

    const [localProduct, setLocalProduct] = useState(productName || "");
    const [localPrice, setLocalPrice] = useState(productPrice ? String(productPrice) : "");
    const [localAudience, setLocalAudience] = useState(audience || "all");
    const [localTone, setLocalTone] = useState(tone || "professional");
    const [promotion, setPromotion] = useState("");
    const [additionalInfo, setAdditionalInfo] = useState("");

    const [result, setResult] = useState(null);
    const [copied, setCopied] = useState(null);

    const handleGenerate = async () => {
        if (!localProduct.trim()) {
            toast.error("Vui lòng nhập tên sản phẩm");
            return;
        }
        try {
            const data = await generate({
                productName: localProduct,
                productPrice: localPrice ? Number(localPrice) : undefined,
                audience: localAudience,
                tone: localTone,
                promotion: promotion || undefined,
                additionalInfo: additionalInfo || undefined,
            }).unwrap();
            setResult(data);
        } catch {
            toast.error("AI không phản hồi, vui lòng thử lại");
        }
    };

    const handleApply = () => {
        if (result && onGenerated) {
            onGenerated(result);
        }
    };

    const handleCopy = (text, key) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(key);
            setTimeout(() => setCopied(null), 2000);
        });
    };

    return (
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/10">
            <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-700 dark:text-blue-400">
                    <Sparkles className="h-4 w-4" />
                    AI Tạo nội dung email marketing
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Input fields */}
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Tên sản phẩm <span className="text-red-500">*</span></Label>
                        <Input
                            placeholder="VD: iPhone 15 Pro Max"
                            value={localProduct}
                            onChange={(e) => setLocalProduct(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Giá sản phẩm (VNĐ)</Label>
                        <Input
                            type="number"
                            placeholder="VD: 29990000"
                            value={localPrice}
                            onChange={(e) => setLocalPrice(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Đối tượng</Label>
                        <Select value={localAudience} onValueChange={setLocalAudience}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {AUDIENCE_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Giọng điệu</Label>
                        <Select value={localTone} onValueChange={setLocalTone}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {TONE_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                        <Label>Khuyến mãi</Label>
                        <Input
                            placeholder="VD: Giảm 3 triệu + trả góp 0%"
                            value={promotion}
                            onChange={(e) => setPromotion(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                        <Label>Thông tin bổ sung</Label>
                        <Textarea
                            placeholder="VD: Back to school 2025, quà tặng kèm..."
                            value={additionalInfo}
                            onChange={(e) => setAdditionalInfo(e.target.value)}
                            className="min-h-[60px]"
                        />
                    </div>
                </div>

                <Button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Đang tạo nội dung...
                        </>
                    ) : (
                        <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Tạo nội dung email
                        </>
                    )}
                </Button>

                {/* Result */}
                {result && (
                    <div className="space-y-3 pt-2 border-t border-blue-200 dark:border-blue-800">
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs text-muted-foreground">Subject</Label>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => handleCopy(result.subject, "subject")}
                                >
                                    {copied === "subject" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                                </Button>
                            </div>
                            <p className="text-sm font-medium bg-white dark:bg-background rounded-lg p-2 border">
                                {result.subject}
                            </p>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs text-muted-foreground">CTA Button</Label>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => handleCopy(result.cta, "cta")}
                                >
                                    {copied === "cta" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                                </Button>
                            </div>
                            <p className="text-sm bg-white dark:bg-background rounded-lg p-2 border">
                                {result.cta}
                            </p>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">HTML Body (preview)</Label>
                            <div
                                className="max-h-[200px] overflow-auto rounded-lg border bg-white dark:bg-background p-3 text-sm"
                                dangerouslySetInnerHTML={{ __html: result.body }}
                            />
                        </div>

                        <Button onClick={handleApply} className="w-full">
                            Áp dụng vào chiến dịch
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
