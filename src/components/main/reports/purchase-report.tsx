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
import { PurchaseStatus } from "@/types/inventory";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function PurchaseReport() {
  const { theme } = useTheme();
  const { purchases, settings } = useInventory();

  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({});

  const isDark = theme === "dark";

  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) => {
      const matchSearch =
        p.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        p.supplierName.toLowerCase().includes(search.toLowerCase());

      let matchDate = true;
      if (dateRange.start && dateRange.end) {
        const d = new Date(p.date);
        matchDate = d >= dateRange.start && d <= dateRange.end;
      }

      return matchSearch && matchDate;
    });
  }, [purchases, search, dateRange]);

  const totalPurchases = useMemo(() => {
    return filteredPurchases.reduce((acc, p) => acc + p.grandTotal, 0);
  }, [filteredPurchases]);

  const receivedPurchases = useMemo(() => {
    return filteredPurchases
      .filter((p) => p.status === "Received")
      .reduce((acc, p) => acc + p.grandTotal, 0);
  }, [filteredPurchases]);

  const pendingPurchases = useMemo(() => {
    return filteredPurchases
      .filter((p) => p.status === "Pending")
      .reduce((acc, p) => acc + p.grandTotal, 0);
  }, [filteredPurchases]);

  const { chartDates, chartSeries } = useMemo(() => {
    const sorted = [...filteredPurchases].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const map: Record<string, number> = {};
    sorted.forEach((p) => {
      const day = formatDate(p.date);
      map[day] = (map[day] || 0) + p.grandTotal;
    });

    const dates = Object.keys(map);
    const data = dates.map((d) => map[d]);

    return {
      chartDates: dates,
      chartSeries: data,
    };
  }, [filteredPurchases]);

  const chartOptions: ApexOptions = {
    chart: {
      type: "area",
      height: 240,
      toolbar: { show: false },
      fontFamily: "Outfit, sans-serif",
    },
    colors: ["#F59E0B"],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: isDark ? 0.4 : 0.35,
        opacityTo: 0.05,
        stops: [0, 95, 100],
      },
    },
    stroke: {
      curve: "smooth",
      width: 2.5,
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
      "Purchase Number",
      "Date",
      "Supplier",
      "Total Amount",
      "Purchase Status",
    ];

    const rows = filteredPurchases.map((p) => [
      p.orderNumber,
      formatDate(p.date),
      `"${p.supplierName.replace(/"/g, '""')}"`,
      p.grandTotal,
      p.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `stockflow-purchases-report-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3">
          <span className="text-xs font-medium text-gray-500">
            Total Procurement Orders
          </span>
          <h3 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(totalPurchases, settings.currency, settings.currencyCode)}
          </h3>
          <span className="text-[11px] text-gray-400">
            Across {filteredPurchases.length} total orders
          </span>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3">
          <span className="text-xs font-medium text-gray-500">
            Received Stock Outlay
          </span>
          <h3 className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(receivedPurchases, settings.currency, settings.currencyCode)}
          </h3>
          <span className="text-[11px] text-gray-400">
            Inventory landed & verified in warehouse
          </span>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3">
          <span className="text-xs font-medium text-gray-500">
            Pending Delivery Outlay
          </span>
          <h3 className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
            {formatCurrency(pendingPurchases, settings.currency, settings.currencyCode)}
          </h3>
          <span className="text-[11px] text-gray-400">
            Committed to suppliers awaiting arrival
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/3">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90 mb-2">
          Procurement Spending Outlay Trend
        </h4>
        <ReactApexChart
          options={chartOptions}
          series={[{ name: "PO Spending", data: chartSeries }]}
          type="area"
          height={240}
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
              Procurement Orders Audit Log
            </h3>
            <p className="text-xs text-gray-400">
              Track vendor purchase orders and fulfillment status
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="gap-1.5"
          >
            <DownloadIcon className="size-4" />
            <span>Export Purchases CSV</span>
          </Button>
        </div>

        {/* Filter Bar */}
        <div className="my-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative w-full sm:w-72">
            <SearchIcon className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              placeholder="Filter by PO # or supplier..."
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
                  PO Number
                </TableCell>
                <TableCell isHeader className="py-3 text-start">
                  Date
                </TableCell>
                <TableCell isHeader className="py-3 text-start">
                  Supplier
                </TableCell>
                <TableCell isHeader className="py-3 text-end">
                  Total Amount
                </TableCell>
                <TableCell isHeader className="py-3 pe-4 text-center">
                  Status
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 text-xs dark:divide-gray-800">
              {filteredPurchases.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="py-3 ps-4 font-mono font-medium text-amber-600">
                    {p.orderNumber}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500">
                    {formatDate(p.date)}
                  </TableCell>
                  <TableCell className="py-3 font-medium text-gray-800 dark:text-white">
                    {p.supplierName}
                  </TableCell>
                  <TableCell className="py-3 text-end font-bold text-gray-900 dark:text-white">
                    {formatCurrency(p.grandTotal, settings.currency, settings.currencyCode)}
                  </TableCell>
                  <TableCell className="py-3 pe-4 text-center">
                    {getStatusBadge(p.status)}
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
