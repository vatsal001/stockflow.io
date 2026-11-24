"use client";

import PageBreadcrumb from "@/components/common/page-breadcrumb";
import CustomersTable from "./customers-table";

export default function CustomersManagement() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Customer Management" />
      <CustomersTable />
    </div>
  );
}
