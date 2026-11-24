import PurchasesManagement from "@/components/main/purchases";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Purchase Management | StockFlow",
  description: "Create purchase orders, receive inventory stock, track suppliers, and manage procurement outlays.",
};

export default function PurchasesPage() {
  return <PurchasesManagement />;
}
