"use client";

import PageBreadcrumb from "@/components/common/page-breadcrumb";
import SettingsView from "./settings-view";

export default function SettingsManagement() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Business & System Settings" />
      <SettingsView />
    </div>
  );
}
