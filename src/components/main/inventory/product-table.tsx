"use client";

import { Button } from "@/components/ui/button";
import CustomSelect from "@/components/ui/custom-select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useInventory } from "@/context/inventory-context";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  DownloadIcon,
  EyeIcon,
  FilterIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  TrashBinIcon,
} from "@/icons";
import {
  calculateStockStatus,
  Product,
  StockStatus,
} from "@/types/inventory";
import { formatCurrency } from "@/utils/formatters";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import ProductDetailsModal from "./product-details-modal";
import ProductFormModal from "./product-form-modal";
import StockStatusBadge from "./stock-status-badge";

type SortField = "name" | "sku" | "category" | "currentStock" | "purchasePrice" | "sellingPrice";
type SortOrder = "asc" | "desc";

export default function ProductTable() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  const { products, deleteProduct, settings } = useInventory();

  // Filter & Search states
  const [search, setSearch] = useState(initialSearch);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [detailsProduct, setDetailsProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Categories list
  const categories = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.category)));
  }, [products]);

  // Filtered & Sorted items
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" || p.category === categoryFilter;

      const pStatus = calculateStockStatus(p.currentStock, p.minimumStock);
      const matchesStatus =
        statusFilter === "all" || pStatus === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, search, categoryFilter, statusFilter]);

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      let comparison = 0;
      if (sortField === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === "sku") {
        comparison = a.sku.localeCompare(b.sku);
      } else if (sortField === "category") {
        comparison = a.category.localeCompare(b.category);
      } else if (sortField === "currentStock") {
        comparison = a.currentStock - b.currentStock;
      } else if (sortField === "purchasePrice") {
        comparison = a.purchasePrice - b.purchasePrice;
      } else if (sortField === "sellingPrice") {
        comparison = a.sellingPrice - b.sellingPrice;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [filteredProducts, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / pageSize) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedProducts.slice(start, start + pageSize);
  }, [sortedProducts, currentPage, pageSize]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleDeleteConfirm = () => {
    if (!deletingProduct) return;
    const res = deleteProduct(deletingProduct.id);
    if (!res.success) {
      setDeleteError(res.error || "Cannot delete product.");
    } else {
      setDeletingProduct(null);
      setDeleteError(null);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "Product Name",
      "SKU",
      "Category",
      "Unit",
      "Available Stock",
      "Min Stock",
      "Purchase Price",
      "Selling Price",
      "Stock Status",
    ];

    const rows = sortedProducts.map((p) => [
      `"${p.name.replace(/"/g, '""')}"`,
      p.sku,
      p.category,
      p.unit,
      p.currentStock,
      p.minimumStock,
      p.purchasePrice,
      p.sellingPrice,
      calculateStockStatus(p.currentStock, p.minimumStock),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `stockflow-inventory-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/3">
      {/* Top Header Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
        <div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-white/90">
            Product Inventory Catalog
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Monitor real-time physical stock levels, cost pricing, margins and SKU parameters
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="gap-1.5"
          >
            <DownloadIcon className="size-4" />
            <span>Export CSV</span>
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              setEditingProduct(null);
              setIsFormOpen(true);
            }}
            className="gap-1.5"
          >
            <PlusIcon className="size-4" />
            <span>Add Product</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="my-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Search */}
        <div className="relative">
          <SearchIcon className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, SKU, category..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2 ps-9 pe-4 text-xs text-gray-800 outline-none focus:border-brand-500 dark:border-gray-800 dark:bg-white/5 dark:text-white placeholder:text-gray-400"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <FilterIcon className="size-4 text-gray-400 shrink-0" />
          <CustomSelect
            value={categoryFilter}
            onChange={(val) => {
              setCategoryFilter(val);
              setCurrentPage(1);
            }}
            options={[
              { value: "all", label: `All Categories (${categories.length})` },
              ...categories.map((c) => ({ value: c, label: c })),
            ]}
            triggerClassName="h-9 min-w-[170px]"
          />
        </div>

        {/* Stock Status Filter */}
        <div className="flex items-center gap-2">
          <CustomSelect
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val);
              setCurrentPage(1);
            }}
            options={[
              { value: "all", label: "All Stock Statuses" },
              { value: "In Stock", label: "In Stock" },
              { value: "Low Stock", label: "Low Stock" },
              { value: "Out of Stock", label: "Out of Stock" },
            ]}
            triggerClassName="h-9 min-w-[160px]"
          />
        </div>

        {/* Summary Count Display */}
        <div className="flex items-center justify-end text-xs text-gray-500 dark:text-gray-400">
          Showing <span className="font-semibold text-gray-800 dark:text-white mx-1">{filteredProducts.length}</span> of {products.length} products
        </div>
      </div>

      {/* Product Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
        <Table>
          <TableHeader className="bg-gray-50/70 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:bg-gray-800/50">
            <TableRow>
              <TableCell
                isHeader
                className="py-3 ps-4 text-start cursor-pointer hover:text-gray-900 dark:hover:text-white"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center gap-1">
                  <span>Product</span>
                  {sortField === "name" && (sortOrder === "asc" ? <ChevronUpIcon className="size-3" /> : <ChevronDownIcon className="size-3" />)}
                </div>
              </TableCell>

              <TableCell
                isHeader
                className="py-3 text-start cursor-pointer hover:text-gray-900 dark:hover:text-white"
                onClick={() => handleSort("sku")}
              >
                <div className="flex items-center gap-1">
                  <span>SKU</span>
                  {sortField === "sku" && (sortOrder === "asc" ? <ChevronUpIcon className="size-3" /> : <ChevronDownIcon className="size-3" />)}
                </div>
              </TableCell>

              <TableCell
                isHeader
                className="py-3 text-start cursor-pointer hover:text-gray-900 dark:hover:text-white"
                onClick={() => handleSort("category")}
              >
                <div className="flex items-center gap-1">
                  <span>Category</span>
                  {sortField === "category" && (sortOrder === "asc" ? <ChevronUpIcon className="size-3" /> : <ChevronDownIcon className="size-3" />)}
                </div>
              </TableCell>

              <TableCell isHeader className="py-3 text-start">
                Unit
              </TableCell>

              <TableCell
                isHeader
                className="py-3 text-end cursor-pointer hover:text-gray-900 dark:hover:text-white"
                onClick={() => handleSort("currentStock")}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Available</span>
                  {sortField === "currentStock" && (sortOrder === "asc" ? <ChevronUpIcon className="size-3" /> : <ChevronDownIcon className="size-3" />)}
                </div>
              </TableCell>

              <TableCell isHeader className="py-3 text-end">
                Min Stock
              </TableCell>

              <TableCell
                isHeader
                className="py-3 text-end cursor-pointer hover:text-gray-900 dark:hover:text-white"
                onClick={() => handleSort("purchasePrice")}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Cost</span>
                  {sortField === "purchasePrice" && (sortOrder === "asc" ? <ChevronUpIcon className="size-3" /> : <ChevronDownIcon className="size-3" />)}
                </div>
              </TableCell>

              <TableCell
                isHeader
                className="py-3 text-end cursor-pointer hover:text-gray-900 dark:hover:text-white"
                onClick={() => handleSort("sellingPrice")}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Price</span>
                  {sortField === "sellingPrice" && (sortOrder === "asc" ? <ChevronUpIcon className="size-3" /> : <ChevronDownIcon className="size-3" />)}
                </div>
              </TableCell>

              <TableCell isHeader className="py-3 text-center">
                Status
              </TableCell>

              <TableCell isHeader className="py-3 pe-4 text-end">
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 text-xs dark:divide-gray-800">
            {paginatedProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="py-10 text-center text-gray-400">
                  No products found matching your filter criteria.
                </TableCell>
              </TableRow>
            ) : (
              paginatedProducts.map((p) => {
                const status: StockStatus = calculateStockStatus(p.currentStock, p.minimumStock);
                return (
                  <TableRow
                    key={p.id}
                    className="hover:bg-gray-50/60 dark:hover:bg-white/2 transition-colors"
                  >
                    <TableCell className="py-3.5 ps-4 font-medium text-gray-800 dark:text-white">
                      <button
                        type="button"
                        onClick={() => setDetailsProduct(p)}
                        className="text-start hover:text-brand-600 transition-colors"
                      >
                        {p.name}
                      </button>
                    </TableCell>

                    <TableCell className="py-3.5 font-mono text-gray-600 dark:text-gray-400">
                      {p.sku}
                    </TableCell>

                    <TableCell className="py-3.5 text-gray-600 dark:text-gray-400">
                      {p.category}
                    </TableCell>

                    <TableCell className="py-3.5 text-gray-500 uppercase">
                      {p.unit}
                    </TableCell>

                    <TableCell className="py-3.5 text-end font-bold">
                      <span
                        className={
                          p.currentStock <= 0
                            ? "text-error-600 dark:text-error-400"
                            : p.currentStock <= p.minimumStock
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-gray-900 dark:text-white"
                        }
                      >
                        {p.currentStock}
                      </span>
                    </TableCell>

                    <TableCell className="py-3.5 text-end text-gray-500">
                      {p.minimumStock}
                    </TableCell>

                    <TableCell className="py-3.5 text-end text-gray-600 dark:text-gray-400">
                      {formatCurrency(p.purchasePrice, settings.currency, settings.currencyCode)}
                    </TableCell>

                    <TableCell className="py-3.5 text-end font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(p.sellingPrice, settings.currency, settings.currencyCode)}
                    </TableCell>

                    <TableCell className="py-3.5 text-center">
                      <StockStatusBadge status={status} />
                    </TableCell>

                    <TableCell className="py-3.5 pe-4 text-end">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => setDetailsProduct(p)}
                          title="View Details & Stock History"
                        >
                          <EyeIcon className="size-4 text-gray-500 hover:text-brand-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => {
                            setEditingProduct(p);
                            setIsFormOpen(true);
                          }}
                          title="Edit Product"
                        >
                          <PencilIcon className="size-4 text-gray-500 hover:text-amber-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => {
                            setDeletingProduct(p);
                            setDeleteError(null);
                          }}
                          title="Delete Product"
                        >
                          <TrashBinIcon className="size-4 text-gray-500 hover:text-error-600" />
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

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-xs">
          <span className="text-gray-500">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="xs"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <Button
                key={i}
                variant={currentPage === i + 1 ? "default" : "ghost"}
                size="xs"
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              size="xs"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <ProductFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        productToEdit={editingProduct}
      />

      <ProductDetailsModal
        isOpen={Boolean(detailsProduct)}
        onClose={() => setDetailsProduct(null)}
        product={detailsProduct}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(deletingProduct)}
        onOpenChange={(open) => !open && setDeletingProduct(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Delete Product</DialogTitle>
            <p className="text-xs text-gray-500">
              Are you sure you want to delete{" "}
              <strong className="text-gray-800 dark:text-white">
                {deletingProduct?.name}
              </strong>{" "}
              ({deletingProduct?.sku})?
            </p>
          </DialogHeader>

          {deleteError && (
            <div className="rounded-lg bg-error-50 p-3 text-xs text-error-700 dark:bg-error-950/40 dark:text-error-300 border border-error-200">
              {deleteError}
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingProduct(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              Delete Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
