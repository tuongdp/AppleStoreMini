import { useEffect, useState, useRef, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import {
    Plus, Trash2, Upload, X, GripVertical, PackageOpen, Edit3, Save, AlertTriangle
} from "lucide-react";
import { productSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import RichTextEditor from "@/components/ui/RichTextEditor";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useGetAdminCategoriesQuery, useUploadProductImagesMutation, useDeleteVariantMutation } from "@/store/api/productsApi";
import { slugify, formatNumber, formatDateTime, cn, parseJsonField, formatFileSize } from "@/lib/utils";
import { IMAGE, COLOR_OPTIONS, STORAGE_OPTIONS } from "@/lib/constants";
import { toast } from "sonner";

const EMPTY_VARIANT = { color: "", storage: "", price: "", salePrice: "", stock: 0 };

export default function AdminProductForm({ product, onSubmit, isLoading }) {
    const { t } = useTranslation("admin");
    const isEdit = !!product;

    const { data: categories } = useGetAdminCategoriesQuery();

    const [images, setImages] = useState(() => parseJsonField(product?.images));
    const [specs, setSpecs] = useState([]);
    const [variants, setVariants] = useState([]);
    const [editingVariantIdx, setEditingVariantIdx] = useState(null);
    const [showVariantForm, setShowVariantForm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [blockedVariant, setBlockedVariant] = useState(null);
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    const [uploadImages] = useUploadProductImagesMutation();
    const [deleteVariant] = useDeleteVariantMutation();

    const form = useForm({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: product?.name || "",
            slug: product?.slug || "",
            category: product?.category?.slug || product?.categorySlug || "",
            description: product?.description || "",
            featured: product?.featured ?? false,
        },
    });

    useEffect(() => {
        if (product) {
            form.reset({
                name: product.name || "",
                slug: product.slug || "",
                description: product.description || "",
                featured: product.featured ?? false,
            });
            setImages(parseJsonField(product.images));

            const rawSpecs = product.specifications || {};
            const specArray = typeof rawSpecs === "object" && !Array.isArray(rawSpecs)
                ? Object.entries(rawSpecs).map(([key, value]) => ({ key, value }))
                : [];
            setSpecs(specArray);

            const productVariants = (product.variants || []).map((v) => ({
                id: v.id,
                color: v.color || "",
                storage: v.storage || "",
                price: v.price ?? 0,
                salePrice: v.salePrice ?? "",
                stock: v.stock ?? 0,
                images: parseJsonField(v.images),
                inStock: v.inStock ?? true,
            }));
            setVariants(productVariants);
        }
    }, [product, form]);

    useEffect(() => {
        if (product && categories?.length > 0) {
            const catSlug = product.category?.slug || product.categorySlug || "";
            if (catSlug) {
                form.setValue("category", catSlug);
            }
        }
    }, [categories, product, form]);

    const handleNameChange = (e) => {
        const name = e.target.value;
        form.setValue("name", name);
        if (!isEdit) form.setValue("slug", slugify(name));
    };

    const addSpec = () => setSpecs([...specs, { key: "", value: "" }]);
    const removeSpec = (idx) => setSpecs(specs.filter((_, i) => i !== idx));
    const updateSpec = (idx, field, val) => {
        const next = [...specs];
        next[idx] = { ...next[idx], [field]: val };
        setSpecs(next);
    };

    const buildSpecsObject = () => {
        const obj = {};
        specs.forEach(({ key, value }) => {
            if (key.trim()) obj[key.trim()] = value;
        });
        return obj;
    };

    const openVariantForm = (idx) => {
        setEditingVariantIdx(idx);
        setShowVariantForm(true);
    };

    const cancelVariantForm = () => {
        setEditingVariantIdx(null);
        setShowVariantForm(false);
    };

    const saveVariant = (data) => {
        const { color, storage, price, salePrice, stock, images: vImages } = data;
        if (!color.trim()) { toast.error("Màu sắc không được để trống"); return; }
        if (!storage.trim()) { toast.error("Dung lượng không được để trống"); return; }
        if (!price || Number(price) < 1000) { toast.error("Giá bán phải lớn hơn 1.000đ"); return; }
        if (salePrice && Number(salePrice) >= Number(price)) { toast.error("Giá sale phải nhỏ hơn giá bán"); return; }

        const dup = variants.findIndex((v, i) =>
            i !== editingVariantIdx &&
            v.color?.toLowerCase() === color.trim().toLowerCase() &&
            v.storage?.toLowerCase() === storage.trim().toLowerCase()
        );
        if (dup >= 0) { toast.error("Variant với màu sắc và dung lượng này đã tồn tại"); return; }

        const variant = {
            color: color.trim(),
            storage: storage.trim(),
            price: Number(price),
            salePrice: salePrice ? Number(salePrice) : null,
            stock: Number(stock) || 0,
            images: vImages || [],
            inStock: Number(stock) > 0,
        };

        if (editingVariantIdx !== null) {
            const existing = variants[editingVariantIdx];
            variant.id = existing?.id;
            setVariants(variants.map((v, i) => i === editingVariantIdx ? variant : v));
        } else {
            setVariants([...variants, variant]);
        }

        cancelVariantForm();
    };

    const handleDeleteVariant = async (idx) => {
        const variant = variants[idx];
        if (variant.id) {
            try {
                const res = await fetch(
                    `${import.meta.env.VITE_API_URL}/admin/variants/${variant.id}/check-orders`
                );
                const json = await res.json();
                if (json.data?.hasOrders) {
                    setBlockedVariant(idx);
                    return;
                }
            } catch {
                // proceed to delete
            }
        }
        setDeleteTarget(idx);
    };

    const confirmDeleteVariant = async () => {
        const idx = deleteTarget;
        const variant = variants[idx];
        if (variant.id) {
            try {
                await deleteVariant(variant.id).unwrap();
            } catch {
                toast.error("Xóa variant thất bại");
                setDeleteTarget(null);
                return;
            }
        }
        setVariants(variants.filter((_, i) => i !== idx));
        setDeleteTarget(null);
        toast.success("Đã xóa variant");
    };

    const handleBlockedVariantToggle = async () => {
        const idx = blockedVariant;
        const variant = variants[idx];
        if (!variant.id) { setBlockedVariant(null); return; }
        try {
            await fetch(
                `${import.meta.env.VITE_API_URL}/admin/variants/${variant.id}`,
                { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ inStock: false }) }
            );
            setVariants(variants.map((v, i) => i === idx ? { ...v, inStock: false } : v));
            toast.success("Đã tắt trạng thái còn hàng");
        } catch {
            toast.error("Có lỗi xảy ra");
        }
        setBlockedVariant(null);
    };

    const handleImageFiles = async (files) => {
        const validFiles = Array.from(files).filter((f) => {
            if (!IMAGE.VALID_TYPES.includes(f.type)) { toast.error("Định dạng ảnh không hợp lệ"); return false; }
            if (f.size > IMAGE.MAX_SIZE) { toast.error("Ảnh vượt quá 5MB"); return false; }
            return true;
        });
        if (!validFiles.length) return;
        if (images.length + validFiles.length > IMAGE.MAX_COUNT) { toast.error("Tối đa 10 ảnh"); return; }

        if (isEdit && product?.id) {
            const formData = new FormData();
            validFiles.forEach((f) => formData.append("images", f));
            try {
                const result = await uploadImages({ id: product.id, formData }).unwrap();
                setImages(result?.images || []);
                toast.success("Upload ảnh thành công");
            } catch { toast.error("Upload thất bại"); }
        } else {
            const newPreviews = validFiles.map((f) => URL.createObjectURL(f));
            setImages([...images, ...newPreviews]);
        }
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const removeImage = (idx) => setImages(images.filter((_, i) => i !== idx));

    const handleSubmit = (values) => {
        if (variants.length === 0) { toast.error("Cần có ít nhất 1 variant"); return; }
        onSubmit({
            ...values,
            images,
            specifications: buildSpecsObject(),
            variants: variants.map(({ images: vImgs, ...rest }) => ({
                ...rest,
                price: Number(rest.price) || 0,
                salePrice: rest.salePrice ? Number(rest.salePrice) : null,
                stock: Number(rest.stock) || 0,
                images: vImgs || [],
            })),
        });
    };

    const hasVariants = variants.length > 0;

    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="space-y-5 lg:col-span-2">
                        {/* ── Section 1: Basic Info ── */}
                        <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                            <h3 className="mb-5 text-sm font-medium text-foreground">Thông tin cơ bản</h3>
                            <div className="space-y-4">
                                <FormField control={form.control} name="name" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tên sản phẩm <span className="text-destructive">*</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="VD: iPhone 15 Pro Max" disabled={isLoading} {...field} onChange={handleNameChange} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="slug" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Slug <span className="text-destructive">*</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="VD: iphone-15-pro-max" disabled={isLoading} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="category" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Danh mục <span className="text-destructive">*</span></FormLabel>
                                        <Select key={categories ? "loaded" : "loading"} value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                                            <FormControl>
                                                <SelectTrigger><SelectValue placeholder="Chọn danh mục" /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {(categories || []).map((cat) => (
                                                    <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="description" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mô tả sản phẩm</FormLabel>
                                        <FormControl>
                                            <Controller
                                                name="description"
                                                control={form.control}
                                                render={({ field: { onChange, value } }) => (
                                                    <RichTextEditor
                                                        value={value}
                                                        onChange={onChange}
                                                        disabled={isLoading}
                                                    />
                                                )}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                        </div>

                        {/* ── Section 2: Images ── */}
                        <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                            <h3 className="mb-5 text-sm font-medium text-foreground">Hình ảnh sản phẩm</h3>
                            <div className="space-y-3">
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                    onDragLeave={() => setIsDragging(false)}
                                    onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleImageFiles(e.dataTransfer.files); }}
                                    className={cn(
                                        "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-colors",
                                        isDragging ? "border-foreground bg-muted/30" : "border-border hover:border-foreground/30 hover:bg-muted/20"
                                    )}
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                        <Upload className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-foreground">Kéo thả hoặc click để chọn ảnh</p>
                                        <p className="mt-0.5 text-xs text-muted-foreground">JPG, PNG, WEBP · {formatFileSize(IMAGE.MAX_SIZE)}</p>
                                    </div>
                                </div>
                                <input ref={fileInputRef} type="file" multiple accept={IMAGE.VALID_TYPES.join(",")} onChange={(e) => handleImageFiles(e.target.files)} className="hidden" />
                                {images.length > 0 && (
                                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                                        {images.map((src, idx) => (
                                            <div key={idx} className="group relative aspect-square overflow-hidden rounded-xl bg-muted/30">
                                                <img src={src} alt={`${idx + 1}`} className="h-full w-full object-contain p-1" />
                                                <div className="absolute left-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-background/80 text-[10px] font-medium">{idx + 1}</div>
                                                <button type="button" onClick={() => removeImage(idx)} className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-background/80 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive hover:text-white">
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                                <div className="absolute bottom-1.5 right-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                                                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <p className="text-xs text-muted-foreground">{images.length}/{IMAGE.MAX_COUNT} ảnh</p>
                            </div>
                        </div>

                        {/* ── Section 3: Specifications ── */}
                        <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                            <h3 className="mb-5 text-sm font-medium text-foreground">Thông số kỹ thuật</h3>
                            <div className="space-y-3">
                                {specs.map((spec, idx) => (
                                    <div key={idx} className="flex items-start gap-2">
                                        <Input placeholder="Tên thông số" value={spec.key} onChange={(e) => updateSpec(idx, "key", e.target.value)} className="flex-1" />
                                        <Input placeholder="Giá trị" value={spec.value} onChange={(e) => updateSpec(idx, "value", e.target.value)} className="flex-1" />
                                        <Button type="button" variant="ghost" size="icon" className="mt-0.5 h-10 w-10 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => removeSpec(idx)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={addSpec}>
                                    <Plus className="mr-1 h-3.5 w-3.5" /> Thêm thông số
                                </Button>
                            </div>
                        </div>

                        {/* ── Section 4: Variants ── */}
                        <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                            <h3 className="mb-5 text-sm font-medium text-foreground">Variants</h3>

                            {!hasVariants && !showVariantForm && (
                                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-10 text-center">
                                    <PackageOpen className="mb-3 h-10 w-10 text-muted-foreground/50" />
                                    <p className="text-sm text-muted-foreground">Chưa có variant nào. Hãy thêm ít nhất một variant.</p>
                                </div>
                            )}

                            {hasVariants && (
                                <div className="mb-4 overflow-x-auto rounded-xl border border-border">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-border bg-muted/30 text-left text-xs font-medium uppercase text-muted-foreground">
                                                <th className="px-4 py-3">Màu sắc</th>
                                                <th className="px-4 py-3">Dung lượng</th>
                                                <th className="px-4 py-3">Giá bán</th>
                                                <th className="px-4 py-3">Giá sale</th>
                                                <th className="px-4 py-3">Tồn kho</th>
                                                <th className="px-4 py-3">Trạng thái</th>
                                                <th className="px-4 py-3 text-right">Hành động</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {variants.map((v, idx) => (
                                                <tr key={v.id || idx} className="border-b border-border last:border-0 hover:bg-muted/20">
                                                    <td className="px-4 py-3 font-medium text-foreground">{v.color || "—"}</td>
                                                    <td className="px-4 py-3 text-muted-foreground">{v.storage || "—"}</td>
                                                    <td className="px-4 py-3 text-foreground">{formatNumber(v.price)}đ</td>
                                                    <td className="px-4 py-3 text-muted-foreground">{v.salePrice ? `${formatNumber(v.salePrice)}đ` : "—"}</td>
                                                    <td className="px-4 py-3 text-foreground">{v.stock}</td>
                                                    <td className="px-4 py-3">
                                                        <Badge variant={v.inStock ? "default" : "secondary"} className="text-[10px]">
                                                            {v.inStock ? "Còn hàng" : "Hết hàng"}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => openVariantForm(idx)} disabled={editingVariantIdx === idx}>
                                                                <Edit3 className="h-3.5 w-3.5" />
                                                            </Button>
                                                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteVariant(idx)} disabled={editingVariantIdx === idx}>
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {showVariantForm && (
                                <VariantInlineForm
                                    initial={editingVariantIdx !== null ? variants[editingVariantIdx] : null}
                                    onSave={saveVariant}
                                    onCancel={cancelVariantForm}
                                />
                            )}

                            {!showVariantForm && (
                                <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => { setEditingVariantIdx(null); setShowVariantForm(true); }}>
                                    <Plus className="mr-1 h-3.5 w-3.5" /> Thêm variant
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* ── Right Column ── */}
                    <div className="space-y-4">
                        <div className="rounded-2xl border border-border bg-card p-5">
                            <h3 className="mb-4 text-sm font-medium text-foreground">Trạng thái</h3>
                            <FormField control={form.control} name="featured" render={({ field }) => (
                                <FormItem className="flex items-center justify-between gap-4">
                                    <div>
                                        <FormLabel className="cursor-pointer font-normal text-foreground">Sản phẩm nổi bật</FormLabel>
                                        <p className="text-xs text-muted-foreground">Hiển thị ở trang chủ và trang sản phẩm nổi bật</p>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} />
                                    </FormControl>
                                </FormItem>
                            )} />
                        </div>

                        <div className="relative">
                            <Button
                                type="submit"
                                className="w-full rounded-full"
                                disabled={isLoading || !hasVariants}
                            >
                                {isLoading ? "Đang lưu..." : (
                                    <><Save className="mr-1.5 h-4 w-4" /> Lưu sản phẩm</>
                                )}
                            </Button>
                            {!hasVariants && (
                                <div className="absolute -top-8 left-0 right-0 text-center">
                                    <span className="text-xs text-destructive flex items-center justify-center gap-1">
                                        <AlertTriangle className="h-3 w-3" /> Cần có ít nhất 1 variant
                                    </span>
                                </div>
                            )}
                        </div>

                        {isEdit && product && (
                            <div className="rounded-2xl border border-border bg-card p-5 text-xs text-muted-foreground space-y-2">
                                <div className="flex justify-between">
                                    <span>Ngày tạo</span>
                                    <span className="text-foreground">{formatDateTime(product.createdAt)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between">
                                    <span>Cập nhật</span>
                                    <span className="text-foreground">{formatDateTime(product.updatedAt)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between">
                                    <span>Đánh giá</span>
                                    <span className="text-foreground">{product.reviewCount ?? 0}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between">
                                    <span>Đã bán</span>
                                    <span className="text-foreground">{product.soldCount ?? 0}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between">
                                    <span>ID</span>
                                    <span className="max-w-[140px] truncate text-foreground">{product.id}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </form>
            </Form>

            <ConfirmDialog
                open={deleteTarget !== null}
                onOpenChange={(o) => !o && setDeleteTarget(null)}
                title="Xóa variant"
                description="Bạn có chắc muốn xóa variant này?"
                onConfirm={confirmDeleteVariant}
            />

            <ConfirmDialog
                open={blockedVariant !== null}
                onOpenChange={(o) => !o && setBlockedVariant(null)}
                title="Không thể xóa variant"
                description="Không thể xóa variant này vì đã có trong đơn hàng. Bạn có thể tắt trạng thái còn hàng thay thế."
                confirmLabel="Tắt còn hàng"
                onConfirm={handleBlockedVariantToggle}
            />
        </>
    );
}

function SelectWithCustom({ value, onChange, options, placeholder, label }) {
    const [isCustom, setIsCustom] = useState(false);
    const [customVal, setCustomVal] = useState("");

    const mergedOptions = [...new Set([...options, ...(value && !options.includes(value) ? [value] : [])])];

    const handleSelect = (val) => {
        if (val === "__custom__") {
            setIsCustom(true);
            setCustomVal("");
        } else {
            onChange(val);
        }
    };

    const handleCustomSave = () => {
        if (customVal.trim()) {
            onChange(customVal.trim());
        }
        setIsCustom(false);
    };

    if (isCustom) {
        return (
            <div className="flex gap-1">
                <Input
                    placeholder={`Nhập ${label.toLowerCase()}...`}
                    value={customVal}
                    onChange={(e) => setCustomVal(e.target.value)}
                    className="h-9 text-xs flex-1"
                    autoFocus
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleCustomSave(); } }}
                />
                <Button type="button" size="icon" className="h-9 w-9 shrink-0 rounded-full" onClick={handleCustomSave}>
                    <Save className="h-3.5 w-3.5" />
                </Button>
            </div>
        );
    }

    return (
        <div className="flex gap-1">
            <Select value={value || ""} onValueChange={handleSelect}>
                <SelectTrigger className="h-9 text-xs flex-1">
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {mergedOptions.map((opt) => (
                        <SelectItem key={opt} value={opt} className="text-xs">{opt}</SelectItem>
                    ))}
                    <SelectItem value="__custom__" className="text-xs text-apple-blue">
                        + Thêm mới...
                    </SelectItem>
                </SelectContent>
            </Select>
            <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9 shrink-0 rounded-full"
                onClick={() => setIsCustom(true)}
                title={`Thêm ${label.toLowerCase()} mới`}
            >
                <Plus className="h-3.5 w-3.5" />
            </Button>
        </div>
    );
}

function VariantInlineForm({ initial, onSave, onCancel }) {
    const [color, setColor] = useState(initial?.color || "");
    const [storage, setStorage] = useState(initial?.storage || "");
    const [price, setPrice] = useState(initial?.price || "");
    const [salePrice, setSalePrice] = useState(initial?.salePrice || "");
    const [stock, setStock] = useState(initial?.stock ?? 0);
    const [vImages, setVImages] = useState(initial?.images || []);
    const fileRef = useRef(null);

    const handleVImageUpload = (e) => {
        const files = Array.from(e.target.files || []);
        const valid = files.filter((f) => IMAGE.VALID_TYPES.includes(f.type) && f.size <= IMAGE.MAX_SIZE);
        const newUrls = valid.map((f) => URL.createObjectURL(f));
        setVImages([...vImages, ...newUrls].slice(0, 5));
        if (fileRef.current) fileRef.current.value = "";
    };

    const removeVImage = (idx) => setVImages(vImages.filter((_, i) => i !== idx));

    const handleSave = () => {
        onSave({ color, storage, price, salePrice, stock, images: vImages });
    };

    return (
        <div className="mb-4 rounded-xl border border-border bg-muted/20 p-4 space-y-3">
            <p className="text-sm font-medium text-foreground">
                {initial ? "Sửa variant" : "Thêm variant mới"}
            </p>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <Label className="text-xs">Màu sắc <span className="text-destructive">*</span></Label>
                    <div className="mt-1">
                        <SelectWithCustom
                            value={color}
                            onChange={setColor}
                            options={COLOR_OPTIONS}
                            placeholder="Chọn màu sắc"
                            label="Màu sắc"
                        />
                    </div>
                </div>
                <div>
                    <Label className="text-xs">Dung lượng <span className="text-destructive">*</span></Label>
                    <div className="mt-1">
                        <SelectWithCustom
                            value={storage}
                            onChange={setStorage}
                            options={STORAGE_OPTIONS}
                            placeholder="Chọn dung lượng"
                            label="Dung lượng"
                        />
                    </div>
                </div>
                <div>
                    <Label className="text-xs">Giá bán <span className="text-destructive">*</span></Label>
                    <Input type="number" min={0} placeholder="VD: 34990000" value={price} onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))} className="mt-1 h-9 text-xs" />
                </div>
                <div>
                    <Label className="text-xs">Giá sale</Label>
                    <Input type="number" min={0} placeholder="Để trống nếu không có khuyến mãi" value={salePrice} onChange={(e) => setSalePrice(e.target.value === "" ? "" : Number(e.target.value))} className="mt-1 h-9 text-xs" />
                </div>
                <div>
                    <Label className="text-xs">Tồn kho <span className="text-destructive">*</span></Label>
                    <Input type="number" min={0} placeholder="0" value={stock} onChange={(e) => setStock(Number(e.target.value) || 0)} className="mt-1 h-9 text-xs" />
                </div>
            </div>

            <div>
                <Label className="text-xs">Ảnh riêng (tối đa 5 ảnh)</Label>
                <div className="mt-1 flex flex-wrap gap-2">
                    {vImages.map((src, idx) => (
                        <div key={idx} className="group relative h-14 w-14 overflow-hidden rounded-lg bg-muted/30">
                            <img src={src} alt="" className="h-full w-full object-contain p-1" />
                            <button type="button" onClick={() => removeVImage(idx)} className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-background/80 hover:bg-destructive hover:text-white">
                                <X className="h-2.5 w-2.5" />
                            </button>
                        </div>
                    ))}
                    {vImages.length < 5 && (
                        <button type="button" onClick={() => fileRef.current?.click()} className="flex h-14 w-14 items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground hover:border-foreground hover:text-foreground">
                            <Upload className="h-4 w-4" />
                        </button>
                    )}
                </div>
                <input ref={fileRef} type="file" multiple accept={IMAGE.VALID_TYPES.join(",")} onChange={handleVImageUpload} className="hidden" />
            </div>

            <div className="flex justify-end gap-2 pt-1">
                <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={onCancel}>Hủy</Button>
                <Button type="button" size="sm" className="rounded-full" onClick={handleSave}>
                    <Save className="mr-1 h-3.5 w-3.5" /> Lưu variant
                </Button>
            </div>
        </div>
    );
}
