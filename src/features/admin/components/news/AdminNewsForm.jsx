import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { slugify } from "@/lib/utils";

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

export default function AdminNewsForm({ news, onSubmit, isLoading }) {
    const isEditing = !!news;
    const [content, setContent] = useState(news?.content || "");

    const form = useForm({
        resolver: zodResolver(newsSchema),
        defaultValues: {
            title: "",
            slug: "",
            excerpt: "",
            thumbnail: "",
            category: "",
            author: "",
            readTime: undefined,
            isPublished: false,
        },
    });

    const newsIdRef = useRef(news?.id);
    useEffect(() => {
        if (news && news.id !== newsIdRef.current) {
            newsIdRef.current = news.id;
            form.reset({
                title: news.title || "",
                slug: news.slug || "",
                excerpt: news.excerpt || "",
                thumbnail: news.thumbnail || "",
                category: news.category || "",
                author: news.author || "",
                readTime: news.readTime || undefined,
                isPublished: news.isPublished ?? false,
            });
            setContent(news.content || "");
        }
    }, [news, form]);

    const handleTitleChange = (e) => {
        const title = e.target.value;
        form.setValue("title", title);
        if (!isEditing) form.setValue("slug", slugify(title));
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
                {/* ── Left — Main ── */}
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
                                                disabled={
                                                    isLoading || isEditing
                                                }
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
                                            URL ảnh thumbnail{" "}
                                            <span className="text-muted-foreground">
                                                (tùy chọn)
                                            </span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="https://..."
                                                disabled={isLoading}
                                                {...field}
                                            />
                                        </FormControl>
                                        {field.value && (
                                            <img
                                                src={field.value}
                                                alt="thumbnail"
                                                className="mt-2 h-32 w-full rounded-lg object-cover"
                                                onError={(e) =>
                                                    (e.target.style.display =
                                                        "none")
                                                }
                                            />
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* Rich text editor */}
                    <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                        <h3 className="mb-4 text-sm font-medium text-foreground">
                            Nội dung bài viết
                        </h3>
                        <RichTextEditor
                            content={content}
                            onChange={setContent}
                            placeholder="Nhập nội dung bài viết..."
                        />
                    </div>
                </div>

                {/* ── Right — Settings ── */}
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
                                        <FormControl>
                                            <Input
                                                placeholder="VD: Sản phẩm mới"
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
                                            Thời gian đọc (phút)
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={1}
                                                placeholder="5"
                                                disabled={isLoading}
                                                value={field.value ?? ""}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        e.target.value === ""
                                                            ? undefined
                                                            : Number(
                                                                  e.target
                                                                      .value,
                                                              ),
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
                            ID: {news._id || news.id}
                        </p>
                    )}
                </div>
            </form>
        </Form>
    );
}
