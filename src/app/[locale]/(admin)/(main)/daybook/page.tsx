import DaybookComponent from "@/components/main/daybook";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daybook & Cash Register | StockFlow",
  description: "Daily cash ledger, inflows, expenses, drawer balance, and petty cash management.",
};

export default function DaybookPage() {
  return <DaybookComponent />;
}
