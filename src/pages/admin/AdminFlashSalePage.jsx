import { useState } from "react";
import {
    Plus,
    Pencil,
    Trash2,
    Eye,
    EyeOff,
    Loader2,
    Clock,
    Search,
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

const flashSaleSchema = z.object({
    title: z.string().min(1, "Tiêu đề không được để trống"),
    startTime: z.string().min(1, "Chọn thời gian bắt đầu"),
    endTime: z.string().min(1, "Chọn thời gian kết thúc"),
});

const addItemSchema = z.object({
    variantId: z.string().min(1, "Chọn biến thể"),
    salePrice: z.coerce.number().min(1000, "Giá phải lớn hơn 0"),
    quantityLimit: z.coerce.number().min(1, "Số lượng tối thiểu là 1"),
    sortOrder: z.coerce.number().default(0),
});

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

function FlashSaleForm({ flashSale, onClose }) {
    const isEditing = !!flashSale;
    const [createFlashSale, { isLoading: isCreating }] = useCreateFlashSaleMutation();
    const [updateFlashSale, { isLoading: isUpdating }] = useUpdateFlashSaleMutation();
    const isLoading = isCreating || isUpdating;

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
            if (isEditing) {
                await updateFlashSale({
                    id: flashSale.id,
                    title: values.title,
                    startTime: new Date(values.startTime).toISOString(),
                    endTime: new Date(values.endTime).toISOString(),
                }).unwrap();
                toast.success("Đã cập nhật flash sale");
            } else {
                await createFlashSale({
                    title: values.title,
                    startTime: new Date(values.startTime).toISOString(),
                    endTime: new Date(values.endTime).toISOString(),
                }).unwrap();
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
                            <FormLabel>Tiêu đề</FormLabel>
                            <FormControl>
                                <Input placeholder="VD: FLASH SALE" {...field} />
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
                                <FormLabel>Thời gian bắt đầu</FormLabel>
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
                                <FormLabel>Thời gian kết thúc</FormLabel>
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
                        Hủy
                    </Button>
                    <Button type="submit" size="sm" className="rounded-full" disabled={isLoading}>
                        {isLoading ? (
                            <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />Đang lưu...</>
                        ) : isEditing ? "Cập nhật" : "Tạo mới"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}

function AddItemDialog({ flashSaleId, open, onClose }) {
    const [search, setSearch] = useState("");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const { data: productsData, isFetching, isError } = useSearchProductsQuery(search, { skip: search.length < 2 });
    const [addItem, { isLoading }] = useAddFlashSaleItemMutation();

    const products = productsData || [];

    const form = useForm({
        resolver: zodResolver(addItemSchema),
        defaultValues: { salePrice: 0, quantityLimit: 1, sortOrder: 0, productId: "" },
    });

    const selectProduct = (product) => {
        setSelectedProduct(product);
        form.setValue("variantId", product.variantId);
        form.setValue("salePrice", product.salePrice || product.price);
    };

    const onSubmit = async (values) => {
        try {
            await addItem({ flashSaleId, ...values }).unwrap();
            toast.success("Đã thêm sản phẩm");
            setSelectedProduct(null);
            setSearch("");
            form.reset();
            onClose();
        } catch (error) {
            toast.error(error?.data?.message || "Có lỗi xảy ra");
        }
    };

    return (
        <Dialog open={open} onOpenChange={(o) => {
            if (!o) {
                setSelectedProduct(null);
                setSearch("");
                onClose();
            }
        }}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Thêm sản phẩm vào flash sale</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <FormLabel>Tìm sản phẩm</FormLabel>
                            <div className="relative mt-1.5">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    className="pl-9"
                                    placeholder="Gõ tên sản phẩm..."
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setSelectedProduct(null);
                                    }}
                                />
                            </div>

                            {search.length > 0 && search.length < 2 && (
                                <p className="mt-1.5 text-xs text-muted-foreground">Gõ ít nhất 2 ký tự để tìm kiếm</p>
                            )}

                            {isFetching && (
                                <div className="mt-2 flex items-center gap-2 rounded-lg border border-border px-3 py-4">
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Đang tìm kiếm...</span>
                                </div>
                            )}

                            {isError && (
                                <p className="mt-1.5 text-xs text-destructive">Có lỗi khi tìm kiếm. Vui lòng thử lại.</p>
                            )}

                            {!isFetching && !isError && search.length >= 2 && products.length === 0 && (
                                <p className="mt-1.5 text-xs text-muted-foreground">Không tìm thấy sản phẩm nào</p>
                            )}

                            {!isFetching && products.length > 0 && (
                                <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-border">
                                    {products.map((product) => (
                                        <button
                                            key={product.id}
                                            type="button"
                                            className={cn(
                                                "flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-muted",
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
                                                <p className="text-xs text-muted-foreground">{formatPrice(product.price)}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {selectedProduct && (
                                <div className="mt-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm dark:border-green-800 dark:bg-green-950/20">
                                    <span className="text-muted-foreground">Đã chọn: </span>
                                    <span className="font-medium">{selectedProduct.name}</span>
                                </div>
                            )}
                        </div>

                        <FormField
                            control={form.control}
                            name="salePrice"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Giá flash sale</FormLabel>
                                    <FormControl>
                                        <Input type="number" min={1000} {...field} />
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
                                        <FormLabel>Slot giới hạn</FormLabel>
                                        <FormControl>
                                            <Input type="number" min={1} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="sortOrder"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Thứ tự hiển thị</FormLabel>
                                        <FormControl>
                                            <Input type="number" min={0} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={onClose}>
                                Hủy
                            </Button>
                            <Button type="submit" size="sm" className="rounded-full" disabled={isLoading}>
                                {isLoading ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />Đang thêm...</> : "Thêm"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

function FlashSaleDetail({ flashSale }) {
    const [removeItem, { isLoading: isRemoving }] = useRemoveFlashSaleItemMutation();
    const now = new Date();
    const isActive = flashSale.isActive && new Date(flashSale.startTime) <= now && new Date(flashSale.endTime) >= now;
    const statusColor = isActive ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400" : "bg-muted text-muted-foreground";
    const statusLabel = isActive ? "Đang diễn ra" : flashSale.isActive ? "Sắp diễn ra" : "Đã tắt";

    const handleRemoveItem = async (itemId) => {
        try {
            await removeItem(itemId).unwrap();
            toast.success("Đã xóa sản phẩm");
        } catch {
            toast.error("Có lỗi xảy ra");
        }
    };

    const items = flashSale.items || [];

    return (
        <div className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border p-4">
                <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                        <p className="text-sm font-medium text-foreground">{flashSale.title}</p>
                        <p className="text-xs text-muted-foreground">
                            {formatDateTime(flashSale.startTime)} → {formatDateTime(flashSale.endTime)}
                        </p>
                    </div>
                </div>
                <Badge className={cn("text-xs", statusColor)}>{statusLabel}</Badge>
            </div>

            <div className="p-4">
                {items.length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">Chưa có sản phẩm nào</p>
                ) : (
                    <div className="space-y-2">
                        {items.map((item) => {
                            const remaining = item.quantityLimit - item.quantitySold;
                            const product = item.variant?.product || item.product;
                            const variant = item.variant;
                            const color = variant?.color || "";
                            const storage = variant?.storage || "";
                            const imgSrc = (Array.isArray(variant?.images) ? variant.images[0] : null)
                                || product?.images?.[0]
                                || "";
                            return (
                                <div key={item.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                                    <img
                                        src={imgSrc}
                                        alt={product?.name}
                                        className="h-12 w-12 rounded-lg object-cover"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-foreground">{product?.name}</p>
                                        {(color || storage) && (
                                            <p className="text-xs text-muted-foreground">
                                                {color}{color && storage && " · "}{storage}
                                            </p>
                                        )}
                                        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                                            <span className="line-through">{formatPrice(item.originalPrice)}</span>
                                            <span className="font-semibold text-red-500">{formatPrice(item.salePrice)}</span>
                                            <Badge variant="destructive" className="text-[10px]">-{item.discountPercent}%</Badge>
                                        </div>
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            Còn {remaining}/{item.quantityLimit} slot
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                                        onClick={() => handleRemoveItem(item.id)}
                                        disabled={isRemoving}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function AdminFlashSalePage() {
    const [deleteId, setDeleteId] = useState(null);
    const [editingFlashSale, setEditingFlashSale] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [addItemTo, setAddItemTo] = useState(null);

    const { data, isLoading } = useGetAllFlashSalesQuery();
    const [deleteFlashSale, { isLoading: isDeleting }] = useDeleteFlashSaleMutation();
    const [toggleStatus, { isLoading: isToggling }] = useToggleFlashSaleStatusMutation();

    const flashSales = data || [];

    const handleDelete = async () => {
        try {
            await deleteFlashSale(deleteId).unwrap();
            toast.success("Đã xóa flash sale");
        } catch {
            toast.error("Có lỗi xảy ra");
        } finally {
            setDeleteId(null);
        }
    };

    const handleToggle = async (id) => {
        try {
            await toggleStatus(id).unwrap();
            toast.success("Đã cập nhật trạng thái");
        } catch {
            toast.error("Có lỗi xảy ra");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-foreground">Quản lý Flash Sale</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Tạo đợt flash sale, thêm sản phẩm giảm giá</p>
                </div>
                <Button className="rounded-full" onClick={() => { setEditingFlashSale(null); setShowForm(true); }}>
                    <Plus className="mr-1.5 h-4 w-4" />
                    Tạo đợt flash sale
                </Button>
            </div>

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

            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(2)].map((_, i) => (
                        <Skeleton key={i} className="h-40 w-full rounded-xl" />
                    ))}
                </div>
            ) : flashSales.length === 0 ? (
                <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-border">
                    <p className="text-sm text-muted-foreground">Chưa có đợt flash sale nào</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {flashSales.map((fs) => (
                        <div key={fs.id}>
                            <FlashSaleDetail flashSale={fs} />
                            <div className="mt-2 flex items-center justify-end gap-2 px-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 text-xs text-muted-foreground"
                                    onClick={() => setAddItemTo(fs.id)}
                                >
                                    <Plus className="mr-1 h-3.5 w-3.5" />
                                    Thêm sản phẩm
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                    onClick={() => { setEditingFlashSale(fs); setShowForm(true); }}
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                    onClick={() => handleToggle(fs.id)}
                                    disabled={isToggling}
                                >
                                    {fs.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                    onClick={() => setDeleteId(fs.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            <Separator className="my-4" />
                        </div>
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
                title="Xóa flash sale"
                description="Bạn có chắc muốn xóa đợt flash sale này?"
                onConfirm={handleDelete}
                isLoading={isDeleting}
            />
        </div>
    );
}
