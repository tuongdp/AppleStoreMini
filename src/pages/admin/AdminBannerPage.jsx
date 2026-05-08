import { useState } from "react";
import {
    Plus,
    Pencil,
    Trash2,
    GripVertical,
    Eye,
    EyeOff,
    ImagePlus,
    Loader2,
} from "lucide-react";
import {
    useGetAllBannersQuery,
    useCreateBannerMutation,
    useUpdateBannerMutation,
    useDeleteBannerMutation,
    useToggleBannerStatusMutation,
} from "@/store/api/bannersApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const bannerSchema = z.object({
    title: z.string().min(1, "Tiêu đề không được để trống"),
    subtitle: z.string().optional(),
    description: z.string().optional(),
    bgFrom: z.string().default("#1d1d1f"),
    bgTo: z.string().default("#2d2d2f"),
    textColor: z.enum(["light", "dark"]).default("light"),
    ctaText: z.string().optional(),
    ctaLink: z.string().optional(),
    order: z.coerce.number().default(0),
});

function BannerForm({ banner, onClose }) {
    const isEditing = !!banner;
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(banner?.image || null);

    const [createBanner, { isLoading: isCreating }] = useCreateBannerMutation();
    const [updateBanner, { isLoading: isUpdating }] = useUpdateBannerMutation();
    const isLoading = isCreating || isUpdating;

    const form = useForm({
        resolver: zodResolver(bannerSchema),
        defaultValues: {
            title: banner?.title || "",
            subtitle: banner?.subtitle || "",
            description: banner?.description || "",
            bgFrom: banner?.bgFrom || "#1d1d1f",
            bgTo: banner?.bgTo || "#2d2d2f",
            textColor: banner?.textColor || "light",
            ctaText: banner?.ctaText || "",
            ctaLink: banner?.ctaLink || "/products",
            order: banner?.order || 0,
        },
    });

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const onSubmit = async (values) => {
        try {
            const formData = new FormData();
            Object.entries(values).forEach(([key, val]) => {
                if (val !== undefined && val !== "") formData.append(key, val);
            });
            if (imageFile) formData.append("image", imageFile);

            if (isEditing) {
                await updateBanner({
                    id: banner._id || banner.id,
                    ...Object.fromEntries(formData),
                }).unwrap();
                // Nếu có file ảnh cần upload riêng
                toast.success("Đã cập nhật banner");
            } else {
                await createBanner(formData).unwrap();
                toast.success("Đã tạo banner mới");
            }
            onClose();
        } catch (error) {
            toast.error(error?.data?.message || "Có lỗi xảy ra");
        }
    };

    const watchBgFrom = form.watch("bgFrom");
    const watchBgTo = form.watch("bgTo");
    const watchTextColor = form.watch("textColor");

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {/* Preview */}
                <div
                    className="relative h-32 w-full overflow-hidden rounded-xl"
                    style={{
                        background: `linear-gradient(135deg, ${watchBgFrom}, ${watchBgTo})`,
                    }}
                >
                    {imagePreview && (
                        <img
                            src={imagePreview}
                            alt="preview"
                            className="h-full w-full object-cover opacity-60"
                        />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <p
                            className={cn(
                                "text-lg font-semibold",
                                watchTextColor === "light"
                                    ? "text-white"
                                    : "text-gray-900",
                            )}
                        >
                            {form.watch("title") || "Tiêu đề banner"}
                        </p>
                    </div>
                </div>

                {/* Image upload */}
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                        Ảnh nền{" "}
                        <span className="text-muted-foreground">
                            (tùy chọn)
                        </span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border p-3 hover:bg-muted/30">
                        <ImagePlus className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                            {imageFile ? imageFile.name : "Chọn ảnh banner..."}
                        </span>
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                        />
                    </label>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tiêu đề</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="VD: iPhone 16 Pro"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="subtitle"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Phụ đề{" "}
                                    <span className="text-muted-foreground">
                                        (tùy chọn)
                                    </span>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="VD: Titanium. Mạnh mẽ."
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
                                    placeholder="Mô tả ngắn về banner"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="bgFrom"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Màu nền từ</FormLabel>
                                <FormControl>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={field.value}
                                            onChange={(e) =>
                                                field.onChange(e.target.value)
                                            }
                                            className="h-9 w-9 cursor-pointer rounded-lg border border-border"
                                        />
                                        <Input
                                            value={field.value}
                                            onChange={field.onChange}
                                            className="font-mono text-xs"
                                        />
                                    </div>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="bgTo"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Màu nền đến</FormLabel>
                                <FormControl>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={field.value}
                                            onChange={(e) =>
                                                field.onChange(e.target.value)
                                            }
                                            className="h-9 w-9 cursor-pointer rounded-lg border border-border"
                                        />
                                        <Input
                                            value={field.value}
                                            onChange={field.onChange}
                                            className="font-mono text-xs"
                                        />
                                    </div>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="textColor"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Màu chữ</FormLabel>
                                <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="light">
                                            Trắng (sáng)
                                        </SelectItem>
                                        <SelectItem value="dark">
                                            Đen (tối)
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="ctaText"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Nút CTA{" "}
                                    <span className="text-muted-foreground">
                                        (tùy chọn)
                                    </span>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="VD: Mua ngay"
                                        {...field}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="ctaLink"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Link CTA</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="/products?category=iphone"
                                        {...field}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="order"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Thứ tự hiển thị</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    min={0}
                                    placeholder="0"
                                    {...field}
                                    onChange={(e) =>
                                        field.onChange(Number(e.target.value))
                                    }
                                    className="w-24"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-2 pt-2">
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
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                Đang lưu...
                            </>
                        ) : isEditing ? (
                            "Cập nhật"
                        ) : (
                            "Tạo banner"
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
}

export default function AdminBannerPage() {
    const [deleteId, setDeleteId] = useState(null);
    const [editingBanner, setEditingBanner] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const { data, isLoading } = useGetAllBannersQuery();
    const [deleteBanner, { isLoading: isDeleting }] = useDeleteBannerMutation();
    const [toggleStatus, { isLoading: isToggling }] =
        useToggleBannerStatusMutation();

    const banners = data?.data || [];

    const handleDelete = async () => {
        try {
            await deleteBanner(deleteId).unwrap();
            toast.success("Đã xóa banner");
        } catch {
            toast.error("Có lỗi xảy ra");
        } finally {
            setDeleteId(null);
        }
    };

    const handleToggle = async (banner) => {
        try {
            await toggleStatus(banner._id || banner.id).unwrap();
            toast.success(banner.isActive ? "Đã ẩn banner" : "Đã hiện banner");
        } catch {
            toast.error("Có lỗi xảy ra");
        }
    };

    const handleEdit = (banner) => {
        setEditingBanner(banner);
        setShowForm(true);
    };
    const handleAdd = () => {
        setEditingBanner(null);
        setShowForm(true);
    };
    const handleFormClose = () => {
        setShowForm(false);
        setEditingBanner(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-foreground">
                        Quản lý Banner
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Quản lý banner slider trang chủ
                    </p>
                </div>
                <Button className="rounded-full" onClick={handleAdd}>
                    <Plus className="mr-1.5 h-4 w-4" />
                    Thêm banner
                </Button>
            </div>

            {/* Form */}
            {showForm && (
                <div className="rounded-2xl border border-border bg-card p-5">
                    <h3 className="mb-4 text-sm font-medium text-foreground">
                        {editingBanner ? "Chỉnh sửa banner" : "Tạo banner mới"}
                    </h3>
                    <BannerForm
                        banner={editingBanner}
                        onClose={handleFormClose}
                    />
                </div>
            )}

            {/* Banner list */}
            <div className="overflow-hidden rounded-xl border border-border bg-card">
                {isLoading ? (
                    <div className="space-y-0">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-4 border-b border-border p-4 last:border-0"
                            >
                                <Skeleton className="h-16 w-28 rounded-lg" />
                                <div className="flex-1 space-y-1.5">
                                    <Skeleton className="h-4 w-40" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : banners.length === 0 ? (
                    <div className="flex h-40 items-center justify-center">
                        <p className="text-sm text-muted-foreground">
                            Chưa có banner nào
                        </p>
                    </div>
                ) : (
                    <div>
                        {banners.map((banner, index) => {
                            const bannerId = banner._id || banner.id;
                            return (
                                <div key={bannerId}>
                                    <div className="flex items-center gap-4 p-4">
                                        <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground/40" />

                                        {/* Preview nhỏ */}
                                        <div
                                            className="relative h-14 w-24 shrink-0 overflow-hidden rounded-lg"
                                            style={{
                                                background: `linear-gradient(135deg, ${banner.bgFrom}, ${banner.bgTo})`,
                                            }}
                                        >
                                            {banner.image && (
                                                <img
                                                    src={banner.image}
                                                    alt={banner.title}
                                                    className="h-full w-full object-cover opacity-70"
                                                />
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-foreground">
                                                {banner.title}
                                            </p>
                                            {banner.subtitle && (
                                                <p className="text-xs text-muted-foreground">
                                                    {banner.subtitle}
                                                </p>
                                            )}
                                            {banner.ctaText && (
                                                <p className="mt-0.5 text-xs text-apple-blue">
                                                    {banner.ctaText} →{" "}
                                                    {banner.ctaLink}
                                                </p>
                                            )}
                                        </div>

                                        {/* Order badge */}
                                        <span className="text-xs text-muted-foreground">
                                            #{banner.order}
                                        </span>

                                        {/* Status */}
                                        <Badge
                                            className={cn(
                                                "text-xs",
                                                banner.isActive
                                                    ? "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-950/30 dark:text-green-400"
                                                    : "bg-muted text-muted-foreground hover:bg-muted",
                                            )}
                                        >
                                            {banner.isActive
                                                ? "Hiển thị"
                                                : "Đã ẩn"}
                                        </Badge>

                                        {/* Toggle */}
                                        <Switch
                                            checked={banner.isActive}
                                            onCheckedChange={() =>
                                                handleToggle(banner)
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
                                                    handleEdit(banner)
                                                }
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                onClick={() =>
                                                    setDeleteId(bannerId)
                                                }
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    {index < banners.length - 1 && (
                                        <Separator />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <ConfirmDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                title="Xóa banner"
                description="Bạn có chắc muốn xóa banner này?"
                onConfirm={handleDelete}
                isLoading={isDeleting}
            />
        </div>
    );
}
