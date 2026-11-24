import PosComponent from "@/components/main/pos";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Retail POS Terminal | StockFlow",
  description: "Retail point of sale terminal with multi-tender checkout, held carts, and thermal receipts.",
};

export default function PosPage() {
  return <PosComponent />;
}
