"use client";

import InventoryOverviewChart from "./inventory-overview-chart";
import LowStockAlerts from "./low-stock-alerts";
import RecentActivityFeed from "./recent-activity";
import SalesOverviewChart from "./sales-overview-chart";
import SummaryCards from "./summary-cards";

export default function InventoryDashboard() {
  return (
    <div className="space-y-6">
      {/* 5 Summary KPI Cards */}
      <SummaryCards />

      {/* Row 1: Sales Chart (8 cols) + Inventory Donut (4 cols) */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 xl:col-span-8">
          <SalesOverviewChart />
        </div>
        <div className="col-span-12 xl:col-span-4">
          <InventoryOverviewChart />
        </div>
      </div>

      {/* Row 2: Low Stock Priority Table (7 cols) + Recent Activity Audit (5 cols) */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 xl:col-span-7">
          <LowStockAlerts />
        </div>
        <div className="col-span-12 xl:col-span-5">
          <RecentActivityFeed />
        </div>
      </div>
    </div>
  );
}
