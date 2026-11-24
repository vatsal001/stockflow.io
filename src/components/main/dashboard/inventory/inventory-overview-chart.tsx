"use client";

import { useTheme } from "@/context/theme-context";
import { useInventory } from "@/context/inventory-context";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useMemo } from "react";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function InventoryOverviewChart() {
  const { theme } = useTheme();
  const { products } = useInventory();

  const { inStock, lowStock, outOfStock, total } = useMemo(() => {
    let inCount = 0;
    let lowCount = 0;
    let outCount = 0;

    products.forEach((p) => {
      if (p.currentStock <= 0) {
        outCount++;
      } else if (p.currentStock <= p.minimumStock) {
        lowCount++;
      } else {
        inCount++;
      }
    });

    return {
      inStock: inCount,
      lowStock: lowCount,
      outOfStock: outCount,
      total: products.length,
    };
  }, [products]);

  const isDark = theme === "dark";

  const options: ApexOptions = {
    chart: {
      type: "donut",
      fontFamily: "Outfit, sans-serif",
    },
    colors: ["#10B981", "#F59E0B", "#EF4444"],
    labels: ["In Stock", "Low Stock", "Out of Stock"],
    legend: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "75%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total Products",
              fontSize: "12px",
              color: isDark ? "#9CA3AF" : "#6B7280",
              formatter: () => `${total}`,
            },
            value: {
              fontSize: "24px",
              fontWeight: 700,
              color: isDark ? "#FFFFFF" : "#111827",
            },
          },
        },
      },
    },
    stroke: {
      colors: [isDark ? "#111827" : "#FFFFFF"],
      width: 2,
    },
    tooltip: {
      theme: isDark ? "dark" : "light",
      y: {
        formatter: (val) => `${val} Items (${total > 0 ? ((val / total) * 100).toFixed(0) : 0}%)`,
      },
    },
  };

  const series = [inStock, lowStock, outOfStock];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/3 flex flex-col justify-between">
      <div className="pb-4 border-b border-gray-100 dark:border-gray-800">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
          Inventory Health
        </h3>
        <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
          Live stock categorization & availability metrics
        </p>
      </div>

      <div className="my-auto py-2 flex justify-center">
        <ReactApexChart options={options} series={series} type="donut" height={230} />
      </div>

      <div className="space-y-2.5 pt-3 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-emerald-500" />
            <span className="text-gray-600 dark:text-gray-300">In Stock (&gt; Min)</span>
          </div>
          <span className="font-semibold text-gray-900 dark:text-white">
            {inStock} <span className="text-gray-400 font-normal">({total > 0 ? ((inStock / total) * 100).toFixed(0) : 0}%)</span>
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-amber-500" />
            <span className="text-gray-600 dark:text-gray-300">Low Stock (&le; Min)</span>
          </div>
          <span className="font-semibold text-gray-900 dark:text-white">
            {lowStock} <span className="text-gray-400 font-normal">({total > 0 ? ((lowStock / total) * 100).toFixed(0) : 0}%)</span>
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-error-500" />
            <span className="text-gray-600 dark:text-gray-300">Out of Stock (&le; 0)</span>
          </div>
          <span className="font-semibold text-gray-900 dark:text-white">
            {outOfStock} <span className="text-gray-400 font-normal">({total > 0 ? ((outOfStock / total) * 100).toFixed(0) : 0}%)</span>
          </span>
        </div>
      </div>
    </div>
  );
}
