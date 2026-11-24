"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DateRangePicker from "@/components/ui/date-range-picker";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useInventory } from "@/context/inventory-context";
import { useTheme } from "@/context/theme-context";
import { DownloadIcon, SearchIcon } from "@/icons";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function SalesReport() {
  const { theme } = useTheme();
  const { sales, settings } = useInventory();

  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({});

  const isDark = theme === "dark";

  // Filtered sales
  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      const matchSearch =
        s.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        s.customerName.toLowerCase().includes(search.toLowerCase());

      let matchDate = true;
      if (dateRange.start && dateRange.end) {
        const d = new Date(s.date);
        matchDate = d >= dateRange.start && d <= dateRange.end;
      }

      return matchSearch && matchDate;
    });
  }, [sales, search, dateRange]);

  // Aggregate Metrics
  const totalSales = useMemo(() => {
    return filteredSales.reduce((acc, s) => acc + s.grandTotal, 0);
  }, [filteredSales]);

  const paidSales = useMemo(() => {
    return filteredSales
      .filter((s) => s.paymentStatus === "Paid")
      .reduce((acc, s) => acc + s.grandTotal, 0);
  }, [filteredSales]);

  const unpaidSales = useMemo(() => {
    return filteredSales
      .filter((s) => s.paymentStatus === "Unpaid" || s.paymentStatus === "Partial")
      .reduce((acc, s) => acc + s.grandTotal, 0);
  }, [filteredSales]);

  // Chart Data: Group by Date
  const { chartDates, chartSeries } = useMemo(() => {
    const sorted = [...filteredSales].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const map: Record<string, number> = {};
    sorted.forEach((s) => {
      const day = formatDate(s.date);
      map[day] = (map[day] || 0) + s.grandTotal;
    });

    const dates = Object.keys(map);
    const data = dates.map((d) => map[d]);

    return {
      chartDates: dates,
      chartSeries: data,
    };
  }, [filteredSales]);

  const chartOptions: ApexOptions = {
    chart: {
      type: "bar",
      height: 240,
      toolbar: { show: false },
      fontFamily: "Outfit, sans-serif",
    },
    colors: ["#465FFF"],
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: "40%",
      },
    },
    dataLabels: { enabled: false },
    grid: {
      borderColor: isDark ? "#1F2937" : "#F3F4F6",
      strokeDashArray: 4,
    },
    xaxis: {
      categories: chartDates,
      labels: {
        style: {
          colors: isDark ? "#9CA3AF" : "#6B7280",
          fontSize: "11px",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: isDark ? "#9CA3AF" : "#6B7280",
          fontSize: "11px",
        },
        formatter: (val) => `${settings.currency} ${(val / 1000).toFixed(0)}k`,
      },
    },
    tooltip: {
      theme: isDark ? "dark" : "light",
      y: {
        formatter: (val) =>
          formatCurrency(val, settings.currency, settings.currencyCode),
      },
    },
  };

  const handleExportCSV = () => {
    const headers = [
      "Invoice Number",
      "Date",
      "Customer",
      "Items Count",
      "Subtotal",
      "Discount",
      "Tax",
      "Total Amount",
      "Payment Status",
    ];

    const rows = filteredSales.map((s) => [
      s.invoiceNumber,
      formatDate(s.date),
      `"${s.customerName.replace(/"/g, '""')}"`,
      s.items.reduce((acc, i) => acc + i.quantity, 0),
      s.subtotal,
      s.discount,
      s.tax,
      s.grandTotal,
      s.paymentStatus,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `stockflow-sales-report-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Sales Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3">
          <span className="text-xs font-medium text-gray-500">
            Total Sales Revenue
          </span>
          <h3 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(totalSales, settings.currency, settings.currencyCode)}
          </h3>
          <span className="text-[11px] text-gray-400">
            Across {filteredSales.length} invoiced orders
          </span>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3">
          <span className="text-xs font-medium text-gray-500">
            Settled / Paid Sales
          </span>
          <h3 className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(paidSales, settings.currency, settings.currencyCode)}
          </h3>
          <span className="text-[11px] text-gray-400">
            {totalSales > 0 ? ((paidSales / totalSales) * 100).toFixed(1) : 0}% realization rate
          </span>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3">
          <span className="text-xs font-medium text-gray-500">
            Outstanding / Unpaid Sales
          </span>
          <h3 className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
            {formatCurrency(unpaidSales, settings.currency, settings.currencyCode)}
          </h3>
          <span className="text-[11px] text-gray-400">
            Pending accounts receivable collection
          </span>
        </div>
      </div>

      {/* Sales Trend Chart */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/3">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90 mb-2">
          Daily Sales Invoicing Trend
        </h4>
        <ReactApexChart
          options={chartOptions}
          series={[{ name: "Invoiced Sales", data: chartSeries }]}
          type="bar"
          height={240}
        />
      </div>

      {/* Sales Ledger Table */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
              Sales Transaction Log
            </h3>
            <p className="text-xs text-gray-400">
              Complete historical order audit ledger
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="gap-1.5"
          >
            <DownloadIcon className="size-4" />
            <span>Export Sales CSV</span>
          </Button>
        </div>

        {/* Filter Bar */}
        <div className="my-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative w-full sm:w-72">
            <SearchIcon className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              placeholder="Filter by invoice # or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2 ps-9 pe-4 text-xs text-gray-800 outline-none focus:border-brand-500 dark:border-gray-800 dark:bg-white/5 dark:text-white"
            />
          </div>

          <DateRangePicker
            onRangeChange={(start, end) => setDateRange({ start, end })}
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
          <Table>
            <TableHeader className="bg-gray-50/70 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:bg-gray-800/50">
              <TableRow>
                <TableCell isHeader className="py-3 ps-4 text-start">
                  Invoice #
                </TableCell>
                <TableCell isHeader className="py-3 text-start">
                  Date
                </TableCell>
                <TableCell isHeader className="py-3 text-start">
                  Customer
                </TableCell>
                <TableCell isHeader className="py-3 text-end">
                  Total Amount
                </TableCell>
                <TableCell isHeader className="py-3 pe-4 text-center">
                  Payment Status
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 text-xs dark:divide-gray-800">
              {filteredSales.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="py-3 ps-4 font-mono font-medium text-brand-600">
                    {s.invoiceNumber}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500">
                    {formatDate(s.date)}
                  </TableCell>
                  <TableCell className="py-3 font-medium text-gray-800 dark:text-white">
                    {s.customerName}
                  </TableCell>
                  <TableCell className="py-3 text-end font-bold text-gray-900 dark:text-white">
                    {formatCurrency(s.grandTotal, settings.currency, settings.currencyCode)}
                  </TableCell>
                  <TableCell className="py-3 pe-4 text-center">
                    <Badge
                      color={
                        s.paymentStatus === "Paid"
                          ? "success"
                          : s.paymentStatus === "Partial"
                          ? "warning"
                          : "error"
                      }
                      size="sm"
                    >
                      {s.paymentStatus}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
