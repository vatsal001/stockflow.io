"use client";

import PageBreadcrumb from "@/components/common/page-breadcrumb";
import SuppliersTable from "./suppliers-table";

export default function SuppliersManagement() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Supplier Management" />
      <SuppliersTable />
    </div>
  );
}
