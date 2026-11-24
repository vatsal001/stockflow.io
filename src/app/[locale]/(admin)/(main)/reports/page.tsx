import ReportsManagement from "@/components/main/reports";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reports & Analytics | StockFlow",
  description: "Stock valuation reports, sales performance trends, purchase outlays, and CSV business data exports.",
};

export default function ReportsPage() {
  return <ReportsManagement />;
}
