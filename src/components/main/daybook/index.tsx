"use client";

import PageBreadcrumb from "@/components/common/page-breadcrumb";
import React from "react";
import DaybookBalanceCards from "./daybook-balance-cards";
import DaybookTable from "./daybook-table";

export default function DaybookComponent() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Daybook & Cash Register" />
      <DaybookBalanceCards />
      <DaybookTable />
    </div>
  );
}
