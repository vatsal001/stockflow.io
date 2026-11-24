"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useInventory } from "@/context/inventory-context";
import { Link } from "@/i18n/navigation";
import { AlertIcon, CheckCircleIcon, PlusIcon } from "@/icons";

export default function LowStockAlerts() {
  const { products } = useInventory();

  const lowStockItems = products.filter((p) => p.currentStock <= p.minimumStock);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/3">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-error-50 text-error-600 dark:bg-error-950/40 dark:text-error-400">
            <AlertIcon className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
                Low Stock Priority Alerts
              </h3>
              <Badge color={lowStockItems.length > 0 ? "error" : "success"} size="sm">
                {lowStockItems.length} Products Alerted
              </Badge>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Items at or below minimum reorder thresholds requiring replenishment
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href="/purchases" />}
          className="gap-1.5"
        >
          <PlusIcon className="size-4" />
          <span>New Purchase Order</span>
        </Button>
      </div>

      <div className="mt-4 overflow-x-auto">
        {lowStockItems.length === 0 ? (
          <div className="py-10 text-center flex flex-col items-center justify-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 mb-3">
              <CheckCircleIcon className="size-6" />
            </div>
            <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
              All Stock Levels Healthy
            </h4>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500 max-w-sm">
              No products are currently at or below their designated minimum threshold.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:border-gray-800">
              <TableRow>
                <TableCell isHeader className="py-3 text-start">
                  Product
                </TableCell>
                <TableCell isHeader className="py-3 text-start">
                  SKU
                </TableCell>
                <TableCell isHeader className="py-3 text-end">
                  Available Qty
                </TableCell>
                <TableCell isHeader className="py-3 text-end">
                  Min Stock
                </TableCell>
                <TableCell isHeader className="py-3 text-center">
                  Status
                </TableCell>
                <TableCell isHeader className="py-3 text-end">
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
              {lowStockItems.map((prod) => {
                const isOutOfStock = prod.currentStock <= 0;
                return (
                  <TableRow
                    key={prod.id}
                    className="hover:bg-gray-50/60 dark:hover:bg-white/2 transition-colors"
                  >
                    <TableCell className="py-3.5 font-medium text-gray-800 dark:text-white/90">
                      {prod.name}
                      <span className="block text-xs font-normal text-gray-400">
                        {prod.category}
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5 font-mono text-xs text-gray-600 dark:text-gray-400">
                      {prod.sku}
                    </TableCell>
                    <TableCell className="py-3.5 text-end font-bold text-gray-800 dark:text-white/90">
                      <span
                        className={
                          isOutOfStock
                            ? "text-error-600 dark:text-error-400"
                            : "text-amber-600 dark:text-amber-400"
                        }
                      >
                        {prod.currentStock} {prod.unit}
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5 text-end text-gray-500 dark:text-gray-400">
                      {prod.minimumStock} {prod.unit}
                    </TableCell>
                    <TableCell className="py-3.5 text-center">
                      <Badge color={isOutOfStock ? "error" : "warning"} size="sm">
                        {isOutOfStock ? "Out of Stock" : "Low Stock"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3.5 text-end">
                      <Button
                        size="xs"
                        variant="default"
                        nativeButton={false}
                        render={<Link href={`/purchases?product=${encodeURIComponent(prod.id)}`} />}
                      >
                        Restock
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
