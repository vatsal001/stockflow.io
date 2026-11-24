"use client";

import { Button } from "@/components/ui/button";
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
  DownloadIcon,
  EyeIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  TrashBinIcon,
} from "@/icons";
import { Purchase, Supplier } from "@/types/inventory";
import { formatCurrency } from "@/utils/formatters";
import { useMemo, useState } from "react";
import PurchaseDetailModal from "../purchases/purchase-detail-modal";
import SupplierDetailsModal from "./supplier-details-modal";
import SupplierFormModal from "./supplier-form-modal";

export default function SuppliersTable() {
  const { suppliers, purchases, deleteSupplier, settings } = useInventory();

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [detailsSupplier, setDetailsSupplier] = useState<Supplier | null>(null);
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [viewPurchase, setViewPurchase] = useState<Purchase | null>(null);

  // Derived stats per supplier
  const supplierStats = useMemo(() => {
    const stats: Record<string, { orders: number; totalSpent: number }> = {};
    suppliers.forEach((s) => {
      stats[s.id] = { orders: 0, totalSpent: 0 };
    });

    purchases.forEach((p) => {
      if (stats[p.supplierId]) {
        stats[p.supplierId].orders += 1;
        stats[p.supplierId].totalSpent += p.grandTotal;
      }
    });

    return stats;
  }, [suppliers, purchases]);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      return (
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.companyName.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        s.phone.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [suppliers, search]);

  const totalPages = Math.ceil(filteredSuppliers.length / pageSize) || 1;
  const paginatedSuppliers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSuppliers.slice(start, start + pageSize);
  }, [filteredSuppliers, currentPage, pageSize]);

  const handleDeleteConfirm = () => {
    if (!deletingSupplier) return;
    const res = deleteSupplier(deletingSupplier.id);
    if (!res.success) {
      setDeleteError(res.error || "Cannot delete supplier.");
    } else {
      setDeletingSupplier(null);
      setDeleteError(null);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "Company Name",
      "Representative",
      "Email",
      "Phone",
      "Address",
      "Total Orders",
      "Total Outlay",
    ];

    const rows = filteredSuppliers.map((s) => [
      `"${s.companyName.replace(/"/g, '""')}"`,
      `"${s.name.replace(/"/g, '""')}"`,
      s.email,
      s.phone,
      `"${s.address.replace(/"/g, '""')}"`,
      supplierStats[s.id]?.orders || 0,
      supplierStats[s.id]?.totalSpent || 0,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `stockflow-suppliers-${Date.now()}.csv`);
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
            Supplier & Vendor Directory
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Authorized procurement vendors, contact reps, purchase orders and cumulative spend
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
              setEditingSupplier(null);
              setIsFormOpen(true);
            }}
            className="gap-1.5"
          >
            <PlusIcon className="size-4" />
            <span>Add Supplier</span>
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="my-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <SearchIcon className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search vendor, contact, email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2 ps-9 pe-4 text-xs text-gray-800 outline-none focus:border-brand-500 dark:border-gray-800 dark:bg-white/5 dark:text-white placeholder:text-gray-400"
          />
        </div>

        <div className="text-xs text-gray-500">
          Total Suppliers: <span className="font-semibold text-gray-900 dark:text-white">{filteredSuppliers.length}</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
        <Table>
          <TableHeader className="bg-gray-50/70 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:bg-gray-800/50">
            <TableRow>
              <TableCell isHeader className="py-3 ps-4 text-start">
                Supplier & Contact
              </TableCell>
              <TableCell isHeader className="py-3 text-start">
                Email
              </TableCell>
              <TableCell isHeader className="py-3 text-start">
                Phone
              </TableCell>
              <TableCell isHeader className="py-3 text-end">
                Total Orders
              </TableCell>
              <TableCell isHeader className="py-3 text-end">
                Cumulative Outlay
              </TableCell>
              <TableCell isHeader className="py-3 pe-4 text-end">
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 text-xs dark:divide-gray-800">
            {paginatedSuppliers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-gray-400">
                  No suppliers found matching your search.
                </TableCell>
              </TableRow>
            ) : (
              paginatedSuppliers.map((s) => {
                const stats = supplierStats[s.id] || { orders: 0, totalSpent: 0 };
                return (
                  <TableRow
                    key={s.id}
                    className="hover:bg-gray-50/60 dark:hover:bg-white/2 transition-colors"
                  >
                    <TableCell className="py-3.5 ps-4 font-medium text-gray-800 dark:text-white">
                      <button
                        type="button"
                        onClick={() => setDetailsSupplier(s)}
                        className="text-start hover:text-amber-600 transition-colors"
                      >
                        {s.companyName}
                        <span className="block text-[11px] font-normal text-gray-400">
                          {s.name}
                        </span>
                      </button>
                    </TableCell>

                    <TableCell className="py-3.5 text-gray-600 dark:text-gray-400">
                      {s.email}
                    </TableCell>

                    <TableCell className="py-3.5 text-gray-600 dark:text-gray-400">
                      {s.phone || "—"}
                    </TableCell>

                    <TableCell className="py-3.5 text-end font-semibold text-gray-800 dark:text-gray-200">
                      {stats.orders}
                    </TableCell>

                    <TableCell className="py-3.5 text-end font-bold text-amber-600 dark:text-amber-400">
                      {formatCurrency(stats.totalSpent, settings.currency, settings.currencyCode)}
                    </TableCell>

                    <TableCell className="py-3.5 pe-4 text-end">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => setDetailsSupplier(s)}
                          title="View PO History"
                        >
                          <EyeIcon className="size-4 text-gray-500 hover:text-amber-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => {
                            setEditingSupplier(s);
                            setIsFormOpen(true);
                          }}
                          title="Edit Supplier"
                        >
                          <PencilIcon className="size-4 text-gray-500 hover:text-amber-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => {
                            setDeletingSupplier(s);
                            setDeleteError(null);
                          }}
                          title="Delete Supplier"
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

      {/* Pagination */}
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
      <SupplierFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        supplierToEdit={editingSupplier}
      />

      <SupplierDetailsModal
        isOpen={Boolean(detailsSupplier)}
        onClose={() => setDetailsSupplier(null)}
        supplier={detailsSupplier}
        onSelectPurchase={(p) => setViewPurchase(p)}
      />

      <PurchaseDetailModal
        isOpen={Boolean(viewPurchase)}
        onClose={() => setViewPurchase(null)}
        purchase={viewPurchase}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(deletingSupplier)}
        onOpenChange={(open) => !open && setDeletingSupplier(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Delete Supplier</DialogTitle>
            <p className="text-xs text-gray-500">
              Are you sure you want to delete supplier account{" "}
              <strong>{deletingSupplier?.companyName}</strong>?
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
              onClick={() => setDeletingSupplier(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              Delete Supplier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
