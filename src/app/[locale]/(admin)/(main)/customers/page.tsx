import CustomersManagement from "@/components/main/customers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customers Management | StockFlow",
  description: "Customer directory, contact details, corporate client profiles, and historical sales transactions.",
};

export default function CustomersPage() {
  return <CustomersManagement />;
}
