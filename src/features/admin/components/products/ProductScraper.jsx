import { useState } from "react";
import { Loader2, Link2, ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useCreateGlobalOptionMutation } from "@/store/api/globalOptionsApi";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

export default function ProductScraper({ onDataReady, disabled }) {
    const [url, setUrl] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [isScraping, setIsScraping] = useState(false);
    const [scrapeResult, setScrapeResult] = useState(null);
    const [error, setError] = useState(null);
    const [isCreatingOptions, setIsCreatingOptions] = useState(false);

    const [createGlobalOption] = useCreateGlobalOptionMutation();

    const handleScrape = async () => {
        if (!url.trim()) return;
        setIsScraping(true);
        setError(null);
        setScrapeResult(null);

        try {
            const token = JSON.parse(localStorage.getItem("persist:root") || "{}")?.auth
                ? JSON.parse(JSON.parse(localStorage.getItem("persist:root") || "{}").auth)?.accessToken
                : null;

            const res = await fetch(`${API_BASE}/admin/scrape/product`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ url: url.trim() }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Lỗi khi lấy dữ liệu");
            setScrapeResult(json.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsScraping(false);
        }
    };

    const handleApply = async () => {
        if (!scrapeResult) return;

        if (scrapeResult.newGlobalOptions?.length > 0) {
            setIsCreatingOptions(true);
            try {
                for (const opt of scrapeResult.newGlobalOptions) {
                    await createGlobalOption({ type: opt.type, value: opt.value, hex: opt.hex }).unwrap();
                }
                toast.success(`Đã tạo ${scrapeResult.newGlobalOptions.length} tùy chọn mới`);
            } catch {
                toast.warning("Một số tùy chọn không thể tạo tự động. Bạn có thể thêm thủ công sau.");
            }
            setIsCreatingOptions(false);
        }

        onDataReady({
            name: scrapeResult.name,
            slug: scrapeResult.slug,
            category: scrapeResult.category,
            description: scrapeResult.description,
            specifications: scrapeResult.specifications || [],
            variants: scrapeResult.variants || [],
        });

        setIsOpen(false);
        setScrapeResult(null);
    };

    const handleClear = () => {
        setScrapeResult(null);
        setError(null);
        setUrl("");
    };

    return (
        <div className="rounded-2xl border border-border bg-card">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
            >
                <div className="flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium text-foreground">Nhập từ TopZone</span>
                </div>
                {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </button>

            {isOpen && (
                <div className="border-t border-border px-5 pb-5 pt-4 space-y-4">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Dán URL sản phẩm TopZone..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            disabled={isScraping || disabled}
                            className="h-9 text-sm"
                            onKeyDown={(e) => e.key === "Enter" && handleScrape()}
                        />
                        <Button
                            type="button"
                            size="sm"
                            className="rounded-full shrink-0"
                            onClick={handleScrape}
                            disabled={!url.trim() || isScraping || disabled}
                        >
                            {isScraping ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Lấy dữ liệu"}
                        </Button>
                    </div>

                    {error && (
                        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                            <div className="flex-1">{error}</div>
                            <button type="button" onClick={handleClear} className="shrink-0"><X className="h-3.5 w-3.5" /></button>
                        </div>
                    )}

                    {scrapeResult && (
                        <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-3 space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-green-700">
                                <CheckCircle2 className="h-4 w-4" />
                                Đã tìm thấy sản phẩm
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                <Badge variant="secondary" className="text-xs">{scrapeResult.name}</Badge>
                                {scrapeResult.colorOptions?.length > 0 && (
                                    <Badge variant="outline" className="text-xs">{scrapeResult.colorOptions.length} màu</Badge>
                                )}
                                {scrapeResult.storageOptions?.length > 0 && (
                                    <Badge variant="outline" className="text-xs">{scrapeResult.storageOptions.length} dung lượng</Badge>
                                )}
                                <Badge variant="outline" className="text-xs">{scrapeResult.variants?.length || 0} variants</Badge>
                                {scrapeResult.specifications?.length > 0 && (
                                    <Badge variant="outline" className="text-xs">{scrapeResult.specifications.length} thông số</Badge>
                                )}
                                {scrapeResult.newGlobalOptions?.length > 0 && (
                                    <Badge variant="secondary" className="text-xs bg-amber-500/10 text-amber-700">
                                        +{scrapeResult.newGlobalOptions.length} tùy chọn mới
                                    </Badge>
                                )}
                            </div>
                            <div className="flex gap-2 pt-1">
                                <Button
                                    type="button"
                                    size="sm"
                                    className="rounded-full"
                                    onClick={handleApply}
                                    disabled={isCreatingOptions}
                                >
                                    {isCreatingOptions ? (
                                        <><Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> Đang tạo...</>
                                    ) : (
                                        "Áp dụng vào form"
                                    )}
                                </Button>
                                <Button type="button" variant="ghost" size="sm" className="rounded-full" onClick={handleClear}>
                                    Huỷ
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
