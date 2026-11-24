import SuppliersManagement from "@/components/main/suppliers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Suppliers Management | StockFlow",
  description: "Vendor directory, procurement contacts, authorized suppliers, and historical purchase orders.",
};

export default function SuppliersPage() {
  return <SuppliersManagement />;
}
