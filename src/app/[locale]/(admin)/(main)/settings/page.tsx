import SettingsManagement from "@/components/main/settings";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings | StockFlow",
  description: "Configure business profile, currency, tax rates, and manage application sample state.",
};

export default function SettingsPage() {
  return <SettingsManagement />;
}
