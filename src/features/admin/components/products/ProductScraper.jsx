import { useState } from "react";
import { useSelector } from "react-redux";
import { Loader2, Link2, ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, X, Globe, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useCreateGlobalOptionMutation } from "@/store/api/globalOptionsApi";
import { selectAccessToken } from "@/store/authSlice";
import { slugify } from "@/lib/utils";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

function parseHtml(doc, sourceUrl) {
    const name = doc.querySelector('meta[property="og:title"]')?.getAttribute("content")
        || doc.querySelector("h1")?.textContent?.trim()
        || doc.querySelector("title")?.textContent?.trim()
        || "";

    const category = (() => {
        try { return new URL(sourceUrl).pathname.split("/").filter(Boolean)[0] || ""; }
        catch { return ""; }
    })();

    const descMeta = doc.querySelector('meta[property="og:description"]')?.getAttribute("content");
    const description = descMeta ? `<p>${descMeta}</p>` : "";

    const specs = [];
    doc.querySelectorAll("table tr, .tsTable tr, .parameter tr").forEach((row) => {
        const cols = row.querySelectorAll("td, th");
        if (cols.length >= 2) {
            const k = cols[0].textContent.trim();
            const v = cols[1].textContent.trim();
            if (k && v && !k.includes("Thông số") && !k.includes("Tiêu chí")) specs.push({ key: k, value: v });
        }
    });
    if (specs.length === 0) {
        doc.querySelectorAll(".parameter-item, .spec-item, .charactestic-item").forEach((el) => {
            const label = el.querySelector("label, .label, .name, .charactestic-name")?.textContent?.trim();
            const val = el.querySelector("span, div, .value, .charactestic-value")?.textContent?.trim();
            if (label && val) specs.push({ key: label, value: val });
        });
    }

    const colors = [];
    const seenColors = new Set();
    doc.querySelectorAll('[style*="background"], [class*="color"] a, [class*="color"] button, .box-color a, .option-color .item').forEach((el) => {
        const title = el.getAttribute("title") || el.getAttribute("aria-label") || el.textContent?.trim();
        const style = el.getAttribute("style") || "";
        const hexMatch = style.match(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}/);
        if (title && !seenColors.has(title.toLowerCase()) && title.length < 50 && title.length > 1) {
            seenColors.add(title.toLowerCase());
            colors.push({ value: title, hex: hexMatch ? hexMatch[0] : null });
        }
    });

    const storages = [];
    const seenStorages = new Set();
    doc.querySelectorAll('[class*="storage"] a, [class*="storage"] button, [class*="option"] a, [class*="option"] button').forEach((el) => {
        const t = el.textContent.trim();
        const m = t.match(/(\d+\s*(GB|TB|MB))/i);
        if (m && !seenStorages.has(m[1].toLowerCase())) {
            seenStorages.add(m[1].toLowerCase());
            storages.push({ value: m[1] });
        }
    });

    let salePrice = null;
    let price = 0;
    const priceMeta = doc.querySelector('meta[property="product:price:amount"]')?.getAttribute("content");
    if (priceMeta) salePrice = Number(priceMeta);
    if (!salePrice) {
        const sp = doc.querySelector(".price, .special-price, .box-price-present .price, .product-price")?.textContent?.replace(/[^\d]/g, "");
        if (sp) salePrice = Number(sp);
    }
    const op = doc.querySelector(".old-price, .original-price, .box-price-present .old-price, .regular-price")?.textContent?.replace(/[^\d]/g, "");
    if (op) price = Number(op);
    if (salePrice && !price) { price = salePrice; salePrice = null; }
    if (salePrice && price && salePrice >= price) [price, salePrice] = [salePrice, price];

    const images = [];
    const seenImgs = new Set();
    doc.querySelectorAll("img[src]").forEach((el) => {
        const src = el.getAttribute("src") || el.getAttribute("data-src");
        if (src && !seenImgs.has(src) && !src.includes("placeholder") && !src.includes("spacer")
            && (src.includes("tgdd.vn") || src.includes("thegioididong") || src.includes("topzone") || src.includes("cdn"))) {
            seenImgs.add(src);
            if (images.length < 20) images.push(src);
        }
    });
    if (images.length === 0) {
        const ogImg = doc.querySelector('meta[property="og:image"]')?.getAttribute("content");
        if (ogImg) images.push(ogImg);
    }

    const variantColors = colors.length > 0 ? colors : [{ value: "" }];
    const variantStorages = storages.length > 0 ? storages : [{ value: "" }];
    const variants = [];
    for (const c of variantColors) {
        for (const s of variantStorages) {
            variants.push({
                color: c.value, storage: s.value, ram: "", edition: "",
                price: price || 0, salePrice: salePrice || null, stock: 0,
                images: [...images],
            });
        }
    }

    return { name, slug: slugify(name), category, description, specifications: specs, colorOptions: colors, storageOptions: storages, price, salePrice, variants, images };
}

async function processParsedData(data, accessToken, url) {
    let newGlobalOptions = [];
    if (data.colorOptions.length > 0 || data.storageOptions.length > 0) {
        try {
            const res = await fetch(`${API_BASE}/admin/scrape/check-options`, {
                method: "POST",
                headers: { "Content-Type": "application/json", ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
                body: JSON.stringify({ colors: data.colorOptions.map((c) => c.value), storages: data.storageOptions.map((s) => s.value) }),
            });
            if (res.ok) {
                const json = await res.json();
                newGlobalOptions = json.data || [];
            }
        } catch { /* non-critical */ }
    }
    return { ...data, newGlobalOptions };
}

export default function ProductScraper({ onDataReady, disabled }) {
    const [url, setUrl] = useState("");
    const [htmlPaste, setHtmlPaste] = useState("");
    const [mode, setMode] = useState("url");
    const [isOpen, setIsOpen] = useState(false);
    const [isScraping, setIsScraping] = useState(false);
    const [scrapeResult, setScrapeResult] = useState(null);
    const [error, setError] = useState(null);
    const [isCreatingOptions, setIsCreatingOptions] = useState(false);

    const [createGlobalOption] = useCreateGlobalOptionMutation();
    const accessToken = useSelector(selectAccessToken);

    const doScrape = async (html, sourceUrl) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const data = parseHtml(doc, sourceUrl);

        if (!data.name) throw new Error("Không tìm thấy tên sản phẩm. Trang có thể đã thay đổi cấu trúc.");
        return processParsedData(data, accessToken, sourceUrl);
    };

    const handleScrapeUrl = async () => {
        if (!url.trim()) return;
        setIsScraping(true);
        setError(null);
        setScrapeResult(null);

        const proxies = [
            (u) => `/api/proxy?url=${encodeURIComponent(u)}`,
            (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
        ];

        let html = null;
        let lastError = null;
        for (const buildUrl of proxies) {
            try {
                const res = await fetch(buildUrl(url.trim()));
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                html = await res.text();
                break;
            } catch (err) { lastError = err.message; }
        }

        if (!html) {
            setError(`Proxy không hoạt động (${lastError || "unknown"}). Thử chuyển sang tab "Dán HTML" để dán mã nguồn trang.`);
            setIsScraping(false);
            return;
        }

        try {
            setScrapeResult(await doScrape(html, url.trim()));
        } catch (err) {
            setError(err.message || "Lỗi phân tích dữ liệu");
        } finally {
            setIsScraping(false);
        }
    };

    const handleScrapeHtml = async () => {
        if (!htmlPaste.trim()) return;
        setIsScraping(true);
        setError(null);
        setScrapeResult(null);

        try {
            setScrapeResult(await doScrape(htmlPaste.trim(), url.trim() || "https://www.topzone.vn/"));
        } catch (err) {
            setError(err.message || "Lỗi phân tích HTML");
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
                toast.warning("Một số tùy chọn không thể tạo tự động.");
            }
            setIsCreatingOptions(false);
        }
        onDataReady({
            name: scrapeResult.name, slug: scrapeResult.slug, category: scrapeResult.category,
            description: scrapeResult.description, specifications: scrapeResult.specifications || [],
            variants: scrapeResult.variants || [],
        });
        setIsOpen(false);
        setScrapeResult(null);
    };

    const handleClear = () => { setScrapeResult(null); setError(null); setUrl(""); setHtmlPaste(""); };

    return (
        <div className="rounded-2xl border border-border bg-card">
            <button type="button" onClick={() => setIsOpen(!isOpen)} className="flex w-full items-center justify-between px-5 py-4 text-left">
                <div className="flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium text-foreground">Nhập từ TopZone</span>
                </div>
                {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </button>

            {isOpen && (
                <div className="border-t border-border px-5 pb-5 pt-4 space-y-4">
                    <div className="flex gap-1 rounded-lg bg-muted p-1">
                        <button type="button" onClick={() => setMode("url")} className={`flex items-center gap-1.5 flex-1 justify-center rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${mode === "url" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                            <Globe className="h-3.5 w-3.5" />URL
                        </button>
                        <button type="button" onClick={() => setMode("html")} className={`flex items-center gap-1.5 flex-1 justify-center rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${mode === "html" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                            <Code2 className="h-3.5 w-3.5" />Dán HTML
                        </button>
                    </div>

                    {mode === "url" && (
                        <div className="flex gap-2">
                            <Input placeholder="Dán URL sản phẩm TopZone hoặc TGDĐ..." value={url} onChange={(e) => setUrl(e.target.value)} disabled={isScraping || disabled} className="h-9 text-sm" onKeyDown={(e) => e.key === "Enter" && handleScrapeUrl()} />
                            <Button type="button" size="sm" className="rounded-full shrink-0" onClick={handleScrapeUrl} disabled={!url.trim() || isScraping || disabled}>
                                {isScraping ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Lấy dữ liệu"}
                            </Button>
                        </div>
                    )}

                    {mode === "html" && (
                        <div className="space-y-2">
                            <p className="text-xs text-muted-foreground">Mở trang sản phẩm → Chuột phải → <strong>View Page Source</strong> → Ctrl+A → Ctrl+C → Dán vào đây:</p>
                            <textarea
                                className="w-full h-32 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs font-mono resize-y focus:outline-none focus:ring-1 focus:ring-primary"
                                placeholder="<html>..."
                                value={htmlPaste}
                                onChange={(e) => setHtmlPaste(e.target.value)}
                                disabled={isScraping || disabled}
                            />
                            <Button type="button" size="sm" className="rounded-full" onClick={handleScrapeHtml} disabled={!htmlPaste.trim() || isScraping || disabled}>
                                {isScraping ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Phân tích HTML"}
                            </Button>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                            <div className="flex-1">{error}</div>
                            <button type="button" onClick={handleClear} className="shrink-0"><X className="h-3.5 w-3.5" /></button>
                        </div>
                    )}

                    {scrapeResult && (
                        <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-3 space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-green-700"><CheckCircle2 className="h-4 w-4" />Đã tìm thấy sản phẩm</div>
                            <div className="flex flex-wrap gap-1.5">
                                <Badge variant="secondary" className="text-xs">{scrapeResult.name}</Badge>
                                {scrapeResult.colorOptions?.length > 0 && <Badge variant="outline" className="text-xs">{scrapeResult.colorOptions.length} màu</Badge>}
                                {scrapeResult.storageOptions?.length > 0 && <Badge variant="outline" className="text-xs">{scrapeResult.storageOptions.length} dung lượng</Badge>}
                                <Badge variant="outline" className="text-xs">{scrapeResult.variants?.length || 0} variants</Badge>
                                {scrapeResult.specifications?.length > 0 && <Badge variant="outline" className="text-xs">{scrapeResult.specifications.length} thông số</Badge>}
                                {scrapeResult.newGlobalOptions?.length > 0 && <Badge variant="secondary" className="text-xs bg-amber-500/10 text-amber-700">+{scrapeResult.newGlobalOptions.length} tùy chọn mới</Badge>}
                            </div>
                            <div className="flex gap-2 pt-1">
                                <Button type="button" size="sm" className="rounded-full" onClick={handleApply} disabled={isCreatingOptions}>
                                    {isCreatingOptions ? <><Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />Đang tạo...</> : "Áp dụng vào form"}
                                </Button>
                                <Button type="button" variant="ghost" size="sm" className="rounded-full" onClick={handleClear}>Huỷ</Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
