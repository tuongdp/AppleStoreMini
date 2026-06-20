import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DOMPurify from "dompurify";
import { Loader2 } from "lucide-react";
import { productSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useUpdateProductMutation } from "@/store/api/productsApi";
import { useGetAdminCategoriesQuery } from "@/store/api/categoriesApi";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { slugify } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminProductEditModal({ open, onOpenChange, product, onUpdated }) {
  const [isSaving, setIsSaving] = useState(false);
  const [descOpen, setDescOpen] = useState(false);
  const { data: categoriesData } = useGetAdminCategoriesQuery();
  const categories = categoriesData?.categories || [];
  const [updateProduct] = useUpdateProductMutation();

  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      slug: "",
      category: "",
      description: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (open && product) {
      form.reset({
        name: product.name || "",
        slug: product.slug || "",
        category: product.category?.slug || product.categorySlug || "",
        description: product.description || "",
        isActive: product.isActive ?? true,
      });
    }
  }, [open, product, form]);

  const handleNameChange = (e) => {
    const name = e.target.value;
    form.setValue("name", name);
    form.setValue("slug", slugify(name));
  };

  const handleSubmit = async (values) => {
    const id = product?._id || product?.id;
    if (!id) return;
    setIsSaving(true);
    try {
      await updateProduct({
        id,
        name: values.name.trim(),
        slug: values.slug.trim(),
        category: values.category,
        description: values.description || "",
        isActive: values.isActive ?? true,
      }).unwrap();
      toast.success("Cập nhật sản phẩm thành công");
      onOpenChange(false);
      onUpdated?.();
    } catch (error) {
      toast.error(error?.data?.message || "Có lỗi xảy ra");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa sản phẩm</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin cơ bản của sản phẩm.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên sản phẩm <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="VD: iPhone 15 Pro Max" {...field} onChange={handleNameChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="slug" render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="VD: iphone-15-pro-max" {...field} />
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
                  <FormLabel>Mô tả sản phẩm</FormLabel>
                  <FormControl>
                    <button
                      type="button"
                      className="group relative w-full cursor-text rounded-lg border border-border bg-muted/20 p-3 text-left transition-colors hover:border-primary/50 hover:bg-muted/30"
                      onClick={() => setDescOpen(true)}
                    >
                      {field.value ? (
                        <div className="pointer-events-none max-h-24 overflow-hidden">
                          <div className="prose prose-sm max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(field.value) }} />
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground/60">Nhấn để soạn mô tả...</p>
                      )}
                    </button>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="isActive" render={({ field }) => (
                <FormItem className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
                  <div>
                    <Label className="cursor-pointer font-normal">Hiển thị trên web</Label>
                    <p className="text-xs text-muted-foreground">Bật để hiển thị sản phẩm.</p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )} />

              <DialogFooter>
                <Button type="button" variant="outline" className="rounded-full" onClick={() => onOpenChange(false)}>
                  Hủy
                </Button>
                <Button type="submit" className="rounded-full" disabled={isSaving}>
                  {isSaving ? <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" />Đang lưu...</> : "Cập nhật"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={descOpen} onOpenChange={setDescOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col" showCloseButton>
          <DialogHeader>
            <DialogTitle>Soạn mô tả sản phẩm</DialogTitle>
            <DialogDescription className="sr-only">Soạn nội dung mô tả chi tiết.</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-1">
            <Controller
              name="description"
              control={form.control}
              render={({ field: { onChange, value } }) => (
                <RichTextEditor value={value} onChange={onChange} />
              )}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
