"use client";

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
import { DownloadIcon, FilterIcon, SearchIcon } from "@/icons";
import { calculateStockStatus } from "@/types/inventory";
import { formatCurrency, formatNumber } from "@/utils/formatters";
import { useMemo, useState } from "react";
import StockStatusBadge from "../inventory/stock-status-badge";

export default function StockReport() {
  const { products, settings } = useInventory();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const categories = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.category)));
  }, [products]);

  const totalStockValuation = useMemo(() => {
    return products.reduce((acc, p) => acc + p.currentStock * p.purchasePrice, 0);
  }, [products]);

  const totalSellingValuation = useMemo(() => {
    return products.reduce((acc, p) => acc + p.currentStock * p.sellingPrice, 0);
  }, [products]);

  const totalUnits = useMemo(() => {
    return products.reduce((acc, p) => acc + p.currentStock, 0);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase());
      const matchCat =
        categoryFilter === "all" || p.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [products, search, categoryFilter]);

  const handleExportCSV = () => {
    const headers = [
      "Product",
      "SKU",
      "Category",
      "Current Quantity",
      "Minimum Quantity",
      "Purchase Price",
      "Stock Value (At Cost)",
      "Stock Status",
    ];

    const rows = filteredProducts.map((p) => [
      `"${p.name.replace(/"/g, '""')}"`,
      p.sku,
      p.category,
      p.currentStock,
      p.minimumStock,
      p.purchasePrice,
      p.currentStock * p.purchasePrice,
      calculateStockStatus(p.currentStock, p.minimumStock),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `stockflow-stock-report-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Valuation KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3">
          <span className="text-xs font-medium text-gray-500">
            Total Inventory Valuation (Cost)
          </span>
          <h3 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(totalStockValuation, settings.currency, settings.currencyCode)}
          </h3>
          <span className="text-[11px] text-gray-400">
            Asset cost basis across {formatNumber(totalUnits)} physical units
          </span>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3">
          <span className="text-xs font-medium text-gray-500">
            Estimated Retail Value (Selling)
          </span>
          <h3 className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(totalSellingValuation, settings.currency, settings.currencyCode)}
          </h3>
          <span className="text-[11px] text-gray-400">
            Gross potential realizable market revenue
          </span>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3">
          <span className="text-xs font-medium text-gray-500">
            Potential Gross Profit Margin
          </span>
          <h3 className="mt-1 text-2xl font-bold text-brand-600 dark:text-brand-400">
            {totalSellingValuation > 0
              ? (
                  ((totalSellingValuation - totalStockValuation) /
                    totalSellingValuation) *
                  100
                ).toFixed(1)
              : 0}
            %
          </h3>
          <span className="text-[11px] text-gray-400">
            Projected profit:{" "}
            {formatCurrency(
              totalSellingValuation - totalStockValuation,
              settings.currency,
              settings.currencyCode
            )}
          </span>
        </div>
      </div>

      {/* Stock Report Table Box */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
              Warehouse Stock Valuation Report
            </h3>
            <p className="text-xs text-gray-400">
              Product-by-product breakdown of on-hand inventory balances and asset valuation
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="gap-1.5"
          >
            <DownloadIcon className="size-4" />
            <span>Export Stock CSV</span>
          </Button>
        </div>

        {/* Filter Bar */}
        <div className="my-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative w-full sm:w-72">
            <SearchIcon className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              placeholder="Filter by product or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2 ps-9 pe-4 text-xs text-gray-800 outline-none focus:border-brand-500 dark:border-gray-800 dark:bg-white/5 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <FilterIcon className="size-4 text-gray-400 shrink-0" />
            <CustomSelect
              value={categoryFilter}
              onChange={(val) => setCategoryFilter(val)}
              options={[
                { value: "all", label: `All Categories (${categories.length})` },
                ...categories.map((c) => ({ value: c, label: c })),
              ]}
              triggerClassName="h-9 min-w-[200px]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
          <Table>
            <TableHeader className="bg-gray-50/70 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:bg-gray-800/50">
              <TableRow>
                <TableCell isHeader className="py-3 ps-4 text-start">
                  Product
                </TableCell>
                <TableCell isHeader className="py-3 text-start">
                  SKU
                </TableCell>
                <TableCell isHeader className="py-3 text-start">
                  Category
                </TableCell>
                <TableCell isHeader className="py-3 text-end">
                  Current Qty
                </TableCell>
                <TableCell isHeader className="py-3 text-end">
                  Min Qty
                </TableCell>
                <TableCell isHeader className="py-3 text-end">
                  Purchase Price
                </TableCell>
                <TableCell isHeader className="py-3 text-end">
                  Stock Value
                </TableCell>
                <TableCell isHeader className="py-3 pe-4 text-center">
                  Status
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 text-xs dark:divide-gray-800">
              {filteredProducts.map((p) => {
                const stockVal = p.currentStock * p.purchasePrice;
                const status = calculateStockStatus(p.currentStock, p.minimumStock);
                return (
                  <TableRow key={p.id}>
                    <TableCell className="py-3 ps-4 font-medium text-gray-800 dark:text-white">
                      {p.name}
                    </TableCell>
                    <TableCell className="py-3 font-mono text-gray-500">
                      {p.sku}
                    </TableCell>
                    <TableCell className="py-3 text-gray-600 dark:text-gray-300">
                      {p.category}
                    </TableCell>
                    <TableCell className="py-3 text-end font-bold text-gray-900 dark:text-white">
                      {p.currentStock} {p.unit}
                    </TableCell>
                    <TableCell className="py-3 text-end text-gray-500">
                      {p.minimumStock} {p.unit}
                    </TableCell>
                    <TableCell className="py-3 text-end text-gray-600 dark:text-gray-400">
                      {formatCurrency(p.purchasePrice, settings.currency, settings.currencyCode)}
                    </TableCell>
                    <TableCell className="py-3 text-end font-bold text-brand-600 dark:text-brand-400">
                      {formatCurrency(stockVal, settings.currency, settings.currencyCode)}
                    </TableCell>
                    <TableCell className="py-3 pe-4 text-center">
                      <StockStatusBadge status={status} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
