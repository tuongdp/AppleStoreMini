import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import RichTextEditor from "@/components/shared/RichTextEditor";
import { selectCurrentUser } from "@/store/authSlice";
import { useUploadEditorImageMutation } from "@/store/api/productsApi";
import { slugify } from "@/lib/utils";
import { toast } from "sonner";
import { useSelector } from "react-redux";

const newsSchema = z.object({
    title: z.string().min(1, "Tiêu đề không được để trống"),
    slug: z.string().min(1, "Slug không được để trống"),
    thumbnail: z.string().optional(),
    isPublished: z.boolean().default(false),
});

const IMAGE_MAX_SIZE = 5 * 1024 * 1024;
const IMAGE_VALID_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function AdminNewsForm({ news, onSubmit, isLoading }) {
    const isEditing = !!news;
    const currentUser = useSelector(selectCurrentUser);
    const [uploadEditorImage, { isLoading: isUploading }] = useUploadEditorImageMutation();
    const [content, setContent] = useState(news?.content || "");
    const [thumbnailPreview, setThumbnailPreview] = useState(news?.thumbnail || "");
    const fileInputRef = useRef(null);

    const authorName = isEditing
        ? (news?.author?.fullName || currentUser?.fullName || "")
        : (currentUser?.fullName || "");

    const form = useForm({
        resolver: zodResolver(newsSchema),
        defaultValues: {
            title: news?.title || "",
            slug: news?.slug || "",
            thumbnail: news?.thumbnail || "",
            isPublished: news?.isPublished ?? false,
        },
    });

    const handleTitleChange = (e) => {
        const title = e.target.value;
        form.setValue("title", title);
        if (!isEditing) form.setValue("slug", slugify(title));
    };

    const handleContentChange = (value) => {
        setContent(value);
    };

    const handleThumbnailUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!IMAGE_VALID_TYPES.includes(file.type)) {
            toast.error("Chỉ chấp nhận ảnh JPG, PNG, WebP");
            return;
        }
        if (file.size > IMAGE_MAX_SIZE) {
            toast.error("Ảnh không được vượt quá 5MB");
            return;
        }

        const fd = new FormData();
        fd.append("image", file);
        try {
            const res = await uploadEditorImage(fd).unwrap();
            const url = res?.url || res;
            form.setValue("thumbnail", url);
            setThumbnailPreview(url);
            toast.success("Đã tải ảnh lên");
        } catch {
            toast.error("Tải ảnh thất bại");
        }

        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = (values) => {
        onSubmit({ ...values, content });
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="grid grid-cols-1 gap-6 lg:grid-cols-3"
            >
                <div className="space-y-5 lg:col-span-2">
                    <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                        <h3 className="mb-5 text-sm font-medium text-foreground">
                            Thông tin bài viết
                        </h3>
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tiêu đề</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Tiêu đề bài viết..."
                                                disabled={isLoading}
                                                {...field}
                                                onChange={handleTitleChange}
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
                                                placeholder="tieu-de-bai-viet"
                                                disabled={isLoading || isEditing}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="thumbnail"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Ảnh thumbnail{" "}
                                            <span className="text-muted-foreground">
                                                (tùy chọn)
                                            </span>
                                        </FormLabel>
                                        <div className="flex gap-2">
                                            <FormControl>
                                                <Input
                                                    placeholder="Nhập URL hoặc tải ảnh lên..."
                                                    disabled={isLoading}
                                                    value={field.value || ""}
                                                    onChange={(e) => {
                                                        field.onChange(e.target.value);
                                                        setThumbnailPreview(e.target.value);
                                                    }}
                                                />
                                            </FormControl>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp"
                                                className="hidden"
                                                onChange={handleThumbnailUpload}
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                className="shrink-0"
                                                disabled={isLoading || isUploading}
                                                onClick={() => fileInputRef.current?.click()}
                                                aria-label="Tải ảnh thumbnail lên"
                                            >
                                                {isUploading ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                                                ) : (
                                                    <Upload className="h-4 w-4" aria-hidden="true" />
                                                )}
                                            </Button>
                                        </div>
                                        {thumbnailPreview && (
                                            <img
                                                src={thumbnailPreview}
                                                alt={form.getValues("title") ? `Thumbnail bài viết ${form.getValues("title")}` : "Thumbnail bài viết"}
                                                className="mt-2 h-40 w-full rounded-lg object-cover"
                                                onError={(e) => {
                                                    e.target.style.display = "none";
                                                }}
                                            />
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                        <h3 className="mb-4 text-sm font-medium text-foreground">
                            Nội dung bài viết
                        </h3>
                        <div className="max-h-[500px] overflow-y-auto rounded-lg border border-border">
                            <RichTextEditor
                                content={content}
                                onChange={handleContentChange}
                                placeholder="Nhập nội dung bài viết..."
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="rounded-2xl border border-border bg-card p-5">
                        <h3 className="mb-4 text-sm font-medium text-foreground">
                            Cài đặt
                        </h3>
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="isPublished"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between gap-4">
                                        <FormLabel className="cursor-pointer font-normal text-foreground">
                                            Xuất bản
                                        </FormLabel>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                disabled={isLoading}
                                                aria-label="Xuất bản bài viết"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <Separator />
                            {authorName && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <User className="h-4 w-4" />
                                    <span>Tác giả: {authorName}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full rounded-full"
                        disabled={isLoading || !content.trim()}
                    >
                        {isLoading
                            ? "Đang lưu..."
                            : isEditing
                                ? "Cập nhật bài viết"
                                : "Tạo bài viết"}
                    </Button>

                    {news && (
                        <p className="text-center text-xs text-muted-foreground">
                            ID: {news.id}
                        </p>
                    )}
                </div>
            </form>
        </Form>
    );
}
