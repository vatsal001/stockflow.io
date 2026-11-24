"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CustomSelect from "@/components/ui/custom-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useInventory } from "@/context/inventory-context";
import {
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DownloadIcon,
  EyeIcon,
  PlusIcon,
  SearchIcon,
} from "@/icons";
import { Purchase, PurchaseStatus } from "@/types/inventory";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import CreatePurchaseModal from "./create-purchase-modal";
import PurchaseDetailModal from "./purchase-detail-modal";

type SortField = "orderNumber" | "date" | "supplierName" | "grandTotal";
type SortOrder = "asc" | "desc";

export default function PurchasesTable() {
  const searchParams = useSearchParams();
  const restockProductId = searchParams.get("product") || undefined;

  const { purchases, suppliers, receivePurchase, settings } = useInventory();

  const [search, setSearch] = useState("");
  const [supplierFilter, setSupplierFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(Boolean(restockProductId));
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    if (restockProductId) {
      const timer = setTimeout(() => setIsCreateOpen(true), 0);
      return () => clearTimeout(timer);
    }
  }, [restockProductId]);

  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) => {
      const matchesSearch =
        p.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        p.supplierName.toLowerCase().includes(search.toLowerCase());

      const matchesSupplier =
        supplierFilter === "all" || p.supplierId === supplierFilter;

      const matchesStatus =
        statusFilter === "all" || p.status === statusFilter;

      return matchesSearch && matchesSupplier && matchesStatus;
    });
  }, [purchases, search, supplierFilter, statusFilter]);

  const sortedPurchases = useMemo(() => {
    return [...filteredPurchases].sort((a, b) => {
      let comp = 0;
      if (sortField === "orderNumber") {
        comp = a.orderNumber.localeCompare(b.orderNumber);
      } else if (sortField === "supplierName") {
        comp = a.supplierName.localeCompare(b.supplierName);
      } else if (sortField === "grandTotal") {
        comp = a.grandTotal - b.grandTotal;
      } else if (sortField === "date") {
        comp = new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      return sortOrder === "asc" ? comp : -comp;
    });
  }, [filteredPurchases, sortField, sortOrder]);

  const totalPages = Math.ceil(sortedPurchases.length / pageSize) || 1;
  const paginatedPurchases = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedPurchases.slice(start, start + pageSize);
  }, [sortedPurchases, currentPage, pageSize]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const handleReceiveStock = (po: Purchase) => {
    const res = receivePurchase(po.id);
    if (res.success) {
      setActionMessage(`Success: Stock received for ${po.orderNumber}! Inventory counts updated.`);
      setTimeout(() => setActionMessage(null), 4000);
    } else {
      setActionMessage(res.error || "Failed to receive purchase order.");
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  const getStatusBadge = (status: PurchaseStatus) => {
    switch (status) {
      case "Received":
        return <Badge color="success">Received</Badge>;
      case "Pending":
        return <Badge color="warning">Pending</Badge>;
      case "Draft":
        return <Badge color="gray">Draft</Badge>;
      case "Cancelled":
        return <Badge color="error">Cancelled</Badge>;
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "Order Number",
      "Date",
      "Supplier",
      "Item Count",
      "Subtotal",
      "Discount",
      "Tax",
      "Grand Total",
      "Status",
    ];

    const rows = sortedPurchases.map((p) => [
      p.orderNumber,
      formatDate(p.date),
      `"${p.supplierName.replace(/"/g, '""')}"`,
      p.items.reduce((acc, i) => acc + i.quantity, 0),
      p.subtotal,
      p.discount,
      p.tax,
      p.grandTotal,
      p.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `stockflow-purchases-${Date.now()}.csv`);
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
            Purchase Orders & Restocking
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Issue procurement orders to vendors, receive shipments, and automate inventory replenishments
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
            onClick={() => setIsCreateOpen(true)}
            className="gap-1.5"
          >
            <PlusIcon className="size-4" />
            <span>Create Purchase Order</span>
          </Button>
        </div>
      </div>

      {actionMessage && (
        <div className="my-3 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 flex items-center gap-2">
          <CheckCircleIcon className="size-4" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="my-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <SearchIcon className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search PO # or supplier..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2 ps-9 pe-4 text-xs text-gray-800 outline-none focus:border-brand-500 dark:border-gray-800 dark:bg-white/5 dark:text-white placeholder:text-gray-400"
          />
        </div>

        <div>
          <CustomSelect
            value={supplierFilter}
            onChange={(val) => {
              setSupplierFilter(val);
              setCurrentPage(1);
            }}
            options={[
              { value: "all", label: `All Suppliers (${suppliers.length})` },
              ...suppliers.map((s) => ({ value: s.id, label: s.companyName })),
            ]}
            triggerClassName="h-9 min-w-[180px]"
          />
        </div>

        <div>
          <CustomSelect
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val);
              setCurrentPage(1);
            }}
            options={[
              { value: "all", label: "All PO Statuses" },
              { value: "Pending", label: "Pending (Awaiting Delivery)" },
              { value: "Received", label: "Received (Stock Added)" },
              { value: "Draft", label: "Draft" },
              { value: "Cancelled", label: "Cancelled" },
            ]}
            triggerClassName="h-9 min-w-[180px]"
          />
        </div>

        <div className="flex items-center justify-end text-xs text-gray-500">
          Total: <span className="font-semibold text-gray-900 dark:text-white mx-1">{filteredPurchases.length}</span> Purchase Orders
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
        <Table>
          <TableHeader className="bg-gray-50/70 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:bg-gray-800/50">
            <TableRow>
              <TableCell
                isHeader
                className="py-3 ps-4 text-start cursor-pointer hover:text-gray-900"
                onClick={() => handleSort("orderNumber")}
              >
                <div className="flex items-center gap-1">
                  <span>PO Number</span>
                  {sortField === "orderNumber" && (sortOrder === "asc" ? <ChevronUpIcon className="size-3" /> : <ChevronDownIcon className="size-3" />)}
                </div>
              </TableCell>

              <TableCell
                isHeader
                className="py-3 text-start cursor-pointer hover:text-gray-900"
                onClick={() => handleSort("date")}
              >
                <div className="flex items-center gap-1">
                  <span>Order Date</span>
                  {sortField === "date" && (sortOrder === "asc" ? <ChevronUpIcon className="size-3" /> : <ChevronDownIcon className="size-3" />)}
                </div>
              </TableCell>

              <TableCell
                isHeader
                className="py-3 text-start cursor-pointer hover:text-gray-900"
                onClick={() => handleSort("supplierName")}
              >
                <div className="flex items-center gap-1">
                  <span>Supplier</span>
                  {sortField === "supplierName" && (sortOrder === "asc" ? <ChevronUpIcon className="size-3" /> : <ChevronDownIcon className="size-3" />)}
                </div>
              </TableCell>

              <TableCell isHeader className="py-3 text-start">
                Items Ordered
              </TableCell>

              <TableCell
                isHeader
                className="py-3 text-end cursor-pointer hover:text-gray-900"
                onClick={() => handleSort("grandTotal")}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Total Amount</span>
                  {sortField === "grandTotal" && (sortOrder === "asc" ? <ChevronUpIcon className="size-3" /> : <ChevronDownIcon className="size-3" />)}
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
            {paginatedPurchases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-gray-400">
                  No purchase orders found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              paginatedPurchases.map((p) => {
                const totalUnits = p.items.reduce((acc, i) => acc + i.quantity, 0);
                const isPending = p.status === "Pending";
                return (
                  <TableRow
                    key={p.id}
                    className="hover:bg-gray-50/60 dark:hover:bg-white/2 transition-colors"
                  >
                    <TableCell className="py-3.5 ps-4 font-mono font-medium text-amber-600 dark:text-amber-400">
                      <button
                        type="button"
                        onClick={() => setSelectedPurchase(p)}
                        className="hover:underline font-semibold"
                      >
                        {p.orderNumber}
                      </button>
                    </TableCell>

                    <TableCell className="py-3.5 text-gray-500 whitespace-nowrap">
                      {formatDate(p.date)}
                    </TableCell>

                    <TableCell className="py-3.5 font-medium text-gray-800 dark:text-white">
                      {p.supplierName}
                    </TableCell>

                    <TableCell className="py-3.5 text-gray-500">
                      {p.items.length} item{p.items.length > 1 ? "s" : ""} ({totalUnits} units)
                    </TableCell>

                    <TableCell className="py-3.5 text-end font-bold text-gray-900 dark:text-white">
                      {formatCurrency(p.grandTotal, settings.currency, settings.currencyCode)}
                    </TableCell>

                    <TableCell className="py-3.5 text-center">
                      {getStatusBadge(p.status)}
                    </TableCell>

                    <TableCell className="py-3.5 pe-4 text-end">
                      <div className="flex items-center justify-end gap-1.5">
                        {isPending && (
                          <Button
                            variant="default"
                            size="xs"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                            onClick={() => handleReceiveStock(p)}
                            title="Confirm Receipt & Increase Inventory"
                          >
                            <CheckCircleIcon className="size-3.5" />
                            <span>Receive</span>
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => setSelectedPurchase(p)}
                          className="gap-1"
                        >
                          <EyeIcon className="size-3.5" />
                          <span>View PO</span>
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
      <CreatePurchaseModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        preselectedProductId={restockProductId}
        onPurchaseCreated={(po) => setSelectedPurchase(po)}
      />

      <PurchaseDetailModal
        isOpen={Boolean(selectedPurchase)}
        onClose={() => setSelectedPurchase(null)}
        purchase={selectedPurchase}
      />
    </div>
  );
}
