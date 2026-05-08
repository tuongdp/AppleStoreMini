import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Pencil, Trash2, GripVertical, ImagePlus } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { slugify } from "@/lib/utils";
import { cn } from "@/lib/utils";

const categorySchema = z.object({
    name: z.string().min(1, "Tên danh mục không được để trống"),
    slug: z.string().min(1, "Slug không được để trống"),
    description: z.string().optional(),
});

function CategoryForm({ category, onClose }) {
    const isEditing = !!category;
    const [createCategory, { isLoading: isCreating }] =
        useCreateCategoryMutation();
    const [updateCategory, { isLoading: isUpdating }] =
        useUpdateCategoryMutation();
    const isLoading = isCreating || isUpdating;

    const form = useForm({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: category?.name || "",
            slug: category?.slug || "",
            description: category?.description || "",
        },
    });

    const handleNameChange = (e) => {
        const name = e.target.value;
        form.setValue("name", name);
        if (!isEditing) form.setValue("slug", slugify(name));
    };

    const onSubmit = async (values) => {
        try {
            if (isEditing) {
                await updateCategory({
                    id: category._id || category.id,
                    ...values,
                }).unwrap();
                toast.success("Đã cập nhật danh mục");
            } else {
                await createCategory(values).unwrap();
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
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                                        disabled={isLoading || isEditing}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Mô tả{" "}
                                <span className="text-muted-foreground">
                                    (tùy chọn)
                                </span>
                            </FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Mô tả ngắn về danh mục"
                                    disabled={isLoading}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
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
    const { t } = useTranslation("admin");
    const [deleteId, setDeleteId] = useState(null);
    const [editingCategory, setEditingCategory] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const { data, isLoading } = useGetAdminCategoriesQuery();
    const [deleteCategory, { isLoading: isDeleting }] =
        useDeleteCategoryMutation();
    const [toggleStatus, { isLoading: isToggling }] =
        useToggleCategoryStatusMutation();

    const categories = data || [];

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
        const id = category._id || category.id;
        try {
            await toggleStatus(id).unwrap();
            toast.success(
                category.isActive ? "Đã ẩn danh mục" : "Đã hiện danh mục",
            );
        } catch {
            toast.error(t("status.error", { ns: "common" }));
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
                    {categories.length} danh mục
                </p>
                <Button className="rounded-full" onClick={handleAdd}>
                    <Plus className="mr-1.5 h-4 w-4" />
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
                        onClose={handleFormClose}
                    />
                </div>
            )}

            {/* Category list */}
            <div className="overflow-hidden rounded-xl border border-border bg-card">
                {isLoading ? (
                    <div className="space-y-0">
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-4 border-b border-border p-4 last:border-0"
                            >
                                <Skeleton className="h-10 w-10 rounded-lg" />
                                <div className="flex-1 space-y-1.5">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                                <Skeleton className="h-6 w-16 rounded-full" />
                                <Skeleton className="h-8 w-20" />
                            </div>
                        ))}
                    </div>
                ) : categories.length === 0 ? (
                    <div className="flex h-40 items-center justify-center">
                        <p className="text-sm text-muted-foreground">
                            Chưa có danh mục nào
                        </p>
                    </div>
                ) : (
                    <div>
                        {categories.map((category, index) => {
                            const catId = category._id || category.id;
                            return (
                                <div key={catId}>
                                    <div className="flex items-center gap-4 p-4">
                                        {/* Drag handle */}
                                        <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground/40" />

                                        {/* Image */}
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted/30">
                                            {category.image ? (
                                                <img
                                                    src={category.image}
                                                    alt={category.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <ImagePlus className="h-4 w-4 text-muted-foreground/40" />
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-foreground">
                                                {category.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                /{category.slug}
                                                {category.productCount !=
                                                    null && (
                                                    <span className="ml-2">
                                                        ·{" "}
                                                        {category.productCount}{" "}
                                                        sản phẩm
                                                    </span>
                                                )}
                                            </p>
                                        </div>

                                        {/* Status badge */}
                                        <Badge
                                            className={cn(
                                                "text-xs",
                                                category.isActive !== false
                                                    ? "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-950/30 dark:text-green-400"
                                                    : "bg-muted text-muted-foreground hover:bg-muted",
                                            )}
                                        >
                                            {category.isActive !== false
                                                ? "Hiển thị"
                                                : "Đã ẩn"}
                                        </Badge>

                                        {/* Toggle */}
                                        <Switch
                                            checked={
                                                category.isActive !== false
                                            }
                                            onCheckedChange={() =>
                                                handleToggle(category)
                                            }
                                            disabled={isToggling}
                                        />

                                        {/* Actions */}
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                onClick={() =>
                                                    handleEdit(category)
                                                }
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                onClick={() =>
                                                    setDeleteId(catId)
                                                }
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    {index < categories.length - 1 && (
                                        <Separator />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

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
