"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
import { CheckCircleIcon, PrinterIcon, TruckDeliveryIcon } from "@/icons";
import { Purchase, PurchaseStatus } from "@/types/inventory";
import { formatCurrency, formatDate, formatDateTime } from "@/utils/formatters";
import React, { useState } from "react";

interface PurchaseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchase: Purchase | null;
}

export default function PurchaseDetailModal({
  isOpen,
  onClose,
  purchase,
}: PurchaseDetailModalProps) {
  const { suppliers, receivePurchase, cancelPurchase, settings } = useInventory();
  const [actionError, setActionError] = useState<string | null>(null);

  if (!purchase) return null;

  const supplier = suppliers.find((s) => s.id === purchase.supplierId);

  const getStatusBadge = (status: PurchaseStatus) => {
    switch (status) {
      case "Received":
        return <Badge color="success">Received & Stocked</Badge>;
      case "Pending":
        return <Badge color="warning">Pending Delivery</Badge>;
      case "Draft":
        return <Badge color="gray">Draft</Badge>;
      case "Cancelled":
        return <Badge color="error">Cancelled</Badge>;
    }
  };

  const handleReceive = () => {
    setActionError(null);
    const res = receivePurchase(purchase.id);
    if (!res.success) {
      setActionError(res.error || "Failed to receive order.");
    }
  };

  const handleCancel = () => {
    setActionError(null);
    const res = cancelPurchase(purchase.id);
    if (!res.success) {
      setActionError(res.error || "Failed to cancel order.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto print:m-0 print:p-0 print:border-none print:shadow-none">
        <DialogHeader className="print:hidden">
          <div className="flex items-center justify-between pe-8">
            <div>
              <DialogTitle className="text-xl font-bold">
                Purchase Order: {purchase.orderNumber}
              </DialogTitle>
              <p className="text-xs text-gray-500">
                Created on {formatDate(purchase.date)}
              </p>
            </div>
            {getStatusBadge(purchase.status)}
          </div>
        </DialogHeader>

        {actionError && (
          <div className="rounded-lg bg-error-50 p-3 text-xs text-error-700 dark:bg-error-950/40 dark:text-error-300 border border-error-200">
            {actionError}
          </div>
        )}

        <div className="space-y-6 pt-2">
          {/* Top Banner if Pending */}
          {purchase.status === "Pending" && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/30 dark:bg-amber-950/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 print:hidden">
              <div>
                <h4 className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                  Awaiting Delivery Confirmation
                </h4>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                  Confirm receipt of goods to automatically increment warehouse inventory quantities.
                </p>
              </div>
              <Button
                type="button"
                variant="default"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shrink-0"
                onClick={handleReceive}
              >
                <CheckCircleIcon className="size-4" />
                <span>Mark Received & Add Stock</span>
              </Button>
            </div>
          )}

          {/* Supplier & Business Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-800">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500 text-white">
                  <TruckDeliveryIcon className="size-4.5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  Purchase Order
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Issued By: <strong>{settings.businessName}</strong>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {settings.address}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Phone: {settings.phone} · Email: {settings.email}
              </p>
            </div>

            <div className="sm:text-end">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                PO NUMBER
              </span>
              <h2 className="text-xl font-mono font-bold text-gray-900 dark:text-white mt-0.5">
                {purchase.orderNumber}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Issued Date: <span className="font-semibold">{formatDate(purchase.date)}</span>
              </p>
              {purchase.receivedAt && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                  Stock Received: {formatDateTime(purchase.receivedAt)}
                </p>
              )}
            </div>
          </div>

          {/* Supplier Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Supplier / Vendor:
              </span>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                {purchase.supplierName}
              </h4>
              {supplier && (
                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5 mt-1">
                  <p>Contact: {supplier.name}</p>
                  <p>Email: {supplier.email}</p>
                  <p>Phone: {supplier.phone}</p>
                  <p className="max-w-xs">{supplier.address}</p>
                </div>
              )}
            </div>

            <div className="sm:text-end">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Order Status:
              </span>
              <div className="mt-1">{getStatusBadge(purchase.status)}</div>
              {purchase.notes && (
                <p className="text-xs text-gray-500 mt-2 italic">
                  Notes: {purchase.notes}
                </p>
              )}
            </div>
          </div>

          {/* Line items table */}
          <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
            <Table>
              <TableHeader className="bg-gray-50/70 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:bg-gray-800/50">
                <TableRow>
                  <TableCell isHeader className="py-2.5 ps-4 text-start">
                    Ordered Product
                  </TableCell>
                  <TableCell isHeader className="py-2.5 text-start">
                    SKU
                  </TableCell>
                  <TableCell isHeader className="py-2.5 text-end">
                    Quantity
                  </TableCell>
                  <TableCell isHeader className="py-2.5 text-end">
                    Unit Cost
                  </TableCell>
                  <TableCell isHeader className="py-2.5 pe-4 text-end">
                    Line Total
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 text-xs dark:divide-gray-800">
                {purchase.items.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="py-3 ps-4 font-medium text-gray-800 dark:text-gray-200">
                      {item.productName}
                    </TableCell>
                    <TableCell className="py-3 font-mono text-gray-500">
                      {item.sku}
                    </TableCell>
                    <TableCell className="py-3 text-end font-semibold text-gray-800 dark:text-gray-200">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="py-3 text-end text-gray-600 dark:text-gray-400">
                      {formatCurrency(
                        item.unitPrice,
                        settings.currency,
                        settings.currencyCode
                      )}
                    </TableCell>
                    <TableCell className="py-3 pe-4 text-end font-bold text-gray-900 dark:text-white">
                      {formatCurrency(
                        item.lineTotal,
                        settings.currency,
                        settings.currencyCode
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full sm:w-72 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(
                    purchase.subtotal,
                    settings.currency,
                    settings.currencyCode
                  )}
                </span>
              </div>

              {purchase.discount > 0 && (
                <div className="flex justify-between text-error-600 dark:text-error-400">
                  <span>Vendor Discount</span>
                  <span>
                    -{formatCurrency(
                      purchase.discount,
                      settings.currency,
                      settings.currencyCode
                    )}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Tax (GST {purchase.taxRate}%)</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(
                    purchase.tax,
                    settings.currency,
                    settings.currencyCode
                  )}
                </span>
              </div>

              <div className="pt-2 border-t border-gray-200 dark:border-gray-800 flex justify-between text-sm font-bold text-gray-900 dark:text-white">
                <span>Grand Total</span>
                <span className="text-base text-brand-600 dark:text-brand-400">
                  {formatCurrency(
                    purchase.grandTotal,
                    settings.currency,
                    settings.currencyCode
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="print:hidden pt-4 border-t border-gray-100 dark:border-gray-800">
          {purchase.status === "Pending" && (
            <Button
              type="button"
              variant="outline"
              className="text-error-600 hover:text-error-700"
              onClick={handleCancel}
            >
              Cancel Order
            </Button>
          )}
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={handlePrint}
            className="gap-1.5"
          >
            <PrinterIcon className="size-4" />
            <span>Print PO</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
