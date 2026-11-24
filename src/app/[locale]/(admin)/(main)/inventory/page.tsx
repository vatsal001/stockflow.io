import InventoryManagement from "@/components/main/inventory";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inventory Management | StockFlow",
  description: "Product catalog, SKU management, physical stock counts, and stock movement ledger.",
};

export default function InventoryPage() {
  return <InventoryManagement />;
}
