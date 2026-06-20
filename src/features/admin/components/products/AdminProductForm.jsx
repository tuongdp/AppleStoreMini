import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DOMPurify from "dompurify";
import { Save, Loader2 } from "lucide-react";
import { productSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useGetAdminCategoriesQuery } from "@/store/api/categoriesApi";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { slugify } from "@/lib/utils";

export default function AdminProductForm({ product, onSubmit, isLoading }) {
  const isEdit = !!product;

  const { data: categoriesData } = useGetAdminCategoriesQuery();
  const categories = categoriesData?.categories || [];

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
        category: product.category?.slug || product.categorySlug || "",
        description: product.description || "",
        isActive: product.isActive ?? true,
      });
    }
  }, [product, form]);

  useEffect(() => {
    if (product && categories?.length > 0) {
      const catSlug = product.category?.slug || product.categorySlug || "";
      if (catSlug) form.setValue("category", catSlug);
    }
  }, [categories, product, form]);

  const handleNameChange = (e) => {
    const name = e.target.value;
    form.setValue("name", name);
    if (!isEdit) form.setValue("slug", slugify(name));
  };

  const handleSubmit = (values) => {
    onSubmit(values);
  };

  const [descOpen, setDescOpen] = useState(false);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 max-w-3xl">
        <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
          <h3 className="mb-5 text-sm font-medium text-foreground">Thông tin cơ bản</h3>
          <div className="space-y-5">
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
                <Select
                  key={categories ? "loaded" : "loading"}
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isLoading}
                >
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
                <div className="flex items-center justify-between">
                  <FormLabel>Mô tả sản phẩm</FormLabel>
                </div>
                <FormControl>
                  <button
                    type="button"
                    className="group relative w-full cursor-text rounded-xl border border-border bg-muted/20 p-4 text-left transition-colors hover:border-primary/50 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                    onClick={() => setDescOpen(true)}
                    disabled={isLoading}
                  >
                    {field.value ? (
                      <div className="pointer-events-none max-h-32 overflow-hidden">
                        <div className="prose prose-sm max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(field.value) }} />
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground/60">Nhấn để soạn mô tả sản phẩm...</p>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/0 opacity-0 transition-opacity group-hover:bg-background/40 group-hover:opacity-100">
                      <span className="rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background">Nhấn để soạn</span>
                    </div>
                  </button>
                </FormControl>
                <FormMessage />

                <Dialog open={descOpen} onOpenChange={setDescOpen}>
                  <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col" showCloseButton>
                    <DialogHeader>
                      <DialogTitle>Soạn mô tả sản phẩm</DialogTitle>
                      <DialogDescription className="sr-only">Soạn và định dạng nội dung mô tả chi tiết cho sản phẩm.</DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto pr-1">
                      <Controller
                        name="description"
                        control={form.control}
                        render={({ field: { onChange, value } }) => (
                          <RichTextEditor value={value} onChange={onChange} disabled={isLoading} />
                        )}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              </FormItem>
            )} />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-4 text-sm font-medium text-foreground">Trạng thái</h3>
          <FormField control={form.control} name="isActive" render={({ field }) => (
            <FormItem className="flex items-center justify-between gap-4">
              <div>
                <Label className="cursor-pointer font-normal text-foreground">Hiển thị trên web</Label>
                <p className="text-xs text-muted-foreground">Bật để hiển thị sản phẩm. Tắt để ẩn.</p>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} />
              </FormControl>
            </FormItem>
          )} />
        </div>

        <Button type="submit" className="w-full rounded-full" disabled={isLoading}>
          {isLoading ? (
            <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" />Đang lưu...</>
          ) : (
            <><Save className="mr-1.5 h-4 w-4" />{isEdit ? "Cập nhật sản phẩm" : "Tạo sản phẩm"}</>
          )}
        </Button>
      </form>
    </Form>
  );
}
