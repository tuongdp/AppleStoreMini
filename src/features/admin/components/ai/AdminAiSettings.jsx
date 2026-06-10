import { useEffect, useState } from "react";
import { Bot, CheckCircle2, Cpu, FlaskConical, Save, SlidersHorizontal, ToggleLeft, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
    useGetAdminAiLogsQuery,
    useGetAdminAiSettingsQuery,
    useTestAdminAiConnectionMutation,
    useUpdateAdminAiSettingsMutation,
} from "@/store/api/adminAiApi";

const FEATURES = [
    { key: "chat", label: "Chatbox", description: "Trả lời tư vấn trong widget chat." },
    { key: "search", label: "Tìm kiếm AI", description: "Hỗ trợ hiểu ý định khi khách tìm sản phẩm." },
    { key: "recommend", label: "Gợi ý sản phẩm", description: "Đề xuất sản phẩm theo nhu cầu khách." },
    { key: "compare", label: "So sánh sản phẩm", description: "Tóm tắt khác biệt giữa các sản phẩm." },
    { key: "reviewSummary", label: "Tóm tắt đánh giá", description: "Tổng hợp cảm nhận từ bình luận sản phẩm." },
    { key: "reviewReply", label: "Gợi ý phản hồi đánh giá", description: "Soạn nháp câu trả lời lịch sự cho bình luận trong admin." },
    { key: "generateDescription", label: "Tạo mô tả", description: "Viết mô tả sản phẩm trong admin." },
    { key: "sentiment", label: "Phân tích cảm xúc", description: "Chấm sắc thái bình luận và đánh giá." },
    { key: "personalized", label: "Cá nhân hóa", description: "Gợi ý dựa trên hành vi và lịch sử mua hàng." },
    { key: "contentCheck", label: "Kiểm duyệt nội dung", description: "Kiểm tra nội dung không phù hợp trước khi hiển thị." },
    { key: "adminInsights", label: "Gợi ý vận hành admin", description: "Phân tích đơn hàng, tồn kho và chăm sóc khách trên dashboard admin." },
];

const DEFAULTS = {
    provider: "Groq",
    enabled: true,
    modelName: "llama-3.3-70b-versatile",
    maxTokens: 1200,
    temperature: 0.5,
    timeoutMs: 20000,
    hasApiKey: false,
    features: FEATURES.reduce((acc, item) => ({ ...acc, [item.key]: true }), {}),
};

const mergeSettings = (data) => ({
    ...DEFAULTS,
    ...data,
    features: { ...DEFAULTS.features, ...data?.features },
});

const STATUS_LABELS = {
    SUCCESS: "Thành công",
    ERROR: "Lỗi",
    DISABLED: "Đã tắt",
    FALLBACK: "Dự phòng",
};

const formatTime = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
};

function Section({ icon: Icon, title, description, children }) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                        <CardTitle>{title}</CardTitle>
                        {description && <CardDescription>{description}</CardDescription>}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">{children}</CardContent>
        </Card>
    );
}

function ReadonlyInfo({ label, value }) {
    return (
        <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="mt-1 break-words text-sm font-medium text-foreground">{value || "-"}</p>
        </div>
    );
}

export default function AdminAiSettings() {
    const { data, isLoading, isFetching } = useGetAdminAiSettingsQuery();
    const { data: aiLogs = [], isFetching: isLogsFetching } = useGetAdminAiLogsQuery({ limit: 5 });
    const [update, { isLoading: isSaving }] = useUpdateAdminAiSettingsMutation();
    const [testConnection, { isLoading: isTesting }] = useTestAdminAiConnectionMutation();
    const [settings, setSettings] = useState(DEFAULTS);
    const [testResult, setTestResult] = useState(null);

    useEffect(() => {
        if (data) {
            setSettings(mergeSettings(data));
        }
    }, [data]);

    const setFeature = (key, value) => {
        setSettings((current) => ({
            ...current,
            features: { ...current.features, [key]: value },
        }));
    };

    const handleSave = async () => {
        try {
            const payload = {
                enabled: settings.enabled,
                features: settings.features,
            };
            const saved = await update(payload).unwrap();
            setSettings(mergeSettings(saved));
            toast.success("Đã lưu cấu hình AI");
        } catch {
            toast.error("Không thể lưu cấu hình AI");
        }
    };

    const handleTestConnection = async () => {
        try {
            const result = await testConnection().unwrap();
            setTestResult(result);
            toast.success(result?.ok ? "Kết nối AI hoạt động" : "AI đang ở chế độ dự phòng");
        } catch {
            setTestResult({ ok: false, message: "Không thể kiểm tra kết nối AI" });
            toast.error("Không thể kiểm tra kết nối AI");
        }
    };

    if (isLoading || isFetching) {
        return (
            <div className="max-w-4xl space-y-6">
                {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-44 rounded-2xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="max-w-4xl space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Cấu hình AI</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Bật/tắt các tính năng AI và kiểm tra trạng thái kết nối. API key, model và thông số gọi AI được cấu hình trong file .env của backend.
                    </p>
                </div>
                <Badge variant={settings.hasApiKey && settings.enabled ? "default" : "secondary"} className="h-6">
                    {settings.hasApiKey && settings.enabled ? "Đang bật" : "Dự phòng"}
                </Badge>
            </div>

            <Section icon={Bot} title="Trạng thái hệ thống" description="Admin chỉ điều khiển trạng thái sử dụng AI, không quản lý danh sách API key trong giao diện.">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <Label htmlFor="ai-enabled" className="text-sm font-medium">Bật AI toàn hệ thống</Label>
                        <p className="text-xs text-muted-foreground">Khi tắt, các tính năng sẽ dùng dữ liệu dự phòng có sẵn.</p>
                    </div>
                    <Switch
                        id="ai-enabled"
                        checked={settings.enabled}
                        onCheckedChange={(value) => setSettings({ ...settings, enabled: value })}
                        aria-label="Bật tắt AI toàn hệ thống"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Provider: {settings.provider}</Badge>
                    <Badge variant={settings.hasApiKey ? "default" : "secondary"}>
                        {settings.hasApiKey ? "Đã có API key" : "Thiếu API key"}
                    </Badge>
                    <Badge variant="outline">Model: {settings.modelName}</Badge>
                </div>
            </Section>

            <Section icon={Cpu} title="Thông tin kỹ thuật" description="Provider, model và API key được cấu hình ở backend để tránh lộ thông tin nhạy cảm.">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <ReadonlyInfo label="Provider" value={settings.provider} />
                    <ReadonlyInfo label="Model" value={settings.modelName} />
                    <ReadonlyInfo label="Max tokens" value={settings.maxTokens} />
                    <ReadonlyInfo label="Temperature" value={settings.temperature} />
                    <ReadonlyInfo label="Timeout" value={`${settings.timeoutMs} ms`} />
                    <ReadonlyInfo label="API key" value={settings.hasApiKey ? "Đã cấu hình ở backend" : "Chưa cấu hình ở backend"} />
                </div>
                <p className="rounded-lg border border-dashed border-border bg-muted/40 px-3 py-2 text-xs leading-5 text-muted-foreground">
                    Không thực hiện thêm, sửa hoặc xóa API AI trên giao diện admin. Khi cần đổi GROQ_API_KEY hoặc model, cập nhật file .env của backend rồi restart server; cách này tách rõ cấu hình bảo mật và thao tác vận hành.
                </p>
            </Section>

            <Section icon={ToggleLeft} title="Tính năng AI" description="Tắt riêng từng nhóm nếu muốn giảm chi phí hoặc tạm khóa tính năng chưa dùng.">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {FEATURES.map((feature) => (
                        <div key={feature.key} className="flex items-start justify-between gap-4 rounded-lg border border-border p-3">
                            <div className="min-w-0 space-y-1">
                                <Label htmlFor={`ai-feature-${feature.key}`} className="text-sm font-medium">
                                    {feature.label}
                                </Label>
                                <p className="text-xs leading-5 text-muted-foreground">{feature.description}</p>
                            </div>
                            <Switch
                                id={`ai-feature-${feature.key}`}
                                checked={Boolean(settings.features?.[feature.key])}
                                onCheckedChange={(value) => setFeature(feature.key, value)}
                                aria-label={`Bật tắt ${feature.label}`}
                            />
                        </div>
                    ))}
                </div>
            </Section>

            <Section icon={FlaskConical} title="Kiểm tra kết nối" description="Gửi một request ngắn đến backend để biết AI đang online hay dùng fallback.">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 text-sm">
                        {testResult ? (
                            testResult.ok ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            ) : (
                                <XCircle className="h-4 w-4 text-amber-600" />
                            )
                        ) : (
                            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-muted-foreground">
                            {testResult?.message || "Chưa kiểm tra trong phiên làm việc này."}
                        </span>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleTestConnection}
                        disabled={isTesting}
                        aria-label="Test kết nối AI"
                    >
                        <FlaskConical className="h-4 w-4" />
                        {isTesting ? "Đang test..." : "Test kết nối"}
                    </Button>
                </div>
            </Section>

            <Section icon={SlidersHorizontal} title="Nhật ký AI" description="Chỉ lưu metadata như feature, trạng thái, latency và lỗi ngắn; không lưu prompt hoặc nội dung phản hồi.">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-sm">
                        <thead>
                            <tr className="border-b border-border text-left text-xs text-muted-foreground">
                                <th className="py-2 pr-4 font-medium">Thời gian</th>
                                <th className="py-2 pr-4 font-medium">Feature</th>
                                <th className="py-2 pr-4 font-medium">Trạng thái</th>
                                <th className="py-2 pr-4 font-medium">Latency</th>
                                <th className="py-2 pr-4 font-medium">Model</th>
                                <th className="py-2 font-medium">Lỗi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLogsFetching ? (
                                <tr>
                                    <td colSpan={6} className="py-6 text-center text-muted-foreground">Đang tải nhật ký...</td>
                                </tr>
                            ) : aiLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-6 text-center text-muted-foreground">Chưa có nhật ký AI.</td>
                                </tr>
                            ) : (
                                aiLogs.map((log) => (
                                    <tr key={log.id} className="border-b border-border/60 last:border-0">
                                        <td className="whitespace-nowrap py-3 pr-4 text-muted-foreground">{formatTime(log.createdAt)}</td>
                                        <td className="py-3 pr-4 font-medium">{log.feature}</td>
                                        <td className="py-3 pr-4">
                                            <Badge
                                                variant={log.status === "ERROR" ? "destructive" : log.status === "DISABLED" ? "secondary" : "outline"}
                                            >
                                                {STATUS_LABELS[log.status] || log.status}
                                            </Badge>
                                        </td>
                                        <td className="whitespace-nowrap py-3 pr-4 text-muted-foreground">
                                            {log.latencyMs != null ? `${log.latencyMs} ms` : "-"}
                                        </td>
                                        <td className="max-w-[180px] truncate py-3 pr-4 text-muted-foreground">{log.modelName || "-"}</td>
                                        <td className="max-w-[260px] truncate py-3 text-muted-foreground">{log.errorMessage || "-"}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Section>

            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isSaving} size="lg" aria-label="Lưu cấu hình AI">
                    <Save className="h-4 w-4" />
                    {isSaving ? "Đang lưu..." : "Lưu cấu hình AI"}
                </Button>
            </div>
        </div>
    );
}
