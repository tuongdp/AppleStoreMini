import { Link, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { Plus, Edit, Trash2, MoreHorizontal, Search } from "lucide-react";
import {
  useGetProductsQuery,
  useDeleteProductMutation,
} from "@/store/api/productsApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { toast } from "sonner";
import { formatPrice, formatNumber, parseJsonField } from "@/lib/utils";
import { ROUTES, CATEGORIES, PAGINATION } from "@/lib/constants";
import { useDebounce } from "@/hooks/useDebounce";
import ExportButton from "@/components/ui/export-button";
import { useExport } from "@/hooks/useExport";

export default function AdminProductTable() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [deleteId, setDeleteId] = useState(null);
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || "",
  );

  const debouncedSearch = useDebounce(searchInput, 400);

  const filters = {
    page: Number(searchParams.get("page")) || 1,
    limit: PAGINATION.DEFAULT_LIMIT,
    category: searchParams.get("category") || undefined,
    search: debouncedSearch || undefined,
    inStock: "false",
  };

  const { data, isLoading } = useGetProductsQuery(filters);
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

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
    { key: "variants", label: "Biến thể" },
  ];

  const getProductExportRows = () => products.map((p) => ({
    name: p.name,
    category: p.category || "—",
    price: p.price || 0,
    salePrice: p.salePrice && p.salePrice < p.price ? p.salePrice : null,
    stock: p.stock ?? 0,
    soldCount: p.soldCount || 0,
    status: p.inStock ? "Đang bán" : "Ngừng bán",
    variants: (p.variants || []).map((v) => {
      const parts = [v.color, v.storage, v.ram].filter(Boolean);
      return `${parts.join(" ")} (Tồn: ${v.stock})`;
    }).join("; ") || "—",
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
          {/* Search */}
          <div className="relative min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={"Tìm kiếm sản phẩm..."}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="rounded-full pl-9"
            />
          </div>

          {/* Category filter */}
          <Select
            value={searchParams.get("category") || "all"}
            onValueChange={(val) => updateParam("category", val)}
          >
            <SelectTrigger className="w-40 rounded-full">
              <SelectValue placeholder={"Lọc theo danh mục"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{"Tất cả"}</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3">
          <ExportButton
            onExportExcel={handleExportProductsExcel}
            onExportPDF={handleExportProductsPDF}
            loading={isExporting}
            disabled={isLoading}
          />
          <Button className="rounded-full" asChild>
            <Link to={ROUTES.ADMIN_PRODUCT_CREATE}>
              <Plus className="mr-1.5 h-4 w-4" />
              {"Thêm sản phẩm"}
            </Link>
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-16">{"Hình ảnh sản phẩm"}</TableHead>
              <TableHead>{"Tên sản phẩm"}</TableHead>
              <TableHead>{"Danh mục"}</TableHead>
              <TableHead>{"Giá gốc"}</TableHead>
              <TableHead>{"Giá sale"}</TableHead>
              <TableHead className="text-right">{"Tồn kho"}</TableHead>
              <TableHead>{"Đã bán"}</TableHead>
              <TableHead>{"Trạng thái"}</TableHead>
              <TableHead className="text-right">{"Thao tác"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(7)].map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="py-12 text-center text-muted-foreground"
                >
                  {"Không có dữ liệu"}
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => {
                const productId = product._id || product.id;
                return (
                  <TableRow key={productId}>
                    <TableCell>
                      <div className="h-11 w-11 overflow-hidden rounded-lg bg-muted/30 p-1">
                        <img
                          src={
                            parseJsonField(product.images)?.[0] || product.image
                          }
                          alt={product.name}
                          className="h-full w-full object-contain"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="max-w-[200px] truncate text-sm font-medium text-foreground">
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {product.slug}
                      </p>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {product.category}
                      </span>
                    </TableCell>
                    <TableCell>
                      {product.salePrice &&
                      product.salePrice < product.price ? (
                        <span className="text-xs text-muted-foreground line-through">
                          {formatPrice(product.price)}
                        </span>
                      ) : (
                        <span className="text-sm font-medium text-foreground">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {product.salePrice &&
                      product.salePrice < product.price ? (
                        <>
                          <span className="text-sm font-medium text-green-600 dark:text-green-400">
                            {formatPrice(product.salePrice)}
                          </span>
                          <p className="text-xs text-muted-foreground">
                            -
                            {Math.round(
                              (1 - product.salePrice / product.price) * 100,
                            )}
                            %
                          </p>
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`text-sm font-medium ${
                          product.stock > 10
                            ? "text-foreground"
                            : product.stock > 0
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {formatNumber(product.stock ?? 0)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatNumber(product.soldCount || 0)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          product.inStock
                            ? "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-950/30 dark:text-green-400"
                            : "bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400"
                        }
                      >
                        {product.inStock ? "Đang bán" : "Ngừng bán"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link
                              to={ROUTES.ADMIN_PRODUCT_EDIT(productId)}
                              className="flex items-center gap-2"
                            >
                              <Edit className="h-4 w-4" />
                              {"Chỉnh sửa sản phẩm"}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="gap-2 text-destructive focus:text-destructive"
                            onClick={() => setDeleteId(productId)}
                          >
                            <Trash2 className="h-4 w-4" />
                            {"Xoá"}
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
          <p className="text-sm text-muted-foreground">
            {"Hàng mỗi trang"} {PAGINATION.DEFAULT_LIMIT}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              disabled={filters.page <= 1}
              onClick={() => updateParam("page", filters.page - 1)}
            >
              {"Trước"}
            </Button>
            <span className="text-sm text-muted-foreground">
              {filters.page} {"trong"} {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              disabled={filters.page >= pagination.totalPages}
              onClick={() => updateParam("page", filters.page + 1)}
            >
              {"Sau"}
            </Button>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={"Bạn có chắc muốn xoá sản phẩm này không?"}
        description={"Hành động này không thể hoàn tác."}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
