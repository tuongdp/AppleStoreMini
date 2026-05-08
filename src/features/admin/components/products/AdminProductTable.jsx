import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
import { formatPrice, formatNumber } from "@/lib/utils";
import { ROUTES, CATEGORIES, PAGINATION } from "@/lib/constants";
import { useDebounce } from "@/hooks/useDebounce";

export default function AdminProductTable() {
  const { t } = useTranslation("admin");
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
      toast.success(t("product.deleteSuccess"));
    } catch {
      toast.error(t("product.deleteFailed"));
    } finally {
      setDeleteId(null);
    }
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
              placeholder={t("product.search")}
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
              <SelectValue placeholder={t("product.filterCategory")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("product.all")}</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Add button */}
        <Button className="rounded-full" asChild>
          <Link to={ROUTES.ADMIN_PRODUCT_CREATE}>
            <Plus className="mr-1.5 h-4 w-4" />
            {t("product.addNew")}
          </Link>
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-16">{t("product.images")}</TableHead>
              <TableHead>{t("product.name")}</TableHead>
              <TableHead>{t("product.category")}</TableHead>
              <TableHead>{t("product.price")}</TableHead>
              <TableHead>{t("product.salePrice")}</TableHead>
              <TableHead className="text-right">{t("product.stock")}</TableHead>
              <TableHead>{t("product.soldCount")}</TableHead>
              <TableHead>{t("product.status")}</TableHead>
              <TableHead className="text-right">{t("table.actions")}</TableHead>
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
                  {t("table.noData")}
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
                          src={product.images?.[0] || product.image}
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
                      <span className="text-sm font-medium text-foreground">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <p className="text-xs text-muted-foreground line-through">
                          {formatPrice(product.originalPrice)}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      {product.salePrice ? (
                        <>
                          <span className="text-sm font-medium text-green-600 dark:text-green-400">
                            {formatPrice(product.salePrice)}
                          </span>
                          {product.price > product.salePrice && (
                            <p className="text-xs text-muted-foreground">
                              -{Math.round((1 - product.salePrice / product.price) * 100)}%
                            </p>
                          )}
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`text-sm font-medium ${
                        product.stock > 10
                          ? "text-foreground"
                          : product.stock > 0
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-red-600 dark:text-red-400"
                      }`}>
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
                        {product.inStock
                          ? t("product.active")
                          : t("product.inactive")}
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
                              {t("product.edit")}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="gap-2 text-destructive focus:text-destructive"
                            onClick={() => setDeleteId(productId)}
                          >
                            <Trash2 className="h-4 w-4" />
                            {t("btn.delete", {
                              ns: "common",
                            })}
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
            {t("table.rowsPerPage")} {PAGINATION.DEFAULT_LIMIT}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              disabled={filters.page <= 1}
              onClick={() => updateParam("page", filters.page - 1)}
            >
              {t("pagination.prev", { ns: "common" })}
            </Button>
            <span className="text-sm text-muted-foreground">
              {filters.page} {t("table.of")} {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              disabled={filters.page >= pagination.totalPages}
              onClick={() => updateParam("page", filters.page + 1)}
            >
              {t("pagination.next", { ns: "common" })}
            </Button>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={t("product.deleteConfirm")}
        description={t("confirm.deleteDesc", { ns: "common" })}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
