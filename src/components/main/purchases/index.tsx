"use client";

import PageBreadcrumb from "@/components/common/page-breadcrumb";
import { Suspense } from "react";
import PurchasesTable from "./purchases-table";

export default function PurchasesManagement() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Purchase Management" />
      <Suspense
        fallback={
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3 text-center text-sm text-gray-500">
            Loading Purchase Orders...
          </div>
        }
      >
        <PurchasesTable />
      </Suspense>
    </div>
  );
}
