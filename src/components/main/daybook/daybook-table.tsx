"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CustomSelect from "@/components/ui/custom-select";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useInventory } from "@/context/inventory-context";
import { DownloadIcon, FilterIcon, PlusIcon, SearchIcon } from "@/icons";
import React, { useMemo, useState } from "react";
import AddEntryModal from "./add-entry-modal";

export default function DaybookTable() {
  const { daybookEntries, settings } = useInventory();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [modeFilter, setModeFilter] = useState<string>("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filtered entries sorted newest first
  const filteredEntries = useMemo(() => {
    return daybookEntries
      .filter((entry) => {
        const matchesSearch =
          entry.partyName.toLowerCase().includes(search.toLowerCase()) ||
          entry.category.toLowerCase().includes(search.toLowerCase()) ||
          (entry.reference && entry.reference.toLowerCase().includes(search.toLowerCase())) ||
          (entry.notes && entry.notes.toLowerCase().includes(search.toLowerCase()));

        const matchesType =
          typeFilter === "ALL" || entry.type === typeFilter;

        const matchesMode =
          modeFilter === "ALL" || entry.paymentMode === modeFilter;

        return matchesSearch && matchesType && matchesMode;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [daybookEntries, search, typeFilter, modeFilter]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      "Date",
      "Type",
      "Party Name",
      "Party Type",
      "Category",
      "Payment Mode",
      "Amount",
      "Reference",
      "Notes",
    ];

    const rows = filteredEntries.map((e) => [
      new Date(e.date).toLocaleString("en-IN"),
      e.type === "cash_in" ? "Cash In" : "Cash Out",
      `"${e.partyName.replace(/"/g, '""')}"`,
      e.partyType,
      `"${e.category.replace(/"/g, '""')}"`,
      e.paymentMode,
      e.amount,
      e.reference || "",
      `"${(e.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join(
      "\n"
    );

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `StockFlow_Daybook_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-theme-xs overflow-hidden">
      {/* Top Controls Toolbar */}
      <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-800 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none text-gray-400">
            <SearchIcon className="w-4 h-4" />
          </span>
          <Input
            type="text"
            placeholder="Search party, category, reference, notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-10 text-xs sm:text-sm"
          />
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filter */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <FilterIcon className="w-3.5 h-3.5" />
            <CustomSelect
              value={typeFilter}
              onChange={(val) => setTypeFilter(val)}
              options={[
                { value: "ALL", label: "All Types" },
                { value: "cash_in", label: "Inflows (Cash In)" },
                { value: "cash_out", label: "Outflows (Cash Out)" },
              ]}
              triggerClassName="h-8 min-w-[140px]"
            />
          </div>

          {/* Mode Filter */}
          <CustomSelect
            value={modeFilter}
            onChange={(val) => setModeFilter(val)}
            options={[
              { value: "ALL", label: "All Modes" },
              { value: "Cash", label: "Cash Only" },
              { value: "UPI", label: "UPI / QR" },
              { value: "Card", label: "Card" },
              { value: "Bank Transfer", label: "Bank Transfer" },
            ]}
            triggerClassName="h-8 min-w-[130px]"
          />

          {/* CSV Export */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="text-xs gap-1.5"
          >
            <DownloadIcon className="w-3.5 h-3.5" />
            CSV
          </Button>

          {/* Add Entry */}
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="text-xs gap-1.5 shadow-sm"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            Record Entry
          </Button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50 dark:bg-gray-800/50 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              <TableCell className="py-3 px-4">Date &amp; Time</TableCell>
              <TableCell className="py-3 px-4">Reference</TableCell>
              <TableCell className="py-3 px-4">Party &amp; Category</TableCell>
              <TableCell className="py-3 px-4 text-center">Mode</TableCell>
              <TableCell className="py-3 px-4 text-end">Cash In (Inflow)</TableCell>
              <TableCell className="py-3 px-4 text-end">Cash Out (Expense)</TableCell>
              <TableCell className="py-3 px-4">Notes</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEntries.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-12 text-sm text-gray-400"
                >
                  No daybook entries match your filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredEntries.map((entry) => {
                const isCashIn = entry.type === "cash_in";
                const dateObj = new Date(entry.date);
                const dateStr = dateObj.toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                });
                const timeStr = dateObj.toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <TableRow
                    key={entry.id}
                    className="hover:bg-gray-50/70 dark:hover:bg-gray-800/40 text-xs"
                  >
                    {/* Date */}
                    <TableCell className="py-3 px-4 font-mono whitespace-nowrap text-gray-600 dark:text-gray-400">
                      <div>{dateStr}</div>
                      <div className="text-[10px] text-gray-400">{timeStr}</div>
                    </TableCell>

                    {/* Reference */}
                    <TableCell className="py-3 px-4 font-mono font-medium text-gray-900 dark:text-white whitespace-nowrap">
                      {entry.reference || "—"}
                    </TableCell>

                    {/* Party & Category */}
                    <TableCell className="py-3 px-4">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {entry.partyName}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-gray-500">{entry.category}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-gray-100 dark:bg-gray-800 text-gray-500">
                          {entry.partyType}
                        </span>
                      </div>
                    </TableCell>

                    {/* Mode */}
                    <TableCell className="py-3 px-4 text-center whitespace-nowrap">
                      <Badge
                        color={
                          entry.paymentMode === "Cash"
                            ? "success"
                            : entry.paymentMode === "UPI"
                            ? "primary"
                            : "light"
                        }
                        size="sm"
                      >
                        {entry.paymentMode}
                      </Badge>
                    </TableCell>

                    {/* Cash In */}
                    <TableCell className="py-3 px-4 text-end font-semibold whitespace-nowrap">
                      {isCashIn ? (
                        <span className="text-success-600 dark:text-success-400 font-bold">
                          +{settings.currency}{entry.amount.toLocaleString("en-IN")}
                        </span>
                      ) : (
                        <span className="text-gray-300 dark:text-gray-700">—</span>
                      )}
                    </TableCell>

                    {/* Cash Out */}
                    <TableCell className="py-3 px-4 text-end font-semibold whitespace-nowrap">
                      {!isCashIn ? (
                        <span className="text-error-600 dark:text-error-400 font-bold">
                          -{settings.currency}{entry.amount.toLocaleString("en-IN")}
                        </span>
                      ) : (
                        <span className="text-gray-300 dark:text-gray-700">—</span>
                      )}
                    </TableCell>

                    {/* Notes */}
                    <TableCell className="py-3 px-4 text-gray-500 dark:text-gray-400 max-w-[200px] truncate">
                      {entry.notes || "—"}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Entry Modal */}
      <AddEntryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
