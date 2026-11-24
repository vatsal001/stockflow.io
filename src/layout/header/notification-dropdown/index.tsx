"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useInventory } from "@/context/inventory-context";
import { Link } from "@/i18n/navigation";
import { AlertIcon, BellIcon, CheckCircleIcon, XIcon } from "@/icons";
import { formatDateTime } from "@/utils/formatters";
import { useState } from "react";

export default function NotificationDropdown() {
  const { products, activities } = useInventory();
  const [isOpen, setIsOpen] = useState(false);

  const lowStockItems = products.filter((p) => p.currentStock <= p.minimumStock);
  const totalAlerts = lowStockItems.length;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="icon-lg"
            className="relative"
            aria-label="Toggle notifications"
          >
            {totalAlerts > 0 && (
              <span className="absolute -top-1 -end-1 z-10 flex h-4 min-w-4 items-center justify-center rounded-full bg-error-500 px-1 text-[10px] font-bold text-white">
                {totalAlerts}
              </span>
            )}
            <BellIcon className="size-auto!" />
          </Button>
        }
      />

      <DropdownMenuContent
        align="end"
        sideOffset={12}
        className="w-87.5 overflow-hidden p-3 sm:w-96 dark:bg-[#1E2635]"
      >
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <h5 className="text-title-sm font-semibold text-gray-800 dark:text-gray-200">
              System Alerts
            </h5>
            {totalAlerts > 0 && (
              <Badge color="error" size="sm">
                {totalAlerts} Low Stock
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setIsOpen(false)}
            aria-label="Close notifications"
          >
            <XIcon className="size-4" />
          </Button>
        </div>

        <DropdownMenuSeparator className="my-0" />

        <ScrollArea className="h-80">
          <div className="flex flex-col pe-2 py-1 space-y-1">
            {lowStockItems.length > 0 && (
              <div className="mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-error-600 dark:text-error-400 px-2">
                  Inventory Alerts ({lowStockItems.length})
                </span>
                {lowStockItems.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="mt-1 flex items-start gap-2.5 rounded-lg p-2 bg-error-50/50 dark:bg-error-950/20 border border-error-100 dark:border-error-900/30"
                  >
                    <div className="mt-0.5 rounded-md bg-error-100 p-1 text-error-600 dark:bg-error-900/40 dark:text-error-400">
                      <AlertIcon className="size-3.5" />
                    </div>
                    <div className="flex-1 text-start">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        SKU: {item.sku} · Available:{" "}
                        <span className="font-bold text-error-600 dark:text-error-400">
                          {item.currentStock} {item.unit}
                        </span>{" "}
                        (Min: {item.minimumStock})
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 px-2">
                Recent Activity
              </span>
              {activities.slice(0, 5).map((act) => (
                <div
                  key={act.id}
                  className="mt-1 flex items-start gap-2.5 rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  <div className="mt-0.5 rounded-md bg-brand-50 p-1 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400">
                    <CheckCircleIcon className="size-3.5" />
                  </div>
                  <div className="flex-1 text-start">
                    <p className="text-xs font-medium text-gray-800 dark:text-gray-200">
                      {act.title}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">
                      {act.description}
                    </p>
                    <span className="text-[10px] text-gray-400 mt-0.5 block">
                      {formatDateTime(act.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>

        <Button
          variant="outline"
          size="default"
          nativeButton={false}
          render={<Link href="/inventory" />}
          className="mt-3 w-full"
          onClick={() => setIsOpen(false)}
        >
          Manage Inventory Stock
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
