"use client";

import PageBreadcrumb from "@/components/common/page-breadcrumb";
import React from "react";
import PosTerminal from "./pos-terminal";

export default function PosComponent() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Retail POS Terminal" />
      <PosTerminal />
    </div>
  );
}
