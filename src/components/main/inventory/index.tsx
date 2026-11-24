"use client";

import PageBreadcrumb from "@/components/common/page-breadcrumb";
import { Suspense } from "react";
import ProductTable from "./product-table";

export default function InventoryManagement() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Inventory Management" />
      <Suspense
        fallback={
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3 text-center text-sm text-gray-500">
            Loading Inventory Catalog...
          </div>
        }
      >
        <ProductTable />
      </Suspense>
    </div>
  );
}
