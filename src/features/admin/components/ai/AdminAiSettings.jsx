import { useEffect, useState } from "react";
import { Bot, FileText, Save, ToggleLeft } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
    useGetAdminAiSettingsQuery,
    useUpdateAdminAiSettingsMutation,
} from "@/store/api/adminAiApi";
import AdminPromptTemplates from "./AdminPromptTemplates";

const FEATURES = [
    { key: "chat", label: "Chatbox", description: "Trả lời tư vấn trong widget chat." },
    { key: "search", label: "Tìm kiếm AI", description: "Hiểu ý định khi khách tìm sản phẩm." },
];

const DEFAULTS = {
    enabled: true,
    hasApiKey: false,
    features: FEATURES.reduce((acc, item) => ({ ...acc, [item.key]: true }), {}),
};

const mergeSettings = (data) => ({
    ...DEFAULTS,
    ...data,
    features: { ...DEFAULTS.features, ...data?.features },
});

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

export default function AdminAiSettings() {
    const { data, isLoading, isFetching } = useGetAdminAiSettingsQuery();
    const [update, { isLoading: isSaving }] = useUpdateAdminAiSettingsMutation();
    const [settings, setSettings] = useState(DEFAULTS);

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

    if (isLoading || isFetching) {
        return (
            <div className="max-w-4xl space-y-6">
                {Array.from({ length: 2 }).map((_, index) => (
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
                        Bật/tắt các tính năng AI và tùy chỉnh prompt. API key được cấu hình ở backend.
                    </p>
                </div>
                <Badge variant={settings.hasApiKey && settings.enabled ? "default" : "secondary"} className="h-6">
                    {settings.hasApiKey && settings.enabled ? "Đang bật" : "Dự phòng"}
                </Badge>
            </div>

            <Section icon={Bot} title="Trạng thái hệ thống" description="Bật/tắt AI toàn hệ thống. Khi tắt, các tính năng sẽ dùng dữ liệu dự phòng.">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <Label htmlFor="ai-enabled" className="text-sm font-medium">Bật AI toàn hệ thống</Label>
                        <p className="text-xs text-muted-foreground">API key được cấu hình trong file .env của backend.</p>
                    </div>
                    <Switch
                        id="ai-enabled"
                        checked={settings.enabled}
                        onCheckedChange={(value) => setSettings({ ...settings, enabled: value })}
                        aria-label="Bật tắt AI toàn hệ thống"
                    />
                </div>
            </Section>

            <Section icon={ToggleLeft} title="Tính năng AI" description="Bật/tắt từng tính năng để kiểm soát chi phí hoặc tạm khóa tính năng chưa dùng.">
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

            <Section icon={FileText} title="Prompt Templates" description="Tùy chỉnh system prompt cho từng tính năng. Để trống để dùng prompt mặc định.">
                <AdminPromptTemplates />
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
