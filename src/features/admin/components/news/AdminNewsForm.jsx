import { useEffect, useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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

const NEWS_CATEGORIES = [
    { value: "iPhone", label: "iPhone" },
    { value: "Mac", label: "Mac" },
    { value: "iPad", label: "iPad" },
    { value: "Watch", label: "Watch" },
    { value: "Âm thanh", label: "Âm thanh" },
    { value: "Phụ kiện", label: "Phụ kiện" },
    { value: "Dịch vụ", label: "Dịch vụ" },
];

const calcReadTime = (text) => {
    if (!text) return 0;
    const plain = text.replace(/<[^>]*>/g, "").trim();
    const words = plain.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
};

const newsSchema = z.object({
    title: z.string().min(1, "Tiêu đề không được để trống"),
    slug: z.string().min(1, "Slug không được để trống"),
    excerpt: z.string().optional(),
    thumbnail: z.string().optional(),
    category: z.string().optional(),
    author: z.string().optional(),
    readTime: z.number().optional(),
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

    const form = useForm({
        resolver: zodResolver(newsSchema),
        defaultValues: {
            title: "",
            slug: "",
            excerpt: "",
            thumbnail: "",
            category: "",
            author: currentUser?.fullName || "",
            readTime: undefined,
            isPublished: false,
        },
        values: news
            ? {
                  title: news.title || "",
                  slug: news.slug || "",
                  excerpt: news.excerpt || "",
                  thumbnail: news.thumbnail || "",
                  category: news.category || "",
                  author: news.author || currentUser?.fullName || "",
                  readTime: news.readTime || undefined,
                  isPublished: news.isPublished ?? false,
              }
            : undefined,
    });

    useEffect(() => {
        if (news) {
            setContent(news.content || "");
            setThumbnailPreview(news.thumbnail || "");
        }
    }, [news]);

    useEffect(() => {
        if (!isEditing) {
            form.setValue("author", currentUser?.fullName || "");
        }
    }, [currentUser, form, isEditing]);

    const handleTitleChange = (e) => {
        const title = e.target.value;
        form.setValue("title", title);
        if (!isEditing) form.setValue("slug", slugify(title));
    };

    const handleContentChange = useCallback(
        (value) => {
            setContent(value);
            const readTime = calcReadTime(value);
            form.setValue("readTime", readTime || undefined);
        },
        [form],
    );

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
                                name="excerpt"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Tóm tắt{" "}
                                            <span className="text-muted-foreground">
                                                (tùy chọn)
                                            </span>
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Tóm tắt ngắn về bài viết..."
                                                rows={3}
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
                                            >
                                                {isUploading ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Upload className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                        {thumbnailPreview && (
                                            <img
                                                src={thumbnailPreview}
                                                alt="thumbnail"
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
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <Separator />
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Danh mục{" "}
                                            <span className="text-muted-foreground">
                                                (tùy chọn)
                                            </span>
                                        </FormLabel>
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            disabled={isLoading}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn danh mục..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {NEWS_CATEGORIES.map((cat) => (
                                                    <SelectItem key={cat.value} value={cat.value}>
                                                        {cat.label}
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
                                name="author"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Tác giả{" "}
                                            <span className="text-muted-foreground">
                                                (tùy chọn)
                                            </span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Tên tác giả"
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
                                name="readTime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Thời gian đọc (phút){" "}
                                            <span className="text-xs text-muted-foreground">
                                                (tự động tính)
                                            </span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={1}
                                                placeholder="Tự động"
                                                disabled={isLoading}
                                                value={field.value ?? ""}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        e.target.value === ""
                                                            ? undefined
                                                            : Number(e.target.value),
                                                    )
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
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
