import { useState, useEffect } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    useGetAdminPromptsQuery,
    useUpdateAdminPromptMutation,
} from "@/store/api/adminPromptApi";

const PROMPT_FEATURES = [
    { key: "chat", label: "Chatbox", description: "Prompt cho trợ lý tư vấn trong widget chat." },
    { key: "search", label: "Tìm kiếm AI", description: "Prompt hiểu ý định tìm kiếm sản phẩm." },
];

const DEFAULT_PROMPTS = {
    chat: "Bạn là trợ lý tư vấn của Apple Store. Trả lời ngắn gọn, thân thiện bằng tiếng Việt. Tư vấn sản phẩm Apple dựa trên nhu cầu khách hàng.",
    search: "Phân tích ý định tìm kiếm của người dùng. Xác định loại sản phẩm, ngân sách, nhu cầu cụ thể từ mô tả tự nhiên.",
};

export default function AdminPromptTemplates() {
    const { data: prompts, isLoading } = useGetAdminPromptsQuery();
    const [updatePrompt, { isLoading: isSaving }] = useUpdateAdminPromptMutation();
    const [selectedFeature, setSelectedFeature] = useState("");
    const [promptValue, setPromptValue] = useState("");

    const currentFeature = PROMPT_FEATURES.find((f) => f.key === selectedFeature);
    const savedPrompt = selectedFeature ? prompts?.[selectedFeature]?.systemPrompt || "" : "";
    const defaultPrompt = selectedFeature ? DEFAULT_PROMPTS[selectedFeature] || "" : "";
    const effectivePrompt = savedPrompt || defaultPrompt;
    const hasChanges = promptValue !== effectivePrompt;
    const isDefault = !savedPrompt && selectedFeature;

    useEffect(() => {
        setPromptValue(effectivePrompt);
    }, [selectedFeature, effectivePrompt]);

    const handleSelectFeature = (key) => {
        setSelectedFeature(key);
    };

    const handleSave = async () => {
        if (!selectedFeature) return;
        try {
            await updatePrompt({ featureKey: selectedFeature, systemPrompt: promptValue }).unwrap();
            toast.success(`Đã lưu prompt cho ${currentFeature?.label || selectedFeature}`);
        } catch {
            toast.error("Không thể lưu prompt, vui lòng thử lại");
        }
    };

    if (isLoading) {
        return <Skeleton className="h-48 rounded-lg" />;
    }

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Chọn tính năng</Label>
                <Select value={selectedFeature} onValueChange={handleSelectFeature}>
                    <SelectTrigger>
                        <SelectValue placeholder="Chọn tính năng để chỉnh prompt..." />
                    </SelectTrigger>
                    <SelectContent>
                        {PROMPT_FEATURES.map((f) => (
                            <SelectItem key={f.key} value={f.key}>
                                <span className="flex items-center gap-2">
                                    {f.label}
                                    {prompts?.[f.key]?.systemPrompt && (
                                        <Badge variant="secondary" className="ml-1 text-[10px]">Đã chỉnh</Badge>
                                    )}
                                </span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {currentFeature && (
                <div className="space-y-3 rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">{currentFeature.label}</p>
                            <p className="text-xs text-muted-foreground">{currentFeature.description}</p>
                        </div>
                        <Badge variant={savedPrompt ? "default" : "outline"}>
                            {savedPrompt ? "Đã tùy chỉnh" : "Mặc định"}
                        </Badge>
                    </div>

                    {isDefault && (
                        <p className="rounded bg-muted/50 px-2 py-1.5 text-xs text-muted-foreground">
                            Đang dùng prompt mặc định. Sửa bên dưới để tùy chỉnh.
                        </p>
                    )}

                    <Textarea
                        value={promptValue}
                        onChange={(e) => setPromptValue(e.target.value)}
                        rows={6}
                        placeholder={DEFAULT_PROMPTS[selectedFeature] || "Nhập system prompt..."}
                        className="resize-y text-sm"
                    />

                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                            {promptValue.length} ký tự
                        </span>
                        <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={isSaving || !hasChanges}
                            className="rounded-full"
                        >
                            {isSaving ? (
                                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Save className="mr-1.5 h-3.5 w-3.5" />
                            )}
                            {isSaving ? "Đang lưu..." : "Lưu prompt"}
                        </Button>
                    </div>
                </div>
            )}

            {!currentFeature && (
                <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
                    Chọn một tính năng bên trên để xem và chỉnh sửa prompt.
                </p>
            )}
        </div>
    );
}
