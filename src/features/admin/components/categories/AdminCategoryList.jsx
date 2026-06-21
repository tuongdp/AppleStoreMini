import { useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Plus, Pencil, Trash2, ImageUp, ImagePlus, Loader2 } from "lucide-react";
import {
    useGetAdminCategoriesQuery,
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation,
    useToggleCategoryStatusMutation,
} from "@/store/api/categoriesApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { slugify, cn } from "@/lib/utils";
import { PAGINATION } from "@/lib/constants";

const categorySchema = z.object({
    name: z.string().min(1, "Tên danh mục không được để trống"),
    slug: z.string().min(1, "Slug không được để trống"),
    order: z.coerce.number().int().min(0).optional(),
});

function getCategoryId(category) {
    return category?._id || category?.id;
}

function getCategoryImage(category) {
    return category?.image || category?.icon || category?.thumbnail || "";
}

function getCategoryProductCount(category) {
    return category?._count?.products ?? category?.productCount ?? category?.productsCount ?? 0;
}

function CategoryForm({ category, categories, onClose }) {
    const isEditing = !!category;
    const [createCategory, { isLoading: isCreating }] =
        useCreateCategoryMutation();
    const [updateCategory, { isLoading: isUpdating }] =
        useUpdateCategoryMutation();
    const isLoading = isCreating || isUpdating;
    const fileInputRef = useRef(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(getCategoryImage(category) || null);

    const nextOrder = isEditing
        ? category.order
        : (categories?.length > 0 ? Math.max(...categories.map((c) => c.order || 0)) + 1 : 0);

    const form = useForm({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: category?.name || "",
            slug: category?.slug || "",
            order: nextOrder ?? 0,
        },
    });

    const handleNameChange = (e) => {
        const name = e.target.value;
        form.setValue("name", name);
        form.setValue("slug", slugify(name));
    };

    const handleImagePick = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
    };

    const onSubmit = async (values) => {
        try {
            const payload = { ...values };
            if (imageFile) payload.image = imageFile;
            if (isEditing) {
                payload.id = getCategoryId(category);
                await updateCategory(payload).unwrap();
                toast.success("Đã cập nhật danh mục");
            } else {
                await createCategory(payload).unwrap();
                toast.success("Đã tạo danh mục mới");
            }
            onClose();
        } catch (error) {
            toast.error(error?.data?.message || "Có lỗi xảy ra");
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tên danh mục</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="VD: iPhone"
                                        disabled={isLoading}
                                        {...field}
                                        onChange={handleNameChange}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="slug"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Slug</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="VD: iphone"
                                        disabled={isLoading}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="order"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Thứ tự</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min={0}
                                        disabled={isLoading}
                                        {...field}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Image upload */}
                <div>
                    <FormLabel>Ảnh danh mục</FormLabel>
                    <div className="mt-1.5">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={handleImagePick}
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isLoading}
                            className="group flex h-28 w-28 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted/30 transition-colors hover:border-muted-foreground/40"
                            aria-label="Chọn ảnh danh mục"
                        >
                            {imagePreview ? (
                                <img
                                    src={imagePreview}
                                    alt={category?.name ? `Ảnh danh mục ${category.name}` : "Ảnh danh mục"}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
                                    <ImageUp className="h-6 w-6" aria-hidden="true" />
                                    <span className="text-[10px]">Chọn ảnh</span>
                                </div>
                            )}
                        </button>
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Hủy
                    </Button>
                    <Button
                        type="submit"
                        size="sm"
                        className="rounded-full"
                        disabled={isLoading}
                    >
                        {isLoading
                            ? "Đang lưu..."
                            : isEditing
                              ? "Cập nhật"
                              : "Tạo danh mục"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}

export default function AdminCategoryList() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [deleteId, setDeleteId] = useState(null);
    const [editingCategory, setEditingCategory] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const page = Number(searchParams.get("page")) || 1;

    const { data, isLoading, isFetching } = useGetAdminCategoriesQuery({ page, limit: PAGINATION.DEFAULT_LIMIT });
    const [deleteCategory, { isLoading: isDeleting }] =
        useDeleteCategoryMutation();
    const [toggleStatus, { isLoading: isToggling }] =
        useToggleCategoryStatusMutation();

    const categories = data?.categories || [];
    const pagination = data?.pagination || {};

    const updateParam = (key, value) => {
        const params = new URLSearchParams(searchParams);
        if (value && value !== "all") params.set(key, value);
        else params.delete(key);
        if (key !== "page") params.set("page", "1");
        setSearchParams(params);
    };

    const handleDelete = async () => {
        try {
            await deleteCategory(deleteId).unwrap();
            toast.success("Đã xóa danh mục");
        } catch (error) {
            toast.error(
                error?.data?.message ||
                    "Không thể xóa danh mục đang có sản phẩm",
            );
        } finally {
            setDeleteId(null);
        }
    };

    const handleToggle = async (category) => {
        const id = getCategoryId(category);
        try {
            await toggleStatus(id).unwrap();
            toast.success(
                category.isActive ? "Đã ẩn danh mục" : "Đã hiện danh mục",
            );
        } catch {
            toast.error("Có lỗi xảy ra");
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setShowForm(true);
    };

    const handleAdd = () => {
        setEditingCategory(null);
        setShowForm(true);
    };

    const handleFormClose = () => {
        setShowForm(false);
        setEditingCategory(null);
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                    {isFetching ? "Đang tải..." : `${pagination.total || categories.length} danh mục`}
                </p>
                <Button className="rounded-full" onClick={handleAdd}>
                    <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
                    Thêm danh mục
                </Button>
            </div>

            {/* Inline form */}
            {showForm && (
                <div className="rounded-2xl border border-border bg-card p-5">
                    <h3 className="mb-4 text-sm font-medium text-foreground">
                        {editingCategory
                            ? "Chỉnh sửa danh mục"
                            : "Thêm danh mục mới"}
                    </h3>
                    <CategoryForm
                        category={editingCategory}
                        categories={categories}
                        onClose={handleFormClose}
                    />
                </div>
            )}

            {/* Category list */}
            <div className="overflow-x-auto rounded-xl border border-border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-12">STT</TableHead>
                            <TableHead>Danh mục</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading || isFetching ? (
                            [...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-5 w-8" /></TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="h-10 w-10 rounded-lg" />
                                            <div className="space-y-1.5">
                                                <Skeleton className="h-4 w-32" />
                                                <Skeleton className="h-3 w-20" />
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="ml-auto h-8 w-20" /></TableCell>
                                </TableRow>
                            ))
                        ) : categories.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="py-12 text-center text-muted-foreground">
                                    Chưa có danh mục nào
                                </TableCell>
                            </TableRow>
                        ) : (
                            categories.map((category) => {
                                const catId = getCategoryId(category);
                                const image = getCategoryImage(category);
                                const productCount = getCategoryProductCount(category);
                                return (
                                    <TableRow key={catId}>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {category.order ?? 0}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted/30">
                                                    {image ? (
                                                        <img
                                                            src={image}
                                                            alt={category.name || "Danh mục"}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <ImagePlus className="h-4 w-4 text-muted-foreground/40" aria-hidden="true" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-medium text-foreground">
                                                        {category.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        /{category.slug}
                                                        {productCount > 0 && (
                                                                    <span className="ml-2">· {productCount} sản phẩm</span>
                                                                )}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={cn(
                                                    "text-xs",
                                                    category.isActive !== false
                                                        ? "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-950/30 dark:text-green-400"
                                                        : "bg-muted text-muted-foreground hover:bg-muted",
                                                )}
                                            >
                                                {category.isActive !== false ? "Hiển thị" : "Đã ẩn"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Switch
                                                    checked={category.isActive !== false}
                                                    onCheckedChange={() => handleToggle(category)}
                                                    disabled={isToggling}
                                                    aria-label={category.isActive !== false ? `Ẩn danh mục ${category.name}` : `Hiện danh mục ${category.name}`}
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                    onClick={() => handleEdit(category)}
                                                    aria-label={`Sửa danh mục ${category.name}`}
                                                >
                                                    <Pencil className="h-4 w-4" aria-hidden="true" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                    onClick={() => setDeleteId(catId)}
                                                    aria-label={`Xóa danh mục ${category.name}`}
                                                >
                                                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Hàng mỗi trang {PAGINATION.DEFAULT_LIMIT}</p>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" aria-label="Trang trước" disabled={page <= 1} onClick={() => updateParam("page", page - 1)}>
                            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                        </Button>
                        <span className="text-sm text-muted-foreground">{page} trong {pagination.totalPages}</span>
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" aria-label="Trang sau" disabled={page >= pagination.totalPages} onClick={() => updateParam("page", page + 1)}>
                            <ChevronRight className="h-4 w-4" aria-hidden="true" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Confirm delete */}
            <ConfirmDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                title="Xóa danh mục"
                description="Danh mục có sản phẩm sẽ không thể xóa. Bạn có chắc muốn xóa danh mục này?"
                onConfirm={handleDelete}
                isLoading={isDeleting}
            />
        </div>
    );
}
