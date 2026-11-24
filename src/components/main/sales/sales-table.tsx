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
  ChevronDownIcon,
  ChevronUpIcon,
  DownloadIcon,
  EyeIcon,
  PlusIcon,
  SearchIcon,
} from "@/icons";
import { PaymentStatus, Sale } from "@/types/inventory";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { useMemo, useState } from "react";
import CreateSaleModal from "./create-sale-modal";
import InvoiceDetailModal from "./invoice-detail-modal";

type SortField = "invoiceNumber" | "date" | "customerName" | "grandTotal";
type SortOrder = "asc" | "desc";

export default function SalesTable() {
  const { sales, settings } = useInventory();

  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  // Filtered
  const filteredSales = useMemo(() => {
    const now = new Date();
    return sales.filter((s) => {
      const matchesSearch =
        s.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        s.customerName.toLowerCase().includes(search.toLowerCase());

      const matchesPayment =
        paymentFilter === "all" || s.paymentStatus === paymentFilter;

      let matchesDate = true;
      if (dateFilter === "7d") {
        const d = new Date(s.date);
        const diff = (now.getTime() - d.getTime()) / (1000 * 3600 * 24);
        matchesDate = diff <= 7;
      } else if (dateFilter === "30d") {
        const d = new Date(s.date);
        const diff = (now.getTime() - d.getTime()) / (1000 * 3600 * 24);
        matchesDate = diff <= 30;
      }

      return matchesSearch && matchesPayment && matchesDate;
    });
  }, [sales, search, paymentFilter, dateFilter]);

  const sortedSales = useMemo(() => {
    return [...filteredSales].sort((a, b) => {
      let comp = 0;
      if (sortField === "invoiceNumber") {
        comp = a.invoiceNumber.localeCompare(b.invoiceNumber);
      } else if (sortField === "customerName") {
        comp = a.customerName.localeCompare(b.customerName);
      } else if (sortField === "grandTotal") {
        comp = a.grandTotal - b.grandTotal;
      } else if (sortField === "date") {
        comp = new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      return sortOrder === "asc" ? comp : -comp;
    });
  }, [filteredSales, sortField, sortOrder]);

  const totalPages = Math.ceil(sortedSales.length / pageSize) || 1;
  const paginatedSales = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedSales.slice(start, start + pageSize);
  }, [sortedSales, currentPage, pageSize]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const getPaymentBadge = (status: PaymentStatus) => {
    switch (status) {
      case "Paid":
        return <Badge color="success">Paid</Badge>;
      case "Partial":
        return <Badge color="warning">Partial</Badge>;
      case "Unpaid":
        return <Badge color="error">Unpaid</Badge>;
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "Invoice Number",
      "Date",
      "Customer",
      "Item Count",
      "Subtotal",
      "Discount",
      "Tax",
      "Grand Total",
      "Payment Status",
      "Invoice Status",
    ];

    const rows = sortedSales.map((s) => [
      s.invoiceNumber,
      formatDate(s.date),
      `"${s.customerName.replace(/"/g, '""')}"`,
      s.items.reduce((acc, i) => acc + i.quantity, 0),
      s.subtotal,
      s.discount,
      s.tax,
      s.grandTotal,
      s.paymentStatus,
      s.invoiceStatus,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `stockflow-sales-${Date.now()}.csv`);
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
            Sales Orders & Invoices
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Manage customer sales, generate tax invoices, track payment status and stock fulfillment
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
            <span>Create New Sale</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="my-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <SearchIcon className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search invoice # or customer..."
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
            value={paymentFilter}
            onChange={(val) => {
              setPaymentFilter(val);
              setCurrentPage(1);
            }}
            options={[
              { value: "all", label: "All Payment Statuses" },
              { value: "Paid", label: "Paid" },
              { value: "Partial", label: "Partial" },
              { value: "Unpaid", label: "Unpaid" },
            ]}
            triggerClassName="h-9 min-w-[170px]"
          />
        </div>

        <div>
          <CustomSelect
            value={dateFilter}
            onChange={(val) => {
              setDateFilter(val);
              setCurrentPage(1);
            }}
            options={[
              { value: "all", label: "All Time" },
              { value: "7d", label: "Last 7 Days" },
              { value: "30d", label: "Last 30 Days" },
            ]}
            triggerClassName="h-9 min-w-[140px]"
          />
        </div>

        <div className="flex items-center justify-end text-xs text-gray-500">
          Total: <span className="font-semibold text-gray-900 dark:text-white mx-1">{filteredSales.length}</span> Invoices
        </div>
      </div>

      {/* Sales Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
        <Table>
          <TableHeader className="bg-gray-50/70 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:bg-gray-800/50">
            <TableRow>
              <TableCell
                isHeader
                className="py-3 ps-4 text-start cursor-pointer hover:text-gray-900"
                onClick={() => handleSort("invoiceNumber")}
              >
                <div className="flex items-center gap-1">
                  <span>Invoice #</span>
                  {sortField === "invoiceNumber" && (sortOrder === "asc" ? <ChevronUpIcon className="size-3" /> : <ChevronDownIcon className="size-3" />)}
                </div>
              </TableCell>

              <TableCell
                isHeader
                className="py-3 text-start cursor-pointer hover:text-gray-900"
                onClick={() => handleSort("date")}
              >
                <div className="flex items-center gap-1">
                  <span>Date</span>
                  {sortField === "date" && (sortOrder === "asc" ? <ChevronUpIcon className="size-3" /> : <ChevronDownIcon className="size-3" />)}
                </div>
              </TableCell>

              <TableCell
                isHeader
                className="py-3 text-start cursor-pointer hover:text-gray-900"
                onClick={() => handleSort("customerName")}
              >
                <div className="flex items-center gap-1">
                  <span>Customer</span>
                  {sortField === "customerName" && (sortOrder === "asc" ? <ChevronUpIcon className="size-3" /> : <ChevronDownIcon className="size-3" />)}
                </div>
              </TableCell>

              <TableCell isHeader className="py-3 text-start">
                Items
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
                Payment
              </TableCell>

              <TableCell isHeader className="py-3 text-center">
                Status
              </TableCell>

              <TableCell isHeader className="py-3 pe-4 text-end">
                Action
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 text-xs dark:divide-gray-800">
            {paginatedSales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-gray-400">
                  No sales invoices found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              paginatedSales.map((s) => {
                const totalUnits = s.items.reduce((acc, i) => acc + i.quantity, 0);
                return (
                  <TableRow
                    key={s.id}
                    className="hover:bg-gray-50/60 dark:hover:bg-white/2 transition-colors"
                  >
                    <TableCell className="py-3.5 ps-4 font-mono font-medium text-brand-600 dark:text-brand-400">
                      <button
                        type="button"
                        onClick={() => setSelectedSale(s)}
                        className="hover:underline font-semibold"
                      >
                        {s.invoiceNumber}
                      </button>
                    </TableCell>

                    <TableCell className="py-3.5 text-gray-500 whitespace-nowrap">
                      {formatDate(s.date)}
                    </TableCell>

                    <TableCell className="py-3.5 font-medium text-gray-800 dark:text-white">
                      {s.customerName}
                    </TableCell>

                    <TableCell className="py-3.5 text-gray-500">
                      {s.items.length} item{s.items.length > 1 ? "s" : ""} ({totalUnits} units)
                    </TableCell>

                    <TableCell className="py-3.5 text-end font-bold text-gray-900 dark:text-white">
                      {formatCurrency(s.grandTotal, settings.currency, settings.currencyCode)}
                    </TableCell>

                    <TableCell className="py-3.5 text-center">
                      {getPaymentBadge(s.paymentStatus)}
                    </TableCell>

                    <TableCell className="py-3.5 text-center">
                      <Badge color="primary" size="sm">
                        {s.invoiceStatus}
                      </Badge>
                    </TableCell>

                    <TableCell className="py-3.5 pe-4 text-end">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => setSelectedSale(s)}
                        className="gap-1"
                      >
                        <EyeIcon className="size-3.5" />
                        <span>View Invoice</span>
                      </Button>
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
      <CreateSaleModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSaleCreated={(newSale) => setSelectedSale(newSale)}
      />

      <InvoiceDetailModal
        isOpen={Boolean(selectedSale)}
        onClose={() => setSelectedSale(null)}
        sale={selectedSale}
      />
    </div>
  );
}
