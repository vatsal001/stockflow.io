"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useInventory } from "@/context/inventory-context";
import { Purchase, Supplier } from "@/types/inventory";
import { formatCurrency, formatDate } from "@/utils/formatters";

interface SupplierDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier | null;
  onSelectPurchase?: (purchase: Purchase) => void;
}

export default function SupplierDetailsModal({
  isOpen,
  onClose,
  supplier,
  onSelectPurchase,
}: SupplierDetailsModalProps) {
  const { purchases, settings } = useInventory();

  if (!supplier) return null;

  const supplierPurchases = purchases.filter((p) => p.supplierId === supplier.id);
  const totalOutlay = supplierPurchases.reduce((acc, p) => acc + p.grandTotal, 0);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-wrap items-center justify-between gap-3 pe-8">
            <div>
              <DialogTitle className="text-xl font-bold">
                {supplier.companyName}
              </DialogTitle>
              <p className="text-xs text-gray-500">
                Contact: {supplier.name} · Verified Vendor since {formatDate(supplier.createdAt)}
              </p>
            </div>
            <Badge color="warning">Procurement Vendor</Badge>
          </div>
        </DialogHeader>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl border border-gray-100 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-white/3">
          <div>
            <span className="text-[11px] uppercase font-semibold text-gray-400">
              Total Purchase Orders
            </span>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
              {supplierPurchases.length}
            </p>
            <span className="text-[10px] text-gray-400">Issued PO count</span>
          </div>

          <div>
            <span className="text-[11px] uppercase font-semibold text-gray-400">
              Total Purchase Outlay
            </span>
            <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">
              {formatCurrency(totalOutlay, settings.currency, settings.currencyCode)}
            </p>
            <span className="text-[10px] text-gray-400">Cumulative spend</span>
          </div>

          <div>
            <span className="text-[11px] uppercase font-semibold text-gray-400">
              Vendor Channels
            </span>
            <p className="text-xs font-semibold text-gray-900 dark:text-white mt-0.5 truncate">
              {supplier.email}
            </p>
            <p className="text-[11px] text-gray-500">{supplier.phone || "No phone registered"}</p>
          </div>
        </div>

        {supplier.address && (
          <div className="rounded-xl border border-gray-100 p-3 text-xs text-gray-600 dark:border-gray-800 dark:text-gray-400">
            <strong>Warehouse / Dispatch Address:</strong> {supplier.address}
          </div>
        )}

        {/* Supplier Purchase Orders History */}
        <div className="space-y-2 pt-2">
          <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
            Purchase Orders Issued ({supplierPurchases.length})
          </h4>

          <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
            {supplierPurchases.length === 0 ? (
              <p className="py-6 text-center text-xs text-gray-400">
                No purchase orders recorded for this supplier.
              </p>
            ) : (
              <Table>
                <TableHeader className="bg-gray-50/70 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:bg-gray-800/50">
                  <TableRow>
                    <TableCell isHeader className="py-2.5 ps-4 text-start">
                      PO Number
                    </TableCell>
                    <TableCell isHeader className="py-2.5 text-start">
                      Date
                    </TableCell>
                    <TableCell isHeader className="py-2.5 text-start">
                      Items
                    </TableCell>
                    <TableCell isHeader className="py-2.5 text-end">
                      Total Outlay
                    </TableCell>
                    <TableCell isHeader className="py-2.5 text-center">
                      Status
                    </TableCell>
                    <TableCell isHeader className="py-2.5 pe-4 text-end">
                      Details
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 text-xs dark:divide-gray-800">
                  {supplierPurchases.map((po) => (
                    <TableRow key={po.id}>
                      <TableCell className="py-3 ps-4 font-mono font-medium text-amber-600">
                        {po.orderNumber}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500">
                        {formatDate(po.date)}
                      </TableCell>
                      <TableCell className="py-3 text-gray-600 dark:text-gray-300">
                        {po.items.length} item(s)
                      </TableCell>
                      <TableCell className="py-3 text-end font-bold text-gray-900 dark:text-white">
                        {formatCurrency(
                          po.grandTotal,
                          settings.currency,
                          settings.currencyCode
                        )}
                      </TableCell>
                      <TableCell className="py-3 text-center">
                        <Badge
                          color={
                            po.status === "Received"
                              ? "success"
                              : po.status === "Pending"
                              ? "warning"
                              : po.status === "Draft"
                              ? "gray"
                              : "error"
                          }
                          size="sm"
                        >
                          {po.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 pe-4 text-end">
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => {
                            if (onSelectPurchase) onSelectPurchase(po);
                          }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
