import { useState } from "react";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
    useCreateSeriesMutation,
    useDeleteSeriesMutation,
    useGetAdminSeriesQuery,
    useUpdateSeriesMutation,
} from "@/store/api/seriesApi";
import { useGetAdminCategoriesQuery } from "@/store/api/categoriesApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { cn, slugify } from "@/lib/utils";
import { toast } from "sonner";

const seriesSchema = z.object({
    name: z.string().min(1, "Tên series không được để trống"),
    slug: z.string().min(1, "Slug không được để trống"),
    category: z.string().min(1, "Vui lòng chọn danh mục"),
    description: z.string().optional(),
    order: z.coerce.number().int().min(0, "Thứ tự phải từ 0 trở lên").optional(),
});

function getSeriesId(series) {
    return series?._id || series?.id;
}

function SeriesForm({ series, categories, onClose }) {
    const isEditing = !!series;
    const [createSeries, { isLoading: isCreating }] = useCreateSeriesMutation();
    const [updateSeries, { isLoading: isUpdating }] = useUpdateSeriesMutation();
    const isLoading = isCreating || isUpdating;

    const form = useForm({
        resolver: zodResolver(seriesSchema),
        defaultValues: {
            name: series?.name || "",
            slug: series?.slug || "",
            category: series?.category?.slug || "",
            description: series?.description || "",
            order: series?.order ?? 0,
        },
    });

    const handleNameChange = (event) => {
        const name = event.target.value;
        form.setValue("name", name);
        if (!isEditing) {
            form.setValue("slug", slugify(name));
        }
    };

    const onSubmit = async (values) => {
        const payload = {
            ...values,
            description: values.description || "",
            order: Number(values.order) || 0,
        };

        try {
            if (isEditing) {
                await updateSeries({ id: getSeriesId(series), ...payload }).unwrap();
                toast.success("Đã cập nhật series");
            } else {
                await createSeries(payload).unwrap();
                toast.success("Đã tạo series mới");
            }
            onClose();
        } catch (error) {
            toast.error(error?.data?.message || "Có lỗi xảy ra");
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tên series</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="VD: iPhone 17 Series"
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
                                        placeholder="VD: iphone-17"
                                        disabled={isLoading}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Danh mục</FormLabel>
                                <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    disabled={isLoading || categories.length === 0}
                                >
                                    <FormControl>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Chọn danh mục" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id || category._id} value={category.slug}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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
                                        min="0"
                                        placeholder="0"
                                        disabled={isLoading}
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
                            <FormLabel>Mô tả</FormLabel>
                            <FormControl>
                                <Textarea
                                    rows={3}
                                    placeholder="Mô tả ngắn cho series"
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
                    <Button type="submit" size="sm" className="rounded-full" disabled={isLoading}>
                        {isLoading ? "Đang lưu..." : isEditing ? "Cập nhật" : "Tạo series"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}

export default function AdminSeriesList() {
    const [deleteId, setDeleteId] = useState(null);
    const [editingSeries, setEditingSeries] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const { data: seriesData, isLoading } = useGetAdminSeriesQuery();
    const { data: categoryData, isLoading: isLoadingCategories } = useGetAdminCategoriesQuery();
    const [deleteSeries, { isLoading: isDeleting }] = useDeleteSeriesMutation();
    const [updateSeries, { isLoading: isUpdating }] = useUpdateSeriesMutation();

    const series = seriesData || [];
    const categories = categoryData || [];

    const handleAdd = () => {
        setEditingSeries(null);
        setShowForm(true);
    };

    const handleEdit = (item) => {
        setEditingSeries(item);
        setShowForm(true);
    };

    const handleFormClose = () => {
        setShowForm(false);
        setEditingSeries(null);
    };

    const handleToggle = async (item) => {
        try {
            await updateSeries({
                id: getSeriesId(item),
                name: item.name,
                slug: item.slug,
                category: item.category?.slug,
                description: item.description || "",
                order: item.order ?? 0,
                isActive: item.isActive === false,
            }).unwrap();
            toast.success(item.isActive === false ? "Đã hiện series" : "Đã ẩn series");
        } catch (error) {
            toast.error(error?.data?.message || "Có lỗi xảy ra");
        }
    };

    const handleDelete = async () => {
        try {
            await deleteSeries(deleteId).unwrap();
            toast.success("Đã xóa series");
        } catch (error) {
            toast.error(error?.data?.message || "Không thể xóa series đang có sản phẩm");
        } finally {
            setDeleteId(null);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">{series.length} series</p>
                <Button className="rounded-full" onClick={handleAdd} disabled={isLoadingCategories}>
                    <Plus className="mr-1.5 h-4 w-4" />
                    Thêm series
                </Button>
            </div>

            {showForm && (
                <div className="rounded-2xl border border-border bg-card p-5">
                    <h3 className="mb-4 text-sm font-medium text-foreground">
                        {editingSeries ? "Chỉnh sửa series" : "Thêm series mới"}
                    </h3>
                    <SeriesForm
                        key={getSeriesId(editingSeries) || "new-series"}
                        series={editingSeries}
                        categories={categories}
                        onClose={handleFormClose}
                    />
                </div>
            )}

            <div className="overflow-x-auto rounded-xl border border-border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead>Series</TableHead>
                            <TableHead>Danh mục</TableHead>
                            <TableHead>Thứ tự</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            [...Array(5)].map((_, index) => (
                                <TableRow key={index}>
                                    {[...Array(5)].map((__, cellIndex) => (
                                        <TableCell key={cellIndex}>
                                            <Skeleton className="h-5 w-full" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : series.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                                    Chưa có series nào
                                </TableCell>
                            </TableRow>
                        ) : (
                            series.map((item) => {
                                const id = getSeriesId(item);
                                const isActive = item.isActive !== false;
                                return (
                                    <TableRow key={id}>
                                        <TableCell>
                                            <p className="font-medium text-foreground">{item.name}</p>
                                            <p className="text-xs text-muted-foreground">/{item.slug}</p>
                                            {item.description && (
                                                <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                                                    {item.description}
                                                </p>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-foreground">
                                                {item.category?.name || "Không có danh mục"}
                                            </span>
                                            {item.category?.slug && (
                                                <p className="text-xs text-muted-foreground">/{item.category.slug}</p>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {item.order ?? 0}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={cn(
                                                    "text-xs",
                                                    isActive
                                                        ? "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-950/30 dark:text-green-400"
                                                        : "bg-muted text-muted-foreground hover:bg-muted",
                                                )}
                                            >
                                                {isActive ? "Hiển thị" : "Đã ẩn"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                    disabled={isUpdating}
                                                    onClick={() => handleToggle(item)}
                                                    aria-label={isActive ? `Ẩn series ${item.name}` : `Hiện series ${item.name}`}
                                                >
                                                    {isActive ? (
                                                        <ToggleRight className="h-4 w-4 text-green-500" />
                                                    ) : (
                                                        <ToggleLeft className="h-4 w-4" />
                                                    )}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                    onClick={() => handleEdit(item)}
                                                    aria-label={`Sửa series ${item.name}`}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                    onClick={() => setDeleteId(id)}
                                                    aria-label={`Xóa series ${item.name}`}
                                                >
                                                    <Trash2 className="h-4 w-4" />
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

            <ConfirmDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                title="Xóa series"
                description="Series đang có sản phẩm sẽ không thể xóa. Bạn có chắc muốn xóa series này?"
                onConfirm={handleDelete}
                isLoading={isDeleting}
            />
        </div>
    );
}
