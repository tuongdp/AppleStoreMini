import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import { Plus, Edit, Trash2, MoreHorizontal, Search, EyeOff, ChevronLeft, ChevronRight, Package, Layers } from "lucide-react";
import {
  useGetAdminProductsQuery,
  useGetAdminProductByIdQuery,
  useDeleteProductMutation,
  useUpdateProductMutation,
} from "@/store/api/productsApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import AdminVariantTable from "./AdminVariantTable";
import AdminProductCreateModal from "./AdminProductCreateModal";
import AdminProductEditModal from "./AdminProductEditModal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CATEGORIES, PAGINATION } from "@/lib/constants";
import { useDebounce } from "@/hooks/useDebounce";
import ExportButton from "@/components/ui/export-button";
import { useExport } from "@/hooks/useExport";

const STOCK_FILTERS = [
  { value: "all", label: "Tất cả tồn kho" },
  { value: "in", label: "Còn hàng" },
  { value: "low", label: "Sắp hết hàng" },
  { value: "out", label: "Hết hàng" },
];

const STATUS_FILTERS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "active", label: "Đang bán" },
  { value: "hidden", label: "Ẩn sản phẩm" },
  { value: "inactive", label: "Ngừng bán" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "oldest", label: "Cũ nhất" },
  { value: "price_asc", label: "Giá thấp → cao" },
  { value: "price_desc", label: "Giá cao → thấp" },
  { value: "stock_asc", label: "Tồn kho thấp → cao" },
  { value: "stock_desc", label: "Tồn kho cao → thấp" },
  { value: "best_seller", label: "Bán chạy nhất" },
  { value: "updated_desc", label: "Mới cập nhật" },
];

export default function AdminProductTable() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [deleteId, setDeleteId] = useState(null);
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  const debouncedSearch = useDebounce(searchInput, 400);

  const stockFilter = searchParams.get("stock") || "all";
  const statusFilter = searchParams.get("status") || "all";

  const filters = {
    page: Number(searchParams.get("page")) || 1,
    limit: PAGINATION.DEFAULT_LIMIT,
    category: searchParams.get("category") || undefined,
    search: debouncedSearch || undefined,
    sort: searchParams.get("sort") || "newest",
  };

  if (stockFilter === "out") filters.stock = "out";
  if (stockFilter === "low") filters.stock = "low";
  if (stockFilter === "in") filters.stock = "in";
  if (statusFilter === "active") filters.vstatus = "active";
  if (statusFilter === "inactive") filters.vstatus = "inactive";
  if (statusFilter === "hidden") filters.isActive = "false";

  const { data, isLoading, isFetching } = useGetAdminProductsQuery(filters);
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [updateProduct] = useUpdateProductMutation();

  const {
    data: selectedProduct,
    isLoading: variantLoading,
    isFetching: variantFetching,
  } = useGetAdminProductByIdQuery(selectedProductId, { skip: !selectedProductId });

  const products = data?.products || [];
  const pagination = data?.pagination || {};

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (key !== "page") params.set("page", "1");
    setSearchParams(params);
  };

  const handleDelete = async () => {
    try {
      await deleteProduct(deleteId).unwrap();
      if (deleteId === selectedProductId) setSelectedProductId(null);
      toast.success("Xoá sản phẩm thành công");
    } catch {
      toast.error("Xoá sản phẩm thất bại");
    } finally {
      setDeleteId(null);
    }
  };

  const handleToggleProductVisibility = async (product) => {
    const productId = product._id || product.id;
    if (!productId) return;
    const nextIsActive = product.isActive === false;
    try {
      await updateProduct({ id: productId, isActive: nextIsActive }).unwrap();
      toast.success(nextIsActive ? "Đã hiện sản phẩm" : "Đã ẩn sản phẩm");
    } catch {
      toast.error("Cập nhật trạng thái sản phẩm thất bại");
    }
  };

  const { exportExcel, exportPDF, isExporting } = useExport();
  const productColumns = [
    { key: "name", label: "Tên sản phẩm" },
    { key: "category", label: "Danh mục" },
    { key: "stock", label: "Tồn kho" },
    { key: "soldCount", label: "Đã bán" },
    { key: "status", label: "Trạng thái" },
  ];
  const getSafeSoldCount = (v) => Math.max(0, Number(v) || 0);
  const getProductExportRows = () => products.map((p) => ({
    name: p.name,
    category: p.category || "—",
    stock: p.stock ?? 0,
    soldCount: getSafeSoldCount(p.soldCount),
    status: p.isActive !== false ? "Đang bán" : "Ẩn sản phẩm",
  }));
  const handleExportProductsExcel = () => {
    if (products.length === 0) { toast.error("Không có dữ liệu để xuất"); return; }
    exportExcel({ sheets: [{ name: "SanPham", columns: productColumns, rows: getProductExportRows() }], filename: `SanPham_${new Date().toISOString().slice(0, 10)}` });
  };
  const handleExportProductsPDF = () => {
    if (products.length === 0) { toast.error("Không có dữ liệu để xuất"); return; }
    exportPDF({ title: "Danh sách sản phẩm", columns: productColumns, rows: getProductExportRows(), filename: `SanPham_${new Date().toISOString().slice(0, 10)}` });
  };

  const selectedProductData = products.find((p) => (p._id || p.id) === selectedProductId);

  return (
    <div className="space-y-4">
      {/* ── Toolbar (full width) ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              aria-label="Tìm kiếm sản phẩm"
              placeholder={"Tìm kiếm sản phẩm..."}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="rounded-full pl-9"
            />
          </div>
          <Select value={searchParams.get("category") || "all"} onValueChange={(val) => updateParam("category", val)}>
            <SelectTrigger className="w-40 rounded-full"><SelectValue placeholder={"Lọc theo danh mục"} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{"Tất cả"}</SelectItem>
              {CATEGORIES.map((cat) => <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={stockFilter} onValueChange={(val) => updateParam("stock", val)}>
            <SelectTrigger className="w-36 rounded-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {STOCK_FILTERS.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(val) => updateParam("status", val)}>
            <SelectTrigger className="w-40 rounded-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={searchParams.get("sort") || "newest"} onValueChange={(val) => updateParam("sort", val)}>
            <SelectTrigger className="w-40 rounded-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-3">
          <ExportButton onExportExcel={handleExportProductsExcel} onExportPDF={handleExportProductsPDF} loading={isExporting} disabled={isLoading || isFetching} />
          <Button className="rounded-full" onClick={() => setCreateModalOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />{"Thêm sản phẩm"}
          </Button>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        {/* Left: Product list (compact) */}
        <div className="rounded-xl border border-border bg-card flex flex-col min-h-0">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <h3 className="text-sm font-semibold text-foreground">Sản phẩm</h3>
              <Badge variant="secondary" className="text-xs">{pagination.total || products.length}</Badge>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoading || isFetching ? (
              <div className="p-3 space-y-2">
                {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
              </div>
            ) : products.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground text-sm">Không có sản phẩm</div>
            ) : (
              <div className="divide-y divide-border">
                {products.map((product) => {
                  const productId = product._id || product.id;
                  const isSelected = productId === selectedProductId;
                  return (
                    <div
                      key={productId}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-muted/30",
                        isSelected && "bg-muted/50 border-l-2 border-l-primary",
                      )}
                      onClick={() => setSelectedProductId(isSelected ? null : productId)}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{product.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground truncate">{product.category}</span>
                          {product.variants?.length > 0 && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{product.variants.length}</Badge>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                            <MoreHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2" onClick={(e) => { e.stopPropagation(); setEditProduct(product); }}>
                            <Edit className="h-4 w-4" aria-hidden="true" />Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2" onClick={(e) => { e.stopPropagation(); handleToggleProductVisibility(product); }}>
                            <EyeOff className="h-4 w-4" aria-hidden="true" />{product.isActive !== false ? "Ẩn sản phẩm" : "Hiện sản phẩm"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteId(productId); }}>
                            <Trash2 className="h-4 w-4" aria-hidden="true" />Xoá
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {pagination.totalPages > 1 && (
            <div className="px-4 py-2.5 border-t border-border flex items-center justify-between shrink-0">
              <Button variant="outline" size="icon" className="h-7 w-7 rounded-full" disabled={filters.page <= 1} onClick={() => updateParam("page", filters.page - 1)} aria-label="Trang trước">
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>
              <span className="text-xs text-muted-foreground">{filters.page}/{pagination.totalPages}</span>
              <Button variant="outline" size="icon" className="h-7 w-7 rounded-full" disabled={filters.page >= pagination.totalPages} onClick={() => updateParam("page", filters.page + 1)} aria-label="Trang sau">
                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>
            </div>
          )}
        </div>

        {/* Right: Variants */}
        <div className="min-w-0">
          {selectedProductId ? (
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-foreground truncate">
                    {selectedProductData?.name || "Sản phẩm đã chọn"}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selectedProductData?.category && `${selectedProductData.category} · `}
                    {selectedProductData?.variants?.length || 0} biến thể
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground shrink-0" onClick={() => setSelectedProductId(null)}>
                  Đóng
                </Button>
              </div>
              <AdminVariantTable
                productId={selectedProductId}
                variants={selectedProduct?.variants}
                isLoading={variantLoading || variantFetching}
              />
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border px-6 py-24 text-center">
              <Package className="mx-auto h-10 w-10 text-muted-foreground/40" aria-hidden="true" />
              <p className="mt-3 text-sm font-medium text-foreground">Chọn một sản phẩm</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Nhấn vào sản phẩm bên trái để xem và quản lý biến thể.
              </p>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)} title={"Xoá sản phẩm?"} description={"Hành động này không thể hoàn tác."} onConfirm={handleDelete} isLoading={isDeleting} />

      <AdminProductCreateModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onCreated={(product) => {
          setSelectedProductId(product.id || product._id);
        }}
      />

      <AdminProductEditModal
        open={!!editProduct}
        onOpenChange={(open) => { if (!open) setEditProduct(null); }}
        product={editProduct}
        onUpdated={() => {
          setEditProduct(null);
        }}
      />
    </div>
  );
}
