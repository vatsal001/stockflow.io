"use client";

import PageBreadcrumb from "@/components/common/page-breadcrumb";
import SalesTable from "./sales-table";

export default function SalesManagement() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Sales Orders & Invoicing" />
      <SalesTable />
    </div>
  );
}
