import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, ArrowLeft, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import SearchableSelect from "@/components/shared/SearchableSelect";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ROUTES } from "@/lib/constants";
import { useGetProductsQuery } from "@/store/api/productsApi";
import {
    useCreateCampaignMutation,
    useUpdateCampaignMutation,
    useGetCampaignByIdQuery,
} from "@/store/api/emailMarketingApi";
import AIEmailGenerator from "./AIEmailGenerator";

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

export default function CampaignForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const { data: productsData } = useGetProductsQuery({ page: 1, limit: 100 });
    const products = productsData?.products ?? [];

    const { data: existing, isLoading: loadingCampaign } = useGetCampaignByIdQuery(id, { skip: !isEdit });
    const [createCampaign, { isLoading: creating }] = useCreateCampaignMutation();
    const [updateCampaign, { isLoading: updating }] = useUpdateCampaignMutation();

    const [form, setForm] = useState({
        subject: "",
        content: "",
        targetAudience: "all",
        productId: "__none__",
        tone: "professional",
    });

    const [showAI, setShowAI] = useState(false);

    useEffect(() => {
        if (existing) {
            setForm({
                subject: existing.subject || "",
                content: existing.content || "",
                targetAudience: existing.targetAudience || "all",
                productId: existing.productId || "__none__",
                tone: existing.tone || "professional",
            });
        }
    }, [existing]);

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleAIGenerated = ({ subject, body, cta }) => {
        const htmlContent = body;
        setForm((prev) => ({
            ...prev,
            subject: subject || prev.subject,
            content: htmlContent || prev.content,
        }));
        toast.success("Đã áp dụng nội dung AI");
        setShowAI(false);
    };

    const selectedProduct = products.find((p) => p.id === form.productId);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.subject.trim()) { toast.error("Vui lòng nhập tiêu đề"); return; }
        if (!form.content.trim()) { toast.error("Vui lòng nhập nội dung HTML"); return; }

        const payload = { ...form };
        if (payload.productId === "__none__") payload.productId = undefined;

        try {
            if (isEdit) {
                await updateCampaign({ id, ...payload }).unwrap();
                toast.success("Đã cập nhật chiến dịch");
            } else {
                await createCampaign(payload).unwrap();
                toast.success("Đã tạo chiến dịch mới");
            }
            navigate(ROUTES.ADMIN_EMAIL_MARKETING);
        } catch (err) {
            toast.error(err?.data?.message || "Có lỗi xảy ra");
        }
    };

    const saving = creating || updating;

    if (isEdit && loadingCampaign) {
        return (
            <div className="space-y-4">
                <Card><CardContent className="p-6 space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 bg-muted animate-pulse rounded-lg" />)}
                </CardContent></Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button type="button" variant="ghost" size="icon" onClick={() => navigate(ROUTES.ADMIN_EMAIL_MARKETING)}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-semibold text-foreground">
                                {isEdit ? "Chỉnh sửa chiến dịch" : "Tạo chiến dịch mới"}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {isEdit ? "Cập nhật nội dung chiến dịch email" : "Thiết kế email marketing và gửi đến subscribers"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowAI(!showAI)}
                        >
                            <Sparkles className="mr-2 h-4 w-4" />
                            {showAI ? "Ẩn AI" : "AI Tạo nội dung"}
                        </Button>
                        <Button type="submit" disabled={saving}>
                            <Save className="mr-2 h-4 w-4" />
                            {saving ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo chiến dịch"}
                        </Button>
                    </div>
                </div>

                {/* AI Generator panel */}
                {showAI && (
                    <AIEmailGenerator
                        productName={selectedProduct?.name}
                        productPrice={selectedProduct?.price}
                        audience={form.targetAudience}
                        tone={form.tone}
                        onGenerated={handleAIGenerated}
                    />
                )}

                {/* Campaign info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Thông tin chiến dịch</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Tiêu đề email <span className="text-red-500">*</span></Label>
                            <Input
                                placeholder="VD: Khuyến mãi đặc biệt tháng 5 - Giảm đến 30%"
                                value={form.subject}
                                onChange={(e) => handleChange("subject", e.target.value)}
                            />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="space-y-2">
                                <Label>Đối tượng</Label>
                                <Select value={form.targetAudience} onValueChange={(v) => handleChange("targetAudience", v)}>
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
                                <Select value={form.tone} onValueChange={(v) => handleChange("tone", v)}>
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
                            <div className="space-y-2">
                                <Label>Sản phẩm liên quan</Label>
                                <SearchableSelect
                                    options={[
                                        { value: "__none__", label: "-- Không chọn --" },
                                        ...products.map((p) => ({ value: p.id, label: p.name })),
                                    ]}
                                    value={form.productId}
                                    onChange={(v) => handleChange("productId", v)}
                                    placeholder="Tìm kiếm sản phẩm..."
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Nội dung HTML <span className="text-red-500">*</span></Label>
                            <Textarea
                                placeholder="<h2>Nội dung email...</h2>"
                                value={form.content}
                                onChange={(e) => handleChange("content", e.target.value)}
                                className="min-h-[300px] font-mono text-sm"
                            />
                            <p className="text-xs text-muted-foreground">
                                Hỗ trợ HTML. Sử dụng nút "AI Tạo nội dung" để tự động sinh email marketing.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </form>

            {/* Preview panel */}
            {form.content && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Xem trước</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-lg border border-border bg-white p-6">
                            {form.subject && (
                                <h2 className="text-lg font-semibold mb-4 pb-4 border-b">{form.subject}</h2>
                            )}
                            <div
                                className="prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ __html: form.content }}
                            />
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
