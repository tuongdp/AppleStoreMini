import { useEffect, useState, useRef, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import {
    Plus, Trash2, Upload, X, PackageOpen, Edit3, Save, AlertTriangle, Loader2, FileSpreadsheet
} from "lucide-react";
import { productSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import SearchableSelect from "@/components/shared/SearchableSelect";
import { useGetGlobalOptionsQuery } from "@/store/api/globalOptionsApi";
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
import { useGetAdminCategoriesQuery, useDeleteVariantMutation, useLazyCheckVariantOrdersQuery, useCreateVariantMutation, useUpdateVariantMutation, useUploadEditorImageMutation, useCreateProductMutation } from "@/store/api/productsApi";
import { slugify, formatNumber, formatDateTime, parseJsonField } from "@/lib/utils";
import { IMAGE } from "@/lib/constants";
import { toast } from "sonner";
import ImportSpecsFromExcel from "./ImportSpecsFromExcel";

const EMPTY_VARIANT = { color: "", storage: "", ram: "", edition: "", price: "", salePrice: "", stock: 0 };

export default function AdminProductForm({ product, onSubmit, isLoading, onProductAutoCreated }) {
    const { t } = useTranslation("admin");
    const isEdit = !!product;

    const { data: categories } = useGetAdminCategoriesQuery();

    const [specs, setSpecs] = useState([]);
    const [options, setOptions] = useState([]);
    const [variants, setVariants] = useState([]);
    const [editingVariantIdx, setEditingVariantIdx] = useState(null);
    const [showVariantForm, setShowVariantForm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [blockedVariant, setBlockedVariant] = useState(null);
    const [autoCreatedId, setAutoCreatedId] = useState(null);
    const [isCreatingProduct, setIsCreatingProduct] = useState(false);
    const [showImportSpecs, setShowImportSpecs] = useState(false);

    const [deleteVariant] = useDeleteVariantMutation();
    const [checkOrders] = useLazyCheckVariantOrdersQuery();
    const [createVariantApi] = useCreateVariantMutation();
    const [updateVariantApi] = useUpdateVariantMutation();
    const [uploadImage] = useUploadEditorImageMutation();
    const [createProductApi] = useCreateProductMutation();

    useGetGlobalOptionsQuery("COLOR");
    const { data: gStorages = [] } = useGetGlobalOptionsQuery("STORAGE");
    const { data: gRams = [] } = useGetGlobalOptionsQuery("RAM");
    const { data: gEditions = [] } = useGetGlobalOptionsQuery("EDITION");

    const colorOptions = useMemo(() => options.filter((o) => o.type === "COLOR"), [options]);
    const storageOptions = useMemo(() => options.filter((o) => o.type === "STORAGE"), [options]);
    const ramOptions = useMemo(() => options.filter((o) => o.type === "RAM"), [options]);
    const editionOptions = useMemo(() => options.filter((o) => o.type === "EDITION"), [options]);

    const form = useForm({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: product?.name || "",
            slug: product?.slug || "",
            category: product?.category?.slug || product?.categorySlug || "",
            description: product?.description || "",
            isActive: product?.isActive ?? true,
        },
    });

    useEffect(() => {
        if (product) {
            form.reset({
                name: product.name || "",
                slug: product.slug || "",
                description: product.description || "",
                isActive: product.isActive ?? true,
            });

            const rawSpecs = product.specifications || {};
            let specArray;
            if (Array.isArray(rawSpecs)) {
                specArray = rawSpecs.map((s) => ({ key: s.key ?? s.label ?? "", value: s.value ?? "" }));
            } else if (typeof rawSpecs === "object") {
                specArray = Object.entries(rawSpecs).map(([key, value]) => ({ key, value }));
            } else {
                specArray = [];
            }
            setSpecs(specArray);

            const productOptions = (product.options || []).map((o) => ({
                id: o.id,
                type: o.type,
                value: o.value,
                hex: o.hex || null,
            }));
            setOptions(productOptions);

            const productVariants = (product.variants || []).map((v) => ({
                id: v.id,
                color: v.color || "",
                storage: v.storage || "",
                ram: v.ram || "",
                edition: v.edition || "",
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

    const buildSpecsArray = () => {
        return specs.filter((s) => s.key.trim()).map(({ key, value }) => ({ key: key.trim(), value }));
    };

    const handleImportSpecs = (importedSpecs) => {
        const existingKeys = new Set(specs.map((s) => s.key));
        const newSpecs = importedSpecs.filter((s) => !existingKeys.has(s.key));
        setSpecs([...specs, ...newSpecs]);
        setShowImportSpecs(false);
        if (newSpecs.length < importedSpecs.length) {
            toast.info(t("productForm.importSpecsDupSkipped", { count: importedSpecs.length - newSpecs.length }));
        }
        toast.success(t("productForm.importSpecsSuccess", { count: newSpecs.length }));
    };

    // ── Option management ──
    // ── Variant management ──
    const openVariantForm = (idx) => {
        setEditingVariantIdx(idx);
        setShowVariantForm(true);
    };

    const cancelVariantForm = () => {
        setEditingVariantIdx(null);
        setShowVariantForm(false);
    };

    const saveVariant = async (data) => {
        const { color, storage, ram, edition, price, salePrice, stock, images: vImages } = data;
        if (!color.trim()) { toast.error(t("productForm.toast.colorRequired")); return; }
        if ((storageOptions.length > 0 || gStorages.length > 0) && !storage.trim()) { toast.error(t("productForm.toast.storageRequired")); return; }
        if ((ramOptions.length > 0 || gRams.length > 0) && !ram.trim()) { toast.error(t("productForm.toast.ramRequired")); return; }
        if ((editionOptions.length > 0 || gEditions.length > 0) && !edition.trim()) { toast.error(t("productForm.toast.editionRequired")); return; }
        if (!price || Number(price) < 1000) { toast.error(t("productForm.toast.priceMinError")); return; }
        if (salePrice && Number(salePrice) >= Number(price)) { toast.error(t("productForm.toast.salePriceError")); return; }

        const dup = variants.findIndex((v, i) =>
            i !== editingVariantIdx &&
            v.color?.toLowerCase() === color.trim().toLowerCase() &&
            v.storage?.toLowerCase() === storage.trim().toLowerCase() &&
            v.ram?.toLowerCase() === ram.trim().toLowerCase() &&
            v.edition?.toLowerCase() === edition.trim().toLowerCase()
        );
        if (dup >= 0) { toast.error(t("productForm.toast.variantExists")); return; }

        let images = vImages || [];
        let savedId = null;
        const productIdForApi = isEdit ? product.id : autoCreatedId;

        if (productIdForApi) {
            try {
                if (editingVariantIdx !== null) {
                    const existing = variants[editingVariantIdx];
                    if (existing?.id) {
                        await updateVariantApi({ variantId: existing.id, color: color.trim(), storage: storage.trim(), ram: ram.trim(), edition: edition.trim(), price: Number(price), salePrice: salePrice ? Number(salePrice) : null, stock: Number(stock) || 0, images }).unwrap();
                        savedId = existing.id;
                    } else {
                        const created = await createVariantApi({ productId: productIdForApi, color: color.trim(), storage: storage.trim(), ram: ram.trim(), edition: edition.trim(), price: Number(price), salePrice: salePrice ? Number(salePrice) : null, stock: Number(stock) || 0, images }).unwrap();
                        savedId = created.id;
                    }
                } else {
                    const created = await createVariantApi({ productId: productIdForApi, color: color.trim(), storage: storage.trim(), ram: ram.trim(), edition: edition.trim(), price: Number(price), salePrice: salePrice ? Number(salePrice) : null, stock: Number(stock) || 0, images }).unwrap();
                    savedId = created.id;
                }
             } catch (err) {
                toast.error(err?.data?.message || t("productForm.toast.saveVariantError"));
                return;
            }
        } else {
            // Create mode — auto-create product first so variant can be saved via API
            const formValues = form.getValues();
            if (!formValues.name?.trim() || !formValues.slug?.trim() || !formValues.category) {
                toast.error(t("productForm.toast.fillRequiredFields"));
                return;
            }
            setIsCreatingProduct(true);
            try {
                const created = await createProductApi({
                    name: formValues.name.trim(),
                    slug: formValues.slug.trim(),
                    category: formValues.category,
                    description: formValues.description || "",
                    isActive: formValues.isActive ?? true,
                    specifications: buildSpecsArray(),
                    options: options.map(({ type, value, hex }) => hex ? { type, value, hex } : { type, value }),
                    variants: [{
                        color: color.trim(),
                        storage: storage.trim(),
                        ram: ram.trim(),
                        edition: edition.trim(),
                        price: Number(price),
                        salePrice: salePrice ? Number(salePrice) : null,
                        stock: Number(stock) || 0,
                        images,
                    }],
                }).unwrap();
                const newProductId = created.id;
                setAutoCreatedId(newProductId);
                onProductAutoCreated?.(newProductId);
                const createdVariant = created.variants?.[0];
                if (createdVariant) { savedId = createdVariant.id; }
                toast.success(t("productForm.toast.productAndVariantCreated"));
            } catch (err) {
                toast.error(err?.data?.message || t("productForm.toast.createProductError"));
                setIsCreatingProduct(false);
                return;
            }
            setIsCreatingProduct(false);
        }

        const variant = {
            color: color.trim(),
            storage: storage.trim(),
            ram: ram.trim(),
            edition: edition.trim(),
            price: Number(price),
            salePrice: salePrice ? Number(salePrice) : null,
            stock: Number(stock) || 0,
            images,
            inStock: Number(stock) > 0,
            id: savedId,
        };

        if (editingVariantIdx !== null) {
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
                const result = await checkOrders(variant.id).unwrap();
                if (result?.hasOrders) {
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
                toast.error(t("productForm.toast.deleteVariantFailed"));
                setDeleteTarget(null);
                return;
            }
        }
        setVariants(variants.filter((_, i) => i !== idx));
        setDeleteTarget(null);
        toast.success(t("productForm.toast.variantDeleted"));
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
            toast.success(t("productForm.toast.inStockDisabled"));
        } catch {
            toast.error(t("productForm.toast.errorOccurred"));
        }
        setBlockedVariant(null);
    };

    const handleSubmit = (values) => {
        if (variants.length === 0) { toast.error(t("productForm.toast.needAtLeastOneVariant")); return; }
        onSubmit({
            ...values,
            productId: autoCreatedId,
            specifications: buildSpecsArray(),
            options: options.map(({ type, value, hex }) => hex ? { type, value, hex } : { type, value }),
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
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 max-w-5xl mx-auto">
                        {/* ── Section 1: Basic Info ── */}
                        <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                            <h3 className="mb-5 text-sm font-medium text-foreground">{t("productForm.basicInfo")}</h3>
                            <div className="max-h-[55vh] overflow-y-auto space-y-4 pr-1">
                                <FormField control={form.control} name="name" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("productForm.productName")} <span className="text-destructive">*</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder={t("productForm.productNamePlaceholder")} disabled={isLoading} {...field} onChange={handleNameChange} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="slug" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Slug <span className="text-destructive">*</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder={t("productForm.slugPlaceholder")} disabled={isLoading} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="category" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Danh mục <span className="text-destructive">*</span></FormLabel>
                                        <Select key={categories ? "loaded" : "loading"} value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                                            <FormControl>
                                                <SelectTrigger><SelectValue placeholder={t("product.categoryPlaceholder")} /></SelectTrigger>
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
                                <FormField control={form.control} name="description" render={() => (
                                    <FormItem>
                                        <FormLabel>{t("productForm.productDescription")}</FormLabel>
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

                        {/* ── Section 2: Specifications ── */}
                        <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                            <h3 className="mb-5 text-sm font-medium text-foreground">{t("productForm.specifications")}</h3>
                            <div className="max-h-[40vh] overflow-y-auto space-y-3 pr-1">
                                {specs.map((spec, idx) => (
                                    <div key={idx} className="flex items-start gap-2">
                                        <Input placeholder={t("productForm.specNamePlaceholder")} value={spec.key} onChange={(e) => updateSpec(idx, "key", e.target.value)} className="flex-1" />
                                        <Input placeholder={t("productForm.specValuePlaceholder")} value={spec.value} onChange={(e) => updateSpec(idx, "value", e.target.value)} className="flex-1" />
                                        <Button type="button" variant="ghost" size="icon" className="mt-0.5 h-10 w-10 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => removeSpec(idx)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
                                <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={addSpec}>
                                    <Plus className="mr-1 h-3.5 w-3.5" /> {t("productForm.addSpec")}
                                </Button>
                                <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => setShowImportSpecs(true)}>
                                    <FileSpreadsheet className="mr-1 h-3.5 w-3.5" /> {t("productForm.importSpecsSelectFile")}
                                </Button>
                            </div>
                        </div>

                        {showImportSpecs && (
                            <ImportSpecsFromExcel
                                onImport={handleImportSpecs}
                                onCancel={() => setShowImportSpecs(false)}
                            />
                        )}


                    {/* ── Section 3: Variants ── */}
                    <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                        <h3 className="mb-5 text-sm font-medium text-foreground">Variants</h3>

                        <div className="max-h-[45vh] overflow-y-auto pr-1">
                            {!hasVariants && !showVariantForm && (
                                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-10 text-center">
                                    <PackageOpen className="mb-3 h-10 w-10 text-muted-foreground/50" />
                                    <p className="text-sm text-muted-foreground">{t("productForm.noVariants")}</p>
                                </div>
                            )}

                            {hasVariants && (
                                <div className="mb-4 overflow-x-auto rounded-xl border border-border">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted/50">
                                            <tr className="border-b border-border text-left text-xs text-muted-foreground">
                                                <th className="px-4 py-3">{t("productForm.variantColor")}</th>
                                                <th className="px-4 py-3">{t("productForm.variantStorage")}</th>
                                                <th className="px-4 py-3">{t("productForm.variantRam")}</th>
                                                <th className="px-4 py-3">{t("productForm.variantEdition")}</th>
                                                <th className="px-4 py-3">{t("productForm.priceColumn")}</th>
                                                <th className="px-4 py-3">{t("productForm.salePriceColumn")}</th>
                                                <th className="px-4 py-3">{t("productForm.stockColumn")}</th>
                                                <th className="px-4 py-3">{t("productForm.imagesColumn")}</th>
                                                <th className="px-4 py-3">{t("productForm.statusColumn")}</th>
                                                <th className="px-4 py-3 text-right">{t("productForm.actions")}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {variants.map((v, idx) => (
                                                <tr key={v.id || idx} className="border-b border-border last:border-0 hover:bg-muted/20">
                                                    <td className="px-4 py-3 font-medium text-foreground">{v.color || "—"}</td>
                                                    <td className="px-4 py-3 text-muted-foreground">{v.storage || "—"}</td>
                                                    <td className="px-4 py-3 text-muted-foreground">{v.ram || "—"}</td>
                                                    <td className="px-4 py-3 text-muted-foreground">{v.edition || "—"}</td>
                                                    <td className="px-4 py-3 text-foreground">{formatNumber(v.price)}đ</td>
                                                    <td className="px-4 py-3 text-muted-foreground">{v.salePrice ? `${formatNumber(v.salePrice)}đ` : "—"}</td>
                                                    <td className="px-4 py-3 text-foreground">{v.stock}</td>
                                                    <td className="px-4 py-3 text-xs text-muted-foreground">{Array.isArray(v.images) ? v.images.length : 0} ảnh</td>
                                                    <td className="px-4 py-3">
                                                        <Badge variant={v.inStock ? "default" : "destructive"} className="text-[10px] px-1.5 py-0 whitespace-nowrap">
                                                            {v.inStock ? t("productForm.inStock") : t("productForm.outOfStock")}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex items-center justify-end gap-0.5">
                                                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground" onClick={() => openVariantForm(idx)}>
                                                                <Edit3 className="h-3.5 w-3.5" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-muted-foreground hover:text-destructive" onClick={() => handleDeleteVariant(idx)}>
                                                                {isCreatingProduct ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
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
                                    colorOptions={colorOptions}
                                    storageOptions={storageOptions}
                                    ramOptions={ramOptions}
                                    editionOptions={editionOptions}
                                    uploadImage={uploadImage}
                                    isSaving={isCreatingProduct}
                                />
                            )}
                        </div>

                        {!showVariantForm && (
                            <div className="mt-3 flex gap-2">
                                <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => { setEditingVariantIdx(null); setShowVariantForm(true); }}>
                                    <Plus className="mr-1 h-3.5 w-3.5" /> {t("productForm.addVariant")}
                                </Button>
                            </div>
                        )}
                    </div>


                        <div className="rounded-2xl border border-border bg-card p-5">
                            <h3 className="mb-4 text-sm font-medium text-foreground">{t("productForm.status")}</h3>
                            <FormField control={form.control} name="isActive" render={({ field }) => (
                                <FormItem className="flex items-center justify-between gap-4">
                                    <div>
                                        <FormLabel className="cursor-pointer font-normal text-foreground">{t("productForm.isActive")}</FormLabel>
                                        <p className="text-xs text-muted-foreground">{t("productForm.isActiveDescription")}</p>
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
                                disabled={isLoading || isCreatingProduct || !hasVariants}
                            >
                                {isLoading || isCreatingProduct ? t("productForm.saving") : (
                                    <><Save className="mr-1.5 h-4 w-4" /> {t("productForm.saveProduct")}</>
                                )}
                            </Button>
                            {!hasVariants && (
                                <div className="absolute -top-8 left-0 right-0 text-center">
                                    <span className="text-xs text-destructive flex items-center justify-center gap-1">
                                        <AlertTriangle className="h-3 w-3" /> {t("productForm.needAtLeastOneVariant")}
                                    </span>
                                </div>
                            )}
                        </div>

                        {isEdit && product && (
                            <div className="rounded-2xl border border-border bg-card p-5 text-xs text-muted-foreground space-y-2">
                                <div className="flex justify-between">
                                    <span>{t("productForm.createdAt")}</span>
                                    <span className="text-foreground">{formatDateTime(product.createdAt)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between">
                                    <span>{t("productForm.updatedAt")}</span>
                                    <span className="text-foreground">{formatDateTime(product.updatedAt)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between">
                                    <span>{t("productForm.reviewCount")}</span>
                                    <span className="text-foreground">{product.reviewCount ?? 0}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between">
                                    <span>{t("productForm.soldCount")}</span>
                                    <span className="text-foreground">{product.soldCount ?? 0}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between">
                                    <span>{t("productForm.productId")}</span>
                                    <span className="max-w-[140px] truncate text-foreground">{product.id}</span>
                                </div>
                            </div>
                        )}


                </form>
            </Form>

            <ConfirmDialog
                open={deleteTarget !== null}
                onOpenChange={(o) => !o && setDeleteTarget(null)}
                title={t("productForm.deleteVariant")}
                description={t("productForm.deleteVariantConfirm")}
                onConfirm={confirmDeleteVariant}
            />

            <ConfirmDialog
                open={blockedVariant !== null}
                onOpenChange={(o) => !o && setBlockedVariant(null)}
                title={t("productForm.cannotDeleteVariant")}
                description={t("productForm.cannotDeleteVariantDesc")}
                confirmLabel={t("productForm.disableInStock")}
                onConfirm={handleBlockedVariantToggle}
            />
        </>
    );
}

function VariantInlineForm({ initial, onSave, onCancel, colorOptions = [], storageOptions = [], ramOptions = [], editionOptions = [], uploadImage, isSaving }) {
    const { t } = useTranslation("admin");
    const [color, setColor] = useState(initial?.color || "");
    const [storage, setStorage] = useState(initial?.storage || "");
    const [ram, setRam] = useState(initial?.ram || "");
    const [edition, setEdition] = useState(initial?.edition || "");
    const [price, setPrice] = useState(initial?.price || "");
    const [salePrice, setSalePrice] = useState(initial?.salePrice || "");
    const [stock, setStock] = useState(initial?.stock ?? 0);
    const [vImages, setVImages] = useState(initial?.images || []);
    const [uploadingIdx, setUploadingIdx] = useState({});
    const vImagesRef = useRef(vImages);
    const fileRef = useRef(null);

    const { data: globalColors = [] } = useGetGlobalOptionsQuery("COLOR");
    const { data: globalStorages = [] } = useGetGlobalOptionsQuery("STORAGE");
    const { data: globalRams = [] } = useGetGlobalOptionsQuery("RAM");
    const { data: globalEditions = [] } = useGetGlobalOptionsQuery("EDITION");

    const mergeOptions = (perProduct, global) => {
        const seen = new Set();
        const merged = [];
        const add = (o) => {
            const val = o.value?.toLowerCase();
            if (!seen.has(val)) {
                seen.add(val);
                merged.push({ value: o.value, label: o.value, prefix: o.hex ? <span className="inline-block h-3 w-3 rounded-full border" style={{ backgroundColor: o.hex }} /> : null });
            }
        };
        perProduct.forEach(add);
        global.forEach(add);
        return merged;
    };

    const allColorOptions = mergeOptions(colorOptions, globalColors);
    const allStorageOptions = mergeOptions(storageOptions, globalStorages);
    const allRamOptions = mergeOptions(ramOptions, globalRams);
    const allEditionOptions = mergeOptions(editionOptions, globalEditions);

    useEffect(() => {
        vImagesRef.current = vImages;
    }, [vImages]);

    const uploadSingleFile = async (file, idx) => {
        setUploadingIdx((prev) => ({ ...prev, [idx]: true }));
        try {
            const fd = new FormData();
            fd.append("image", file);
            const result = await uploadImage(fd).unwrap();
            const realUrl = result.url || result;
            setVImages((prev) => prev.map((img, j) => j === idx ? realUrl : img));
        } catch {
            toast.error(t("productForm.toast.imageUploadError"));
        } finally {
            setUploadingIdx((prev) => {
                const next = { ...prev };
                delete next[idx];
                return next;
            });
        }
    };

    const handleVImageUpload = async (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const valid = files.filter((f) => IMAGE.VALID_TYPES.includes(f.type) && f.size <= IMAGE.MAX_SIZE);
        const currentCount = vImagesRef.current.length;
        const remaining = Math.max(0, IMAGE.MAX_COUNT - currentCount);
        const toUpload = valid.slice(0, remaining);

        if (!toUpload.length) return;

        const blobUrls = toUpload.map((f) => URL.createObjectURL(f));
        const startIdx = currentCount;
        setVImages((prev) => [...prev, ...blobUrls]);

        // Upload tuần tự để tránh race condition
        for (let i = 0; i < toUpload.length; i++) {
            await uploadSingleFile(toUpload[i], startIdx + i);
        }

        if (fileRef.current) fileRef.current.value = "";
    };

    const removeVImage = (idx) => setVImages((prev) => prev.filter((_, i) => i !== idx));

    const handleSave = () => {
        onSave({ color, storage, ram, edition, price, salePrice, stock, images: vImages });
    };

    return (
        <div className="mb-4 rounded-xl border border-border bg-muted/20 p-4 space-y-3">
            <p className="text-sm font-medium text-foreground">
                {initial ? t("productForm.editVariant") : t("productForm.newVariant")}
            </p>
            <div className="grid grid-cols-2 gap-3">
                {allColorOptions.length > 0 && (
                    <div>
                        <Label className="text-xs">{t("productForm.colorLabel")} <span className="text-destructive">*</span></Label>
                        <div className="mt-1">
                            <SearchableSelect
                                options={allColorOptions}
                                value={color}
                                onChange={setColor}
                                placeholder={t("productForm.selectColor")}
                            />
                        </div>
                    </div>
                )}
                {allStorageOptions.length > 0 && (
                    <div>
                        <Label className="text-xs">{t("productForm.storageLabel")} <span className="text-destructive">*</span></Label>
                        <div className="mt-1">
                            <SearchableSelect
                                options={allStorageOptions}
                                value={storage}
                                onChange={setStorage}
                                placeholder={t("productForm.selectStorage")}
                            />
                        </div>
                    </div>
                )}
                {allRamOptions.length > 0 && (
                    <div>
                        <Label className="text-xs">{t("productForm.ramLabel")} <span className="text-destructive">*</span></Label>
                        <div className="mt-1">
                            <SearchableSelect
                                options={allRamOptions}
                                value={ram}
                                onChange={setRam}
                                placeholder={t("productForm.selectRam")}
                            />
                        </div>
                    </div>
                )}
                {allEditionOptions.length > 0 && (
                    <div>
                        <Label className="text-xs">{t("productForm.editionLabel")} <span className="text-destructive">*</span></Label>
                        <div className="mt-1">
                            <SearchableSelect
                                options={allEditionOptions}
                                value={edition}
                                onChange={setEdition}
                                placeholder={t("productForm.selectEdition")}
                            />
                        </div>
                    </div>
                )}
                <div>
                    <Label className="text-xs">{t("productForm.price")} <span className="text-destructive">*</span></Label>
                    <Input type="number" min={0} placeholder={t("productForm.pricePlaceholder")} value={price} onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))} className="mt-1 h-9 text-xs" />
                </div>
                <div>
                    <Label className="text-xs">{t("productForm.salePrice")}</Label>
                    <Input type="number" min={0} placeholder={t("productForm.salePricePlaceholder")} value={salePrice} onChange={(e) => setSalePrice(e.target.value === "" ? "" : Number(e.target.value))} className="mt-1 h-9 text-xs" />
                </div>
                <div>
                    <Label className="text-xs">{t("productForm.stock")} <span className="text-destructive">*</span></Label>
                    <Input type="number" min={0} placeholder={t("productForm.stockPlaceholder")} value={stock} onChange={(e) => setStock(Number(e.target.value) || 0)} className="mt-1 h-9 text-xs" />
                </div>
            </div>

            <div>
                <Label className="text-xs">{t("productForm.variantImages", { max: IMAGE.MAX_COUNT })}</Label>
                <div className="mt-1 flex flex-wrap gap-2">
                    {vImages.map((src, idx) => (
                        <div key={idx} className="group relative h-14 w-14 overflow-hidden rounded-lg bg-muted/30">
                            <img src={src} alt="" className="h-full w-full object-contain p-1" />
                            {uploadingIdx[idx] && (
                                <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                </div>
                            )}
                            <button type="button" onClick={() => removeVImage(idx)} className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-background/80 hover:bg-destructive hover:text-white">
                                <X className="h-2.5 w-2.5" />
                            </button>
                        </div>
                    ))}
                    {vImages.length < IMAGE.MAX_COUNT && (
                        <button type="button" onClick={() => fileRef.current?.click()} className="flex h-14 w-14 items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground hover:border-foreground hover:text-foreground">
                            <Upload className="h-4 w-4" />
                        </button>
                    )}
                </div>
                <input ref={fileRef} type="file" multiple accept={IMAGE.VALID_TYPES.join(",")} onChange={handleVImageUpload} className="hidden" />
            </div>

            <div className="flex justify-end gap-2 pt-1">
                <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={onCancel}>{t("productForm.cancel")}</Button>
                <Button type="button" size="sm" className="rounded-full" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <><Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> {t("productForm.creating")}</> : <><Save className="mr-1 h-3.5 w-3.5" /> {t("productForm.saveVariant")}</>}
                </Button>
            </div>
        </div>
    );
}
