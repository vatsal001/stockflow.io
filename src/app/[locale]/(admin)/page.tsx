import InventoryDashboard from "@/components/main/dashboard/inventory";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "StockFlow | Premium Inventory & Business Management SaaS",
  description:
    "Real-time inventory management, sales tracking, purchase orders, customer & supplier trade workflows.",
};

export default function DashboardPage() {
  return <InventoryDashboard />;
}
