"use client";

import { useTheme } from "@/context/theme-context";
import { useInventory } from "@/context/inventory-context";
import { formatCurrency } from "@/utils/formatters";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function SalesOverviewChart() {
  const { theme } = useTheme();
  const { sales, settings } = useInventory();
  const [timeRange, setTimeRange] = useState<"7d" | "30d">("30d");

  // Calculate actual dynamic sales grouped by days
  const { categories, seriesData, currentTotal, previousTotal, percentageChange } =
    useMemo(() => {
      const daysCount = timeRange === "7d" ? 7 : 30;
      const now = new Date();
      const currentPeriodDates: string[] = [];
      const currentPeriodMap: Record<string, number> = {};

      for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateKey = d.toISOString().split("T")[0];
        currentPeriodDates.push(dateKey);
        currentPeriodMap[dateKey] = 0;
      }

      let curTotal = 0;
      let prevTotal = 0;

      const previousPeriodStart = new Date(now);
      previousPeriodStart.setDate(previousPeriodStart.getDate() - daysCount * 2);
      const currentPeriodStart = new Date(now);
      currentPeriodStart.setDate(currentPeriodStart.getDate() - daysCount);

      sales.forEach((sale) => {
        if (sale.invoiceStatus !== "Completed") return;
        const saleDate = new Date(sale.date);
        const dateKey = sale.date.split("T")[0];

        if (saleDate >= currentPeriodStart && saleDate <= now) {
          curTotal += sale.grandTotal;
          if (currentPeriodMap[dateKey] !== undefined) {
            currentPeriodMap[dateKey] += sale.grandTotal;
          }
        } else if (
          saleDate >= previousPeriodStart &&
          saleDate < currentPeriodStart
        ) {
          prevTotal += sale.grandTotal;
        }
      });

      const formattedCategories = currentPeriodDates.map((d) => {
        const parts = d.split("-");
        return `${parts[1]}/${parts[2]}`;
      });

      const data = currentPeriodDates.map((d) => currentPeriodMap[d] || 0);

      const change =
        prevTotal > 0
          ? ((curTotal - prevTotal) / prevTotal) * 100
          : curTotal > 0
          ? 100
          : 0;

      return {
        categories: formattedCategories,
        seriesData: data,
        currentTotal: curTotal,
        previousTotal: prevTotal,
        percentageChange: change,
      };
    }, [sales, timeRange]);

  const isDark = theme === "dark";

  const options: ApexOptions = {
    chart: {
      type: "area",
      height: 280,
      toolbar: { show: false },
      fontFamily: "Outfit, sans-serif",
    },
    colors: ["#465FFF"],
    dataLabels: { enabled: false },
    stroke: {
      curve: "smooth",
      width: 2.5,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: isDark ? 0.45 : 0.4,
        opacityTo: 0.05,
        stops: [0, 95, 100],
      },
    },
    grid: {
      borderColor: isDark ? "#1F2937" : "#F3F4F6",
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
    },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          colors: isDark ? "#9CA3AF" : "#6B7280",
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: isDark ? "#9CA3AF" : "#6B7280",
          fontSize: "12px",
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

  const series = [
    {
      name: "Sales Revenue",
      data: seriesData,
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/3 flex flex-col justify-between">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
        <div>
          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
            Sales Overview
          </h3>
          <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
            Real-time revenue performance derived from fulfilled sales invoices
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-800 dark:bg-gray-800">
          <button
            type="button"
            onClick={() => setTimeRange("7d")}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              timeRange === "7d"
                ? "bg-white text-gray-800 shadow-theme-xs dark:bg-gray-700 dark:text-white"
                : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            Last 7 Days
          </button>
          <button
            type="button"
            onClick={() => setTimeRange("30d")}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              timeRange === "30d"
                ? "bg-white text-gray-800 shadow-theme-xs dark:bg-gray-700 dark:text-white"
                : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-baseline gap-4">
        <div>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Total Sales in Period
          </span>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            {formatCurrency(currentTotal, settings.currency, settings.currencyCode)}
          </h2>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium">
          <span
            className={
              percentageChange >= 0
                ? "text-emerald-500 font-semibold"
                : "text-error-500 font-semibold"
            }
          >
            {percentageChange >= 0 ? "+" : ""}
            {percentageChange.toFixed(1)}%
          </span>
          <span className="text-gray-400 dark:text-gray-500">
            vs. previous {timeRange === "7d" ? "7 days" : "30 days"} (
            {formatCurrency(previousTotal, settings.currency, settings.currencyCode)})
          </span>
        </div>
      </div>

      <div className="mt-3">
        <ReactApexChart options={options} series={series} type="area" height={280} />
      </div>
    </div>
  );
}
