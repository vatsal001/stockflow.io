import SalesManagement from "@/components/main/sales";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sales Management | StockFlow",
  description: "Create sales orders, validate stock, generate invoices, and manage payment statuses.",
};

export default function SalesPage() {
  return <SalesManagement />;
}
