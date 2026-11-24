"use client";

import PageBreadcrumb from "@/components/common/page-breadcrumb";
import { BoxIcon, CartIcon, TruckDeliveryIcon } from "@/icons";
import { useState } from "react";
import PurchaseReport from "./purchase-report";
import SalesReport from "./sales-report";
import StockReport from "./stock-report";

type ReportTab = "stock" | "sales" | "purchases";

export default function ReportsManagement() {
  const [activeTab, setActiveTab] = useState<ReportTab>("stock");

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Analytics & Business Reports" />

      {/* Modern Tabs Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("stock")}
          className={`flex items-center gap-2 pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "stock"
              ? "border-brand-500 text-brand-600 dark:text-brand-400"
              : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-white"
          }`}
        >
          <BoxIcon className="size-4.5" />
          <span>Stock Valuation Report</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("sales")}
          className={`flex items-center gap-2 pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "sales"
              ? "border-brand-500 text-brand-600 dark:text-brand-400"
              : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-white"
          }`}
        >
          <CartIcon className="size-4.5" />
          <span>Sales & Revenue Report</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("purchases")}
          className={`flex items-center gap-2 pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "purchases"
              ? "border-brand-500 text-brand-600 dark:text-brand-400"
              : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-white"
          }`}
        >
          <TruckDeliveryIcon className="size-4.5" />
          <span>Procurement & PO Report</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "stock" && <StockReport />}
      {activeTab === "sales" && <SalesReport />}
      {activeTab === "purchases" && <PurchaseReport />}
    </div>
  );
}
