import { Link, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { Plus, Edit, Trash2, MoreHorizontal, Search, Copy, Eye, EyeOff, Package, Clock } from "lucide-react";
import {
  useGetProductsQuery,
  useDeleteProductMutation,
} from "@/store/api/productsApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { toast } from "sonner";
import { formatPrice, formatNumber, parseJsonField, cn } from "@/lib/utils";
import { ROUTES, CATEGORIES, PAGINATION } from "@/lib/constants";
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

const stockColor = (stock) => {
  if (stock === 0) return "text-red-600 dark:text-red-400";
  if (stock <= 5) return "text-orange-500 dark:text-orange-400";
  if (stock <= 20) return "text-amber-600 dark:text-amber-400";
  return "text-green-600 dark:text-green-400";
};

function relativeTime(dateStr) {
  if (!dateStr) return null;
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);
  if (mins < 60) return `${mins} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days === 1) return "Hôm qua";
  if (days < 7) return `${days} ngày trước`;
  return new Date(dateStr).toLocaleDateString("vi-VN");
}

export default function AdminProductTable() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [deleteId, setDeleteId] = useState(null);
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");

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

  if (stockFilter === "out") filters.inStock = "false";
  if (stockFilter === "in") filters.inStock = "true";
  if (stockFilter === "low") filters.inStock = "true";
  if (statusFilter === "active") filters.isActive = "true";
  if (statusFilter === "inactive") filters.isActive = "false";

  const { data, isLoading } = useGetProductsQuery(filters);
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  const products = data?.products || [];
  const pagination = data?.pagination || {};
  const getSafeSoldCount = (value) => Math.max(0, Number(value) || 0);

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
      toast.success("Xoá sản phẩm thành công");
    } catch {
      toast.error("Xoá sản phẩm thất bại");
    } finally {
      setDeleteId(null);
    }
  };

  const { exportExcel, exportPDF, isExporting } = useExport();

  const productColumns = [
    { key: "name", label: "Tên sản phẩm" },
    { key: "category", label: "Danh mục" },
    { key: "price", label: "Giá gốc", format: "currency" },
    { key: "salePrice", label: "Giá KM", format: "currency" },
    { key: "stock", label: "Tồn kho" },
    { key: "soldCount", label: "Đã bán" },
    { key: "status", label: "Trạng thái" },
  ];

  const getProductExportRows = () => products.map((p) => ({
    name: p.name,
    category: p.category || "—",
    price: p.price || 0,
    salePrice: p.salePrice && p.salePrice < p.price ? p.salePrice : null,
    stock: p.stock ?? 0,
    soldCount: getSafeSoldCount(p.soldCount),
    status: p.inStock ? "Đang bán" : "Ngừng bán",
  }));

  const handleExportProductsExcel = () => {
    if (products.length === 0) { toast.error("Không có dữ liệu để xuất"); return; }
    exportExcel({ sheets: [{ name: "SanPham", columns: productColumns, rows: getProductExportRows() }], filename: `SanPham_${new Date().toISOString().slice(0, 10)}` });
  };

  const handleExportProductsPDF = () => {
    if (products.length === 0) { toast.error("Không có dữ liệu để xuất"); return; }
    exportPDF({ title: "Danh sách sản phẩm", columns: productColumns, rows: getProductExportRows(), filename: `SanPham_${new Date().toISOString().slice(0, 10)}` });
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
          <ExportButton onExportExcel={handleExportProductsExcel} onExportPDF={handleExportProductsPDF} loading={isExporting} disabled={isLoading} />
          <Button className="rounded-full" asChild>
            <Link to={ROUTES.ADMIN_PRODUCT_CREATE}><Plus className="mr-1.5 h-4 w-4" />{"Thêm sản phẩm"}</Link>
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-16">{"Hình ảnh"}</TableHead>
              <TableHead>{"Tên sản phẩm"}</TableHead>
              <TableHead>{"Danh mục"}</TableHead>
              <TableHead>{"Giá bán"}</TableHead>
              <TableHead className="text-right">{"Tồn kho"}</TableHead>
              <TableHead>{"Đã bán"}</TableHead>
              <TableHead>{"Cập nhật"}</TableHead>
              <TableHead>{"Trạng thái"}</TableHead>
              <TableHead className="text-right">{"Thao tác"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(9)].map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}
                </TableRow>
              ))
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-12 text-center text-muted-foreground">{"Không có dữ liệu"}</TableCell>
              </TableRow>
            ) : (
              products.map((product) => {
                const productId = product._id || product.id;
                const stock = product.stock ?? 0;
                return (
                  <TableRow key={productId}>
                    <TableCell>
                      <div className="h-11 w-11 overflow-hidden rounded-lg bg-muted/30 p-1">
                        <img src={product.image || parseJsonField(product.images)?.[0]} alt={product.name} className="h-full w-full object-contain" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="max-w-[200px] truncate text-sm font-medium text-foreground">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.slug}</p>
                    </TableCell>
                    <TableCell><span className="text-sm text-muted-foreground">{product.category}</span></TableCell>
                    <TableCell>
                      {product.salePrice && product.salePrice < product.price ? (
                        <div>
                          <span className="text-sm font-medium text-green-600 dark:text-green-400">{formatPrice(product.salePrice)}</span>
                          <p className="text-xs text-muted-foreground line-through">{formatPrice(product.price)}</p>
                        </div>
                      ) : (
                        <span className="text-sm font-medium text-foreground">{formatPrice(product.price)}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={cn("text-sm font-medium", stockColor(stock))}>
                        {stock === 0 ? "—" : formatNumber(stock)}
                      </span>
                    </TableCell>
                    <TableCell><span className="text-sm text-muted-foreground">{formatNumber(getSafeSoldCount(product.soldCount))}</span></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{relativeTime(product.updatedAt) || "—"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={product.inStock ? "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-950/30 dark:text-green-400" : "bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400"}>
                        {product.inStock ? "Đang bán" : "Ngừng bán"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Thao tác cho ${product.name}`}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={ROUTES.ADMIN_PRODUCT_EDIT(productId)} className="flex items-center gap-2">
                              <Eye className="h-4 w-4" />{"Xem chi tiết"}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={ROUTES.ADMIN_PRODUCT_EDIT(productId)} className="flex items-center gap-2">
                              <Edit className="h-4 w-4" />{"Chỉnh sửa"}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2" onClick={() => toast.info("Sao chép sản phẩm — đang phát triển")}>
                            <Copy className="h-4 w-4" />{"Sao chép"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2" onClick={() => toast.info("Ẩn sản phẩm — đang phát triển")}>
                            <EyeOff className="h-4 w-4" />{product.inStock ? "Ẩn sản phẩm" : "Hiện sản phẩm"}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive" onClick={() => setDeleteId(productId)}>
                            <Trash2 className="h-4 w-4" />{"Xoá"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{"Hàng mỗi trang"} {PAGINATION.DEFAULT_LIMIT}</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-full" disabled={filters.page <= 1} onClick={() => updateParam("page", filters.page - 1)}>{"Trước"}</Button>
            <span className="text-sm text-muted-foreground">{filters.page} / {pagination.totalPages}</span>
            <Button variant="outline" size="sm" className="rounded-full" disabled={filters.page >= pagination.totalPages} onClick={() => updateParam("page", filters.page + 1)}>{"Sau"}</Button>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)} title={"Xoá sản phẩm?"} description={"Hành động này không thể hoàn tác."} onConfirm={handleDelete} isLoading={isDeleting} />
    </div>
  );
}
