import { useState, useRef } from "react";
import { Edit, Trash2, Plus, Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { toast } from "sonner";
import { formatPrice, formatNumber, parseJsonField, cn } from "@/lib/utils";
import { IMAGE } from "@/lib/constants";
import {
  useCreateVariantMutation,
  useUpdateVariantMutation,
  useDeleteVariantMutation,
  useUploadEditorImageMutation,
} from "@/store/api/productsApi";

const stockColor = (stock) => {
  if (stock === 0) return "text-red-600 dark:text-red-400";
  if (stock <= 5) return "text-orange-500 dark:text-orange-400";
  if (stock <= 20) return "text-amber-600 dark:text-amber-400";
  return "text-green-600 dark:text-green-400";
};

const variantImage = (v) => {
  const images = parseJsonField(v.images);
  return Array.isArray(images) ? images[0] : null;
};

export default function AdminVariantTable({ productId, variants, isLoading }) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ color: "", storage: "", size: "", price: "", salePrice: "", stock: "", images: [], isActive: true });
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef(null);

  const [createVariant, { isLoading: isCreating }] = useCreateVariantMutation();
  const [updateVariant, { isLoading: isUpdating }] = useUpdateVariantMutation();
  const [deleteVariant, { isLoading: isDeleting }] = useDeleteVariantMutation();
  const [uploadImage] = useUploadEditorImageMutation();

  const openAdd = () => {
    setEditing(null);
    setForm({ color: "", storage: "", size: "", price: "", salePrice: "", stock: "", images: [], isActive: true });
    setFormOpen(true);
  };

  const openEdit = (v) => {
    setEditing(v);
    setForm({
      color: v.color || "",
      storage: v.storage || "",
      size: v.size || "",
      price: v.price ? String(v.price) : "",
      salePrice: v.salePrice ? String(v.salePrice) : "",
      stock: v.stock != null ? String(v.stock) : "0",
      images: parseJsonField(v.images),
      isActive: v.isActive !== false,
    });
    setFormOpen(true);
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!IMAGE.VALID_TYPES.includes(file.type) || file.size > IMAGE.MAX_SIZE) {
      toast.error("Ảnh không hợp lệ hoặc vượt quá dung lượng");
      return;
    }
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const result = await uploadImage(fd).unwrap();
      const url = result.url || result;
      setForm((p) => ({ ...p, images: [...p.images, url] }));
    } catch {
      toast.error("Lỗi upload ảnh");
    } finally {
      setIsUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removeImage = (idx) => {
    setForm((p) => ({ ...p, images: p.images.filter((_, i) => i !== idx) }));
  };

  const handleSave = async () => {
    if (!form.price) {
      toast.error("Vui lòng nhập giá");
      return;
    }
    try {
      if (editing) {
        await updateVariant({
          variantId: editing.id || editing._id,
          color: form.color,
          storage: form.storage,
          size: form.size,
          price: Number(form.price),
          salePrice: form.salePrice ? Number(form.salePrice) : null,
          stock: Number(form.stock) || 0,
          isActive: form.isActive,
          images: form.images,
        }).unwrap();
        toast.success("Đã cập nhật biến thể");
      } else {
        await createVariant({
          productId,
          color: form.color,
          storage: form.storage,
          size: form.size,
          price: Number(form.price),
          salePrice: form.salePrice ? Number(form.salePrice) : null,
          stock: Number(form.stock) || 0,
          isActive: form.isActive,
          images: form.images,
        }).unwrap();
        toast.success("Đã thêm biến thể");
      }
      setFormOpen(false);
    } catch (error) {
      toast.error(error?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteVariant(deleteId).unwrap();
      toast.success("Đã xoá biến thể");
    } catch (error) {
      toast.error(error?.data?.message || "Xoá biến thể thất bại");
    } finally {
      setDeleteId(null);
    }
  };

  const list = Array.isArray(variants) ? variants : [];
  const saving = isCreating || isUpdating;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">Biến thể</h3>
          <Badge variant="secondary" className="text-xs">{list.length}</Badge>
        </div>
        <Button size="sm" className="rounded-full" onClick={openAdd} disabled={!productId}>
          <Plus className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
          Thêm biến thể
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12"></TableHead>
              <TableHead>Màu</TableHead>
              <TableHead>Dung lượng</TableHead>
              <TableHead>Mặt kính</TableHead>
              <TableHead className="text-right">Giá</TableHead>
              <TableHead className="text-right">Giá KM</TableHead>
              <TableHead className="text-right">Tồn kho</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(9)].map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}
                </TableRow>
              ))
            ) : list.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                  Chưa có biến thể nào
                </TableCell>
              </TableRow>
            ) : (
              list.map((v) => {
                const vStock = v.stock ?? 0;
                const img = variantImage(v);
                return (
                  <TableRow key={v.id || v._id}>
                    <TableCell>
                      <div className="h-8 w-8 overflow-hidden rounded bg-muted/30 p-0.5">
                        {img ? <img src={img} alt="" className="h-full w-full object-contain" /> : <div className="h-full w-full bg-muted/50 rounded" />}
                      </div>
                    </TableCell>
                    <TableCell><span className="text-sm">{v.color || "—"}</span></TableCell>
                    <TableCell><span className="text-sm text-muted-foreground">{v.storage || "—"}</span></TableCell>
                    <TableCell><span className="text-sm text-muted-foreground">{v.size || "—"}</span></TableCell>
                    <TableCell className="text-right">
                      <span className="text-sm font-medium">{v.price ? formatPrice(Number(v.price)) : "—"}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-sm text-green-600 dark:text-green-400">
                        {v.salePrice && Number(v.salePrice) < Number(v.price) ? formatPrice(Number(v.salePrice)) : "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={cn("text-sm font-medium", stockColor(vStock))}>{formatNumber(vStock)}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={v.isActive !== false ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400" : "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300"}>
                        {v.isActive !== false ? "Hiển thị" : "Ẩn"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(v)} aria-label="Sửa biến thể">
                          <Edit className="h-3.5 w-3.5" aria-hidden="true" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteId(v.id || v._id)} aria-label="Xoá biến thể">
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
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

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Sửa biến thể" : "Thêm biến thể"}</DialogTitle>
            <DialogDescription>
              {editing ? "Cập nhật thông tin biến thể." : "Tạo biến thể mới cho sản phẩm."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="v-color">Màu</Label>
                <Input id="v-color" placeholder="Xanh" value={form.color} onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="v-storage">Dung lượng</Label>
                <Input id="v-storage" placeholder="128GB" value={form.storage} onChange={(e) => setForm((p) => ({ ...p, storage: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="v-size">Mặt kính</Label>
                <Input id="v-size" placeholder="Ion-X" value={form.size} onChange={(e) => setForm((p) => ({ ...p, size: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="v-price">Giá</Label>
                <Input id="v-price" type="number" placeholder="15000000" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="v-sale">Giá KM</Label>
                <Input id="v-sale" type="number" placeholder="Để trống nếu không KM" value={form.salePrice} onChange={(e) => setForm((p) => ({ ...p, salePrice: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="v-stock">Tồn kho</Label>
              <Input id="v-stock" type="number" placeholder="0" value={form.stock} onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))} />
            </div>
            <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
              <div>
                <Label className="cursor-pointer font-normal">Hiển thị trên web</Label>
                <p className="text-xs text-muted-foreground">Tắt để ẩn biến thể khỏi webshop.</p>
              </div>
              <Switch checked={form.isActive} onCheckedChange={(v) => setForm((p) => ({ ...p, isActive: v }))} />
            </div>
            <div className="space-y-2">
              <Label>Ảnh</Label>
              <div className="flex flex-wrap gap-2">
                {form.images.map((url, idx) => (
                  <div key={idx} className="relative h-16 w-16 overflow-hidden rounded-lg border border-border bg-muted/30">
                    <img src={url} alt="" className="h-full w-full object-contain p-1" />
                    <button
                      type="button"
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white hover:bg-destructive/90"
                      onClick={() => removeImage(idx)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
                  onClick={() => fileRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                </button>
                <input ref={fileRef} type="file" accept={IMAGE.VALID_TYPES.join(",")} onChange={handleUpload} className="hidden" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-full" onClick={() => setFormOpen(false)}>
              Hủy
            </Button>
            <Button className="rounded-full" onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" aria-hidden="true" />Đang lưu...</> : editing ? "Cập nhật" : "Thêm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Xoá biến thể?"
        description="Hành động này không thể hoàn tác."
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
