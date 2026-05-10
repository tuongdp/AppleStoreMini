import { useState } from "react";
import { useTranslation } from "react-i18next";
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
import { useSearchProductsQuery } from "@/store/api/productsApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { cn, formatPrice } from "@/lib/utils";

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
    const { t } = useTranslation("admin");
    const config = {
        active: {
            label: t("flashSale.statusActive"),
            className: "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400",
        },
        upcoming: {
            label: t("flashSale.statusUpcoming"),
            className: "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
        },
        ended: {
            label: "Đã kết thúc",
            className: "bg-muted text-muted-foreground",
        },
        disabled: {
            label: t("flashSale.statusDisabled"),
            className: "bg-muted text-muted-foreground",
        },
    };
    const c = config[status] || config.disabled;
    return <Badge className={cn("text-[11px]", c.className)}>{c.label}</Badge>;
}

// ── FlashSale Form (create / edit) ─────────────────────
function FlashSaleForm({ flashSale, onClose }) {
    const { t } = useTranslation("admin");
    const isEditing = !!flashSale;
    const [createFlashSale, { isLoading: isCreating }] = useCreateFlashSaleMutation();
    const [updateFlashSale, { isLoading: isUpdating }] = useUpdateFlashSaleMutation();
    const isLoading = isCreating || isUpdating;

    const flashSaleSchema = z.object({
        title: z.string().min(1, t("flashSale.validation.titleRequired")),
        startTime: z.string().min(1, t("flashSale.validation.startTimeRequired")),
        endTime: z.string().min(1, t("flashSale.validation.endTimeRequired")),
        description: z.string().optional().default(""),
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
            description: flashSale?.description || "",
        },
    });

    const onSubmit = async (values) => {
        try {
            const payload = {
                title: values.title,
                startTime: new Date(values.startTime).toISOString(),
                endTime: new Date(values.endTime).toISOString(),
            };
            if (values.description) {
                payload.description = values.description;
            }
            if (isEditing) {
                await updateFlashSale({ id: flashSale.id, ...payload }).unwrap();
                toast.success(t("flashSale.toast.updateSuccess"));
            } else {
                await createFlashSale(payload).unwrap();
                toast.success(t("flashSale.toast.createSuccess"));
            }
            onClose();
        } catch (error) {
            toast.error(error?.data?.message || t("flashSale.toast.errorOccurred"));
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
                            <FormLabel>{t("flashSale.titleLabel")}</FormLabel>
                            <FormControl>
                                <Input placeholder={t("flashSale.titlePlaceholder")} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Ghi chú / Mô tả</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Mô tả ngắn cho đợt flash sale (tuỳ chọn)"
                                    {...field}
                                />
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
                                <FormLabel>{t("flashSale.startTime")}</FormLabel>
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
                                <FormLabel>{t("flashSale.endTime")}</FormLabel>
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
                        {t("flashSale.cancel")}
                    </Button>
                    <Button type="submit" size="sm" className="rounded-full" disabled={isLoading}>
                        {isLoading ? (
                            <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />{t("flashSale.saving")}</>
                        ) : isEditing ? t("flashSale.update") : t("flashSale.create")}
                    </Button>
                </div>
            </form>
        </Form>
    );
}

// ── AddItemDialog ──────────────────────────────────────
function AddItemDialog({ flashSaleId, open, onClose }) {
    const { t } = useTranslation("admin");
    const [search, setSearch] = useState("");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const { data: productsData, isFetching, isError } = useSearchProductsQuery(search, { skip: search.length < 2 });
    const [addItem, { isLoading }] = useAddFlashSaleItemMutation();

    const products = productsData || [];

    const addItemSchema = z.object({
        variantId: z.string().min(1, t("flashSale.validation.variantRequired")),
        salePrice: z.coerce.number().min(1000, t("flashSale.validation.priceMin")),
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

    const selectProduct = (product) => {
        setSelectedProduct(product);
        const originalPrice = product.price || 0;
        form.setValue("variantId", product.variantId);
        form.setValue("salePrice", originalPrice);
        form.setValue("discountPercent", 0);
    };

    const handleDiscountChange = (value) => {
        form.setValue("discountPercent", value);
        if (selectedProduct) {
            const originalPrice = selectedProduct.price || 0;
            const salePrice = Math.round(originalPrice * (1 - value / 100));
            form.setValue("salePrice", salePrice);
        }
    };

    const handleSalePriceChange = (value) => {
        form.setValue("salePrice", value);
        if (selectedProduct && selectedProduct.price > 0) {
            const discount = Math.round(((selectedProduct.price - value) / selectedProduct.price) * 100);
            form.setValue("discountPercent", Math.max(0, Math.min(99, discount)));
        }
    };

    const onSubmit = async (values) => {
        try {
            await addItem({
                flashSaleId,
                variantId: values.variantId,
                salePrice: values.salePrice,
                quantityLimit: values.quantityLimit,
                maxPerUser: values.maxPerUser,
                sortOrder: values.sortOrder,
            }).unwrap();
            toast.success(t("flashSale.toast.itemAdded"));
            setSelectedProduct(null);
            setSearch("");
            form.reset();
            onClose();
        } catch (error) {
            toast.error(error?.data?.message || t("flashSale.toast.errorOccurred"));
        }
    };

    const variantAttrs = (product) => {
        const parts = [];
        if (product.color) parts.push(product.color);
        if (product.storage) parts.push(product.storage);
        if (product.ram) parts.push(product.ram);
        if (product.edition) parts.push(product.edition);
        return parts;
    };

    return (
        <Dialog open={open} onOpenChange={(o) => {
            if (!o) {
                setSelectedProduct(null);
                setSearch("");
                onClose();
            }
        }}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t("flashSale.addItem")}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Search */}
                        <div>
                            <FormLabel>{t("flashSale.searchProduct")}</FormLabel>
                            <div className="relative mt-1.5">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    className="pl-9"
                                    placeholder={t("flashSale.searchPlaceholder")}
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setSelectedProduct(null);
                                    }}
                                />
                            </div>

                            {search.length > 0 && search.length < 2 && (
                                <p className="mt-1.5 text-xs text-muted-foreground">{t("flashSale.searchMinChars")}</p>
                            )}

                            {isFetching && (
                                <div className="mt-2 flex items-center gap-2 rounded-lg border border-border px-3 py-4">
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">{t("flashSale.searching")}</span>
                                </div>
                            )}

                            {isError && (
                                <p className="mt-1.5 text-xs text-destructive">{t("flashSale.searchError")}</p>
                            )}

                            {!isFetching && !isError && search.length >= 2 && products.length === 0 && (
                                <p className="mt-1.5 text-xs text-muted-foreground">{t("flashSale.noProductsFound")}</p>
                            )}

                            {!isFetching && products.length > 0 && (
                                <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-border">
                                    {products.map((product) => {
                                        const attrs = variantAttrs(product);
                                        return (
                                            <button
                                                key={product.id}
                                                type="button"
                                                className={cn(
                                                    "flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted",
                                                    selectedProduct?.id === product.id && "bg-primary/10"
                                                )}
                                                onClick={() => selectProduct(product)}
                                            >
                                                <img
                                                    src={product.images?.[0] || ""}
                                                    alt={product.name}
                                                    className="h-10 w-10 rounded-lg object-cover"
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate font-medium">{product.name}</p>
                                                    {attrs.length > 0 && (
                                                        <p className="text-xs text-muted-foreground">
                                                            {attrs.join(" · ")}
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-muted-foreground">{formatPrice(product.price)}</p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {selectedProduct && (
                                <div className="mt-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm dark:border-green-800 dark:bg-green-950/20">
                                    <span className="text-muted-foreground">{t("flashSale.selectedLabel")}</span>
                                    <span className="font-medium">{selectedProduct.name}</span>
                                    {variantAttrs(selectedProduct).length > 0 && (
                                        <span className="ml-1 text-xs text-muted-foreground">
                                            ({variantAttrs(selectedProduct).join(" · ")})
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Original Price (read-only) */}
                        {selectedProduct && (
                            <div className="rounded-lg border border-border bg-muted/30 p-3">
                                <p className="text-xs text-muted-foreground">Giá gốc</p>
                                <p className="text-base font-semibold text-foreground">
                                    {formatPrice(selectedProduct.price || 0)}
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
                                    <FormLabel>{t("flashSale.salePriceLabel")}</FormLabel>
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
                                    <FormLabel>{t("flashSale.sortOrder")}</FormLabel>
                                    <FormControl>
                                        <Input type="number" min={0} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={onClose}>
                                {t("flashSale.cancel")}
                            </Button>
                            <Button type="submit" size="sm" className="rounded-full" disabled={isLoading}>
                                {isLoading ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />{t("flashSale.adding")}</> : t("flashSale.add")}
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
        || product?.images?.[0]
        || "";

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
                    Đã bán {item.quantitySold || 0}
                    {item.quantityLimit > 0 && ` / ${item.quantityLimit}`}
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
    const { t } = useTranslation("admin");
    const [expanded, setExpanded] = useState(false);
    const status = getFlashSaleStatus(flashSale);
    const items = flashSale.items || [];

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
                            <p className="py-3 text-center text-xs text-muted-foreground">{t("flashSale.noProducts")}</p>
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
                            {t("flashSale.addProduct")}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// ── Main Page ──────────────────────────────────────────
export default function AdminFlashSalePage() {
    const { t } = useTranslation("admin");
    const [deleteId, setDeleteId] = useState(null);
    const [editingFlashSale, setEditingFlashSale] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [addItemTo, setAddItemTo] = useState(null);

    const { data, isLoading } = useGetAllFlashSalesQuery();
    const [deleteFlashSale, { isLoading: isDeleting }] = useDeleteFlashSaleMutation();
    const [toggleStatus, { isLoading: isToggling }] = useToggleFlashSaleStatusMutation();
    const [removeItem, { isLoading: isRemoving }] = useRemoveFlashSaleItemMutation();

    const flashSales = data || [];

    const handleDelete = async () => {
        try {
            await deleteFlashSale(deleteId).unwrap();
            toast.success(t("flashSale.toast.deleteSuccess"));
        } catch {
            toast.error(t("flashSale.toast.errorOccurred"));
        } finally {
            setDeleteId(null);
        }
    };

    const handleToggle = async (id) => {
        try {
            await toggleStatus(id).unwrap();
            toast.success(t("flashSale.toast.statusUpdated"));
        } catch {
            toast.error(t("flashSale.toast.errorOccurred"));
        }
    };

    const handleRemoveItem = async (itemId) => {
        try {
            await removeItem(itemId).unwrap();
            toast.success(t("flashSale.toast.itemRemoved"));
        } catch {
            toast.error(t("flashSale.toast.errorOccurred"));
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-foreground">{t("flashSale.title")}</h1>
                    <p className="mt-1 text-sm text-muted-foreground">{t("flashSale.subtitle")}</p>
                </div>
                <Button className="rounded-full" onClick={() => { setEditingFlashSale(null); setShowForm(true); }}>
                    <Plus className="mr-1.5 h-4 w-4" />
                    {t("flashSale.createSale")}
                </Button>
            </div>

            {/* Form */}
            {showForm && (
                <div className="rounded-2xl border border-border bg-card p-5">
                    <h3 className="mb-4 text-sm font-medium text-foreground">
                        {editingFlashSale ? t("flashSale.editSale") : t("flashSale.createSaleNew")}
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
                        {t("flashSale.createSale")}
                    </Button>
                </div>
            )}

            {/* Card grid */}
            {!isLoading && flashSales.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {flashSales.map((fs) => (
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
                title={t("flashSale.deleteSale")}
                description={t("flashSale.deleteSaleConfirm")}
                onConfirm={handleDelete}
                isLoading={isDeleting}
            />
        </div>
    );
}
