import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
    Plus,
    Pencil,
    Trash2,
    Eye,
    EyeOff,
    Loader2,
    Clock,
    Search,
    Zap,
    ChevronDown,
    ChevronUp,
    PackageOpen,
    BarChart3,
    AlertTriangle,
    TrendingUp,
    X,
} from "lucide-react";
import {
    useGetAllFlashSalesQuery,
    useCreateFlashSaleMutation,
    useUpdateFlashSaleMutation,
    useDeleteFlashSaleMutation,
    useToggleFlashSaleStatusMutation,
    useAddFlashSaleItemMutation,
    useRemoveFlashSaleItemMutation,
} from "@/store/api/flashSalesApi";
import { useSearchProductsQuery, useGetProductBySlugQuery } from "@/store/api/productsApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { cn, formatPrice, parseJsonField } from "@/lib/utils";

const FLASH_SALE_STATUS_FILTERS = ["all", "active", "upcoming", "ended", "disabled"];

function formatDateTime(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function getFlashSaleStatus(flashSale) {
    const now = new Date();
    if (!flashSale.isActive) return "disabled";
    if (new Date(flashSale.endTime) < now) return "ended";
    if (new Date(flashSale.startTime) > now) return "upcoming";
    return "active";
}

function FlashSaleStatusBadge({ status }) {
    const config = {
        active: {
            label: "Đang diễn ra",
            className: "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400",
        },
        upcoming: {
            label: "Sắp diễn ra",
            className: "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
        },
        ended: {
            label: "Đã kết thúc",
            className: "bg-muted text-muted-foreground",
        },
        disabled: {
            label: "Đã tắt",
            className: "bg-muted text-muted-foreground",
        },
    };
    const c = config[status] || config.disabled;
    return <Badge className={cn("text-[11px]", c.className)}>{c.label}</Badge>;
}

function getItemStats(items = []) {
    return items.reduce(
        (stats, item) => {
            const limit = Number(item.quantityLimit) || 0;
            const sold = Math.max(0, Number(item.quantitySold) || 0);
            const salePrice = Number(item.salePrice) || 0;
            return {
                totalLimit: stats.totalLimit + limit,
                totalSold: stats.totalSold + sold,
                revenue: stats.revenue + (sold * salePrice),
                soldOut: stats.soldOut + (limit > 0 && sold >= limit ? 1 : 0),
            };
        },
        { totalLimit: 0, totalSold: 0, revenue: 0, soldOut: 0 },
    );
}

function FlashSaleSummaryCard({ icon: Icon, label, value, note, tone = "default" }) {
    const toneClass = {
        default: "bg-muted text-muted-foreground",
        active: "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400",
        warning: "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
        danger: "bg-destructive/10 text-destructive",
    }[tone];

    return (
        <Card>
            <CardContent className="flex items-center gap-3 p-4">
                <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", toneClass)}>
                    <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="mt-0.5 text-lg font-semibold text-foreground">{value}</p>
                    {note && <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{note}</p>}
                </div>
            </CardContent>
        </Card>
    );
}

// ── FlashSale Form (create / edit) ─────────────────────
function FlashSaleForm({ flashSale, onClose }) {
    const isEditing = !!flashSale;
    const [createFlashSale, { isLoading: isCreating }] = useCreateFlashSaleMutation();
    const [updateFlashSale, { isLoading: isUpdating }] = useUpdateFlashSaleMutation();
    const isLoading = isCreating || isUpdating;

    const flashSaleSchema = z.object({
        title: z.string().min(1, "Tiêu đề không được để trống"),
        startTime: z.string().min(1, "Chọn thời gian bắt đầu"),
        endTime: z.string().min(1, "Chọn thời gian kết thúc"),
    }).refine((values) => new Date(values.endTime) > new Date(values.startTime), {
        path: ["endTime"],
        message: "Thời gian kết thúc phải sau thời gian bắt đầu",
    });

    const form = useForm({
        resolver: zodResolver(flashSaleSchema),
        defaultValues: {
            title: flashSale?.title || "FLASH SALE",
            startTime: flashSale?.startTime
                ? new Date(flashSale.startTime).toISOString().slice(0, 16)
                : "",
            endTime: flashSale?.endTime
                ? new Date(flashSale.endTime).toISOString().slice(0, 16)
                : "",
        },
    });

    const onSubmit = async (values) => {
        try {
            const payload = {
                title: values.title,
                startTime: new Date(values.startTime).toISOString(),
                endTime: new Date(values.endTime).toISOString(),
            };
            if (isEditing) {
                await updateFlashSale({ id: flashSale.id, ...payload }).unwrap();
                toast.success("Đã cập nhật flash sale");
            } else {
                await createFlashSale(payload).unwrap();
                toast.success("Đã tạo flash sale mới");
            }
            onClose();
        } catch (error) {
            toast.error(error?.data?.message || "Có lỗi xảy ra");
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{"Tiêu đề"}</FormLabel>
                            <FormControl>
                                <Input placeholder={"VD: FLASH SALE"} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="startTime"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{"Thời gian bắt đầu"}</FormLabel>
                                <FormControl>
                                    <Input type="datetime-local" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="endTime"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{"Thời gian kết thúc"}</FormLabel>
                                <FormControl>
                                    <Input type="datetime-local" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={onClose} disabled={isLoading}>
                        {"Huỷ"}
                    </Button>
                    <Button type="submit" size="sm" className="rounded-full" disabled={isLoading}>
                        {isLoading ? (
                            <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />{"Đang lưu..."}</>
                        ) : isEditing ? "Cập nhật" : "Tạo mới"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}

// ── AddItemDialog ──────────────────────────────────────
function AddItemDialog({ flashSaleId, open, onClose }) {
    const [search, setSearch] = useState("");
    const [selectedProductSlug, setSelectedProductSlug] = useState(null);
    const [selectedVariantId, setSelectedVariantId] = useState(null);
    const { data: productsData, isFetching, isError } = useSearchProductsQuery(search, { skip: search.length < 2 });
    const { data: fullProduct } = useGetProductBySlugQuery(selectedProductSlug, { skip: !selectedProductSlug });
    const [addItem, { isLoading }] = useAddFlashSaleItemMutation();

    const products = productsData || [];
    const variants = fullProduct?.variants || [];
    const selectedVariant = variants.find((v) => v.id === selectedVariantId);

    const addItemSchema = z.object({
        variantId: z.string().min(1, "Chọn biến thể"),
        salePrice: z.coerce.number().min(1000, "Giá phải lớn hơn 0"),
        quantityLimit: z.coerce.number().min(0, "Phải >= 0"),
        maxPerUser: z.coerce.number().min(1, "Tối thiểu 1"),
        discountPercent: z.coerce.number().min(0).max(99).default(0),
        sortOrder: z.coerce.number().default(0),
    });

    const form = useForm({
        resolver: zodResolver(addItemSchema),
        defaultValues: {
            salePrice: 0,
            quantityLimit: 0,
            maxPerUser: 1,
            discountPercent: 0,
            sortOrder: 0,
            variantId: "",
        },
    });

    const selectProductSlug = (slug) => {
        setSelectedProductSlug(slug);
        setSelectedVariantId(null);
    };

    const selectVariant = (variant) => {
        setSelectedVariantId(variant.id);
        form.setValue("variantId", variant.id);
        form.setValue("salePrice", variant.price || 0);
        form.setValue("discountPercent", 0);
    };

    const handleDiscountChange = (value) => {
        form.setValue("discountPercent", value);
        if (selectedVariant) {
            const originalPrice = selectedVariant.price || 0;
            const salePrice = Math.round(originalPrice * (1 - value / 100));
            form.setValue("salePrice", salePrice);
        }
    };

    const handleSalePriceChange = (value) => {
        form.setValue("salePrice", value);
        if (selectedVariant && selectedVariant.price > 0) {
            const discount = Math.round(((selectedVariant.price - value) / selectedVariant.price) * 100);
            form.setValue("discountPercent", Math.max(0, Math.min(99, discount)));
        }
    };

    const onSubmit = async (values) => {
        try {
            if (!selectedVariant) {
                toast.error("Vui lòng chọn biến thể sản phẩm");
                return;
            }
            if (!selectedVariant.inStock || Number(selectedVariant.stock) <= 0) {
                toast.error("Chỉ thêm sản phẩm đang bán và còn hàng vào flash sale");
                return;
            }
            if (Number(values.salePrice) >= Number(selectedVariant.price)) {
                toast.error("Giá flash sale phải thấp hơn giá gốc");
                return;
            }
            if (Number(values.quantityLimit) > 0 && Number(values.quantityLimit) > Number(selectedVariant.stock || 0)) {
                toast.error("Giới hạn flash sale không được vượt quá tồn kho");
                return;
            }
            if (Number(values.quantityLimit) > 0 && Number(values.maxPerUser) > Number(values.quantityLimit)) {
                toast.error("Tối đa mỗi khách không được vượt quá giới hạn bán");
                return;
            }
            await addItem({
                flashSaleId,
                variantId: values.variantId,
                salePrice: values.salePrice,
                quantityLimit: values.quantityLimit,
                maxPerUser: values.maxPerUser,
                sortOrder: values.sortOrder,
            }).unwrap();
            toast.success("Đã thêm sản phẩm");
            setSelectedProductSlug(null);
            setSelectedVariantId(null);
            setSearch("");
            form.reset();
            onClose();
        } catch (error) {
            toast.error(error?.data?.message || "Có lỗi xảy ra");
        }
    };

    const variantAttrs = (v) => {
        const parts = [];
        if (v.color) parts.push(v.color);
        if (v.storage) parts.push(v.storage);
        if (v.ram) parts.push(v.ram);
        if (v.edition) parts.push(v.edition);
        return parts;
    };

    return (
        <Dialog open={open} onOpenChange={(o) => {
            if (!o) {
                setSelectedProductSlug(null);
                setSelectedVariantId(null);
                setSearch("");
                onClose();
            }
        }}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{"Thêm sản phẩm vào flash sale"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <FormLabel>{"Tìm sản phẩm"}</FormLabel>
                            <div className="relative mt-1.5">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    className="pl-9"
                                    placeholder={"Gõ tên sản phẩm..."}
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setSelectedProductSlug(null);
                                        setSelectedVariantId(null);
                                    }}
                                />
                            </div>

                            {search.length > 0 && search.length < 2 && (
                                <p className="mt-1.5 text-xs text-muted-foreground">{"Gõ ít nhất 2 ký tự để tìm kiếm"}</p>
                            )}

                            {isFetching && (
                                <div className="mt-2 flex items-center gap-2 rounded-lg border border-border px-3 py-4">
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">{"Đang tìm kiếm..."}</span>
                                </div>
                            )}

                            {!isFetching && !isError && search.length >= 2 && products.length === 0 && (
                                <p className="mt-1.5 text-xs text-muted-foreground">{"Không tìm thấy sản phẩm nào"}</p>
                            )}

                            {!isFetching && products.length > 0 && (
                                <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-border">
                                    {products.map((product) => (
                                        <button
                                            key={product.id}
                                            type="button"
                                            className={cn(
                                                "flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted",
                                                selectedProductSlug === product.slug && "bg-primary/10"
                                            )}
                                            onClick={() => selectProductSlug(product.slug)}
                                        >
                                            <img
                                                src={product.image || parseJsonField(product.images)?.[0] || ""}
                                                alt={product.name}
                                                className="h-10 w-10 rounded-lg object-cover"
                                            />
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate font-medium">{product.name}</p>
                                                {variantAttrs(product).length > 0 && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {variantAttrs(product).join(" · ")}
                                                    </p>
                                                )}
                                                <p className="text-xs text-muted-foreground">{formatPrice(product.price)}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Variant selection */}
                            {selectedProductSlug && fullProduct && (
                                <div className="mt-2 rounded-lg border border-border p-3">
                                    <p className="text-xs font-medium text-foreground mb-2">
                                        Chọn phiên bản cho: {fullProduct.name}
                                    </p>
                                    <div className="space-y-1 max-h-32 overflow-y-auto">
                                        {variants.map((v) => {
                                            const attrs = variantAttrs(v);
                                            return (
                                                <button
                                                    key={v.id}
                                                    type="button"
                                                    className={cn(
                                                        "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted",
                                                        selectedVariantId === v.id && "bg-primary/10 border border-primary/20"
                                                    )}
                                                    onClick={() => selectVariant(v)}
                                                >
                                                    <span className="text-foreground">
                                                        {attrs.length > 0 ? attrs.join(" · ") : "Mặc định"}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatPrice(v.price)} {v.inStock ? "" : "(Hết hàng)"}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {selectedVariant && (
                                <div className="mt-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm dark:border-green-800 dark:bg-green-950/20">
                                    <span className="text-muted-foreground">Đã chọn: </span>
                                    <span className="font-medium">{fullProduct?.name}</span>
                                    <span className="ml-1 text-xs text-muted-foreground">
                                        ({variantAttrs(selectedVariant).join(" · ") || "Mặc định"})
                                    </span>
                                </div>
                            )}
                        </div>

                        {selectedVariant && (
                            <div className="rounded-lg border border-border bg-muted/30 p-3">
                                <p className="text-xs text-muted-foreground">Giá gốc</p>
                                <p className="text-base font-semibold text-foreground">
                                    {formatPrice(selectedVariant.price || 0)}
                                </p>
                            </div>
                        )}

                        {/* Discount % */}
                        <FormField
                            control={form.control}
                            name="discountPercent"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Giảm giá (%)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={0}
                                            max={99}
                                            placeholder="0"
                                            {...field}
                                            onChange={(e) => {
                                                field.onChange(e);
                                                handleDiscountChange(Number(e.target.value) || 0);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Sale Price */}
                        <FormField
                            control={form.control}
                            name="salePrice"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{"Giá flash sale"}</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={1000}
                                            {...field}
                                            onChange={(e) => {
                                                field.onChange(e);
                                                handleSalePriceChange(Number(e.target.value) || 0);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="quantityLimit"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Giới hạn số lượng</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={0}
                                                placeholder="0 = không giới hạn"
                                                {...field}
                                            />
                                        </FormControl>
                                        <p className="text-[10px] text-muted-foreground">0 = không giới hạn</p>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="maxPerUser"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tối đa / người dùng</FormLabel>
                                        <FormControl>
                                            <Input type="number" min={1} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="sortOrder"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{"Thứ tự hiển thị"}</FormLabel>
                                    <FormControl>
                                        <Input type="number" min={0} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={onClose}>
                                {"Huỷ"}
                            </Button>
                            <Button type="submit" size="sm" className="rounded-full" disabled={isLoading}>
                                {isLoading ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />{"Đang thêm..."}</> : "Thêm"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

// ── FlashSaleItemRow ───────────────────────────────────
function FlashSaleItemRow({ item, onRemove, isRemoving }) {
    const product = item.variant?.product || item.product;
    const variant = item.variant;
    const color = variant?.color || "";
    const storage = variant?.storage || "";
    const ram = variant?.ram || "";
    const imgSrc = (Array.isArray(variant?.images) ? variant.images[0] : null)
        || parseJsonField(product?.images)?.[0]
        || "";
    const sold = Math.max(0, Number(item.quantitySold) || 0);
    const limit = Number(item.quantityLimit) || 0;
    const remaining = limit > 0 ? Math.max(0, limit - sold) : null;

    return (
        <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <img
                src={imgSrc}
                alt={product?.name}
                className="h-12 w-12 rounded-lg object-cover"
            />
            <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{product?.name}</p>
                {[color, storage, ram].filter(Boolean).length > 0 && (
                    <p className="text-xs text-muted-foreground">
                        {[color, storage, ram].filter(Boolean).join(" · ")}
                    </p>
                )}
                <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="line-through">{formatPrice(item.originalPrice)}</span>
                    <span className="font-semibold text-red-500">{formatPrice(item.salePrice)}</span>
                    <Badge variant="destructive" className="text-[10px]">-{item.discountPercent}%</Badge>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                    Đã bán {sold}
                    {limit > 0 && ` / ${limit} · Còn ${remaining}`}
                    {item.maxPerUser > 1 && ` · Tối đa ${item.maxPerUser}/người`}
                </p>
            </div>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => onRemove(item.id)}
                disabled={isRemoving}
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );
}

// ── FlashSaleCard ──────────────────────────────────────
function FlashSaleCard({ flashSale, onToggle, onEdit, onDelete, onAddItem, onRemoveItem, isToggling, isRemoving }) {
    const [expanded, setExpanded] = useState(false);
    const status = getFlashSaleStatus(flashSale);
    const items = flashSale.items || [];
    const stats = getItemStats(items);
    const progress = stats.totalLimit > 0 ? Math.min(100, Math.round((stats.totalSold / stats.totalLimit) * 100)) : 0;

    return (
        <Card className="overflow-hidden">
            <CardHeader className="border-b border-border pb-3">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                        <div className={cn(
                            "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                            status === "active"
                                ? "bg-destructive/10 text-destructive"
                                : "bg-muted text-muted-foreground",
                        )}>
                            <Zap className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                            <CardTitle className="text-sm">{flashSale.title}</CardTitle>
                            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{formatDateTime(flashSale.startTime)} → {formatDateTime(flashSale.endTime)}</span>
                            </div>
                            <div className="mt-1 flex items-center gap-2">
                                <FlashSaleStatusBadge status={status} />
                                <Badge variant="secondary" className="text-[11px]">
                                    {items.length} sản phẩm
                                </Badge>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => onToggle(flashSale.id)}
                            disabled={isToggling}
                        >
                            {flashSale.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => onEdit(flashSale)}
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => onDelete(flashSale.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-3">
                {flashSale.description && (
                    <p className="mb-3 text-xs text-muted-foreground">{flashSale.description}</p>
                )}

                <div className="mb-3 grid grid-cols-3 gap-2 rounded-lg bg-muted/40 p-2 text-xs">
                    <div>
                        <p className="text-muted-foreground">Đã bán</p>
                        <p className="font-semibold text-foreground">{stats.totalSold}{stats.totalLimit > 0 ? ` / ${stats.totalLimit}` : ""}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Doanh thu</p>
                        <p className="font-semibold text-foreground">{formatPrice(stats.revenue)}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Hết suất</p>
                        <p className="font-semibold text-foreground">{stats.soldOut}</p>
                    </div>
                    {stats.totalLimit > 0 && (
                        <div className="col-span-3 h-1.5 overflow-hidden rounded-full bg-background">
                            <div className="h-full rounded-full bg-destructive transition-[width]" style={{ width: `${progress}%` }} />
                        </div>
                    )}
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    className="mb-1 h-7 text-xs text-muted-foreground rounded-full"
                    onClick={() => setExpanded(!expanded)}
                >
                    {expanded ? (
                        <><ChevronUp className="mr-1 h-3.5 w-3.5" />Thu gọn</>
                    ) : (
                        <><ChevronDown className="mr-1 h-3.5 w-3.5" />Xem sản phẩm ({items.length})</>
                    )}
                </Button>

                {expanded && (
                    <div className="mt-2 space-y-2">
                        {items.length === 0 ? (
                            <p className="py-3 text-center text-xs text-muted-foreground">{"Chưa có sản phẩm nào"}</p>
                        ) : (
                            items.map((item) => (
                                <FlashSaleItemRow
                                    key={item.id}
                                    item={item}
                                    onRemove={onRemoveItem}
                                    isRemoving={isRemoving}
                                />
                            ))
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full h-8 text-xs rounded-full"
                            onClick={() => onAddItem(flashSale.id)}
                        >
                            <Plus className="mr-1 h-3.5 w-3.5" />
                            {"Thêm sản phẩm"}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// ── Main Page ──────────────────────────────────────────
export default function AdminFlashSalePage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [deleteId, setDeleteId] = useState(null);
    const [editingFlashSale, setEditingFlashSale] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [addItemTo, setAddItemTo] = useState(null);
    const search = searchParams.get("search") || "";
    const statusParam = searchParams.get("status") || "all";
    const statusFilter = FLASH_SALE_STATUS_FILTERS.includes(statusParam) ? statusParam : "all";

    const { data, isLoading } = useGetAllFlashSalesQuery();
    const [deleteFlashSale, { isLoading: isDeleting }] = useDeleteFlashSaleMutation();
    const [toggleStatus, { isLoading: isToggling }] = useToggleFlashSaleStatusMutation();
    const [removeItem, { isLoading: isRemoving }] = useRemoveFlashSaleItemMutation();

    const flashSales = useMemo(() => data || [], [data]);
    const summary = useMemo(() => {
        return flashSales.reduce(
            (acc, flashSale) => {
                const status = getFlashSaleStatus(flashSale);
                const stats = getItemStats(flashSale.items || []);
                return {
                    total: acc.total + 1,
                    active: acc.active + (status === "active" ? 1 : 0),
                    upcoming: acc.upcoming + (status === "upcoming" ? 1 : 0),
                    ended: acc.ended + (status === "ended" ? 1 : 0),
                    totalSold: acc.totalSold + stats.totalSold,
                    revenue: acc.revenue + stats.revenue,
                    soldOut: acc.soldOut + stats.soldOut,
                };
            },
            { total: 0, active: 0, upcoming: 0, ended: 0, totalSold: 0, revenue: 0, soldOut: 0 },
        );
    }, [flashSales]);

    const filteredFlashSales = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        return flashSales.filter((flashSale) => {
            const status = getFlashSaleStatus(flashSale);
            const matchesStatus = statusFilter === "all" || status === statusFilter;
            const matchesSearch = !keyword || flashSale.title?.toLowerCase().includes(keyword);
            return matchesStatus && matchesSearch;
        });
    }, [flashSales, search, statusFilter]);

    const updateFilterParam = (key, value) => {
        const params = new URLSearchParams(searchParams);
        const normalizedValue = typeof value === "string" ? value.trim() : value;

        if (!normalizedValue || normalizedValue === "all") {
            params.delete(key);
        } else {
            params.set(key, normalizedValue);
        }

        setSearchParams(params, { replace: true });
    };

    const clearFilters = () => {
        const params = new URLSearchParams(searchParams);
        params.delete("search");
        params.delete("status");
        setSearchParams(params, { replace: true });
    };

    const handleDelete = async () => {
        try {
            await deleteFlashSale(deleteId).unwrap();
            toast.success("Đã xóa flash sale");
        } catch (error) {
            toast.error(error?.data?.message || "Có lỗi xảy ra");
        } finally {
            setDeleteId(null);
        }
    };

    const handleToggle = async (id) => {
        try {
            await toggleStatus(id).unwrap();
            toast.success("Đã cập nhật trạng thái");
        } catch (error) {
            toast.error(error?.data?.message || "Có lỗi xảy ra");
        }
    };

    const handleRemoveItem = async (itemId) => {
        try {
            await removeItem(itemId).unwrap();
            toast.success("Đã xóa sản phẩm");
        } catch (error) {
            toast.error(error?.data?.message || "Có lỗi xảy ra");
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-foreground">{"Quản lý Flash Sale"}</h1>
                    <p className="mt-1 text-sm text-muted-foreground">{"Tạo đợt flash sale, thêm sản phẩm giảm giá"}</p>
                </div>
                <Button className="rounded-full" onClick={() => { setEditingFlashSale(null); setShowForm(true); }}>
                    <Plus className="mr-1.5 h-4 w-4" />
                    {"Tạo đợt flash sale"}
                </Button>
            </div>

            {!isLoading && flashSales.length > 0 && (
                <>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <FlashSaleSummaryCard icon={Zap} label="Đang chạy" value={summary.active} note={`${summary.upcoming} sắp diễn ra`} tone="active" />
                        <FlashSaleSummaryCard icon={BarChart3} label="Đã bán" value={summary.totalSold} note={`${summary.soldOut} sản phẩm hết suất`} />
                        <FlashSaleSummaryCard icon={TrendingUp} label="Doanh thu flash sale" value={formatPrice(summary.revenue)} note="Tính theo số đã bán" tone="warning" />
                        <FlashSaleSummaryCard icon={AlertTriangle} label="Đã kết thúc" value={summary.ended} note={`${summary.total} chương trình`} tone="danger" />
                    </div>

                    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 md:flex-row md:items-center md:justify-between">
                        <div className="relative md:w-80">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                className="pl-9"
                                placeholder="Tìm theo tên flash sale..."
                                aria-label="Tìm kiếm flash sale"
                                name="admin-flash-sale-search"
                                autoComplete="off"
                                value={search}
                                onChange={(event) => updateFilterParam("search", event.target.value)}
                            />
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <Select value={statusFilter} onValueChange={(value) => updateFilterParam("status", value)}>
                                <SelectTrigger className="w-full rounded-full md:w-48" aria-label="Lọc trạng thái flash sale">
                                    <SelectValue placeholder="Trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                    <SelectItem value="active">Đang diễn ra</SelectItem>
                                    <SelectItem value="upcoming">Sắp diễn ra</SelectItem>
                                    <SelectItem value="ended">Đã kết thúc</SelectItem>
                                    <SelectItem value="disabled">Đã tắt</SelectItem>
                                </SelectContent>
                            </Select>
                            {(search || statusFilter !== "all") && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="rounded-full"
                                    onClick={clearFilters}
                                >
                                    <X className="mr-1.5 h-3.5 w-3.5" />
                                    Xóa lọc
                                </Button>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Form */}
            {showForm && (
                <div className="rounded-2xl border border-border bg-card p-5">
                    <h3 className="mb-4 text-sm font-medium text-foreground">
                        {editingFlashSale ? "Chỉnh sửa flash sale" : "Tạo flash sale mới"}
                    </h3>
                    <FlashSaleForm
                        flashSale={editingFlashSale}
                        onClose={() => { setShowForm(false); setEditingFlashSale(null); }}
                    />
                </div>
            )}

            {/* Loading */}
            {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(2)].map((_, i) => (
                        <Skeleton key={i} className="h-44 w-full rounded-xl" />
                    ))}
                </div>
            )}

            {/* Empty state */}
            {!isLoading && flashSales.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <PackageOpen className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="mt-3 text-sm font-medium text-foreground">Chưa có Flash Sale nào</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Tạo đợt flash sale đầu tiên để bắt đầu
                    </p>
                    <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 rounded-full"
                        onClick={() => { setEditingFlashSale(null); setShowForm(true); }}
                    >
                        <Plus className="mr-1.5 h-4 w-4" />
                        {"Tạo đợt flash sale"}
                    </Button>
                </div>
            )}

            {!isLoading && flashSales.length > 0 && filteredFlashSales.length === 0 && (
                <div className="rounded-xl border border-dashed border-border py-10 text-center">
                    <p className="text-sm font-medium text-foreground">Không tìm thấy flash sale phù hợp</p>
                    <p className="mt-1 text-xs text-muted-foreground">Thử đổi từ khóa hoặc bộ lọc trạng thái.</p>
                </div>
            )}

            {/* Card grid */}
            {!isLoading && filteredFlashSales.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredFlashSales.map((fs) => (
                        <FlashSaleCard
                            key={fs.id}
                            flashSale={fs}
                            onToggle={handleToggle}
                            onEdit={(fs) => { setEditingFlashSale(fs); setShowForm(true); }}
                            onDelete={(id) => setDeleteId(id)}
                            onAddItem={(id) => setAddItemTo(id)}
                            onRemoveItem={handleRemoveItem}
                            isToggling={isToggling}
                            isRemoving={isRemoving}
                        />
                    ))}
                </div>
            )}

            <AddItemDialog
                flashSaleId={addItemTo}
                open={!!addItemTo}
                onClose={() => setAddItemTo(null)}
            />

            <ConfirmDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                title={"Xóa flash sale"}
                description={"Bạn có chắc muốn xóa đợt flash sale này?"}
                onConfirm={handleDelete}
                isLoading={isDeleting}
            />
        </div>
    );
}
