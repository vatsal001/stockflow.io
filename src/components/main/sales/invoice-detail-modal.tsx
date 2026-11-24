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
import { ArrowLeftRightIcon, BoxIcon, PrinterIcon } from "@/icons";
import { Sale } from "@/types/inventory";
import { formatCurrency, formatDate } from "@/utils/formatters";
import React, { useState } from "react";
import SalesReturnModal from "./sales-return-modal";

interface InvoiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
}

export default function InvoiceDetailModal({
  isOpen,
  onClose,
  sale,
}: InvoiceDetailModalProps) {
  const { customers, settings, sales } = useInventory();
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

  if (!sale) return null;

  // Re-fetch current sale object to reflect live returnedItems updates
  const activeSale = sales.find((s) => s.id === sale.id) || sale;
  const customer = customers.find((c) => c.id === activeSale.customerId);

  const handlePrint = () => {
    window.print();
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "Paid":
        return <Badge color="success">Paid</Badge>;
      case "Partial":
        return <Badge color="warning">Partial</Badge>;
      case "Unpaid":
        return <Badge color="error">Unpaid</Badge>;
      default:
        return <Badge color="gray">{status}</Badge>;
    }
  };

  const totalReturnedQty = (activeSale.returnedItems || []).reduce(
    (sum, r) => sum + r.quantity,
    0
  );
  const totalOriginalQty = activeSale.items.reduce(
    (sum, i) => sum + i.quantity,
    0
  );
  const canReturnItems = totalReturnedQty < totalOriginalQty;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto print:m-0 print:p-0 print:border-none print:shadow-none">
          <DialogHeader className="print:hidden">
            <div className="flex items-center justify-between pe-8">
              <div>
                <DialogTitle className="text-xl font-bold">
                  Tax Invoice: {activeSale.invoiceNumber}
                </DialogTitle>
                <p className="text-xs text-gray-500">
                  Created on {formatDate(activeSale.date)}
                  {activeSale.source && ` • Source: ${activeSale.source}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {activeSale.returnedItems && activeSale.returnedItems.length > 0 && (
                  <Badge color="warning">Items Returned</Badge>
                )}
                {getPaymentBadge(activeSale.paymentStatus)}
              </div>
            </div>
          </DialogHeader>

          {/* Printable Invoice Container */}
          <div id="invoice-printable" className="space-y-6 pt-2">
            {/* Invoice Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-800">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-brand-500 text-white">
                    <BoxIcon className="size-4.5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {settings.businessName}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 max-w-xs leading-relaxed">
                  {settings.address}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Phone: {settings.phone} · Email: {settings.email}
                </p>
              </div>

              <div className="sm:text-end">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  TAX INVOICE
                </span>
                <h2 className="text-xl font-mono font-bold text-gray-900 dark:text-white mt-0.5">
                  {activeSale.invoiceNumber}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Date: <span className="font-semibold">{formatDate(activeSale.date)}</span>
                </p>
                <div className="mt-2 flex items-center justify-end gap-1.5">
                  {activeSale.returnedItems && activeSale.returnedItems.length > 0 && (
                    <Badge color="warning">Return Logged</Badge>
                  )}
                  {getPaymentBadge(activeSale.paymentStatus)}
                </div>
              </div>
            </div>

            {/* Bill To */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Billed To:
                </span>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                  {activeSale.customerName}
                </h4>
                {customer && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5 mt-1">
                    <p>Contact: {customer.name}</p>
                    <p>Email: {customer.email}</p>
                    <p>Phone: {customer.phone}</p>
                    <p className="max-w-xs">{customer.address}</p>
                  </div>
                )}
              </div>

              <div className="sm:text-end">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Payment Status & Terms:
                </span>
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-1">
                  Invoice Status: {activeSale.invoiceStatus}
                </p>
                {activeSale.notes && (
                  <p className="text-xs text-gray-500 mt-1 italic">
                    Notes: {activeSale.notes}
                  </p>
                )}
              </div>
            </div>

            {/* Line Items Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
              <Table>
                <TableHeader className="bg-gray-50/70 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:bg-gray-800/50">
                  <TableRow>
                    <TableCell isHeader className="py-2.5 ps-4 text-start">
                      Item Description
                    </TableCell>
                    <TableCell isHeader className="py-2.5 text-start">
                      SKU
                    </TableCell>
                    <TableCell isHeader className="py-2.5 text-end">
                      Qty Sold
                    </TableCell>
                    <TableCell isHeader className="py-2.5 text-end">
                      Returned
                    </TableCell>
                    <TableCell isHeader className="py-2.5 text-end">
                      Unit Price
                    </TableCell>
                    <TableCell isHeader className="py-2.5 pe-4 text-end">
                      Line Total
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 text-xs dark:divide-gray-800">
                  {activeSale.items.map((item, idx) => {
                    const itemReturned = (activeSale.returnedItems || [])
                      .filter((r) => r.productId === item.productId)
                      .reduce((s, r) => s + r.quantity, 0);

                    return (
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
                        <TableCell className="py-3 text-end text-amber-600 dark:text-amber-400 font-medium">
                          {itemReturned > 0 ? `${itemReturned} returned` : "—"}
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
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Returned Items Log Section if exists */}
            {activeSale.returnedItems && activeSale.returnedItems.length > 0 && (
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 dark:border-amber-900/60 dark:bg-amber-950/20 space-y-2">
                <div className="flex items-center gap-2">
                  <ArrowLeftRightIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                    Sales Returns &amp; Restocked Units
                  </h4>
                </div>
                <div className="space-y-1.5 text-xs text-amber-900 dark:text-amber-300">
                  {activeSale.returnedItems.map((ret, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center py-1 border-b border-amber-200/60 dark:border-amber-900/40 last:border-0"
                    >
                      <div>
                        <span className="font-semibold">{ret.quantity}x {ret.productName}</span>
                        <span className="text-[11px] text-amber-700 dark:text-amber-400 ms-2">
                          ({formatDate(ret.date)}) — &ldquo;{ret.reason}&rdquo;
                        </span>
                      </div>
                      <div className="font-bold">
                        Refund: {formatCurrency(ret.refundAmount, settings.currency, settings.currencyCode)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Financial Totals */}
            <div className="flex justify-end">
              <div className="w-full sm:w-72 space-y-2 text-xs">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(
                      activeSale.subtotal,
                      settings.currency,
                      settings.currencyCode
                    )}
                  </span>
                </div>

                {activeSale.discount > 0 && (
                  <div className="flex justify-between text-error-600 dark:text-error-400">
                    <span>Discount</span>
                    <span>
                      -{formatCurrency(
                        activeSale.discount,
                        settings.currency,
                        settings.currencyCode
                      )}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Tax (GST {activeSale.taxRate}%)</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(
                      activeSale.tax,
                      settings.currency,
                      settings.currencyCode
                    )}
                  </span>
                </div>

                <div className="pt-2 border-t border-gray-200 dark:border-gray-800 flex justify-between text-sm font-bold text-gray-900 dark:text-white">
                  <span>Grand Total</span>
                  <span className="text-base text-brand-600 dark:text-brand-400">
                    {formatCurrency(
                      activeSale.grandTotal,
                      settings.currency,
                      settings.currencyCode
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="print:hidden pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between sm:justify-between w-full">
            <div>
              {canReturnItems && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsReturnModalOpen(true)}
                  className="gap-1.5 text-xs text-amber-700 border-amber-300 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-700 dark:hover:bg-amber-950/40"
                >
                  <ArrowLeftRightIcon className="size-3.5" />
                  <span>Process Return &amp; Restock</span>
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
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
                <span>Print Invoice</span>
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Return Dialog */}
      {isReturnModalOpen && (
        <SalesReturnModal
          isOpen={isReturnModalOpen}
          onClose={() => setIsReturnModalOpen(false)}
          sale={activeSale}
          onReturnSuccess={() => {
            // Updated directly in context
          }}
        />
      )}
    </>
  );
}
